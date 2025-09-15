// components/MCQPhase.tsx
import React, { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, ScrollView, Dimensions } from "react-native";
import { MotiView } from "moti";
import ConfettiCannon from "react-native-confetti-cannon";
import { CheckCircle, XCircle, ChevronRight, Award, Sparkles } from "lucide-react-native";
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
  mode?: "conversation" | "concept";  // 👈 add this
}

interface AnsweredMCQ {
  mcq: MCQ;
  selectedValue: string;
  isCorrect: boolean;
  correctUiLabel: string; // UI label of correct answer
  showFeedback: boolean;
}

function shuffleOptions(mcq: MCQ) {
  const dbKeys = Object.keys(mcq.options) as (keyof MCQOption)[];
  const values = dbKeys.map((k) => ({ dbKey: k, value: mcq.options[k] }));

  // Fisher–Yates shuffle
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }

  const uiLabels: (keyof MCQOption)[] = ["A", "B", "C", "D"];
  return values.map((entry, idx) => ({
    uiLabel: uiLabels[idx],
    dbKey: entry.dbKey,
    value: entry.value,
  }));
}

function MCQCard({
  mcq,
  shuffledOptions,
  onAnswer,
  answeredMCQ,
}: {
  mcq: MCQ;
  shuffledOptions: ReturnType<typeof shuffleOptions>;
  onAnswer: (selectedValue: string, correctUiLabel: string) => void;
  answeredMCQ?: AnsweredMCQ;
}) {
  const correctValue = mcq.options[mcq.correct_answer];
  const correctUiLabel =
    shuffledOptions.find((opt) => opt.value === correctValue)?.uiLabel || "?";

  return (
    <MotiView
      from={{ opacity: 0, translateY: 50, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: "spring", duration: 800 }}
      className="mb-8"
    >
      <View className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden">
        {/* Question Stem */}
        <View className="p-6">
          <View className="bg-slate-900/40 rounded-2xl p-6 border border-slate-600/30 mb-6 shadow-inner">
            <MarkdownWithLatex
              content={mcq.stem}
              markdownStyles={{ body: { color: "#f1f5f9", fontSize: 18 } }}
            />
          </View>

          {/* Options */}
          <View className="space-y-4">
            {shuffledOptions.map((opt) => {
              const isSelected = answeredMCQ?.selectedValue === opt.value;
              const isCorrect = opt.value === correctValue;
              const isDisabled = !!answeredMCQ;

              let optionStyle = "bg-slate-800/80 border-slate-600/50 hover:border-teal-500/60";
              if (isDisabled) {
                if (isSelected) {
                  optionStyle = answeredMCQ?.isCorrect
                    ? "bg-emerald-500/20 border-emerald-500/60"
                    : "bg-red-500/20 border-red-500/60";
                } else if (isCorrect && !answeredMCQ?.isCorrect) {
                  optionStyle = "bg-emerald-500/20 border-emerald-500/60";
                }
              }

              return (
                <Pressable
                  key={`${mcq.id}-${opt.uiLabel}`}
                  onPress={() => !isDisabled && onAnswer(opt.value, correctUiLabel)}
                  disabled={isDisabled}
                  className={`${optionStyle} border-2 rounded-2xl p-6 flex-row items-center`}
                >
                  {/* Fixed A–D label */}
                  <View className="w-12 h-12 rounded-2xl items-center justify-center mr-6 bg-gradient-to-br from-blue-500 to-indigo-600">
                    <Text className="text-white font-bold text-xl">{opt.uiLabel}</Text>
                  </View>

                  {/* Option value */}
                  <View className="flex-1">
                    <MarkdownWithLatex
                      content={opt.value}
                      markdownStyles={{ body: { color: "#f1f5f9", fontSize: 16 } }}
                    />
                  </View>

                  {/* Tick / Cross */}
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
              );
            })}
          </View>
        </View>
      </View>
    </MotiView>
  );
}

function FeedbackCard({ mcq, answered }: { mcq: MCQ; answered: AnsweredMCQ }) {
  return (
    <View className="mb-8">
      {!answered.isCorrect && (
        <>
          <View className="bg-red-900/40 rounded-2xl border border-red-500/40 p-6 mb-4">
            <Text className="text-red-300 font-bold mb-2">❌ Incorrect</Text>
            <MarkdownWithLatex content={mcq.feedback?.wrong} />
          </View>

          {mcq.learning_gap && (
            <View className="bg-amber-900/40 rounded-2xl border border-amber-500/40 p-6 mb-4">
              <Text className="text-amber-300 font-bold mb-2">💡 Learning Gap</Text>
              <Text className="text-amber-100">{mcq.learning_gap}</Text>
            </View>
          )}
        </>
      )}

      <View className="bg-emerald-900/40 rounded-2xl border border-emerald-500/40 p-6">
        <Text className="text-emerald-300 font-bold mb-2">
          ✅ {answered.isCorrect ? "Correct!" : "Correct Answer"}
        </Text>
        <MarkdownWithLatex content={mcq.feedback?.correct} />
        <Text className="text-emerald-200 mt-2">Correct Option: {answered.correctUiLabel}</Text>
      </View>
    </View>
  );
}

