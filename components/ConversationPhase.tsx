import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { MessageCircle, User, GraduationCap, Lightbulb, BookOpen, Bookmark, BookmarkCheck, ChevronRight, ChevronDown, ChevronUp, CircleCheck as CheckCircle, Circle as XCircle, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import MarkdownWithLatex from "@/components/MarkdownWithLatex";
import ConfettiCannon from 'react-native-confetti-cannon';

interface MCQ {
  question: string;
  options: string[];
  answerIndex: number;
  feedback: string;
  correctExplanation: string;
  learningGap?: string;
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

interface MCQCardProps {
  mcq: MCQ;
  mcqIndex: number;
  onAnswer: (selectedIndex: number) => void;
  selectedAnswer?: number;
  showFeedback?: boolean;
  isCorrect?: boolean;
}


function HYFCard({ hyf, index, onGotIt, onBookmark, isBookmarked = false }: HYFCardProps) {
  const [localBookmark, setLocalBookmark] = useState(isBookmarked);


  const handleBookmarkToggle = () => {
    const newValue = !localBookmark;
    setLocalBookmark(newValue);
    onBookmark?.(index, newValue);
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

function MCQCard({ mcq, mcqIndex, onAnswer, selectedAnswer, showFeedback, isCorrect }: MCQCardProps) {
  const markdownStyles = {
    body: {
      color: '#ffffff',
      backgroundColor: 'transparent',
      fontSize: 16,
      lineHeight: 24,
      margin: 0,
      fontFamily: 'System',
    },
    paragraph: {
      color: '#ffffff',
      marginBottom: 8,
      lineHeight: 24,
      fontSize: 16,
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
      fontStyle: 'italic',
      backgroundColor: 'transparent',
    },
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 30, scale: 0.95 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: 'spring', duration: 600, delay: 200 }}
      className="mb-6"
    >
      {/* MCQ Header */}
      <View className="flex-row items-center mb-4">
        <View className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg items-center justify-center mr-3">
          <Text className="text-white font-bold text-sm">Q{mcqIndex + 1}</Text>
        </View>
        <Text className="text-indigo-300 font-bold text-lg">Practice Question</Text>
      </View>

      {/* Question Card */}
      <View className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden mb-4">
        <View className="p-6">
          <MarkdownWithLatex content={mcq.question} markdownStyles={markdownStyles} />
        </View>
      </View>

      {/* Options */}
      <View className="space-y-3 mb-4">
        {mcq.options.map((option, optionIndex) => {
          const isSelected = selectedAnswer === optionIndex;
          const isCorrectOption = optionIndex === mcq.answerIndex;
          const showAsCorrect = showFeedback && isCorrectOption && !isCorrect;
          const showAsWrong = showFeedback && isSelected && !isCorrect;
          
          let optionStyle = 'bg-slate-800/80 border-slate-600/50 active:bg-slate-700/95';
          let textColor = 'text-slate-100';
          
          if (showFeedback) {
            if (isSelected && isCorrect) {
              optionStyle = 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/60';
              textColor = 'text-emerald-100';
            } else if (showAsWrong) {
              optionStyle = 'bg-gradient-to-r from-red-500/20 to-rose-500/20 border-red-500/60';
              textColor = 'text-red-100';
            } else if (showAsCorrect) {
              optionStyle = 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/60';
              textColor = 'text-emerald-100';
            }
          }

          return (
            <MotiView
              key={optionIndex}
              from={{ opacity: 0, translateX: -30, scale: 0.9 }}
              animate={{ opacity: 1, translateX: 0, scale: 1 }}
              transition={{ type: 'spring', duration: 500, delay: optionIndex * 100 + 400 }}
            >
              <Pressable
                onPress={() => !showFeedback && onAnswer(optionIndex)}
                disabled={showFeedback}
                className={`${optionStyle} border-2 rounded-xl p-4 flex-row items-center shadow-lg`}
              >
                {/* Option Letter */}
                <View className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full items-center justify-center mr-4 shadow-md">
                  <Text className="text-white font-bold text-sm">
                    {String.fromCharCode(65 + optionIndex)}
                  </Text>
                </View>
                
                {/* Option Text */}
                <View className="flex-1">
                  <Text className={`${textColor} text-base`}>
                    {option}
                  </Text>
                </View>

                {/* Result Icon */}
                {showFeedback && isSelected && (
                  <MotiView
                    from={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', duration: 400 }}
                    className="ml-3"
                  >
                    {isCorrect ? (
                      <CheckCircle size={24} color="#10b981" />
                    ) : (
                      <XCircle size={24} color="#ef4444" />
                    )}
                  </MotiView>
                )}

                {/* Correct Answer Indicator */}
                {showFeedback && showAsCorrect && (
                  <MotiView
                    from={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', duration: 400, delay: 200 }}
                    className="ml-3"
                  >
                    <CheckCircle size={24} color="#10b981" />
                  </MotiView>
                )}
              </Pressable>
            </MotiView>
          );
        })}
      </View>

      {/* Feedback Section */}
      {showFeedback && (
        <AnimatePresence>
          {/* Wrong Answer Feedback */}
          {!isCorrect && (
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', duration: 600, delay: 300 }}
              className="mb-4"
            >
              <View className="bg-gradient-to-br from-red-900/60 to-rose-900/60 rounded-2xl border border-red-500/40 p-4 shadow-lg">
                <View className="flex-row items-center mb-3">
                  <XCircle size={20} color="#ef4444" />
                  <Text className="text-red-200 font-bold text-lg ml-2">Not quite right</Text>
                </View>
                <MarkdownWithLatex content={mcq.feedback} markdownStyles={markdownStyles} />
              </View>
            </MotiView>
          )}

          {/* Learning Gap */}
          {!isCorrect && mcq.learningGap && (
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', duration: 600, delay: 500 }}
              className="mb-4"
            >
              <View className="bg-gradient-to-br from-amber-900/60 to-orange-900/60 rounded-2xl border border-amber-500/40 p-4 shadow-lg">
                <View className="flex-row items-center mb-3">
                  <AlertTriangle size={20} color="#f59e0b" />
                  <Text className="text-amber-200 font-bold text-lg ml-2">Learning Gap</Text>
                </View>
                <Text className="text-amber-100 text-base leading-6">
                  💡 {mcq.learningGap}
                </Text>
              </View>
            </MotiView>
          )}

          {/* Correct Answer Explanation */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', duration: 600, delay: isCorrect ? 300 : 700 }}
            className="mb-4"
          >
            <View className="bg-gradient-to-br from-emerald-900/60 to-teal-900/60 rounded-2xl border border-emerald-500/40 p-4 shadow-lg">
              <View className="flex-row items-center mb-3">
                <CheckCircle size={20} color="#10b981" />
                <Text className="text-emerald-200 font-bold text-lg ml-2">
                  {isCorrect ? 'Excellent!' : 'Correct Answer'}
                </Text>
              </View>
              <MarkdownWithLatex content={mcq.correctExplanation} markdownStyles={markdownStyles} />
            </View>
          </MotiView>
        </AnimatePresence>
      )}
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
  const [selectedAnswer, setSelectedAnswer] = useState<number | undefined>(undefined);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const isMobile = Dimensions.get('window').width < 768;

  const currentHYF = hyfs[currentHYFIndex];
  const currentMCQ = currentHYF?.mcqs[currentMCQIndex];

  const handleNextMCQ = () => {
    const isCorrect = selectedAnswer === currentMCQ?.answerIndex;

    if (isCorrect) {
      // Correct answer - move to next HYF
      handleNextHYF();
    } else {
      // Wrong answer - show next MCQ or move to next HYF if no more MCQs
      if (currentMCQIndex < currentHYF.mcqs.length - 1) {
        setCurrentMCQIndex(currentMCQIndex + 1);
        setSelectedAnswer(undefined);
        setShowFeedback(false);
      } else {
        // No more MCQs, move to next HYF
        handleNextHYF();
      }
    }
  };

  const handleNextHYF = () => {
    if (currentHYFIndex < hyfs.length - 1) {
      setCurrentHYFIndex(currentHYFIndex + 1);
      setCurrentMCQIndex(-1);
      setSelectedAnswer(undefined);
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

  const handleMCQAnswer = (selectedIndex: number) => {
    setSelectedAnswer(selectedIndex);
    setShowFeedback(true);
    
    if (selectedIndex === currentMCQ?.answerIndex) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const isCorrect = selectedAnswer === currentMCQ?.answerIndex;

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
                of {hyfs.length}
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
            {currentMCQIndex === -1 && (
              <HYFCard
                hyf={currentHYF}
                index={currentHYFIndex}
                onGotIt={handleGotIt}
                onBookmark={onBookmark}
                isBookmarked={bookmarkedHYFs.has(currentHYFIndex)}
              />
            )}

            {/* Current MCQ */}
            {currentMCQIndex >= 0 && currentMCQ && (
              <>
                <MCQCard
                  mcq={currentMCQ}
                  mcqIndex={currentMCQIndex}
                  onAnswer={handleMCQAnswer}
                  selectedAnswer={selectedAnswer}
                  showFeedback={showFeedback}
                  isCorrect={isCorrect}
                />

                {/* Next Button */}
                {showFeedback && (
                  <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'spring', duration: 600, delay: 800 }}
                    className="flex-row justify-end"
                  >
                    <Pressable
                      onPress={handleNextMCQ}
                     className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl py-4 px-6 border border-emerald-500/30 shadow-2xl active:scale-95"
                      style={{
                        shadowColor: '#10b981',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.4,
                        shadowRadius: 16,
                        elevation: 8,
                      }}
                    >
                      <Text className="text-white font-bold text-lg mr-3">
                        {isCorrect 
                          ? 'Next HYF' 
                          : currentMCQIndex < currentHYF.mcqs.length - 1 
                            ? 'Next MCQ' 
                            : 'Next HYF'
                        }
                      </Text>
                      <ChevronRight size={20} color="#ffffff" />
                    </Pressable>
                  </MotiView>
                )}
              </>
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