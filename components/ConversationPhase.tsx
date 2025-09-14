import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { 
  MessageCircle, 
  Bookmark, 
  BookmarkCheck, 
  ChevronRight, 
  CircleCheck as CheckCircle, 
  Circle as XCircle, 
  TriangleAlert as AlertTriangle 
} from 'lucide-react-native';
import MarkdownWithLatex from "@/components/MarkdownWithLatex";
import ConfettiCannon from 'react-native-confetti-cannon';

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

function HYFCard({ hyf, index, onGotIt, onBookmark, isBookmarked = false }: HYFCardProps) {
  const [localBookmark, setLocalBookmark] = useState(isBookmarked);

  const handleBookmarkToggle = () => {
    const newValue = !localBookmark;
    setLocalBookmark(newValue);
    onBookmark?.(index, newValue);
  };

  const markdownStyles = {
    body: { color: '#ffffff', fontSize: 18, lineHeight: 28 },
    strong: { color: '#5eead4', fontWeight: '700' },
    em: { color: '#34d399', fontStyle: 'italic' },
  };

  return (
    <MotiView className="flex-row items-end mb-4 px-1">
      <View className="w-[70%] relative">
        <MotiView className="bg-gradient-to-br from-teal-600 to-cyan-700 rounded-2xl px-4 py-3 shadow-xl">
          <View className="flex-row items-center mb-4">
            <Text className="text-teal-100 font-bold text-lg">High-Yield Fact #{index + 1}</Text>
          </View>
          <MarkdownWithLatex content={hyf.text} markdownStyles={markdownStyles} />
          <Pressable onPress={onGotIt} className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl py-5 px-8 mt-6">
            <Text className="text-white font-bold text-xl">Got it!</Text>
          </Pressable>
        </MotiView>
      </View>
    </MotiView>
  );
}

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