export default function MCQPhase({ mcqs = [], onComplete, mode = "concept" }: MCQPhaseProps) {
  const { width } = Dimensions.get("window");
  const [answeredMCQs, setAnsweredMCQs] = useState<AnsweredMCQ[]>([]);
  const [currentMCQIndex, setCurrentMCQIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // 🔐 Pre-shuffle once
  const [shuffledOptionsList] = useState(() => mcqs.map(shuffleOptions));

  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 300);
    }
  }, [answeredMCQs, currentMCQIndex, isComplete]);

const handleAnswer = (selectedValue: string) => {
  const currentMCQ = mcqs[currentMCQIndex];
  const correctDbKey = currentMCQ.correct_answer;

  const correctUiLabel =
    shuffledOptionsList[currentMCQIndex].find((opt) => opt.dbKey === correctDbKey)?.uiLabel || "?";

  const selectedDbKey = shuffledOptionsList[currentMCQIndex]
    .find((opt) => opt.value === selectedValue)?.dbKey;

  const isCorrect = selectedDbKey === correctDbKey;

  const newAnswered: AnsweredMCQ = {
    mcq: currentMCQ,
    selectedValue,
    isCorrect,
    correctUiLabel,
    showFeedback: true,
  };

  setAnsweredMCQs((prev) => {
    const updated = [...prev];
    updated[currentMCQIndex] = newAnswered;
    return updated;
  });

  if (isCorrect) {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1500);

    // 👇 Stop immediately depending on mode
    if (mode === "conversation" || mode === "concept") {
      setIsComplete(true);
    }
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
        <ConfettiCannon count={120} origin={{ x: width / 2, y: 0 }} autoStart fadeOut />
      )}

      {/* Header */}
      <MotiView
        from={{ opacity: 0, translateY: -30 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "spring", duration: 700 }}
        className="p-6 border-b border-slate-700/50 bg-slate-800/60"
      >
        <Text className="text-teal-400 text-sm font-bold uppercase">Interactive Questions</Text>
        <Text className="text-slate-100 text-2xl font-bold mt-1">Test Your Understanding</Text>
        <Text className="text-slate-400 text-sm mt-1">
          Question {currentMCQIndex + 1} / {mcqs.length}
        </Text>
      </MotiView>

      <ScrollView ref={scrollViewRef} className="flex-1 p-4">
        {answeredMCQs.map((ans, idx) => (
          <View key={ans.mcq.id || idx}>
            <MCQCard
              mcq={ans.mcq}
              shuffledOptions={shuffledOptionsList[idx]}
              onAnswer={handleAnswer}
              answeredMCQ={ans}
            />
            {ans.showFeedback && <FeedbackCard mcq={ans.mcq} answered={ans} />}
            {idx === currentMCQIndex && (
              <Pressable
                onPress={handleNext}
                className="bg-emerald-600 rounded-2xl px-6 py-4 items-center mt-2"
              >
                <Text className="text-white font-bold">
                  {ans.isCorrect ? "Next Concept" : "Next Question"}
                </Text>
              </Pressable>
            )}
          </View>
        ))}

        {!isComplete && currentMCQIndex < mcqs.length && !answeredMCQs[currentMCQIndex] && (
          <MCQCard
            mcq={mcqs[currentMCQIndex]}
            shuffledOptions={shuffledOptionsList[currentMCQIndex]}
            onAnswer={handleAnswer}
          />
        )}

        {isComplete && (
  <>
    {mode === "conversation" ? (
      // 🔹 Conversation mode → Only show Next HYF button
      <View className="items-center justify-center mt-12">
        <Pressable
          onPress={onComplete}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl px-8 py-4 flex-row items-center"
        >
          <Sparkles size={20} color="#fff" />
          <Text className="text-white font-bold text-lg ml-2">Next HYF</Text>
          <ChevronRight size={20} color="#fff" />
        </Pressable>
      </View>
    ) : (
      // 🔹 Concept mode → Show full score card
      <View className="items-center justify-center mt-12 p-8 rounded-3xl bg-emerald-900/40 border border-emerald-500/40">
        <Award size={40} color="#10b981" />
        <Text className="text-emerald-100 text-2xl font-bold mt-4">🎉 All MCQs Completed!</Text>
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
  </>
)}

      </ScrollView>
    </View>
  );
}
