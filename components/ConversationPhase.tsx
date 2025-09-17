import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { MessageCircle, User, GraduationCap, Lightbulb, BookOpen, Bookmark, BookmarkCheck, ChevronRight, ChevronDown, ChevronUp, CircleCheck as CheckCircle, Circle as XCircle, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import MarkdownWithLatex from "@/components/MarkdownWithLatex";
import MCQPhase from "@/components/MCQPhase";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";


interface MCQOption {
  A: string;
  B: string;
  C: string;
  D: string;
}
interface MCQFeedback {
  correct: string;
  wrong: string;
}
interface MCQ {
  id: string;
  stem: string;
  options: MCQOption;
  feedback: MCQFeedback;
  learning_gap?: string;
  correct_answer: keyof MCQOption | null;  // ✅ allow null
}
interface HYF {
  uuid: string;
  text: string;
  mcqs: MCQ[];
  subject_id?: string | number;
  chapter_id?: string | number;
  topic_id?: string | number;
  vertical_id?: string | number;
}



interface ConversationPhaseProps {
  onBookmark?: (hyfUuid: string, isBookmarked: boolean) => void;
}

interface HYFCardProps {
  hyf: HYF;
  onBookmark?: (uuid: string, isBookmarked: boolean) => void;
}


function HYFCard({ hyf, index, onGotIt, onBookmark, isBookmarked = false }: HYFCardProps) {
  const [localBookmark, setLocalBookmark] = useState(isBookmarked);


  const handleBookmarkToggle = () => {
    const newValue = !localBookmark;
    setLocalBookmark(newValue);
    onBookmark?.(hyf.uuid, newValue);   // 👈 use real uuid
  };


  const markdownStyles = {
    body: {
      color: '#ffffff',
      backgroundColor: 'transparent',
      fontSize: 18,
      lineHeight: 28,
      margin: 0,
      fontFamily: 'System',
    },
    paragraph: {
      color: '#ffffff',
      marginBottom: 12,
      lineHeight: 28,
      fontSize: 18,
    },
    strong: {
      color: '#5eead4',
      fontWeight: '700',
      backgroundColor: 'rgba(94, 234, 212, 0.15)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      textShadowColor: '#0f766e',
      textShadowRadius: 8,
    },
    em: {
      color: '#34d399',
      fontStyle: 'italic',
      backgroundColor: 'transparent',
    },
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20, translateX: -30, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, translateX: 0, scale: 1 }}
      transition={{ type: 'spring', duration: 600, delay: index * 300 }}
      className="flex-row items-end mb-4 px-1"
    >
      {/* Avatar */}
      <MotiView
        from={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 500, delay: index * 300 + 200 }}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 items-center justify-center mr-3 shadow-xl"
        style={{
          shadowColor: '#14b8a6',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <MessageCircle size={20} color="#ffffff" />
      </MotiView>

      {/* HYF Card */}
      <View className="w-[70%] relative">
        <MotiView
          from={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 600, delay: index * 300 + 100 }}
          className="bg-gradient-to-br from-teal-600 to-cyan-700 rounded-2xl rounded-bl-md px-4 py-3 shadow-xl relative"
          style={{
            shadowColor: '#0f766e',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          {/* HYF Badge */}
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full items-center justify-center mr-3">
              <Text className="text-white font-bold text-sm">HYF</Text>
            </View>
            <Text className="text-teal-100 font-bold text-lg">High-Yield Fact #{index + 1}</Text>
          </View>

          <MarkdownWithLatex content={hyf.text} markdownStyles={markdownStyles} />

          {/* Enhanced Content Layout */}
          <View className="mt-8 space-y-6">
            {/* Content Enhancement Bar */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center space-x-2">
                <View className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                <Text className="text-teal-200/80 text-sm font-medium">
                  Key Learning Point
                </Text>
              </View>
              
              {/* Bookmark toggle */}
              <Pressable
                onPress={handleBookmarkToggle}
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm items-center justify-center active:scale-95 border border-white/20"
              >
                <MotiView
                  animate={{
                    scale: localBookmark ? [1, 1.3, 1] : 1,
                    rotate: localBookmark ? [0, 15, -15, 0] : 0,
                  }}
                  transition={{ type: 'spring', duration: 400 }}
                >
                  {localBookmark ? (
                    <BookmarkCheck size={20} color="#fbbf24" fill="#fbbf24" />
                  ) : (
                    <Bookmark size={20} color="#ffffff" style={{ opacity: 0.8 }} />
                  )}
                </MotiView>
              </Pressable>
            </View>

            {/* Enhanced Got It Button */}
            <MotiView
              from={{ opacity: 0, translateY: 20, scale: 0.95 }}
              animate={{ opacity: 1, translateY: 0, scale: 1 }}
              transition={{ type: 'spring', duration: 600, delay: index * 300 + 800 }}
            >
              <Pressable
                onPress={onGotIt}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 backdrop-blur-md rounded-2xl py-5 px-8 border border-white/20 shadow-2xl active:scale-95"
                style={{
                  shadowColor: '#ffffff',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.15,
                  shadowRadius: 20,
                  elevation: 8,
                }}
              >
                <View className="flex-row items-center justify-center">
                  <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mr-4">
                    <ChevronRight size={20} color="#ffffff" />
                  </View>
                  <Text className="text-white font-bold text-xl tracking-wide">
                    Got it!
                  </Text>
                  <View className="ml-4 flex-row space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <MotiView
                        key={i}
                        from={{ scale: 0.8, opacity: 0.6 }}
                        animate={{ scale: 1.2, opacity: 0 }}
                        transition={{
                          loop: true,
                          type: 'timing',
                          duration: 1500,
                          delay: i * 200,
                        }}
                        className="w-1.5 h-1.5 bg-white/60 rounded-full"
                      />
                    ))}
                  </View>
                </View>
                
                {/* Subtle progress indicator */}
                <View className="mt-4 flex-row items-center justify-center space-x-1">
                  <View className="w-1.5 h-1.5 bg-white/40 rounded-full" />
                  <View className="w-8 h-1.5 bg-white/60 rounded-full" />
                  <View className="w-1.5 h-1.5 bg-white/40 rounded-full" />
                </View>
              </Pressable>
            </MotiView>
          </View>
        </MotiView>
      </View>
    </MotiView>
  );
}



