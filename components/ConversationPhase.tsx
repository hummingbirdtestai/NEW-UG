import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { 
  MessageCircle, 
  Bookmark, 
  BookmarkCheck, 
  ChevronRight, 
  CheckCircle, 
  XCircle, 
  TriangleAlert as AlertTriangle 
} from 'lucide-react-native';
import MarkdownWithLatex from "@/components/MarkdownWithLatex";
import ConfettiCannon from 'react-native-confetti-cannon';

/* ---------------- Types ---------------- */
interface MCQOption { A: string; B: string; C: string; D: string; }
interface MCQFeedback { correct: string; wrong: string; }
interface MCQ {
  id: string;
  stem: string;
  options: MCQOption;
  feedback: MCQFeedback;
  learning_gap?: string;
  correct_answer: keyof MCQOption;
}
interface HYF { text: string; mcqs: MCQ[]; }

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

interface AnsweredMCQ {
  mcq: MCQ;
  selectedValue: string;
  isCorrect: boolean;
  correctUiLabel: string;
  showFeedback: boolean;
}

/* ---------------- Helpers ---------------- */
function shuffleOptions(mcq: MCQ) {
  const dbKeys = Object.keys(mcq.options) as (keyof MCQOption)[];
  const values = dbKeys.map((k) => ({ dbKey: k, value: mcq.options[k] }));
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

/* ---------------- HYF Card (unchanged) ---------------- */
function HYFCard({ hyf, index, onGotIt, onBookmark, isBookmarked = false }: HYFCardProps) {
  const [localBookmark, setLocalBookmark] = useState(isBookmarked);
  const handleBookmarkToggle = () => {
    const newValue = !localBookmark;
    setLocalBookmark(newValue);
    onBookmark?.(index, newValue);
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20, translateX: -30, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, translateX: 0, scale: 1 }}
      transition={{ type: 'spring', duration: 600, delay: index * 300 }}
      className="flex-row items-end mb-4 px-1"
    >
      {/* Avatar */}
      <MotiView className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 items-center justify-center mr-3 shadow-xl">
        <MessageCircle size={20} color="#ffffff" />
      </MotiView>

      {/* HYF Card */}
      <View className="w-[70%] relative">
        <MotiView className="bg-gradient-to-br from-teal-600 to-cyan-700 rounded-2xl rounded-bl-md px-4 py-3 shadow-xl relative">
          {/* HYF Badge */}
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full items-center justify-center mr-3">
              <Text className="text-white font-bold text-sm">HYF</Text>
            </View>
            <Text className="text-teal-100 font-bold text-lg">High-Yield Fact #{index + 1}</Text>
          </View>

          <MarkdownWithLatex content={hyf.text} />

          {/* Got It + Bookmark row */}
          <View className="mt-6 flex-row justify-between items-center">
            <Pressable onPress={handleBookmarkToggle}>
              {localBookmark
                ? <BookmarkCheck size={20} color="#fbbf24" fill="#fbbf24" />
                : <Bookmark size={20} color="#ffffff" />}
            </Pressable>
            <Pressable onPress={onGotIt} className="bg-emerald-600 rounded-2xl px-6 py-3">
              <Text className="text-white font-bold">Got it!</Text>
            </Pressable>
          </View>
        </MotiView>
      </View>
    </MotiView>
  );
}

