// components/MCQPhase.tsx
import React, { useState, useRef, useEffect } from "react";
import { View, Text, Pressable, ScrollView, Dimensions } from "react-native";
import { MotiView } from "moti";
import ConfettiCannon from "react-native-confetti-cannon";
import {
  CheckCircle,
  XCircle,
  ChevronRight,
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

// 🔀 Shuffle logic
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
    uiLabel: uiLabels[idx],
    dbKey: entry.dbKey,
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
  const shuffledOptions = useRef(shuffleOptions(mcq)).current;

  const markdownStyles = {
    body: { color: "#f1f5f9", fontSize: 18, lineHeight: 28 },
    paragraph: { color: "#f1f5f9", marginBottom: 16, fontSize: 18 },
    strong: {
      color: "#5eead4",
      fontWeight: "700",
      backgroundColor: "rgba(94,234,212,0.15)",
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
      transition={{ type: "spring", duration: 800 }}
      className="mb-8"
    >
      <View className="bg-slate-800/90 rounded-3xl border border-slate-700 shadow-xl overflow-hidden">
        {/* Header */}
        <View className="flex-row items-center p-6 border-b border-slate-700 bg-slate-800/40">
          <Text className="text-teal-400 text-sm font-bold uppercase tracking-wider flex-1">
            MCQ Practice
          </Text>
          <Text className="text-slate-100 text-xl font-bold">
            Q{index + 1}
          </Text>
        </View>

        {/* Stem */}
        <View className="p-6">
          <View className="bg-slate-900/40 rounded-2xl p-6 border border-slate-600/30 mb-6">
            <MarkdownWithLatex content={mcq.stem} markdownStyles={markdownStyles} />
          </View>

          {/* Options */}
          <View className="space-y-4">
            {shuffledOptions.map((opt, optionIndex) => {
              const isSelected = answeredMCQ?.selectedOption === opt.dbKey;
              const isCorrect = opt.dbKey === mcq.correct_answer;
              const isDisabled = !!answeredMCQ;

              let optionStyle =
                "bg-slate-800/80 border-slate-600/50 hover:border-teal-500/60 hover:bg-slate-700/80";
              let textColor = "text-slate-100";
              let borderWidth = "border-2";

              if (isDisabled) {
                if (isSelected) {
                  if (answeredMCQ?.isCorrect) {
                    optionStyle =
                      "bg-emerald-500/20 border-emerald-500/60";
                    textColor = "text-emerald-100";
                    borderWidth = "border-3";
                  } else {
                    optionStyle =
                      "bg-red-500/20 border-red-500/60";
                    textColor = "text-red-100";
                    borderWidth = "border-3";
                  }
                } else if (isCorrect && !answeredMCQ?.isCorrect) {
                  optionStyle =
                    "bg-emerald-500/20 border-emerald-500/60";
                  textColor = "text-emerald-100";
                  borderWidth = "border-3";
                }
              }

              return (
                <MotiView
                  key={`${mcq.id}-${opt.uiLabel}`}
                  from={{ opacity: 0, translateX: -30 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ type: "spring", duration: 500, delay: optionIndex * 100 }}
                >
                  <Pressable
                    onPress={() => !isDisabled && onAnswer(opt.dbKey)}
                    disabled={isDisabled}
                    className={`${optionStyle} ${borderWidth} rounded-2xl p-6 flex-row items-center`}
                  >
                    {/* Fixed A–D label */}
                    <View className="w-12 h-12 rounded-2xl items-center justify-center mr-6 bg-gradient-to-br from-blue-500 to-indigo-600">
                      <Text className="text-white font-bold text-xl">{opt.uiLabel}</Text>
                    </View>

                    {/* Shuffled text */}
                    <View className="flex-1">
                      <MarkdownWithLatex content={opt.value} markdownStyles={markdownStyles} />
                    </View>

                    {/* Indicator */}
                    {isSelected && (
                      <View className="ml-4">
                        {answeredMCQ?.isCorrect ? (
                          <CheckCircle size={24} color="#10b981" />
                        ) : (
                          <XCircle size={24} color="#ef4444" />
                        )}
                      </View>
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
  const [answeredMCQs, setAnsweredMCQs] = useState<AnsweredMCQ[]>([]);
  const [currentMCQIndex, setCurrentMCQIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 300);
    }
  }, [answeredMCQs, currentMCQIndex, isComplete]);

  const handleAnswer = (selectedOption: keyof MCQOption) => {
    const currentMCQ = mcqs[currentMCQIndex];
    const isCorrect = selectedOption === currentMCQ.correct_answer;

    const newAnswered: AnsweredMCQ = {
      mcq: currentMCQ,
      selectedOption,
      isCorrect,
      showFeedback: true,
    };

    setAnsweredMCQs((prev) => {
      const updated = [...prev];
      updated[currentMCQIndex] = newAnswered;
      return updated;
    });

    if (isCorrect) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  };

  const handleNext = () => {
    if (currentMCQIndex < mcqs.length - 1) {
      setCurrentMCQIndex((i) => i + 1);
    } else {
      setIsComplete(true);
    }
  };

  const correctCount = answeredMCQs.filter((a) => a?.isCorrect).length;

  return (
    <View className="flex-1 bg-slate-900">
      {showConfetti && (
        <ConfettiCannon count={100} origin={{ x: width / 2, y: 0 }} autoStart fadeOut />
      )}

      <ScrollView ref={scrollViewRef} className="flex-1 p-4">
        {/* Show already answered */}
        {answeredMCQs.map((ans, idx) => (
          <View key={ans.mcq.id || idx}>
            <MCQCard
              mcq={ans.mcq}
              index={idx}
              onAnswer={() => {}}
              answeredMCQ={ans}
              isActive={false}
            />

            {/* Next button after feedback */}
            {idx === currentMCQIndex && (
              <Pressable
                onPress={handleNext}
                className="bg-emerald-600 rounded-2xl px-6 py-4 items-center mt-4"
              >
                <Text className="text-white font-bold">
                  {ans.isCorrect ? "Next Concept" : "Next Question"}
                </Text>
              </Pressable>
            )}
          </View>
        ))}

        {/* Active question */}
        {!isComplete &&
          currentMCQIndex < mcqs.length &&
          !answeredMCQs[currentMCQIndex] && (
            <MCQCard
              mcq={mcqs[currentMCQIndex]}
              index={currentMCQIndex}
              onAnswer={handleAnswer}
              isActive={true}
            />
          )}

        {/* Completion card */}
        {isComplete && (
          <View className="items-center justify-center mt-12 p-8 rounded-3xl bg-emerald-900/40 border border-emerald-500/40">
            <Award size={40} color="#10b981" />
            <Text className="text-emerald-100 text-2xl font-bold mt-4">
              🎉 All MCQs Completed!
            </Text>
            <Text className="text-emerald-200 text-lg mt-2">
              You scored {correctCount} / {mcqs.length}
            </Text>
            <Pressable
              onPress={onComplete}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl px-8 py-4 mt-6 flex-row items-center"
            >
              <Sparkles size={20} color="#fff" />
              <Text className="text-white font-bold text-lg ml-2">Next Concept</Text>
              <ChevronRight size={20} color="#fff" />
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
