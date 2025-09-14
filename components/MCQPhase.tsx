// components/MCQPhase.tsx
import React, { useState, useRef, useEffect } from "react";
import { View, Text, Pressable, ScrollView, Dimensions } from "react-native";
import { MotiView } from "moti";
import ConfettiCannon from "react-native-confetti-cannon";
import {
  CheckCircle,
  XCircle,
  MessageCircle,
  Lightbulb,
  ChevronRight,
  Target,
  Award,
  Sparkles,
} from "lucide-react-native";
import MarkdownWithLatex from "@/components/MarkdownWithLatex";

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
  correct_answer: keyof MCQOption;
}

interface MCQPhaseProps {
  mcqs: MCQ[];
  onComplete?: () => void;
}

interface AnsweredMCQ {
  mcq: MCQ;
  selectedOption: keyof MCQOption;
  isCorrect: boolean;
  showFeedback: boolean;
}

// 🔀 Shuffle logic (preserve dbKey but assign new UI labels)
function shuffleOptions(mcq: MCQ) {
  const entries = Object.entries(mcq.options).map(([dbKey, value]) => ({
    dbKey: dbKey as keyof MCQOption,
    value,
  }));

  // Fisher-Yates shuffle
  for (let i = entries.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [entries[i], entries[j]] = [entries[j], entries[i]];
  }

  const uiLabels: (keyof MCQOption)[] = ["A", "B", "C", "D"];
  return entries.map((entry, idx) => ({
    uiLabel: uiLabels[idx], // shown on UI
    dbKey: entry.dbKey, // real DB key
    value: entry.value,
  }));
}

