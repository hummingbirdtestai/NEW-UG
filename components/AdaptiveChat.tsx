// components/AdaptiveChat.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  StatusBar,
  Text,
  Dimensions,
  Pressable,
  ActivityIndicator,
  AppState 
} from "react-native";
import { MotiView } from "moti";
import { ChevronRight } from "lucide-react-native";
import { supabase } from "@/lib/supabaseClient";
import ConfettiCannon from "react-native-confetti-cannon";
import { useAuth } from "../contexts/AuthContext";

import ConceptPhase from "@/components/ConceptPhase";
import ConversationPhase from "@/components/ConversationPhase";
import FlashcardPhase from "@/components/FlashcardPhase";
import MCQPhase from "@/components/MCQPhase";
import MediaCard from "@/components/MediaCard";

interface AdaptiveChatProps {
  chapterId: string;
}

export default function AdaptiveChat({ chapterId }: AdaptiveChatProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [totalConcepts, setTotalConcepts] = useState<number>(0);
  const [currentConcept, setCurrentConcept] = useState<any | null>(null);
  const [nextConcept, setNextConcept] = useState<any | null>(null);
  const [phase, setPhase] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [phaseStartTime, setPhaseStartTime] = useState<Date | null>(null);
  const [loadingConcept, setLoadingConcept] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const { user, loading } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  const { width } = Dimensions.get("window");
  const isMobile = width < 768;

  // auto-scroll
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  }, [phase, currentIdx]);

  // revalidate session when tab regains focus
  // revalidate session when tab regains focus
// revalidate session when app/tab returns to foreground (web + native)
// throttled + in-flight guarded
useEffect(() => {
  const THROTTLE_MS = 1500;
  const lastRunRef = { current: 0 } as { current: number };
  const inFlightRef = { current: false } as { current: boolean };

  const runSafely = async () => {
    const now = Date.now();
    if (inFlightRef.current) return;                      // ⛔ already running
    if (now - lastRunRef.current < THROTTLE_MS) return;   // ⛔ too soon

    inFlightRef.current = true;
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session && chapterId) {
        console.log("🔄 Focus/Resume: refetching concept @", currentIdx);
        await fetchConcept(currentIdx, true);
        lastRunRef.current = Date.now();
      }
    } catch (e) {
      console.error("Focus/Resume refresh failed:", e);
    } finally {
      inFlightRef.current = false;
    }
  };

  // Web: focus + (optional) visibilitychange
  const onFocus = () => runSafely();
  const onVisibility = () => {
    // only when tab becomes visible
    if (typeof document !== "undefined" && document.visibilityState === "visible") {
      runSafely();
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("focus", onFocus);
    document?.addEventListener?.("visibilitychange", onVisibility);
  }

  // Native: AppState -> active
  const sub = AppState.addEventListener("change", (state) => {
    if (state === "active") runSafely();
  });

  return () => {
    if (typeof window !== "undefined") {
      window.removeEventListener("focus", onFocus);
      document?.removeEventListener?.("visibilitychange", onVisibility);
    }
    sub.remove();
  };
}, [chapterId, user, currentIdx]);



// reset or resume on chapter change
useEffect(() => {
  if (chapterId && user) {
    let isActive = true;
    const load = async () => {
      setPhase(0);
      setIsCompleted(false);
      setCurrentConcept(null);
      setNextConcept(null);
      setFetchError(false);
      setLoadingConcept(true);

      await fetchTotalConcepts();

      // ✅ Try to resume from pointer
      const { data: pointerRow, error: pointerError } = await supabase
        .from("student_learning_pointer")
        .select("seq_number")
        .eq("student_id", user.id)
        .eq("chapter_id", chapterId)
        .order("updated_at", { ascending: false }) // in case multiple
        .limit(1)
        .maybeSingle();

      let startIdx = 0;
      if (pointerRow?.seq_number !== null && pointerRow?.seq_number !== undefined) {
        startIdx = pointerRow.seq_number;
        console.log("⏪ Resuming from saved pointer:", startIdx);
      } else {
        console.log("▶️ Starting fresh at index 0");
      }

      setCurrentIdx(startIdx);
      if (isActive) await fetchConcept(startIdx, true, isActive);
    };
    load();
    return () => {
      isActive = false;
    };
  }
}, [chapterId, user]);


  const fetchTotalConcepts = async () => {
    const { count, error } = await supabase
      .from("concepts_vertical")
      .select("*", { count: "exact", head: true })
      .eq("chapter_id", chapterId);
    if (!error && count !== null) setTotalConcepts(count);
  };

  // fetch one concept by index
