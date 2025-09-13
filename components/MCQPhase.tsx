// components/MCQPhase.tsx
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import ConfettiCannon from "react-native-confetti-cannon";
import { 
  CircleCheck as CheckCircle, 
  Circle as XCircle, 
  MessageCircle,
  Lightbulb,
  ChevronRight,
  Target,
  Award,
  Sparkles
} from 'lucide-react-native';
import MarkdownWithLatex from "@/components/MarkdownWithLatex";
import SelfSignalsPanel from "@/components/SelfSignalsPanel";

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
  const optionKeys = Object.keys(mcq.options) as (keyof MCQOption)[];

  const markdownStyles = {
    body: { 
      color: '#f1f5f9', 
      fontSize: 18, 
      lineHeight: 28,
      fontFamily: 'System'
    },
    paragraph: { 
      color: '#f1f5f9', 
      marginBottom: 16, 
      lineHeight: 28, 
      fontSize: 18 
    },
    strong: { 
      color: '#5eead4', 
      fontWeight: '700',
      backgroundColor: 'rgba(94, 234, 212, 0.15)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    em: { 
      color: '#34d399', 
      fontStyle: 'italic' 
    },
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 50, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: 'spring', duration: 800, delay: 200 }}
      className="mb-8"
    >
      {/* Enhanced Question Card */}
      <View 
        className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden"
        style={{
          shadowColor: isActive ? '#14b8a6' : '#475569',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.25,
          shadowRadius: 24,
          elevation: 12,
        }}
      >
        {/* Elegant Header */}
        <View className="relative overflow-hidden">
          {/* Animated background gradient */}
          <MotiView
            from={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 0.1 }}
            transition={{
              loop: true,
              type: 'timing',
              duration: 8000,
            }}
            className="absolute inset-0 bg-gradient-to-r from-teal-500/20 via-cyan-500/10 to-indigo-500/20"
          />
          
          <View className="flex-row items-center p-6 border-b border-slate-700/30 bg-slate-800/40">
            <MotiView
              from={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', duration: 800, delay: 400 }}
              className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl items-center justify-center mr-4 shadow-xl"
              style={{
                shadowColor: '#14b8a6',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
                elevation: 10,
              }}
            >
              <MessageCircle size={28} color="#ffffff" />
              
              {/* Rotating glow */}
              <MotiView
                from={{ rotate: '0deg', scale: 1 }}
                animate={{ rotate: '360deg', scale: 1.3 }}
                transition={{
                  loop: true,
                  type: 'timing',
                  duration: 6000,
                }}
                className="absolute inset-0 rounded-2xl bg-teal-400/20"
              />
            </MotiView>
            
            <View className="flex-1">
              <Text className="text-teal-400 text-sm font-bold uppercase tracking-wider mb-1">
                MCQ Practice
              </Text>
              <Text className="text-slate-100 text-2xl font-bold">
                Question {index + 1}
              </Text>
            </View>
            
            {!isActive && answeredMCQ && (
              <MotiView
                from={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', duration: 600, delay: 200 }}
                className="ml-4"
              >
                <View 
                  className={`w-12 h-12 rounded-2xl items-center justify-center shadow-lg ${
                    answeredMCQ.isCorrect 
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600' 
                      : 'bg-gradient-to-br from-red-500 to-rose-600'
                  }`}
                  style={{
                    shadowColor: answeredMCQ.isCorrect ? '#10b981' : '#ef4444',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.4,
                    shadowRadius: 12,
                    elevation: 8,
                  }}
                >
                  {answeredMCQ.isCorrect ? (
                    <CheckCircle size={24} color="#ffffff" />
                  ) : (
                    <XCircle size={24} color="#ffffff" />
                  )}
                </View>
              </MotiView>
            )}
          </View>
        </View>

        {/* Enhanced Question Content */}
        <View className="p-8">
          {/* Question Stem with better typography */}
          <View className="bg-slate-900/40 rounded-2xl p-6 border border-slate-600/30 mb-8 shadow-inner">
            <MarkdownWithLatex content={mcq.stem} markdownStyles={markdownStyles} />
          </View>

          {/* Enhanced Options Grid */}
          <View className="space-y-4">
            {optionKeys.map((key, optionIndex) => {
              const isSelected = answeredMCQ?.selectedOption === key;
              const isCorrect = key === mcq.correct_answer;
              const isDisabled = !!answeredMCQ;

              let optionStyle = 'bg-slate-800/80 border-slate-600/50 hover:border-teal-500/60 hover:bg-slate-700/80 active:scale-[0.98]';
              let textColor = 'text-slate-100';
              let borderWidth = 'border-2';
              
              if (isDisabled) {
                if (isSelected) {
                  if (answeredMCQ?.isCorrect) {
                    optionStyle = 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/60';
                    textColor = 'text-emerald-100';
                    borderWidth = 'border-3';
                  } else {
                    optionStyle = 'bg-gradient-to-r from-red-500/20 to-rose-500/20 border-red-500/60';
                    textColor = 'text-red-100';
                    borderWidth = 'border-3';
                  }
                } else if (isCorrect && !answeredMCQ?.isCorrect) {
                  optionStyle = 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/60';
                  textColor = 'text-emerald-100';
                  borderWidth = 'border-3';
                }
              }

              return (
                <MotiView
                  key={`${mcq.id}-${key}`}
                  from={{ opacity: 0, translateX: -30, scale: 0.9 }}
                  animate={{ opacity: 1, translateX: 0, scale: 1 }}
                  transition={{ 
                    type: 'spring', 
                    duration: 600, 
                    delay: 600 + optionIndex * 150 
                  }}
                >
                  <Pressable
                    onPress={() => !isDisabled && onAnswer(key)}
                    disabled={isDisabled}
                    className={`${optionStyle} ${borderWidth} rounded-2xl p-6 flex-row items-center transition-all duration-200`}
                  >
                    {/* Enhanced Option Circle */}
                    <MotiView
                      from={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        type: 'spring', 
                        duration: 500, 
                        delay: 800 + optionIndex * 150 
                      }}
                      className="w-12 h-12 rounded-2xl items-center justify-center mr-6 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600"
                      style={{
                        shadowColor: '#3b82f6',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 4,
                      }}
                    >
                      <Text className="text-white font-bold text-xl">{key}</Text>
                    </MotiView>
                    
                    {/* Enhanced Option Text */}
                    <View className="flex-1">
                      <MarkdownWithLatex content={mcq.options[key]} markdownStyles={markdownStyles} />
                    </View>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <MotiView
                        from={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', duration: 400 }}
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

        {/* Floating Action Elements */}
        {isActive && (
          <View className="absolute top-8 right-8 pointer-events-none">
            {[...Array(4)].map((_, i) => (
              <MotiView
                key={`particle-${i}`}
                from={{ 
                  opacity: 0, 
                  translateY: Math.random() * 40,
                  translateX: Math.random() * 40,
                  scale: 0
                }}
                animate={{ 
                  opacity: [0, 0.6, 0],
                  translateY: Math.random() * -80,
                  translateX: Math.random() * 20 - 10,
                  scale: [0, 1, 0]
                }}
                transition={{
                  loop: true,
                  type: 'timing',
                  duration: 4000,
                  delay: i * 1000,
                }}
                className="absolute"
                style={{
                  left: Math.random() * 60,
                  top: Math.random() * 60,
                }}
              >
                <View className="w-2 h-2 bg-teal-400 rounded-full shadow-lg" />
              </MotiView>
            ))}
          </View>
        )}
      </View>
    </MotiView>
  );
}

function FeedbackCard({
  mcq,
  selectedOption,
  isCorrect,
}: {
  mcq: MCQ;
  selectedOption: keyof MCQOption;
  isCorrect: boolean;
}) {
  const markdownStyles = {
    body: { 
      color: '#ffffff', 
      fontSize: 16, 
      lineHeight: 26,
      fontFamily: 'System'
    },
    paragraph: { 
      color: '#ffffff', 
      marginBottom: 12, 
      lineHeight: 26 
    },
    strong: { 
      color: '#ffffff', 
      fontWeight: '700',
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    em: { 
      color: '#ffffff', 
      fontStyle: 'italic' 
    },
  };

  return (
    <View className="mb-8 space-y-6">
      {/* Wrong Answer Feedback */}
      {!isCorrect && (
        <MotiView
          from={{ opacity: 0, translateY: 30, scale: 0.95 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{ type: 'spring', duration: 800, delay: 300 }}
          className="relative overflow-hidden"
        >
          <View 
            className="bg-gradient-to-br from-red-900/60 to-rose-900/60 rounded-3xl border border-red-500/40 shadow-2xl"
            style={{
              shadowColor: '#ef4444',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 12,
            }}
          >
            {/* Header */}
            <View className="flex-row items-center p-6 border-b border-red-500/20 bg-red-600/10">
              <View className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl items-center justify-center mr-4 shadow-lg">
                <XCircle size={24} color="#ffffff" />
              </View>
              <Text className="text-red-200 font-bold text-xl">
                Not Quite Right
              </Text>
            </View>

            {/* Content */}
            <View className="p-6">
              <View className="bg-slate-900/40 rounded-2xl p-5 border border-slate-600/30">
                <MarkdownWithLatex content={mcq.feedback?.wrong || ''} markdownStyles={markdownStyles} />
              </View>
            </View>

            {/* Glowing border effect */}
            <MotiView
              from={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 1.02, opacity: 0 }}
              transition={{
                loop: true,
                type: 'timing',
                duration: 2000,
              }}
              className="absolute inset-0 rounded-3xl border-2 border-red-400/50"
            />
          </View>
        </MotiView>
      )}

      {/* Correct Answer Feedback */}
      <MotiView
        from={{ opacity: 0, translateY: 30, scale: 0.95 }}
        animate={{ opacity: 1, translateY: 0, scale: 1 }}
        transition={{ type: 'spring', duration: 800, delay: isCorrect ? 300 : 600 }}
        className="relative overflow-hidden"
      >
        <View 
          className="bg-gradient-to-br from-emerald-900/60 to-teal-900/60 rounded-3xl border border-emerald-500/40 shadow-2xl"
          style={{
            shadowColor: '#10b981',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 12,
          }}
        >
          {/* Header */}
          <View className="flex-row items-center p-6 border-b border-emerald-500/20 bg-emerald-600/10">
            <View className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl items-center justify-center mr-4 shadow-lg">
              <CheckCircle size={24} color="#ffffff" />
            </View>
            <Text className="text-emerald-200 font-bold text-xl">
              {isCorrect ? 'Excellent!' : 'Correct Answer'}
            </Text>
          </View>

          {/* Content */}
          <View className="p-6">
            <View className="bg-slate-900/40 rounded-2xl p-5 border border-slate-600/30">
              <MarkdownWithLatex content={mcq.feedback?.correct || ''} markdownStyles={markdownStyles} />
            </View>
          </View>

          {/* Success particles */}
          {isCorrect && (
            <View className="absolute inset-0 pointer-events-none">
              {[...Array(6)].map((_, i) => (
                <MotiView
                  key={`success-particle-${i}`}
                  from={{ 
                    opacity: 0, 
                    translateY: 20,
                    translateX: Math.random() * 200 - 100,
                    scale: 0
                  }}
                  animate={{ 
                    opacity: [0, 0.8, 0],
                    translateY: -60,
                    translateX: Math.random() * 100 - 50,
                    scale: [0, 1, 0]
                  }}
                  transition={{
                    loop: true,
                    type: 'timing',
                    duration: 3000,
                    delay: i * 500,
                  }}
                  className="absolute"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                  }}
                >
                  <View className="w-2 h-2 bg-emerald-400 rounded-full shadow-lg" />
                </MotiView>
              ))}
            </View>
          )}

          {/* Glowing border effect */}
          <MotiView
      {/* Self Signals Panel */}
      <SelfSignalsPanel
        objectType="mcq"
        objectUuid={mcq.id}
        topicName={mcq.stem.substring(0, 50) + '...'}
      />

            from={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 1.02, opacity: 0 }}
            transition={{
              loop: true,
              type: 'timing',
              duration: 3000,
            }}
            className="absolute inset-0 rounded-3xl border-2 border-emerald-400/50"
          />
        </View>
      </MotiView>

      {/* Learning Gap Card */}
      {!isCorrect && mcq.learning_gap && (
        <MotiView
          from={{ opacity: 0, translateY: 30, scale: 0.95 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{ type: 'spring', duration: 800, delay: 900 }}
          className="relative overflow-hidden"
        >
          <View 
            className="bg-gradient-to-br from-amber-900/60 to-orange-900/60 rounded-3xl border border-amber-500/40 shadow-2xl"
            style={{
              shadowColor: '#f59e0b',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 12,
            }}
          >
            {/* Header */}
            <View className="flex-row items-center p-6 border-b border-amber-500/20 bg-amber-600/10">
              <View className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl items-center justify-center mr-4 shadow-lg">
                <Lightbulb size={24} color="#ffffff" />
              </View>
              <Text className="text-amber-200 font-bold text-xl">
                💡 Learning Gap Identified
              </Text>
            </View>

            {/* Content */}
            <View className="p-6">
              <View className="bg-slate-900/40 rounded-2xl p-5 border border-slate-600/30">
                <Text className="text-amber-100 text-lg leading-7 font-medium">
                  {mcq.learning_gap || ''}
                </Text>
              </View>
            </View>

            {/* Insight particles */}
            <View className="absolute inset-0 pointer-events-none">
              {[...Array(4)].map((_, i) => (
                <MotiView
                  key={`insight-particle-${i}`}
                  from={{ opacity: 0, translateY: 15, scale: 0 }}
                  animate={{ opacity: [0, 0.6, 0], translateY: -40, scale: [0, 1, 0] }}
                  transition={{
                    loop: true,
                    type: 'timing',
                    duration: 2500,
                    delay: i * 600,
                  }}
                  className="absolute"
                  style={{
                    left: `${30 + Math.random() * 40}%`,
                    top: `${30 + Math.random() * 40}%`,
                  }}
                >
                  <View className="w-1.5 h-1.5 bg-amber-400 rounded-full shadow-lg" />
                </MotiView>
              ))}
            </View>

            {/* Glowing border effect */}
            <MotiView
              from={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 1.02, opacity: 0 }}
              transition={{
                loop: true,
                type: 'timing',
                duration: 2500,
              }}
              className="absolute inset-0 rounded-3xl border-2 border-amber-400/50"
            />
          </View>
        </MotiView>
      )}
    </View>
  );
}

export default function MCQPhase({ mcqs = [], onComplete }: MCQPhaseProps) {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;

  const [answeredMCQs, setAnsweredMCQs] = useState<AnsweredMCQ[]>([]);
  const [currentMCQIndex, setCurrentMCQIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [conceptComplete, setConceptComplete] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  // Auto scroll to bottom when new question/feedback appears
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
        <ConfettiCannon
          count={120}
          origin={{ x: width / 2, y: 0 }}
          autoStart
          fadeOut
        />
      )}

      {/* Enhanced Header */}
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
                <Text className="text-teal-400 text-sm font-bold uppercase tracking-wider mb-2">
                  MCQ Practice
                </Text>
                <Text className="text-4xl font-bold text-slate-100 mb-2 leading-tight">
                  Interactive Questions
                </Text>
                <Text className="text-xl text-slate-300">
                  Test your knowledge with adaptive feedback
                </Text>
              </MotiView>
            </View>
          </View>

          {/* Enhanced Progress Badge */}
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', duration: 600, delay: 600 }}
            className="items-center"
          >
            <View className="bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-2xl px-6 py-4 border border-teal-500/30 shadow-xl">
              <Text className="text-teal-400 font-bold text-2xl text-center">
                {Math.min(currentMCQIndex + 1, mcqs.length)}
              </Text>
              <Text className="text-teal-300/80 text-sm text-center font-medium">
                of {mcqs.length}
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
          paddingBottom: 120, // Extra space for completion card
        }}
      >
        {/* Answered MCQs */}
        {answeredMCQs.map((answered, idx) =>
          answered && (
            <View key={answered.mcq.id || idx}>
              <MCQCard 
                mcq={answered.mcq} 
                index={idx} 
                onAnswer={() => {}} 
                answeredMCQ={answered} 
                isActive={false} 
              />
              {answered.showFeedback && (
                <>
                  <FeedbackCard 
                    mcq={answered.mcq} 
                    selectedOption={answered.selectedOption} 
                    isCorrect={answered.isCorrect} 
                  />
                  {/* Next Button for Correct Answers */}
                  {idx === currentMCQIndex && answered.isCorrect && (
                    <MotiView
                      from={{ opacity: 0, translateY: 20 }}
                      animate={{ opacity: 1, translateY: 0 }}
                      transition={{ type: 'spring', duration: 600, delay: 1200 }}
                      className="flex-row justify-end mb-8"
                    >
                      <Pressable
                        onPress={onComplete}
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl px-8 py-4 flex-row items-center shadow-xl active:scale-95"
                        style={{
                          shadowColor: '#10b981',
                          shadowOffset: { width: 0, height: 8 },
                          shadowOpacity: 0.4,
                          shadowRadius: 16,
                          elevation: 8,
                        }}
                      >
                        <Text className="text-white font-bold text-lg mr-3">
                          Next Concept
                        </Text>
                        <ChevronRight size={20} color="#ffffff" />
                      </Pressable>
                    </MotiView>
                  )}

                  {/* Next Button for Wrong Answers */}
                  {idx === currentMCQIndex && !answered.isCorrect && (
                    <MotiView
                      from={{ opacity: 0, translateY: 20 }}
                      animate={{ opacity: 1, translateY: 0 }}
                      transition={{ type: 'spring', duration: 600, delay: 1200 }}
                      className="flex-row justify-end mb-8"
                    >
                      <Pressable
                        onPress={handleNextQuestion}
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl px-8 py-4 flex-row items-center shadow-xl active:scale-95"
                        style={{
                          shadowColor: '#10b981',
                          shadowOffset: { width: 0, height: 8 },
                          shadowOpacity: 0.4,
                          shadowRadius: 16,
                          elevation: 8,
                        }}
                      >
                        <Text className="text-white font-bold text-lg mr-3">
                          Next Question
                        </Text>
                        <ChevronRight size={20} color="#ffffff" />
                      </Pressable>
                    </MotiView>
                  )}
                </>
              )}
            </View>
          )
        )}

        {/* Current Active MCQ */}
        {!isComplete && !conceptComplete && currentMCQIndex < mcqs.length && !answeredMCQs[currentMCQIndex] && (
          <MCQCard 
            mcq={mcqs[currentMCQIndex]} 
            index={currentMCQIndex} 
            onAnswer={handleAnswer} 
            isActive={true} 
          />
        )}


        {/* Enhanced Completion Card */}
        {isComplete && (
          <MotiView
            from={{ opacity: 0, translateY: 50, scale: 0.9 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            transition={{ type: 'spring', duration: 1000, delay: 300 }}
            className="relative overflow-hidden"
          >
            <View 
              className="bg-gradient-to-br from-emerald-900/80 to-teal-900/80 rounded-3xl border border-emerald-500/40 shadow-2xl"
              style={{
                shadowColor: '#10b981',
                shadowOffset: { width: 0, height: 16 },
                shadowOpacity: 0.4,
                shadowRadius: 32,
                elevation: 16,
              }}
            >
              {/* Celebration Header */}
              <View className="items-center p-8 border-b border-emerald-500/20 bg-emerald-600/10">
                <MotiView
                  from={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', duration: 800, delay: 500 }}
                  className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl items-center justify-center mb-6 shadow-2xl"
                  style={{
                    shadowColor: '#10b981',
                    shadowOffset: { width: 0, height: 12 },
                    shadowOpacity: 0.5,
                    shadowRadius: 24,
                    elevation: 12,
                  }}
                >
                  <Award size={40} color="#ffffff" />
                  
                  {/* Celebration glow */}
                  <MotiView
                    from={{ scale: 1, opacity: 0.8 }}
                    animate={{ scale: 1.6, opacity: 0 }}
                    transition={{
                      loop: true,
                      type: 'timing',
                      duration: 2000,
                    }}
                    className="absolute inset-0 rounded-3xl bg-emerald-400/30"
                  />
                </MotiView>

                <Text className="text-emerald-100 text-3xl font-bold mb-2 text-center">
                  🎉 MCQs Completed!
                </Text>
                <Text className="text-emerald-200 text-xl text-center">
                  You scored <Text className="text-teal-300 font-bold text-2xl">{correctCount}</Text> out of <Text className="font-bold">{mcqs.length}</Text>
                </Text>
              </View>

              {/* Score Breakdown */}
              <View className="p-8">
                <View className="bg-slate-900/40 rounded-2xl p-6 border border-slate-600/30 mb-6">
                  <View className="flex-row items-center justify-between">
                    <View className="items-center">
                      <Text className="text-emerald-400 text-sm font-semibold uppercase tracking-wide">
                        Accuracy
                      </Text>
                      <Text className="text-emerald-200 text-3xl font-bold">
                        {Math.round((correctCount / mcqs.length) * 100)}%
                      </Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-cyan-400 text-sm font-semibold uppercase tracking-wide">
                        Correct
                      </Text>
                      <Text className="text-cyan-200 text-3xl font-bold">
                        {correctCount}
                      </Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-blue-400 text-sm font-semibold uppercase tracking-wide">
                        Total
                      </Text>
                      <Text className="text-blue-200 text-3xl font-bold">
                        {mcqs.length}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Next Concept Button */}
                <Pressable
                  onPress={onComplete}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl py-6 px-8 flex-row items-center justify-center shadow-2xl active:scale-95"
                  style={{
                    shadowColor: '#10b981',
                    shadowOffset: { width: 0, height: 12 },
                    shadowOpacity: 0.5,
                    shadowRadius: 24,
                    elevation: 12,
                  }}
                >
                  <Sparkles size={24} color="#ffffff" />
                  <Text className="text-white font-bold text-xl ml-3 mr-2">
                    Next Concept
                  </Text>
                  <ChevronRight size={24} color="#ffffff" />
                </Pressable>
              </View>

              {/* Celebration particles */}
              <View className="absolute inset-0 pointer-events-none">
                {[...Array(12)].map((_, i) => (
                  <MotiView
                    key={`celebration-particle-${i}`}
                    from={{ 
                      opacity: 0, 
                      translateY: Math.random() * 100,
                      translateX: Math.random() * 200 - 100,
                      scale: 0
                    }}
                    animate={{ 
                      opacity: [0, 1, 0],
                      translateY: Math.random() * -150,
                      translateX: Math.random() * 100 - 50,
                      scale: [0, 1.2, 0]
                    }}
                    transition={{
                      loop: true,
                      type: 'timing',
                      duration: 4000,
                      delay: i * 300,
                    }}
                    className="absolute"
                    style={{
                      left: `${Math.random() * 80 + 10}%`,
                      top: `${Math.random() * 80 + 10}%`,
                    }}
                  >
                    <View className="w-3 h-3 bg-emerald-400 rounded-full shadow-lg" />
                  </MotiView>
                ))}
              </View>
            </View>
          </MotiView>
        )}
      </ScrollView>
    </View>
  );
}