function MCQCard({
  mcq,
  mcqIndex,
  shuffledOptions,
  onAnswer,
  selectedValue,
  showFeedback,
  isCorrect,
}: {
  mcq: MCQ;
  mcqIndex: number;
  shuffledOptions: ReturnType<typeof shuffleOptions>;
  onAnswer: (selectedValue: string, correctUiLabel: string) => void;
  selectedValue?: string;
  showFeedback?: boolean;
  isCorrect?: boolean;
}) {
  const markdownStyles = {
    body: { color: '#ffffff', fontSize: 16, lineHeight: 24 },
    strong: { color: '#5eead4', fontWeight: '700' },
    em: { color: '#34d399', fontStyle: 'italic' },
  };

  return (
    <MotiView className="mb-6">
      {/* 🔹 Question Stem */}
      <View className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl border border-slate-700/50 shadow-xl mb-4">
        <View className="p-6">
          <MarkdownWithLatex content={mcq.stem} markdownStyles={markdownStyles} />
        </View>
      </View>

      {/* Options */}
      <View className="space-y-3 mb-4">
        {shuffledOptions.map((opt) => {
          const isSelected = selectedValue === opt.value;
          const isCorrectOption = opt.dbKey === mcq.correct_answer;
          const showAsCorrect = showFeedback && isCorrectOption && !isCorrect;
          const showAsWrong = showFeedback && isSelected && !isCorrect;

          let optionStyle = "bg-slate-800/80 border-slate-600/50";
          let textColor = "text-slate-100";

          if (showFeedback) {
            if (isSelected && isCorrect) {
              optionStyle = "bg-emerald-500/20 border-emerald-500/60";
              textColor = "text-emerald-100";
            } else if (showAsWrong) {
              optionStyle = "bg-red-500/20 border-red-500/60";
              textColor = "text-red-100";
            } else if (showAsCorrect) {
              optionStyle = "bg-emerald-500/20 border-emerald-500/60";
              textColor = "text-emerald-100";
            }
          }

          return (
            <Pressable
              key={`${mcq.id}-${opt.uiLabel}`}
              onPress={() => !showFeedback && onAnswer(opt.value, opt.uiLabel)}
              disabled={showFeedback}
              className={`${optionStyle} border-2 rounded-xl p-4 flex-row items-center`}
            >
              <View className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full items-center justify-center mr-4">
                <Text className="text-white font-bold text-sm">{opt.uiLabel}</Text>
              </View>
              <Text className={`${textColor} text-base`}>{opt.value}</Text>
              {showFeedback && isSelected && (
                isCorrect ? <CheckCircle size={20} color="#10b981" /> : <XCircle size={20} color="#ef4444" />
              )}
              {showFeedback && showAsCorrect && <CheckCircle size={20} color="#10b981" />}
            </Pressable>
          );
        })}
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
  const [currentHYFIndex, setCurrentHYFIndex] = useState(0);
  const [currentMCQIndex, setCurrentMCQIndex] = useState(-1);
  const [selectedValue, setSelectedValue] = useState<string>();
  const [correctUiLabel, setCorrectUiLabel] = useState<string>("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  // Pre-shuffle all MCQs once when component mounts
const [shuffledOptionsList] = useState(() =>
  hyfs.map((hyf) => hyf.mcqs.map(shuffleOptions))
);

  const scrollViewRef = useRef<ScrollView>(null);
  const isMobile = Dimensions.get('window').width < 768;

  const currentHYF = hyfs[currentHYFIndex];
  const currentMCQ = currentHYF?.mcqs[currentMCQIndex];

const handleNextMCQ = () => {
  const correctValue = currentMCQ?.options[currentMCQ.correct_answer];
  const isCorrect = selectedValue === correctValue;

  if (isCorrect) {
    handleNextHYF();
  } else {
    if (currentMCQIndex < currentHYF.mcqs.length - 1) {
      setCurrentMCQIndex(currentMCQIndex + 1);
      setSelectedValue(undefined);
      setShowFeedback(false);
    } else {
      handleNextHYF();
    }
  }
};


  const handleNextHYF = () => {
    if (currentHYFIndex < hyfs.length - 1) {
      setCurrentHYFIndex(currentHYFIndex + 1);
      setCurrentMCQIndex(-1);
      setSelectedValue(undefined);
      setShowFeedback(false);
    } else {
      setIsComplete(true);
      onComplete?.();
    }
  };

  const handleGotIt = () => {
    if (currentHYF.mcqs.length > 0) {
      setCurrentMCQIndex(0);
    } else {
      handleNextHYF();
    }
  };

 const handleMCQAnswer = (selected: string, uiLabel: string) => {
  setSelectedValue(selected);

  const correctValue = currentMCQ?.options[currentMCQ.correct_answer];
  const correctUiLabel =
    shuffledOptionsList[currentHYFIndex][currentMCQIndex].find(
      (opt) => opt.value === correctValue
    )?.uiLabel || "?";

  setCorrectUiLabel(correctUiLabel);
  setShowFeedback(true);

  if (selected === correctValue) {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  }
};


  const isCorrect = selectedValue === currentMCQ?.options[currentMCQ.correct_answer];

  return (
    <View className="flex-1 bg-slate-900">
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
            {currentMCQIndex >= 0 && currentMCQ && (
              <>
                <MCQCard
  mcq={currentMCQ}
  mcqIndex={currentMCQIndex}
  shuffledOptions={shuffledOptionsList[currentHYFIndex][currentMCQIndex]} // ✅ use pre-shuffled
  onAnswer={handleMCQAnswer}
  selectedValue={selectedValue}
  showFeedback={showFeedback}
  isCorrect={isCorrect}
/>

                {/* Feedback Section */}
{showFeedback && (
  <View className="mt-4">
    {!isCorrect && (
      <>
        <View className="bg-red-900/40 rounded-2xl border border-red-500/40 p-4 mb-3">
          <Text className="text-red-300 font-bold mb-2">❌ Incorrect</Text>
          <MarkdownWithLatex content={mcq.feedback?.wrong} />
        </View>

        {mcq.learning_gap && (
          <View className="bg-amber-900/40 rounded-2xl border border-amber-500/40 p-4 mb-3">
            <Text className="text-amber-300 font-bold mb-2">💡 Learning Gap</Text>
            <Text className="text-amber-100">{mcq.learning_gap}</Text>
          </View>
        )}
      </>
    )}

    <View className="bg-emerald-900/40 rounded-2xl border border-emerald-500/40 p-4">
      <Text className="text-emerald-300 font-bold mb-2">
        ✅ {isCorrect ? "Correct!" : "Correct Answer"}
      </Text>
      <MarkdownWithLatex content={mcq.feedback?.correct} />
      <Text className="text-emerald-200 mt-2">Correct Option: {correctUiLabel}</Text>
    </View>
  </View>
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
          </MotiView>
        )}
      </ScrollView>
      {showConfetti && (
        <ConfettiCannon count={80} origin={{ x: Dimensions.get('window').width / 2, y: 0 }} autoStart fadeOut />
      )}
    </View>
  );
}