const fetchConcept = async (
  idx: number,
  preloadNext = false,
  isActive = true
) => {
  setLoadingConcept(true);
  const { data, error } = await supabase
  .from("concepts_vertical")
  .select(
    `vertical_id,
     subject_id, subject_name,
     chapter_id, chapter_name,
     topic_id, topic_name,
     concept_json_unicode,
     correct_jsons,
     mcq_1_6_unicode,
     media_library_unicode,
     flash_cards_unicode,
     react_order`
  )
  .eq("chapter_id", chapterId)
  .order("react_order", { ascending: true })
  .range(idx, idx);


  if (!isActive) return;
  if (error || !data || !data[0]) {
    console.error("❌ Error fetching concept:", error);
    setLoadingConcept(false);
    setFetchError(true);
    return;
  }
  let concept = data[0];

  // ✅ Load concept bookmark state
  if (user && concept.concept_json_unicode?.uuid) {
    const { data: signal } = await supabase
      .from("student_signals")
      .select("bookmark")
      .eq("student_id", user.id)
      .eq("object_type", "concept")
      .eq("object_uuid", concept.concept_json_unicode.uuid)
      .maybeSingle();

    concept.isBookmarked = signal?.bookmark ?? false;
  }

  // ✅ Prepare Conversation HYFs and their MCQs with bookmark state
if (user && Array.isArray(concept.correct_jsons?.HYFs)) {
  for (let hyf of concept.correct_jsons.HYFs) {
    if (Array.isArray(hyf.MCQs)) {
      for (let mcq of hyf.MCQs) {
        if (mcq?.id) {
          const { data: signal } = await supabase
            .from("student_signals")
            .select("bookmark")
            .eq("student_id", user.id)
            .eq("object_type", "conversation_mcq")
            .eq("object_uuid", mcq.id)
            .maybeSingle();

          mcq.isBookmarked = signal?.bookmark ?? false;
        }
      }
    }
  }
}


  // ✅ Prepare MCQs with bookmark state
  if (user && Array.isArray(concept.mcq_1_6_unicode)) {
    for (let mcq of concept.mcq_1_6_unicode) {
      if (mcq?.id) {
        const { data: signal } = await supabase
          .from("student_signals")
          .select("bookmark")
          .eq("student_id", user.id)
          .eq("object_type", "concept_mcq") // ✅ FIXED type
          .eq("object_uuid", mcq.id)
          .maybeSingle();

        mcq.isBookmarked = signal?.bookmark ?? false;
      }
    }
  }

  setCurrentConcept(concept);

  if (user) {
  try {
   await supabase.from("student_learning_pointer").upsert(
  {
    student_id: user.id,
    subject_id: concept.subject_id,
    chapter_id: concept.chapter_id,
    topic_id: concept.topic_id,
    vertical_id: concept.vertical_id,
    seq_number: concept.react_order,
    updated_at: new Date().toISOString(),
  },
  { onConflict: "student_id,vertical_id" }
);
    setPhaseStartTime(new Date());
    console.log("✅ Pointer row created for concept", concept.vertical_id);
  } catch (err) {
    console.error("❌ Failed to insert learning pointer:", err);
  }
}
  setLoadingConcept(false);
  setFetchError(false);

  if (preloadNext && idx + 1 < totalConcepts) preloadConcept(idx + 1);
};


