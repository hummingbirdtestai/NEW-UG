import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions, Linking, Platform } from 'react-native';
import { MotiView } from 'moti';
import { Atom, Bookmark, BookmarkCheck, ExternalLink, ChevronRight } from 'lucide-react-native';
import MarkdownWithLatex from "@/components/MarkdownWithLatex";
import SelfSignalsPanel from "@/components/SelfSignalsPanel"; // ✅ import panel

interface ConceptPhaseProps {
  concept: string;
  explanation: string;
  conceptId: string;   // ✅ real UUID from concepts_vertical
  onNext?: () => void;
  current?: number;
  total?: number;
}

export default function ConceptPhase({
  concept,
  explanation,
  conceptId,
  onNext,
  current,
  total,
}: ConceptPhaseProps) {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;
  const [localBookmark, setLocalBookmark] = useState(false);

  const handleBookmarkToggle = () => {
    setLocalBookmark(!localBookmark);
  };

  const handleLearnMore = () => {
    const searchQuery = concept.replace(/\*\*/g, '').trim();
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery + ' chemistry NEET')}`;
    if (Platform.OS === 'web') {
      window.open(searchUrl, '_blank');
    } else {
      Linking.openURL(searchUrl);
    }
  };

  const markdownStyles = {
    body: { color: '#f1f5f9', fontSize: 16, lineHeight: 26 },
    paragraph: { color: '#f1f5f9', marginBottom: 16, lineHeight: 26, fontSize: 16 },
    strong: {
      color: '#5eead4', fontWeight: '700', backgroundColor: 'rgba(94,234,212,0.1)',
      paddingHorizontal: 4, borderRadius: 4
    },
    em: { color: '#34d399', fontStyle: 'italic' },
    text: { color: '#f1f5f9', fontSize: 16, lineHeight: 26 },
  };

  return (
    <View className="flex-1 bg-slate-900">
      {/* Hero Section */}
      <View className="flex-row items-center justify-between p-8 pt-16 border-b border-slate-700/30">
        <View className="flex-row items-center flex-1">
          <View className="w-16 h-16 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-3xl items-center justify-center mr-6 shadow-2xl">
            <Atom size={32} color="#ffffff" />
          </View>
          <View className="flex-1">
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
          </View>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 24, flexGrow: 1 }}
      >
        {/* Explanation */}
        <View className="bg-slate-800/60 rounded-3xl border border-slate-700/40 shadow-2xl p-6">
          <MarkdownWithLatex content={explanation} markdownStyles={markdownStyles} />

          {/* Learn More + Next */}
          <View className="flex-row space-x-4 mt-6">
            <Pressable
              onPress={handleLearnMore}
              className="flex-1 bg-slate-700/60 rounded-2xl py-4 px-6 items-center justify-center"
            >
              <ExternalLink size={18} color="#94a3b8" />
              <Text className="text-slate-300 font-semibold text-base ml-2">
                Learn More
              </Text>
            </Pressable>
            <Pressable
              onPress={onNext}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl py-4 px-6 items-center justify-center"
            >
              <Text className="text-white font-bold text-base mr-2">
                Next → Conversation
              </Text>
              <ChevronRight size={18} color="#ffffff" />
            </Pressable>
          </View>
        </View>

        {/* ✅ Self Signals Panel */}
        <SelfSignalsPanel
          objectType="concept"
          objectUuid={conceptId}
          topicName={concept}
        />
      </ScrollView>
    </View>
  );
}
