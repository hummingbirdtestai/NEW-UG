import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { Eye, Lightbulb, ChevronRight, Sparkles } from 'lucide-react-native';
import MarkdownWithLatex from "@/components/MarkdownWithLatex";

interface QAItem {
  id?: string;
  question: string;
  answer: string;
}

interface FlashcardPhaseProps {
  qaData: QAItem[];
  onNext?: () => void;
  current?: number;
  total?: number;
}

interface ToggleCardProps {
  item: QAItem;
  index: number;
}

function ToggleCard({ item, index }: ToggleCardProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;

  const handleToggle = () => {
    setShowAnswer(!showAnswer);
  };

  const markdownStyles = {
    body: {
      color: '#f1f5f9',
      backgroundColor: 'transparent',
      fontSize: 16,
      lineHeight: 24,
      margin: 0,
      fontFamily: 'System',
    },
    paragraph: {
      color: '#f1f5f9',
      marginBottom: 12,
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
      textShadowColor: '#0f766e',
      textShadowRadius: 8,
    },
    em: {
      color: '#34d399',
      fontStyle: 'italic',
      backgroundColor: 'transparent',
    },
    text: {
      color: '#f1f5f9',
      fontSize: 16,
      lineHeight: 24,
    },
    list_item: {
      color: '#f1f5f9',
      marginLeft: 16,
      marginBottom: 6,
      fontSize: 15,
    },
    bullet_list: {
      marginVertical: 8,
    },
    code_inline: {
      backgroundColor: 'rgba(0,0,0,0.3)',
      color: '#fbbf24',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      fontSize: 14,
      fontFamily: 'monospace',
    },
    blockquote: {
      backgroundColor: 'rgba(0,0,0,0.2)',
      borderLeftWidth: 4,
      borderLeftColor: showAnswer ? '#8b5cf6' : '#14b8a6',
      paddingLeft: 16,
      paddingVertical: 12,
      marginVertical: 12,
      borderRadius: 8,
    },
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 50, scale: 0.9 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: 'spring', duration: 800, delay: index * 200 + 400 }}
      className="mb-8"
    >
      {/* Card Container */}
      <View 
        className={`rounded-3xl border-2 shadow-2xl overflow-hidden min-h-[200px] ${
          showAnswer 
            ? 'bg-gradient-to-br from-purple-900/60 to-indigo-900/60 border-purple-500/40' 
            : 'bg-gradient-to-br from-teal-900/60 to-cyan-900/60 border-teal-500/40'
        }`}
        style={{
          shadowColor: showAnswer ? '#8b5cf6' : '#14b8a6',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.25,
          shadowRadius: 24,
          elevation: 12,
        }}
      >
        {/* Card Header */}
        <View className={`flex-row items-center justify-between p-6 border-b ${
          showAnswer ? 'border-purple-500/20 bg-purple-600/10' : 'border-teal-500/20 bg-teal-600/10'
        }`}>
          <View className="flex-row items-center">
            <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 shadow-lg ${
              showAnswer 
                ? 'bg-gradient-to-br from-purple-500 to-indigo-600' 
                : 'bg-gradient-to-br from-teal-500 to-cyan-600'
            }`}>
              {showAnswer ? (
                <Lightbulb size={20} color="#ffffff" />
              ) : (
                <Sparkles size={20} color="#ffffff" />
              )}
            </View>
            <View className="flex-1">
              <Text className={`text-lg font-bold ${
                showAnswer ? 'text-purple-200' : 'text-teal-200'
              }`}>
                {showAnswer ? 'Answer' : 'Question'}
              </Text>
              <Text className="text-slate-400 text-sm">
                Card {index + 1} • Tap eye to toggle
              </Text>
            </View>
          </View>

          {/* Toggle Button */}
          <Pressable
            onPress={handleToggle}
            className={`w-12 h-12 rounded-2xl items-center justify-center shadow-lg active:scale-90 ${
              showAnswer 
                ? 'bg-gradient-to-br from-purple-500 to-indigo-600' 
                : 'bg-gradient-to-br from-teal-500 to-cyan-600'
            }`}
            style={{
              shadowColor: showAnswer ? '#8b5cf6' : '#14b8a6',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <MotiView
              animate={{
                scale: showAnswer ? [1, 1.2, 1] : 1,
                rotate: showAnswer ? '180deg' : '0deg',
              }}
              transition={{ type: 'spring', duration: 600 }}
            >
              <Eye size={20} color="#ffffff" />
            </MotiView>
          </Pressable>
        </View>

        {/* Content Container */}
        <View className="p-8 min-h-[140px] justify-center relative">
          {/* Question Content */}
          <AnimatePresence>
            {!showAnswer && (
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: -20 }}
                transition={{ type: 'spring', duration: 400 }}
                className="absolute inset-0 p-8 justify-center"
              >
                <View className="bg-slate-900/30 rounded-2xl p-6 border border-slate-600/20 shadow-inner">
                  <View className="flex-row items-start mb-4">
                    <View className="w-6 h-6 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full items-center justify-center mr-3 mt-1">
                      <Text className="text-white font-bold text-sm">Q</Text>
                    </View>
                    <View className="flex-1">
                      <MarkdownWithLatex content={item.question} markdownStyles={markdownStyles} />
                    </View>
                  </View>
                </View>
              </MotiView>
            )}
          </AnimatePresence>

          {/* Answer Content */}
          <AnimatePresence>
            {showAnswer && (
              <MotiView
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: -20 }}
                transition={{ type: 'spring', duration: 400 }}
                className="absolute inset-0 p-8 justify-center"
              >
                <View className="bg-slate-900/30 rounded-2xl p-6 border border-slate-600/20 shadow-inner">
                  <View className="flex-row items-start mb-4">
                    <View className="w-6 h-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full items-center justify-center mr-3 mt-1">
                      <Text className="text-white font-bold text-sm">A</Text>
                    </View>
                    <View className="flex-1">
                      <MarkdownWithLatex content={item.answer} markdownStyles={markdownStyles} />
                    </View>
                  </View>
                </View>
              </MotiView>
            )}
          </AnimatePresence>

          {/* Floating Glow Effect */}
          <MotiView
            from={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.1, opacity: 0.1 }}
            transition={{
              loop: true,
              type: 'timing',
              duration: 4000,
            }}
            className={`absolute inset-0 rounded-3xl -z-10 ${
              showAnswer 
                ? 'bg-gradient-to-br from-purple-500 via-indigo-500 to-violet-500' 
                : 'bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500'
            }`}
          />
        </View>
      </View>

      {/* Card Number Badge */}
      <MotiView
        from={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', duration: 600, delay: index * 200 + 800 }}
        className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full items-center justify-center shadow-lg z-10"
        style={{
          shadowColor: '#f59e0b',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <Text className="text-white font-bold text-sm">
          {index + 1}
        </Text>
      </MotiView>
    </MotiView>
  );
}

export default function FlashcardPhase({
  qaData = [],
  onNext,
  current,
  total,
}: FlashcardPhaseProps) {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;

  if (qaData.length === 0) {
    return (
      <View className="flex-1 bg-slate-900 items-center justify-center p-8">
        <View className="w-20 h-20 bg-gradient-to-br from-teal-500/20 to-cyan-600/20 rounded-3xl items-center justify-center mb-6">
          <Sparkles size={32} color="#5eead4" />
        </View>
        <Text className="text-2xl font-bold text-slate-100 mb-2 text-center">
          No Flashcards Available
        </Text>
        <Text className="text-slate-300 text-base text-center max-w-md">
          Complete the concept phase to generate interactive flashcards
        </Text>
      </View>
    );
  }

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
          animate={{ scale: 1.2, opacity: 0.15 }}
          transition={{
            loop: true,
            type: 'timing',
            duration: 8000,
          }}
          className="absolute inset-0 bg-gradient-to-br from-teal-500/30 via-purple-500/20 to-indigo-500/30"
        />
        
        <View className="flex-row items-center justify-between p-8 pt-16 border-b border-slate-700/30">
          <View className="flex-row items-center flex-1">
            <MotiView
              from={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', duration: 1000, delay: 200 }}
              className="w-16 h-16 bg-gradient-to-br from-teal-500 to-purple-600 rounded-3xl items-center justify-center mr-6 shadow-2xl"
              style={{
                shadowColor: '#14b8a6',
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.4,
                shadowRadius: 24,
                elevation: 12,
              }}
            >
              <Sparkles size={32} color="#ffffff" />
              
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
                <View className="flex-row items-center mb-2">
                  <Text className="text-sm text-teal-400 font-semibold uppercase tracking-wide">
                    Flashcard Phase
                  </Text>
                  {typeof current === "number" && typeof total === "number" && (
                    <Text className="text-xs text-slate-400 ml-2">
                      ({current} / {total})
                    </Text>
                  )}
                </View>
                <Text className="text-3xl font-bold text-slate-100 mb-2 leading-tight">
                  Interactive Q&A Cards
                </Text>
                <Text className="text-lg text-slate-300">
                  Toggle between questions and answers to test your knowledge
                </Text>
              </MotiView>
            </View>
          </View>

          {/* Cards Count Badge */}
          <MotiView
            from={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 600, delay: 600 }}
            className="items-center"
          >
            <View className="bg-gradient-to-br from-teal-500/20 to-purple-500/20 rounded-2xl px-6 py-4 border border-teal-500/30 shadow-xl">
              <Text className="text-teal-400 font-bold text-2xl text-center">
                {qaData.length}
              </Text>
              <Text className="text-teal-300/80 text-sm text-center font-medium">
                cards
              </Text>
            </View>
          </MotiView>
        </View>
      </MotiView>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: isMobile ? 16 : 24,
          paddingVertical: 24,
          paddingBottom: 280, // Extra space for next button
        }}
      >
        {/* Flashcards Grid */}
        <View className="space-y-6">
          {qaData.map((item, index) => (
            <ToggleCard
              key={item.id || `qa-${index}`}
              item={item}
              index={index}
            />
          ))}
        </View>

        {/* Instructions Card */}
        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 800, delay: qaData.length * 200 + 600 }}
          className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-2xl p-6 border border-indigo-500/20 shadow-xl mt-8"
          style={{
            shadowColor: '#6366f1',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl items-center justify-center mr-3 shadow-lg">
              <Lightbulb size={20} color="#ffffff" />
            </View>
            <Text className="text-xl font-bold text-indigo-100">
              💡 Study Tips
            </Text>
          </View>
          
          <View className="space-y-3">
            <Text className="text-indigo-200 text-base leading-7">
              • <Text className="font-semibold">Try to answer</Text> each question before revealing the answer
            </Text>
            <Text className="text-indigo-200 text-base leading-7">
              • <Text className="font-semibold">Take your time</Text> to understand the concepts thoroughly
            </Text>
            <Text className="text-indigo-200 text-base leading-7">
              • <Text className="font-semibold">Review cards</Text> you found challenging before moving on
            </Text>
          </View>
        </MotiView>

        {/* Progress Indicator */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: qaData.length * 200 + 800 }}
          className="mt-8 bg-slate-800/40 rounded-2xl p-4 border border-slate-700/30"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-6 h-6 bg-gradient-to-br from-teal-500 to-purple-600 rounded-full items-center justify-center mr-3">
                <Text className="text-white font-bold text-xs">3</Text>
              </View>
              <Text className="text-slate-300 font-medium">
                Flashcard Phase
              </Text>
            </View>
            
            <View className="flex-row items-center space-x-2">
              <View className="w-8 h-2 bg-teal-500 rounded-full" />
              <View className="w-8 h-2 bg-emerald-500 rounded-full" />
              <View className="w-8 h-2 bg-purple-500 rounded-full" />
              <View className="w-8 h-2 bg-slate-600 rounded-full" />
            </View>
          </View>
          
          <Text className="text-slate-400 text-sm mt-2">
            Review key concepts before testing with MCQs
          </Text>
        </MotiView>
      </ScrollView>

      {/* Fixed Next Button */}
      <MotiView
        from={{ opacity: 0, translateY: 100 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'spring', duration: 800, delay: qaData.length * 200 + 1000 }}
        className="absolute bottom-0 left-0 right-0 p-6 bg-slate-900/98 backdrop-blur-xl border-t border-slate-700/50 shadow-2xl"
        style={{
          shadowColor: '#10b981',
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.2,
          shadowRadius: 16,
          elevation: 12,
        }}
      >
        <Text className="text-slate-400 text-sm text-center mb-4">
          Ready to test your knowledge? • {qaData.length} concepts reviewed
        </Text>

        <Pressable
          onPress={onNext}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl py-4 px-6 shadow-xl active:scale-95 flex-row items-center justify-center"
          style={{
            shadowColor: '#10b981',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <Text className="text-white font-bold text-lg mr-3">
            Continue to MCQs
          </Text>
          <ChevronRight size={20} color="#ffffff" />
        </Pressable>
      </MotiView>

      {/* Floating Action Elements */}
      <View className="absolute top-32 right-8 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <MotiView
            key={`particle-${i}`}
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
              top: Math.random() * 120,
            }}
          >
            <View className="w-2 h-2 bg-teal-400 rounded-full shadow-lg" />
          </MotiView>
        ))}
      </View>
    </View>
  );
}

export default FlashcardPhase

export default FlashcardPhase