const handleBookmarkToggle = async (newValue: boolean, concept: any) => {
  if (!user) return;
  const objectUuid = concept.concept_json_unicode?.uuid;
  if (!objectUuid) return;

  await upsertSignal({
    user,
    type: "concept",
    uuid: objectUuid,
    bookmark: newValue,
    content: concept.concept_json_unicode,
    concept,
  });

  setCurrentConcept((prev: any) =>
    prev ? { ...prev, isBookmarked: newValue } : prev
  );
};


  // preload next concept
  const preloadConcept = async (idx: number) => {
    const { data, error } = await supabase
      .from("concepts_vertical")
  .select(
    `vertical_id,
     subject_id, subject_name,
     chapter_id, chapter_name,
     topic_id, topic_name,
     concept_json_unicode,
     correct_jsons,
     mcq_1_6_unicode,
     media_library_unicode,
     flash_cards_unicode,
     react_order`
  )
  .eq("chapter_id", chapterId)
  .order("react_order", { ascending: true })
  .range(idx, idx);


    if (!error && data && data[0]) {
      let concept = data[0];

      // ✅ Load concept bookmark state
      if (user && concept.concept_json_unicode?.uuid) {
        const { data: signal } = await supabase
          .from("student_signals")
          .select("bookmark")
          .eq("student_id", user.id)
          .eq("object_type", "concept")
          .eq("object_uuid", concept.concept_json_unicode.uuid)
          .maybeSingle();

        concept.isBookmarked = signal?.bookmark ?? false;
      }

      setNextConcept(concept);
    }
  };

async function upsertSignal({
  user,
  type,
  uuid,
  bookmark,
  content,
  concept,
}: {
  user: any;
  type: string;
  uuid: string;
  bookmark: boolean;
  content?: any;
  concept?: any;
}) {
  if (!user || !uuid) return;

  const payload = {
  student_id: user.id,
  student_name: user.name || user.user_metadata?.full_name || user.email || null,
  subject_id: concept?.subject_id || null,
  subject_name: concept?.subject_name || null,
  chapter_id: concept?.chapter_id || null,
  chapter_name: concept?.chapter_name || null,
  topic_id: concept?.topic_id || null,
  topic_name: concept?.topic_name || null,
  vertical_id: concept?.vertical_id || null,
  object_type: type,
  object_uuid: uuid,
  bookmark,
  object_content: content || null,
  updated_at: new Date().toISOString(),
};


  const { error } = await supabase.from("student_signals").upsert(payload, {
    onConflict: "student_id,object_type,object_uuid",
  });

  if (error) console.error("❌ Upsert signal failed:", error, payload);
  else console.log(`✅ Signal saved for ${type} ${uuid}`);
}

  
const handleNextPhase = () => {
  // Move UI forward immediately
  setPhase((prev) => prev + 1);
  setPhaseStartTime(new Date());

  if (!user || !currentConcept || !phaseStartTime) return;

  const timeSpent = Math.floor((Date.now() - phaseStartTime.getTime()) / 1000);
  let updateFields: any = {};

  if (phase === 0) {
    updateFields = { concept_time_seconds: timeSpent, concept_completed_at: new Date().toISOString() };
  } else if (phase === 1) {
    updateFields = { conversation_time_seconds: timeSpent, conversation_completed_at: new Date().toISOString() };
  } else if (phase === 2) {
    updateFields = { media_library_time_seconds: timeSpent, media_library_completed_at: new Date().toISOString() };
  } else if (phase === 3) {
    updateFields = { flashcards_time_seconds: timeSpent, flashcards_completed_at: new Date().toISOString() };
  }

  // Fire-and-forget Supabase update
  supabase
    .from("student_learning_pointer")
    .update(updateFields)
    .eq("student_id", user.id)
    .eq("vertical_id", currentConcept.vertical_id)
    .then(() => console.log("✅ Pointer updated for phase", phase))
    .catch((err) => console.error("❌ Failed to update pointer:", err));
};


  const handleCompleteConcept = () => {
    if (currentIdx + 1 < totalConcepts) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setPhase(0);
      if (nextConcept) {
        setCurrentConcept(nextConcept);
        setNextConcept(null);
        if (nextIdx + 1 < totalConcepts) preloadConcept(nextIdx + 1);
      } else {
        fetchConcept(nextIdx, true);
      }
    } else {
      setIsCompleted(true);
    }
  };

  // session/loading checks
  if (loading)
    return (
      <View className="flex-1 items-center justify-center bg-slate-900">
        <Text className="text-slate-400">Loading session...</Text>
      </View>
    );
  if (!user)
    return (
      <View className="flex-1 items-center justify-center bg-slate-900">
        <Text className="text-slate-200 text-lg font-bold">
          🔒 Please login to access content
        </Text>
      </View>
    );
  if (user && !user.is_subscribed)
  return (
    <View className="flex-1 bg-slate-900">
      {/* Header Section */}
      <View className="p-8 border-b border-slate-700/30 bg-slate-800/50">
        <Text className="text-sm text-teal-400 font-semibold uppercase tracking-wide">
          Subscription Required
        </Text>
        <Text className="text-3xl font-bold text-slate-100 mt-1 mb-2">
          🔒 Locked Content
        </Text>
        <Text className="text-slate-400 text-base">
          Please subscribe to access this chapter and continue your learning journey.
        </Text>
      </View>

      {/* Body Section */}
      <View className="flex-1 items-center justify-center p-8">
        <Text className="text-slate-300 text-lg mb-6 text-center">
          Upgrade now to unlock all concepts, flashcards, and MCQs 🚀
        </Text>

        <Pressable
          onPress={() => {
            // 🔑 navigate to payment/subscription page
            console.log("Go to subscription flow");
          }}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl py-4 px-8 shadow-xl"
        >
          <Text className="text-white font-bold text-lg">Subscribe Now</Text>
        </Pressable>
      </View>
    </View>
  );


  if (loadingConcept && !currentConcept)
    return (
      <View className="flex-1 items-center justify-center bg-slate-900">
        <ActivityIndicator size="large" color="#10b981" />
        <Text className="text-slate-400 mt-2">Loading concept...</Text>
      </View>
    );
  if (fetchError)
    return (
      <View className="flex-1 items-center justify-center bg-slate-900">
        <Text className="text-red-400">
          ⚠️ Failed to load concept. Try reselecting the chapter.
        </Text>
      </View>
    );
  if (!currentConcept && totalConcepts === 0)
    return (
      <View className="flex-1 items-center justify-center bg-slate-900">
        <Text className="text-slate-400">Loading Concepts</Text>
      </View>
    );

  // ✅ Prepare MCQs
  // ✅ Normalize concept MCQs before passing down
