import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions, Linking, Platform } from 'react-native';
import { MotiView } from 'moti';
import { Atom, Bookmark, BookmarkCheck, ExternalLink, ChevronRight, Sparkles } from 'lucide-react-native';
import MarkdownWithLatex from "@/components/MarkdownWithLatex";
import React, { useState, useEffect } from 'react';
interface ConceptPhaseProps {
  concept: string;
  explanation: string;
  onNext?: () => void;
  onBookmark?: (isBookmarked: boolean) => void;
  isBookmarked?: boolean;
  current?: number;   // ✅ NEW
  total?: number;     // ✅ NEW
}

export default function ConceptPhase({
  concept,
  explanation,
  onNext,
  onBookmark,
  isBookmarked = false,
  current,     // ✅ add
  total,       // ✅ add
}: ConceptPhaseProps) {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;
  
  const [localBookmark, setLocalBookmark] = useState(isBookmarked);

  const handleBookmarkToggle = () => {
    const newValue = !localBookmark;
    setLocalBookmark(newValue);
    onBookmark?.(newValue);
  };

  const handleLearnMore = () => {
    // Extract concept name for search (remove markdown formatting)
    const searchQuery = concept.replace(/\*\*/g, '').trim();
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery + ' chemistry NEET')}`;
    
    if (Platform.OS === 'web') {
      window.open(searchUrl, '_blank');
    } else {
      Linking.openURL(searchUrl);
    }
  };

  // Custom markdown styles for concept explanation
  const markdownStyles = {
    body: {
      color: '#f1f5f9',
      backgroundColor: 'transparent',
      fontSize: 16,
      lineHeight: 26,
      margin: 0,
      fontFamily: 'System',
    },
    paragraph: {
      color: '#f1f5f9',
      marginBottom: 16,
      lineHeight: 26,
      fontSize: 16,
    },
    strong: {
      color: '#5eead4',
      fontWeight: '700',
      backgroundColor: 'rgba(94, 234, 212, 0.1)',
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
      textShadowColor: '#0f766e',
      textShadowRadius: 6,
    },
    em: {
      color: '#34d399',
      fontStyle: 'italic',
      backgroundColor: 'transparent',
    },
    text: {
      color: '#f1f5f9',
      fontSize: 16,
      lineHeight: 26,
    },
  };

  return (
    <View className="flex-1 bg-slate-900">
      {/* Hero Section with Gradient Background */}
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
          className="absolute inset-0 bg-gradient-to-br from-teal-500/30 via-cyan-500/20 to-indigo-500/30"
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
              <Atom size={32} color="#ffffff" />
              
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
    Concept Learning
  </Text>
  {typeof current === "number" && typeof total === "number" && (
  <Text className="text-xs text-slate-400 ml-2">
    ({current} / {total})
  </Text>
)}

</View>

                <MarkdownWithLatex 
                  content={concept.startsWith('#') ? concept : `# ${concept}`}
                  markdownStyles={{
                    ...markdownStyles,
                    heading1: {
                      color: '#f1f5f9',
                      fontSize: isMobile ? 28 : 36,
                      fontWeight: 'bold',
                      marginBottom: 8,
                      lineHeight: isMobile ? 32 : 40,
                    }
                  }}
                />

              </MotiView>
            </View>
          </View>

          {/* Floating particles */}
          <View className="absolute top-8 right-8 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <MotiView
                key={i}
                from={{ 
                  opacity: 0, 
                  translateY: Math.random() * 50,
                  translateX: Math.random() * 50,
                  scale: 0
                }}
                animate={{ 
                  opacity: [0, 0.6, 0],
                  translateY: Math.random() * -100,
                  translateX: Math.random() * 30 - 15,
                  scale: [0, 1, 0]
                }}
                transition={{
                  loop: true,
                  type: 'timing',
                  duration: 4000,
                  delay: i * 800,
                }}
                className="absolute"
                style={{
                  left: Math.random() * 60,
                  top: Math.random() * 80,
                }}
              >
                <View className="w-2 h-2 bg-teal-400 rounded-full shadow-lg" />
              </MotiView>
            ))}
          </View>
        </View>
      </MotiView>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: isMobile ? 16 : 24,
          paddingVertical: 24,
          flexGrow: 1,
        }}
      >
        {/* Main Content Card */}
        <MotiView
          from={{ opacity: 0, translateY: 50, scale: 0.95 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{ type: 'spring', duration: 1000, delay: 600 }}
          className="relative"
        >
          {/* Glassmorphic Card */}
          <View 
            className="bg-slate-800/60 backdrop-blur-xl rounded-3xl border border-slate-700/40 shadow-2xl overflow-hidden"
            style={{
              shadowColor: '#0f766e',
              shadowOffset: { width: 0, height: 20 },
              shadowOpacity: 0.25,
              shadowRadius: 40,
              elevation: 20,
            }}
          >
            {/* Card Header */}
            <View className="flex-row items-center justify-between p-6 border-b border-slate-700/30 bg-slate-800/40">
              <Text className="text-lg font-bold text-slate-100">
                Core Concept
              </Text>

              {/* Bookmark Toggle */}
              <MotiView
                from={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', duration: 600, delay: 800 }}
              >
                <Pressable
                  onPress={handleBookmarkToggle}
                  className={`w-12 h-12 rounded-2xl items-center justify-center shadow-lg active:scale-90 ${
                    localBookmark 
                      ? 'bg-gradient-to-br from-amber-500 to-orange-600' 
                      : 'bg-slate-700/60 border border-slate-600/50'
                  }`}
                  style={{
                    shadowColor: localBookmark ? '#f59e0b' : '#64748b',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                >
                  <MotiView
                    animate={{
                      scale: localBookmark ? [1, 1.3, 1] : 1,
                      rotate: localBookmark ? [0, 15, -15, 0] : 0,
                    }}
                    transition={{ type: 'spring', duration: 600 }}
                  >
                    {localBookmark ? (
                      <BookmarkCheck size={20} color="#ffffff" />
                    ) : (
                      <Bookmark size={20} color="#94a3b8" />
                    )}
                  </MotiView>
                </Pressable>
              </MotiView>
            </View>

            {/* Explanation Content */}
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', duration: 800, delay: 1000 }}
              className="p-8"
            >
              {/* Content with enhanced markdown styling */}
              <View className="bg-slate-900/30 rounded-2xl p-6 border border-slate-600/20 shadow-inner">
                <MarkdownWithLatex content={explanation} markdownStyles={markdownStyles} />
              </View>

              {/* Interactive Action Buttons */}
              <View className="flex-row space-x-4 mt-8">
                {/* Learn More Button */}
                <MotiView
                  from={{ opacity: 0, translateX: -20 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ type: 'spring', duration: 600, delay: 1200 }}
                  className="flex-1"
                >
                  <Pressable
                    onPress={handleLearnMore}
                    className="bg-slate-700/60 border border-slate-600/50 rounded-2xl py-4 px-6 shadow-lg active:scale-95 flex-row items-center justify-center"
                    style={{
                      shadowColor: '#64748b',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 4,
                    }}
                  >
                    <ExternalLink size={18} color="#94a3b8" />
                    <Text className="text-slate-300 font-semibold text-base ml-2">
                      Learn More
                    </Text>
                  </Pressable>
                </MotiView>

                {/* Next Button - Primary CTA */}
                <MotiView
                  from={{ opacity: 0, translateX: 20 }}
                  animate={{ opacity: 1, translateX: 0 }}
                  transition={{ type: 'spring', duration: 600, delay: 1400 }}
                  className="flex-1"
                >
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
                    <Text className="text-white font-bold text-base mr-2">
                      Next → Conversation
                    </Text>
                    <ChevronRight size={18} color="#ffffff" />
                  </Pressable>
                </MotiView>
              </View>
            </MotiView>

            {/* Decorative Elements */}
            <View className="absolute top-4 left-4 pointer-events-none">
              <MotiView
                from={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.3 }}
                transition={{
                  loop: true,
                  type: 'timing',
                  duration: 3000,
                }}
                className="w-32 h-32 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/20"
              />
            </View>

            <View className="absolute bottom-4 right-4 pointer-events-none">
              <MotiView
                from={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.2 }}
                transition={{
                  loop: true,
                  type: 'timing',
                  duration: 4000,
                  delay: 1000,
                }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20"
              />
            </View>
          </View>

          {/* Floating Glow Effect */}
          <MotiView
            from={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.1, opacity: 0.1 }}
            transition={{
              loop: true,
              type: 'timing',
              duration: 6000,
            }}
            className="absolute inset-0 rounded-3xl bg-gradient-to-br from-teal-500 via-cyan-500 to-indigo-500 -z-10"
          />
        </MotiView>

        {/* Progress Indicator */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', duration: 600, delay: 1600 }}
          className="mt-8 bg-slate-800/40 rounded-2xl p-4 border border-slate-700/30"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-6 h-6 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full items-center justify-center mr-3">
                <Text className="text-white font-bold text-xs">1</Text>
              </View>
              <Text className="text-slate-300 font-medium">
                Concept Phase
              </Text>
            </View>
            
            <View className="flex-row items-center space-x-2">
              <View className="w-8 h-2 bg-teal-500 rounded-full" />
              <View className="w-8 h-2 bg-slate-600 rounded-full" />
              <View className="w-8 h-2 bg-slate-600 rounded-full" />
              <View className="w-8 h-2 bg-slate-600 rounded-full" />
            </View>
          </View>
          
          <Text className="text-slate-400 text-sm mt-2">
            Understanding the fundamental concept before diving into practice
          </Text>
        </MotiView>

        {/* Floating Action Elements */}
        <View className="absolute top-32 right-8 pointer-events-none">
          {[...Array(4)].map((_, i) => (
            <MotiView
              key={i}
              from={{ 
                opacity: 0, 
                translateY: Math.random() * 60,
                translateX: Math.random() * 60,
                scale: 0
              }}
              animate={{ 
                opacity: [0, 0.4, 0],
                translateY: Math.random() * -120,
                translateX: Math.random() * 40 - 20,
                scale: [0, 1, 0]
              }}
              transition={{
                loop: true,
                type: 'timing',
                duration: 5000,
                delay: i * 1200,
              }}
              className="absolute"
              style={{
                left: Math.random() * 80,
                top: Math.random() * 100,
              }}
            >
              <View className="w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-lg" />
            </MotiView>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}