function MCQCard({
  mcq,
  index,
  onAnswer,
  answeredMCQ,
  isActive,
}: {
  mcq: MCQ;
  index: number;
  onAnswer: (option: keyof MCQOption) => void;
  answeredMCQ?: AnsweredMCQ;
  isActive: boolean;
}) {
  // shuffle once per question
  const shuffledOptions = useRef(shuffleOptions(mcq)).current;

  const markdownStyles = {
    body: { color: "#f1f5f9", fontSize: 18, lineHeight: 28, fontFamily: "System" },
    paragraph: { color: "#f1f5f9", marginBottom: 16, lineHeight: 28, fontSize: 18 },
    strong: {
      color: "#5eead4",
      fontWeight: "700",
      backgroundColor: "rgba(94, 234, 212, 0.15)",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    em: { color: "#34d399", fontStyle: "italic" },
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 50, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: "spring", duration: 800, delay: 200 }}
      className="mb-8"
    >
      <View
        className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden"
        style={{
          shadowColor: isActive ? "#14b8a6" : "#475569",
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.25,
          shadowRadius: 24,
          elevation: 12,
        }}
      >
        {/* Header */}
        <View className="relative overflow-hidden">
          <View className="flex-row items-center p-6 border-b border-slate-700/30 bg-slate-800/40">
            <View className="flex-1">
              <Text className="text-teal-400 text-sm font-bold uppercase tracking-wider mb-1">
                MCQ Practice
              </Text>
              <Text className="text-slate-100 text-2xl font-bold">
                Question {index + 1}
              </Text>
            </View>
          </View>
        </View>

        {/* Question Stem */}
        <View className="p-8">
          <View className="bg-slate-900/40 rounded-2xl p-6 border border-slate-600/30 mb-8 shadow-inner">
            <MarkdownWithLatex content={mcq.stem} markdownStyles={markdownStyles} />
          </View>

          {/* Options */}
          <View className="space-y-4">
            {shuffledOptions.map((opt, optionIndex) => {
              const isSelected = answeredMCQ?.selectedOption === opt.dbKey;
              const isCorrect = opt.dbKey === mcq.correct_answer;
              const isDisabled = !!answeredMCQ;

              let optionStyle =
                "bg-slate-800/80 border-slate-600/50 hover:border-teal-500/60 hover:bg-slate-700/80 active:scale-[0.98]";
              let textColor = "text-slate-100";
              let borderWidth = "border-2";

              if (isDisabled) {
                if (isSelected) {
                  if (answeredMCQ?.isCorrect) {
                    optionStyle =
                      "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/60";
                    textColor = "text-emerald-100";
                    borderWidth = "border-3";
                  } else {
                    optionStyle =
                      "bg-gradient-to-r from-red-500/20 to-rose-500/20 border-red-500/60";
                    textColor = "text-red-100";
                    borderWidth = "border-3";
                  }
                } else if (isCorrect && !answeredMCQ?.isCorrect) {
                  optionStyle =
                    "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/60";
                  textColor = "text-emerald-100";
                  borderWidth = "border-3";
                }
              }

              return (
                <MotiView
                  key={`${mcq.id}-${opt.uiLabel}`}
                  from={{ opacity: 0, translateX: -30, scale: 0.9 }}
                  animate={{ opacity: 1, translateX: 0, scale: 1 }}
                  transition={{ type: "spring", duration: 600, delay: 600 + optionIndex * 150 }}
                >
                  <Pressable
                    onPress={() => !isDisabled && onAnswer(opt.dbKey)} // ✅ use dbKey
                    disabled={isDisabled}
                    className={`${optionStyle} ${borderWidth} rounded-2xl p-6 flex-row items-center transition-all duration-200`}
                  >
                    {/* Fixed A–D label */}
                    <MotiView
                      from={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", duration: 500, delay: 800 + optionIndex * 150 }}
                      className="w-12 h-12 rounded-2xl items-center justify-center mr-6 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600"
                    >
                      <Text className="text-white font-bold text-xl">{opt.uiLabel}</Text>
                    </MotiView>

                    {/* Shuffled value */}
                    <View className="flex-1">
                      <MarkdownWithLatex content={opt.value} markdownStyles={markdownStyles} />
                    </View>

                    {/* Selection indicator */}
                    {isSelected && (
                      <MotiView
                        from={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", duration: 400 }}
                        className="ml-4"
                      >
                        {answeredMCQ?.isCorrect ? (
                          <CheckCircle size={24} color="#10b981" />
                        ) : (
                          <XCircle size={24} color="#ef4444" />
                        )}
                      </MotiView>
                    )}
                  </Pressable>
                </MotiView>
              );
            })}
          </View>
        </View>
      </View>
    </MotiView>
  );
}

export default function MCQPhase({ mcqs = [], onComplete }: MCQPhaseProps) {
  const { width } = Dimensions.get("window");
  const isMobile = width < 768;

  const [answeredMCQs, setAnsweredMCQs] = useState<AnsweredMCQ[]>([]);
  const [currentMCQIndex, setCurrentMCQIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [conceptComplete, setConceptComplete] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  // Auto scroll when new feedback appears
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 300);
    }
  }, [answeredMCQs, currentMCQIndex, isComplete]);

  const handleAnswer = (selectedOption: keyof MCQOption) => {
    const currentMCQ = mcqs[currentMCQIndex];
    const isCorrect = selectedOption === currentMCQ.correct_answer;

    const newAnsweredMCQ: AnsweredMCQ = {
      mcq: currentMCQ,
      selectedOption,
      isCorrect,
      showFeedback: true,
    };

    setAnsweredMCQs((prev) => {
      const updated = [...prev];
      updated[currentMCQIndex] = newAnsweredMCQ;
      return updated;
    });

    if (isCorrect) {
      setConceptComplete(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const handleNextQuestion = () => {
    if (currentMCQIndex < mcqs.length - 1) {
      setCurrentMCQIndex((prev) => prev + 1);
    } else {
      setIsComplete(true);
    }
  };

  const correctCount = answeredMCQs.filter((a) => a?.isCorrect).length;

  return (
    <View className="flex-1 bg-slate-900">
      {showConfetti && (
        <ConfettiCannon count={120} origin={{ x: width / 2, y: 0 }} autoStart fadeOut />
      )}

      {/* TODO: Add your header / feedback / completion UI here like before */}
      {/* I left only MCQCard part for clarity. 
          You can reuse your previous FeedbackCard + CompletionCard without changing logic. */}
      <ScrollView ref={scrollViewRef} className="flex-1" showsVerticalScrollIndicator={false}>
        {!isComplete && !conceptComplete && currentMCQIndex < mcqs.length && !answeredMCQs[currentMCQIndex] && (
          <MCQCard
            mcq={mcqs[currentMCQIndex]}
            index={currentMCQIndex}
            onAnswer={handleAnswer}
            isActive={true}
          />
        )}
      </ScrollView>
    </View>
  );
}
