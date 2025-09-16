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
  useEffect(() => {
    const onFocus = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session && !user && chapterId) {
        // retry fetch if session restored
        fetchConcept(0, true);
      }
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [chapterId, user]);

  // reset on chapter change
  useEffect(() => {
    if (chapterId && user) {
      let isActive = true;
      const load = async () => {
        setCurrentIdx(0);
        setPhase(0);
        setIsCompleted(false);
        setCurrentConcept(null);
        setNextConcept(null);
        setFetchError(false);
        await fetchTotalConcepts();
        if (isActive) await fetchConcept(0, true, isActive);
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
  "vertical_id, concept_json_unicode, correct_jsons, mcq_1_6_unicode, media_library_unicode, flash_cards_unicode, react_order"
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

    // ✅ Check if this concept is already bookmarked by this user
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

    setCurrentConcept(concept);

    setLoadingConcept(false);
    setFetchError(false);

    if (preloadNext && idx + 1 < totalConcepts) preloadConcept(idx + 1);
  };

  // ✅ Toggle bookmark in student_signals
  const handleBookmarkToggle = async (newValue: boolean, concept: any) => {
    if (!user) return;

    const objectUuid = concept.concept_json_unicode?.uuid || concept.vertical_id;

    if (!objectUuid) {
      console.error("❌ No concept UUID found");
      return;
    }

    const { error } = await supabase
      .from("student_signals")
      .upsert(
        {
          student_id: user.id,
          object_type: "concept",
          object_uuid: objectUuid,
          bookmark: newValue,
        },
        { onConflict: "student_id,object_type,object_uuid" }
      );

    if (error) {
      console.error("❌ Error updating bookmark:", error);
    } else {
      console.log(`✅ Bookmark set to ${newValue} for concept ${objectUuid}`);
      setCurrentConcept((prev: any) =>
        prev ? { ...prev, isBookmarked: newValue } : prev
      );
    }
  };

// preload next concept
const preloadConcept = async (idx: number) => {
  const { data, error } = await supabase
    .from("concepts_vertical")
    .select(
      "vertical_id, concept_json_unicode, correct_jsons, mcq_1_6_unicode, media_library_unicode, flash_cards_unicode, react_order"
    )
    .eq("chapter_id", chapterId)
    .order("react_order", { ascending: true })
    .range(idx, idx);

  if (!error && data && data[0]) {
    let concept = data[0];

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



  const handleNextPhase = () => {
    if (phase === 0) setPhase(1);
    else if (phase === 1) setPhase(2);
    else if (phase === 2) setPhase(3);
    else if (phase === 3) setPhase(4);
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
        <Text className="text-slate-400">No concepts found</Text>
      </View>
    );

  // ✅ Prepare MCQs
const mcqs = (currentConcept.mcq_1_6_unicode || []).filter(Boolean);


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
  concept={currentConcept.concept_json_unicode?.Concept}
  explanation={currentConcept.concept_json_unicode?.Explanation}
  onNext={handleNextPhase}
  current={currentIdx + 1}
  total={totalConcepts}
  isBookmarked={currentConcept.isBookmarked}
  onBookmark={(newValue) =>
    handleBookmarkToggle(newValue, currentConcept)
  }
/>

            )}
            {phase === 1 && (
<ConversationPhase
  hyfs={(currentConcept.correct_jsons?.HYFs || []).map((hyf: any) => ({
    uuid: hyf.uuid,    // 👈 use real HYF uuid from DB
    text: hyf.HYF,
    mcqs: (hyf.MCQs || []).map((mcq: any) => ({
      id: mcq.id,      // 👈 use real MCQ id from DB
      stem: mcq.stem,
      options: mcq.options,
      feedback: {
        correct: mcq.feedback?.correct ?? "",
        wrong: mcq.feedback?.wrong ?? "",
      },
      learning_gap: mcq.learning_gap,
      correct_answer: mcq.correct_answer,
    })),
  }))}


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
                        id: `img-${idx}`,
                        description: item.Description,
                        search_query: item.Search,
                        keywords: item.Search.split(" ")
                          .filter((w: string) => w.length > 3) // drop small filler words
                          .slice(0, 3), // just 3 tags
                      }}
                    />
                  ))}
                  {YouTubeSearches.map((item: any, idx: number) => (
                    <MediaCard
                      key={`yt-${idx}`}
                      type="video"
                      item={{
                        id: `yt-${idx}`,
                        description: item.Description,
                        search_query: item.Search,
                        keywords: item.Search.split(" ")
                          .filter((w: string) => w.length > 3)
                          .slice(0, 3),
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
              />
            )}
            {phase === 4 && (
              <MCQPhase
  key={currentIdx}
  mcqs={mcqs}
  mode="concept"
  onComplete={handleCompleteConcept}
  onBookmarkMCQ={async (mcqId, newValue) => {
    if (!user) return;
    await supabase.from("student_signals").upsert(
      {
        student_id: user.id,
        object_type: "hyf_mcq",   // 👈 for conversation MCQs use "hyf_mcq"
        object_uuid: mcqId,
        bookmark: newValue,
      },
      { onConflict: "student_id,object_type,object_uuid" }
    );
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