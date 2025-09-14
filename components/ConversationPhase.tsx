import React, { useState, useRef } from "react";
import { View, Text, Pressable, ScrollView, Dimensions } from "react-native";
import { MotiView } from "moti";
import {
  MessageCircle,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  CircleCheck as CheckCircle,
} from "lucide-react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import MarkdownWithLatex from "@/components/MarkdownWithLatex";
import MCQPhase from "@/components/MCQPhase"; // <-- use your existing MCQPhase

interface MCQ {
  id: string;
  stem: string;
  options: Record<string, string>;
  correct_answer: string;
  feedback: { correct: string; wrong: string };
  learning_gap?: string;
}

interface HYF {
  text: string;
  mcqs: MCQ[];
}

interface ConversationPhaseProps {
  hyfs?: HYF[];
  onComplete?: () => void;
  onBookmark?: (hyfIndex: number, isBookmarked: boolean) => void;
  bookmarkedHYFs?: Set<number>;
}

interface HYFCardProps {
  hyf: HYF;
  index: number;
  onGotIt: () => void;
  onBookmark?: (index: number, isBookmarked: boolean) => void;
  isBookmarked?: boolean;
}

function HYFCard({
  hyf,
  index,
  onGotIt,
  onBookmark,
  isBookmarked = false,
}: HYFCardProps) {
  const [localBookmark, setLocalBookmark] = useState(isBookmarked);

  const handleBookmarkToggle = () => {
    const newValue = !localBookmark;
    setLocalBookmark(newValue);
    onBookmark?.(index, newValue);
  };

  const markdownStyles = {
    body: { color: "#ffffff", fontSize: 18, lineHeight: 28 },
    paragraph: { color: "#ffffff", marginBottom: 12, lineHeight: 28 },
    strong: {
      color: "#5eead4",
      fontWeight: "700",
      backgroundColor: "rgba(94, 234, 212, 0.15)",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    em: { color: "#34d399", fontStyle: "italic" },
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "spring", duration: 600 }}
      className="flex-row items-end mb-4 px-1"
    >
      {/* Avatar */}
      <MotiView className="w-10 h-10 rounded-full bg-teal-500 items-center justify-center mr-3 shadow-xl">
        <MessageCircle size={20} color="#ffffff" />
      </MotiView>

      {/* HYF Card */}
      <View className="w-[70%] relative">
        <MotiView className="bg-teal-600 rounded-2xl px-4 py-3 shadow-xl">
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 bg-amber-500 rounded-full items-center justify-center mr-3">
              <Text className="text-white font-bold text-sm">HYF</Text>
            </View>
            <Text className="text-teal-100 font-bold text-lg">
              High-Yield Fact #{index + 1}
            </Text>
          </View>

          <MarkdownWithLatex content={hyf.text} markdownStyles={markdownStyles} />

          {/* Bookmark + Got It */}
          <View className="mt-6 flex-row justify-between items-center">
            <Pressable
              onPress={handleBookmarkToggle}
              className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
            >
              {localBookmark ? (
                <BookmarkCheck size={20} color="#fbbf24" fill="#fbbf24" />
              ) : (
                <Bookmark size={20} color="#ffffff" />
              )}
            </Pressable>

            <Pressable
              onPress={onGotIt}
              className="bg-emerald-600 rounded-2xl py-3 px-6 shadow-2xl"
            >
              <View className="flex-row items-center">
                <ChevronRight size={20} color="#ffffff" />
                <Text className="text-white font-bold text-lg ml-2">Got it!</Text>
              </View>
            </Pressable>
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
  bookmarkedHYFs = new Set(),
}: ConversationPhaseProps) {
  const [currentHYFIndex, setCurrentHYFIndex] = useState(0);
  const [showMCQ, setShowMCQ] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const isMobile = Dimensions.get("window").width < 768;

  const currentHYF = hyfs[currentHYFIndex];

  const handleNextHYF = () => {
    if (currentHYFIndex < hyfs.length - 1) {
      setCurrentHYFIndex(currentHYFIndex + 1);
      setShowMCQ(false);
    } else {
      setIsComplete(true);
      onComplete?.();
    }
  };

  return (
    <View className="flex-1 bg-slate-900">
      {/* Header */}
      <MotiView className="p-8 pt-16 border-b border-slate-700/30">
        <View className="flex-row items-center">
          <MotiView className="w-16 h-16 bg-teal-500 rounded-3xl items-center justify-center mr-6 shadow-2xl">
            <MessageCircle size={32} color="#ffffff" />
          </MotiView>
          <View className="flex-1">
            <Text className="text-sm text-teal-400 font-semibold mb-2 uppercase">
              High-Yield Facts Phase
            </Text>
            <Text className="text-3xl font-extrabold text-slate-50 mb-2">
              Interactive Learning
            </Text>
            <Text className="text-lg text-slate-200">
              Master key concepts through guided practice
            </Text>
          </View>
        </View>
      </MotiView>

      {/* Content */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: isMobile ? 16 : 24,
          paddingVertical: 24,
          paddingBottom: 120,
        }}
      >
        {!isComplete ? (
          <>
            {!showMCQ && (
              <HYFCard
                hyf={currentHYF}
                index={currentHYFIndex}
                onGotIt={() => setShowMCQ(true)}
                onBookmark={onBookmark}
                isBookmarked={bookmarkedHYFs.has(currentHYFIndex)}
              />
            )}

            {showMCQ && (
              <MCQPhase
                mcqs={currentHYF.mcqs}
                onComplete={() => {
                  setShowConfetti(true);
                  setTimeout(() => setShowConfetti(false), 2000);
                  handleNextHYF();
                }}
              />
            )}
          </>
        ) : (
          <MotiView className="items-center justify-center flex-1 py-12">
            <View className="w-20 h-20 bg-emerald-500 rounded-3xl items-center justify-center mb-6 shadow-2xl">
              <CheckCircle size={40} color="#ffffff" />
            </View>
            <Text className="text-3xl font-bold text-slate-100 mb-2 text-center">
              🎉 All HYFs Completed!
            </Text>
            <Text className="text-slate-300 text-lg text-center">
              You've mastered {hyfs.length} high-yield concepts
            </Text>
          </MotiView>
        )}
      </ScrollView>

      {showConfetti && (
        <ConfettiCannon
          count={80}
          origin={{ x: Dimensions.get("window").width / 2, y: 0 }}
          autoStart
          fadeOut
        />
      )}
    </View>
  );
}