/* ---------------- MCQ Card ---------------- */
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
    <MotiView className="mb-6">
      <View className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden">
        <View className="p-6">
          <MarkdownWithLatex content={mcq.stem} />
          <View className="mt-4 space-y-3">
            {shuffledOptions.map((opt) => {
              const isSelected = answeredMCQ?.selectedValue === opt.value;
              const isCorrect = opt.value === correctValue;
              const disabled = !!answeredMCQ;

              let optionStyle = "bg-slate-800/80 border-slate-600/50";
              if (disabled) {
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
                  key={opt.uiLabel}
                  disabled={disabled}
                  onPress={() => onAnswer(opt.value, correctUiLabel)}
                  className={`${optionStyle} border-2 rounded-xl p-4 flex-row items-center`}
                >
                  <View className="w-8 h-8 bg-blue-600 rounded-full items-center justify-center mr-4">
                    <Text className="text-white font-bold">{opt.uiLabel}</Text>
                  </View>
                  <Text className="text-white flex-1">{opt.value}</Text>
                  {isSelected && (answeredMCQ?.isCorrect
                    ? <CheckCircle size={22} color="#10b981" />
                    : <XCircle size={22} color="#ef4444" />)}
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </MotiView>
  );
}

/* ---------------- Feedback ---------------- */
function FeedbackCard({ mcq, answered }: { mcq: MCQ; answered: AnsweredMCQ }) {
  return (
    <View className="mb-6">
      {!answered.isCorrect && (
        <>
          <View className="bg-red-900/40 p-4 rounded-2xl mb-3">
            <Text className="text-red-300 font-bold">❌ Incorrect</Text>
            <MarkdownWithLatex content={mcq.feedback.wrong} />
          </View>
          {mcq.learning_gap && (
            <View className="bg-amber-900/40 p-4 rounded-2xl mb-3">
              <Text className="text-amber-300 font-bold">💡 Learning Gap</Text>
              <Text className="text-amber-100">{mcq.learning_gap}</Text>
            </View>
          )}
        </>
      )}
      <View className="bg-emerald-900/40 p-4 rounded-2xl">
        <Text className="text-emerald-300 font-bold">
          ✅ {answered.isCorrect ? "Correct!" : "Correct Answer"}
        </Text>
        <MarkdownWithLatex content={mcq.feedback.correct} />
        <Text className="text-emerald-200 mt-1">Correct Option: {answered.correctUiLabel}</Text>
      </View>
    </View>
  );
}

/* ---------------- ConversationPhase ---------------- */
export default function ConversationPhase({
  hyfs = [],
  onComplete,
  onBookmark,
  bookmarkedHYFs = new Set(),
}: ConversationPhaseProps) {
  const [currentHYFIndex, setCurrentHYFIndex] = useState(0);
  const [currentMCQIndex, setCurrentMCQIndex] = useState(-1);
  const [answeredMCQs, setAnsweredMCQs] = useState<AnsweredMCQ[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const isMobile = Dimensions.get('window').width < 768;

  const currentHYF = hyfs[currentHYFIndex];
  const [shuffledOptionsList] = useState(() =>
    currentHYF ? currentHYF.mcqs.map(shuffleOptions) : []
  );

  const handleGotIt = () => {
    if (currentHYF.mcqs.length > 0) {
      setCurrentMCQIndex(0);
    } else {
      handleNextHYF();
    }
  };

  const handleAnswer = (val: string, correctUiLabel: string) => {
    const mcq = currentHYF.mcqs[currentMCQIndex];
    const correctVal = mcq.options[mcq.correct_answer];
    const isCorrect = val === correctVal;

    const newAns: AnsweredMCQ = {
      mcq,
      selectedValue: val,
      isCorrect,
      correctUiLabel,
      showFeedback: true,
    };

    setAnsweredMCQs((prev) => {
      const updated = [...prev];
      updated[currentMCQIndex] = newAns;
      return updated;
    });

    if (isCorrect) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1500);
    }
  };

  const handleNextMCQ = () => {
    if (currentMCQIndex < currentHYF.mcqs.length - 1) {
      setCurrentMCQIndex((i) => i + 1);
    } else {
      handleNextHYF();
    }
  };

  const handleNextHYF = () => {
    if (currentHYFIndex < hyfs.length - 1) {
      setCurrentHYFIndex((i) => i + 1);
      setCurrentMCQIndex(-1);
      setAnsweredMCQs([]);
    } else {
      setIsComplete(true);
      onComplete?.();
    }
  };

  return (
    <View className="flex-1 bg-slate-900">
      {/* Hero Header and Progress — unchanged */}
      {/* ... keep your full header/progress section here ... */}

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
            {currentMCQIndex === -1 && (
              <HYFCard
                hyf={currentHYF}
                index={currentHYFIndex}
                onGotIt={handleGotIt}
                onBookmark={onBookmark}
                isBookmarked={bookmarkedHYFs.has(currentHYFIndex)}
              />
            )}
            {currentMCQIndex >= 0 && currentHYF.mcqs[currentMCQIndex] && (
              <>
                <MCQCard
                  mcq={currentHYF.mcqs[currentMCQIndex]}
                  shuffledOptions={shuffledOptionsList[currentMCQIndex]}
                  onAnswer={handleAnswer}
                  answeredMCQ={answeredMCQs[currentMCQIndex]}
                />
                {answeredMCQs[currentMCQIndex]?.showFeedback && (
                  <>
                    <FeedbackCard
                      mcq={currentHYF.mcqs[currentMCQIndex]}
                      answered={answeredMCQs[currentMCQIndex]}
                    />
                    <Pressable
                      onPress={handleNextMCQ}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl py-4 px-6 items-center"
                    >
                      <Text className="text-white font-bold">
                        {currentMCQIndex < currentHYF.mcqs.length - 1
                          ? "Next Question"
                          : "Next HYF"}
                      </Text>
                    </Pressable>
                  </>
                )}
              </>
            )}
          </>
        ) : (
          <MotiView className="items-center justify-center flex-1 py-12">
            <CheckCircle size={40} color="#ffffff" />
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
          origin={{ x: Dimensions.get('window').width / 2, y: 0 }}
          autoStart
          fadeOut
        />
      )}

      {/* Floating Action Elements — unchanged */}
      {/* ... keep your floating dots here ... */}
       {/* Floating Action Elements */}
      <View className="absolute top-32 right-8 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <MotiView
            key={i}
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