const mcqs = (currentConcept.mcq_1_6_unicode || [])
  .filter(Boolean)
  .map((m: any, idx: number) => ({
    id: m.id || m.uuid || `concept-mcq-${idx}`,
    uuid: m.uuid || m.id || `concept-mcq-${idx}`,
    mcq_key: m.mcq_key || `mcq_${idx + 1}`,
    stem: m.stem ?? m.question ?? "",
    options: m.options,
    feedback: m.feedback,
    learning_gap: m.learning_gap ?? "",
    correct_answer: m.correct_answer,
    isBookmarked: m.isBookmarked ?? false,
  }));


  // ✅ Prepare Q&A data
  const qaData = currentConcept.flash_cards_unicode
    ? currentConcept.flash_cards_unicode.map((fc: any, idx: number) => ({
        id: fc.uuid || `flash-${idx}`,
        question: fc.Question,
        answer: fc.Answer,
      }))
    : [
        {
          id: `qa-concept-${currentIdx}`,
          question:
            currentConcept.concept_json_unicode?.Concept || "Core Concept",
          answer:
            currentConcept.concept_json_unicode?.Explanation ||
            "Detailed explanation will appear here.",
        },
        ...(currentConcept.correct_jsons?.Conversation || [])
          .filter(
            (msg: any) =>
              msg.role === "teacher" || msg.role === "examiner_hint"
          )
          .slice(0, 3)
          .map((msg: any, idx: number) => ({
            id: `qa-conversation-${currentIdx}-${idx}`,
            question:
              msg.role === "examiner_hint"
                ? "NEET Examiner Hint"
                : "Key Teaching Point",
            answer: msg.text,
          })),
      ];

  const { ImageSearches = [], YouTubeSearches = [] } =
    currentConcept.media_library_unicode || {};

  return (
    <View className="flex-1 bg-slate-900">
      <StatusBar backgroundColor="#0f172a" barStyle="light-content" />
      {isCompleted && (
        <ConfettiCannon
          count={200}
          origin={{ x: width / 2, y: 0 }}
          autoStart
          fadeOut
        />
      )}

      <ScrollView
        ref={scrollViewRef}
        className="flex-1 w-full"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: isMobile ? 16 : 24,
          paddingVertical: 24,
          width: "100%",
        }}
      >
        {!isCompleted ? (
          <>
            {phase === 0 && (
              <ConceptPhase
  concept={currentConcept?.concept_json_unicode?.Concept || ""}
  explanation={currentConcept?.concept_json_unicode?.Explanation || ""}
  onNext={handleNextPhase}
  current={currentIdx + 1}
  total={totalConcepts}
  isBookmarked={!!currentConcept?.isBookmarked}
  onBookmark={(newValue) =>
    handleBookmarkToggle(newValue, currentConcept || {})
  }
/>


            )}
            {phase === 1 && (
              <ConversationPhase
  parentConcept={currentConcept} // 👈 add this
  hyfs={(currentConcept.correct_jsons?.HYFs || []).map((hyf, idx) => ({
    uuid: hyf.uuid || `hyf-${idx}`,
    text: hyf.HYF,
    mcqs: hyf.MCQs || [],
  }))}
  onComplete={handleNextPhase}
  onBookmark={async (hyfUuid, newValue) => {
  if (!user) return;

  // find the full HYF object from currentConcept
  const hyfObj = (currentConcept.correct_jsons?.HYFs || [])
    .find((h: any) => h.uuid === hyfUuid);

 await upsertSignal({
  user,
  type: "conversation_hyf",
  uuid: hyfUuid,
  bookmark: newValue,
  content: {
    uuid: hyfObj?.uuid || hyfUuid,
    hyf: hyfObj?.HYF || "",
  },  // ✅ only store uuid + hyf text
  concept: currentConcept,
});

}}
  upsertSignal={upsertSignal} 
/>

            )}

            {phase === 2 && (
              <View className="flex-1 bg-slate-900">
                {/* Hero Header */}
                <View className="p-8 border-b border-slate-700/30">
                  <Text className="text-sm text-teal-400 font-semibold uppercase tracking-wide">
                    Media Phase
                  </Text>
                  <Text className="text-3xl font-bold text-slate-100 mt-1 mb-2">
                    📸 High-Yield Media
                  </Text>
                  <Text className="text-slate-400 text-base">
                    Explore key images and videos before flashcards
                  </Text>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ padding: 16, paddingBottom: 160 }}
                >
                  {ImageSearches.map((item: any, idx: number) => (
                    <MediaCard
  key={`img-${idx}`}
  type="image"
  item={{
    id: item.uuid, // ✅ real UUID, not img-0
      description: item.Description,
      search_query: item.Search,
    keywords: item.Search.split(" ")
      .filter((w: string) => w.length > 3)
      .slice(0, 3),
  }}
  isBookmarked={false} // TODO: preload from Supabase if needed
onBookmarkToggle={async (mediaId, newValue) => {
  if (!user) return;
  await upsertSignal({
    user,
    type: "media",
    uuid: mediaId,
    bookmark: newValue,
    content: item,   // full media object
    concept: currentConcept,
  });
}}

/>

                  ))}
                  {YouTubeSearches.map((item: any, idx: number) => (
  <MediaCard
    key={`yt-${idx}`}
    type="video"
    item={{
      id: item.uuid, // ✅ real UUID
      description: item.Description,
      search_query: item.Search,
      keywords: item.Search.split(" ")
        .filter((w: string) => w.length > 3)
        .slice(0, 3),
    }}
    isBookmarked={false} // 🔑 later preload from Supabase
onBookmarkToggle={async (mediaId, newValue) => {
  if (!user) return;
  await upsertSignal({
    user,
    type: "media",
    uuid: mediaId,
    bookmark: newValue,
    content: item,   // full video object
    concept: currentConcept,
  });
}}

  />
))}

                </ScrollView>

                {/* Fixed Next Button */}
                <View className="absolute bottom-0 left-0 right-0 p-6 bg-slate-900/98 border-t border-slate-700/50 shadow-2xl">
                  <Pressable
                    onPress={handleNextPhase}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl py-4 px-6 shadow-xl flex-row items-center justify-center"
                  >
                    <Text className="text-white font-bold text-lg mr-3">
                      Continue to Flashcards
                    </Text>
                    <ChevronRight size={20} color="#ffffff" />
                  </Pressable>
                </View>
              </View>
            )}
            {phase === 3 && (
  <FlashcardPhase
    qaData={qaData}
    onNext={handleNextPhase}
    current={currentIdx + 1}
    total={totalConcepts}
    // ✅ add:
    onBookmarkFlash={async (flashUuid, newValue) => {
  if (!user) return;
  await upsertSignal({
    user,
    type: "flashcard",
    uuid: flashUuid,
    bookmark: newValue,
    content: qaData.find((f) => f.id === flashUuid), // store Q/A
    concept: currentConcept,
  });
}}

  />
)}

            {phase === 4 && (
              <MCQPhase
                key={currentIdx}
                mcqs={mcqs.map((mcq: any) => ({
                  ...mcq,
                  isBookmarked: mcq.isBookmarked ?? false, // ✅ preload bookmark state
                }))}
                mode="concept"
                stopOnFirstCorrect
                onComplete={handleCompleteConcept}

                // ✅ Log MCQ attempt
               onAttemptMCQ={async (mcq, selectedOption, isCorrect) => {
  if (!user) return;
  try {
    const { error } = await supabase.from("student_mcq_attempts").insert({
      student_id: user.id,
      subject_id: currentConcept.subject_id,   // ✅ use currentConcept
      chapter_id: currentConcept.chapter_id,
      topic_id: currentConcept.topic_id,
      vertical_id: currentConcept.vertical_id,
      mcq_key: mcq.mcq_key || `concept_mcq_${mcq.id || "unknown"}`, // ✅ safer key
      mcq_uuid: mcq.id || mcq.uuid,
      selected_option: selectedOption,
      correct_answer: mcq.correct_answer,
      is_correct: isCorrect,
      learning_gap: mcq.learning_gap || null,
      hyf_uuid: null,                          // ✅ no HYF here
      mcq_category: "concept",
      feedback: mcq.feedback ? mcq.feedback : null,
    });

    if (error) {
      console.error("❌ Failed to insert concept MCQ attempt:", error);
    } else {
      console.log(`✅ Logged concept MCQ attempt for ${mcq.id}`);
    }


    // Update pointer for MCQ completion
    const mcqKey = mcq.mcq_key; // e.g., "mcq_1"
    const mcqTime = phaseStartTime
      ? Math.floor((Date.now() - phaseStartTime.getTime()) / 1000)
      : 0;

    await supabase.from("student_learning_pointer").update({
      [`${mcqKey}_time_seconds`]: mcqTime,
      [`${mcqKey}_completed_at`]: new Date().toISOString(),
      [`${mcqKey}_is_correct`]: isCorrect,
      ...(isCorrect ? { mcq_section_completed: true } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("student_id", user.id)
    .eq("vertical_id", currentConcept.vertical_id);

    console.log(`✅ Pointer updated for ${mcq.mcq_key}`);
    setPhaseStartTime(new Date());
  } catch (err) {
    console.error("❌ Exception in MCQ attempt handling:", err);
  }
}}

                // ✅ Bookmark handler
            onBookmarkMCQ={async (mcqId, newValue) => {
  if (!user) return;
  const mcqObj = mcqs.find((m) => m.id === mcqId || m.uuid === mcqId); // ✅ robust lookup
  if (!mcqObj) {
    console.warn("⚠️ No MCQ object found for bookmark:", mcqId);
    return;
  }
  await upsertSignal({
    user,
    type: "concept_mcq",
    uuid: mcqObj.uuid || mcqObj.id,     // ✅ always a UUID/string
    bookmark: newValue,
    content: mcqObj,                    // ✅ full object stored
    concept: currentConcept,
  });
}}


              />
            )}
          </>
        ) : (
          <View className="items-center justify-center flex-1 py-12">
            <Text className="text-white text-xl font-bold">
              🎉 Chapter Completed!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}