export default function ConversationPhase({
  hyfs = [],
  onComplete,
  onBookmark,
  bookmarkedHYFs = new Set()
}: ConversationPhaseProps) {
  // Normalize HYFs data
  const { user } = useAuth(); 
  const normalizedHyfs = hyfs.map((h: any, hyfIdx: number) => ({
    uuid: h.uuid || h.id || `hyf-${hyfIdx}`, // normalize HYF id
   text: h.text,
    subject_id: h.subject_id,
  chapter_id: h.chapter_id,
  topic_id: h.topic_id,
  vertical_id: h.vertical_id,
  mcqs: (h.mcqs ?? h.MCQs ?? []).map((m: any, mcqIdx: number) => {
      const rawKey = m.correct_answer?.toString().trim().toUpperCase();
      const validKeys: (keyof MCQOption)[] = ["A", "B", "C", "D"];
      const finalKey = validKeys.includes(rawKey as keyof MCQOption)
        ? (rawKey as keyof MCQOption)
        : null;

      return {
        id: m.id || m.uuid || crypto.randomUUID(),
        stem: m.stem ?? m.question ?? "",
        options: m.options,
        feedback: m.feedback,
        learning_gap: m.learning_gap ?? m.Learning_Gap ?? m.learningGap ?? "",
        correct_answer: finalKey,   // ✅ null if invalid/missing
      };
    }),
  }));

  const [currentHYFIndex, setCurrentHYFIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const isMobile = Dimensions.get('window').width < 768;

   const currentHYF = normalizedHyfs[currentHYFIndex];




  const handleNextHYF = () => {
  if (currentHYFIndex < normalizedHyfs.length - 1) {
    setCurrentHYFIndex(currentHYFIndex + 1);
  } else {
    setIsComplete(true);
    onComplete?.();
  }
};


const [showMCQs, setShowMCQs] = useState(false);

const handleGotIt = () => {
  if (currentHYF?.mcqs?.length > 0) {
    setShowMCQs(true);   // 👉 show MCQPhase
  } else {
    handleNextHYF();
  }
};


  return (
    <View className="flex-1 bg-slate-900">
      {/* Hero Header */}
      <MotiView
        from={{ opacity: 0, translateY: -30 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 800 }}
        className="relative overflow-hidden"
      >
        {/* Animated background gradient */}
        <MotiView
          from={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 0.1 }}
          transition={{
            loop: true,
            type: 'timing',
            duration: 8000,
          }}
          className="absolute inset-0 bg-gradient-to-br from-teal-500/20 via-cyan-500/10 to-indigo-500/20"
        />
        
        <View className="flex-row items-center justify-between p-8 pt-16 border-b border-slate-700/30">
          <View className="flex-row items-center flex-1">
            <MotiView
              from={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', duration: 1000, delay: 200 }}
              className="w-16 h-16 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-3xl items-center justify-center mr-6 shadow-2xl"
              style={{
                shadowColor: '#14b8a6',
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.4,
                shadowRadius: 24,
                elevation: 12,
              }}
            >
              <MessageCircle size={32} color="#ffffff" />
              
              {/* Rotating glow */}
              <MotiView
                from={{ rotate: '0deg', scale: 1 }}
                animate={{ rotate: '360deg', scale: 1.4 }}
                transition={{
                  loop: true,
                  type: 'timing',
                  duration: 6000,
                }}
                className="absolute inset-0 rounded-3xl bg-teal-400/20"
              />
            </MotiView>
            
            <View className="flex-1">
              <MotiView
                from={{ opacity: 0, translateX: -30 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'spring', duration: 800, delay: 400 }}
              >
                <Text className="text-sm text-teal-400 font-semibold mb-2 uppercase tracking-wide">
                  High-Yield Facts Phase
                </Text>
                <Text className="text-4xl font-extrabold text-slate-50 mb-3 leading-tight tracking-wide">
                  Interactive Learning
                </Text>
                <Text className="text-xl font-medium text-slate-200 tracking-wide">
                  Master key concepts through guided practice
                </Text>
              </MotiView>
            </View>
          </View>

          {/* Progress Indicator */}
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', duration: 600, delay: 600 }}
            className="items-center"
          >
            <View className="bg-teal-500/20 rounded-2xl px-4 py-3 border border-teal-500/30 shadow-lg">
              <Text className="text-teal-400 font-bold text-xl">
                {currentHYFIndex + 1}
              </Text>
              <Text className="text-teal-300/80 text-xs text-center">
                of {normalizedHyfs.length}
              </Text>
            </View>
          </MotiView>
        </View>
      </MotiView>

      {/* Content */}
      <ScrollView 
        ref={scrollViewRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: isMobile ? 16 : 24,
          paddingVertical: 24,
          paddingBottom: 120,
          flexGrow: 1,
        }}
      >
        {!isComplete ? (
          <>
            {/* Current HYF */}
{!showMCQs && (
  <HYFCard
  hyf={currentHYF}
  index={currentHYFIndex}
  onGotIt={handleGotIt}
  onBookmark={(uuid, newValue) => {
    // Save to DB
    onBookmark?.(uuid, newValue);
  }}
  isBookmarked={bookmarkedHYFs.has(currentHYF.uuid)} // use uuid not index
/>


)}


            {/* Current MCQ */}
            {showMCQs && currentHYF?.mcqs?.length > 0 && (
  <MCQPhase
  mcqs={currentHYF.mcqs}
  mode="conversation"
  stopOnFirstCorrect
  onComplete={() => {
    setShowMCQs(false);
    handleNextHYF();
  }}
  // ✅ Log MCQ attempt
  onAttemptMCQ={async (mcq, selectedOption, isCorrect) => {
    if (!user) return;
    try {
     const { error } = await supabase.from("student_mcq_attempts").insert({
  student_id: user.id,
  vertical_id: currentHYF.vertical_id || null,   // ✅ only vertical_id needed
  mcq_key: mcq.mcq_key || "conversation_mcq",
  mcq_uuid: mcq.id || mcq.uuid,
  selected_option: selectedOption,
  correct_answer: mcq.correct_answer,
  is_correct: isCorrect,
  learning_gap: mcq.learning_gap || null,
  hyf_uuid: currentHYF.uuid,
  mcq_category: "conversation",
  feedback: mcq.feedback ? mcq.feedback : null,
});


      if (error) {
        console.error("❌ Failed to insert HYF MCQ attempt:", error);
      } else {
        console.log(`✅ Logged HYF MCQ attempt for ${mcq.id}`);
      }
    } catch (err) {
      console.error("❌ Exception inserting HYF MCQ attempt:", err);
    }
  }}
  // ✅ Bookmark handler
  onBookmarkMCQ={async (mcqId, newValue) => {
    if (!user) return;
    try {
      const { error } = await supabase.from("student_signals").upsert(
        {
          student_id: user.id,
          object_type: "conversation_mcq",
          object_uuid: mcqId,
          bookmark: newValue,
        },
        { onConflict: "student_id,object_type,object_uuid" }
      );

      if (error) {
        console.error("❌ Failed to update MCQ bookmark:", error);
      } else {
        console.log(`✅ Bookmark for HYF MCQ ${mcqId} set to ${newValue}`);
        setCurrentHYFIndex((prevIdx) => {
          normalizedHyfs[prevIdx].mcqs = normalizedHyfs[prevIdx].mcqs.map((m) =>
            m.id === mcqId ? { ...m, isBookmarked: newValue } : m
          );
          return prevIdx;
        });
      }
    } catch (err) {
      console.error("❌ Exception updating HYF MCQ bookmark:", err);
    }
  }}
/>

)}


          </>
        ) : (
          /* Completion Screen */
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', duration: 800 }}
            className="items-center justify-center flex-1 py-12"
          >
            <View className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl items-center justify-center mb-6 shadow-2xl">
              <CheckCircle size={40} color="#ffffff" />
            </View>
            <Text className="text-3xl font-bold text-slate-100 mb-2 text-center">
              🎉 All HYFs Completed!
            </Text>
            <Text className="text-slate-300 text-lg text-center">
              You've mastered {normalizedHyfs.length} high-yield concepts
            </Text>
          </MotiView>
        )}
      </ScrollView>


      {/* Floating Action Elements */}
      {/* Floating Action Elements */}
<View className="absolute top-32 right-8 pointer-events-none">
  {[...Array(5)].map((_, i) => (
    <MotiView
      key={i}
      pointerEvents="none"   // 👈 add this line
      from={{ 
        opacity: 0, 
        translateY: Math.random() * 80,
        translateX: Math.random() * 80,
        scale: 0
      }}
      animate={{ 
        opacity: [0, 0.4, 0],
        translateY: Math.random() * -150,
        translateX: Math.random() * 40 - 20,
        scale: [0, 1, 0]
      }}
      transition={{
        loop: true,
        type: 'timing',
        duration: 5000,
        delay: i * 1000,
      }}
      className="absolute"
      style={{
        left: Math.random() * 100,
        top: Math.random() * 150,
      }}
    >
      <View className="w-2 h-2 bg-cyan-400 rounded-full shadow-lg" />
    </MotiView>
  ))}
</View>

    </View>
  );
}