import {
  View,
  Text,
  Pressable,
  ScrollView,
  Dimensions,
  Linking,
  Platform,
} from "react-native";
import { MotiView } from "moti";
import {
  Atom,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  ChevronRight,
} from "lucide-react-native"; // ✅ removed unused Sparkles
import MarkdownWithLatex from "@/components/MarkdownWithLatex";
import React, { useState, useEffect } from "react";

interface ConceptPhaseProps {
  concept: string;
  explanation: string;
  onNext?: () => void;
  onBookmark?: (isBookmarked: boolean) => void;
  isBookmarked?: boolean;
  current?: number;
  total?: number;
}

export default function ConceptPhase({
  concept,
  explanation,
  onNext,
  onBookmark,
  isBookmarked = false,
  current,
  total,
}: ConceptPhaseProps) {
  const { width } = Dimensions.get("window");
  const isMobile = width < 768;

  const handleBookmarkToggle = () => {
    const newValue = !isBookmarked;
    onBookmark?.(newValue);
  };

  const handleLearnMore = () => {
    // ✅ safer fallback if concept is empty/undefined
    const cleanConcept = (concept || "").replace(/\*\*/g, "").trim();
    const searchQuery = cleanConcept || "NEET Chemistry";
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
      searchQuery + " chemistry NEET"
    )}`;

    if (Platform.OS === "web") {
      window.open(searchUrl, "_blank");
    } else {
      Linking.openURL(searchUrl);
    }
  };

  const markdownStyles = {
    body: {
      color: "#f1f5f9",
      backgroundColor: "transparent",
      fontSize: 16,
      lineHeight: 26,
      margin: 0,
      fontFamily: "System",
    },
    paragraph: {
      color: "#f1f5f9",
      marginBottom: 16,
      lineHeight: 26,
      fontSize: 16,
    },
    strong: {
      color: "#5eead4",
      fontWeight: "700",
      backgroundColor: "rgba(94, 234, 212, 0.1)",
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
      textShadowColor: "#0f766e",
      textShadowRadius: 6,
    },
    em: {
      color: "#34d399",
      fontStyle: "italic",
      backgroundColor: "transparent",
    },
    text: {
      color: "#f1f5f9",
      fontSize: 16,
      lineHeight: 26,
    },
  };

  return (
    <View className="flex-1 bg-slate-900">
      {/* Hero Section */}
      <MotiView
        from={{ opacity: 0, translateY: -30 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "spring", duration: 800 }}
        className="relative overflow-hidden"
      >
        {/* Animated background gradient */}
        <MotiView
          from={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 0.15 }}
          transition={{
            loop: true,
            type: "timing",
            duration: 8000,
          }}
          className="absolute inset-0 bg-gradient-to-br from-teal-500/30 via-cyan-500/20 to-indigo-500/30"
        />

        {/* Header */}
        <View className="flex-row items-center justify-between p-8 pt-16 border-b border-slate-700/30">
          <View className="flex-row items-center flex-1">
            {/* Icon */}
            <MotiView
              from={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 1000, delay: 200 }}
              className="w-16 h-16 bg-gradient-to-br from-teal-500 to-indigo-600 rounded-3xl items-center justify-center mr-6 shadow-2xl"
              style={{
                shadowColor: "#14b8a6",
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.4,
                shadowRadius: 24,
                elevation: 12,
              }}
            >
              <Atom size={32} color="#ffffff" />
              <MotiView
                from={{ rotate: "0deg", scale: 1 }}
                animate={{ rotate: "360deg", scale: 1.4 }}
                transition={{
                  loop: true,
                  type: "timing",
                  duration: 6000,
                }}
                className="absolute inset-0 rounded-3xl bg-teal-400/20"
              />
            </MotiView>

            {/* Concept Title */}
            <View className="flex-1">
              <MotiView
                from={{ opacity: 0, translateX: -30 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: "spring", duration: 800, delay: 400 }}
              >
                <View className="flex-row items-center mb-2">
                  <Text className="text-sm text-teal-400 font-semibold uppercase tracking-wide">
                    Concept Learning
                  </Text>
                  {typeof current === "number" &&
                    typeof total === "number" && (
                      <Text className="text-xs text-slate-400 ml-2">
                        ({current} / {total})
                      </Text>
                    )}
                </View>

                <MarkdownWithLatex
                  content={
                    concept?.startsWith("#") ? concept : `# ${concept || ""}`
                  }
                  markdownStyles={{
                    ...markdownStyles,
                    heading1: {
                      color: "#f1f5f9",
                      fontSize: isMobile ? 28 : 36,
                      fontWeight: "bold",
                      marginBottom: 8,
                      lineHeight: isMobile ? 32 : 40,
                    },
                  }}
                />
              </MotiView>
            </View>
          </View>

          {/* Bookmark Toggle */}
          <MotiView
            from={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 600, delay: 800 }}
          >
            <Pressable
              onPress={handleBookmarkToggle}
              className={`w-12 h-12 rounded-2xl items-center justify-center shadow-lg active:scale-90 ${
                isBookmarked
                  ? "bg-gradient-to-br from-amber-500 to-orange-600"
                  : "bg-slate-700/60 border border-slate-600/50"
              }`}
              style={{
                shadowColor: isBookmarked  ? "#f59e0b" : "#64748b",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <MotiView
                animate={{
                  scale: isBookmarked  ? [1, 1.3, 1] : 1,
                  rotate: isBookmarked  ? [0, 15, -15, 0] : 0,
                }}
                transition={{ type: "spring", duration: 600 }}
              >
                {isBookmarked  ? (
                  <BookmarkCheck size={20} color="#ffffff" />
                ) : (
                  <Bookmark size={20} color="#94a3b8" />
                )}
              </MotiView>
            </Pressable>
          </MotiView>
        </View>
      </MotiView>

      {/* Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: isMobile ? 16 : 24,
          paddingVertical: 24,
          flexGrow: 1,
        }}
      >
        {/* Explanation */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "spring", duration: 800, delay: 1000 }}
          className="p-8 bg-slate-900/30 rounded-2xl border border-slate-600/20 shadow-inner"
        >
          <MarkdownWithLatex
            content={explanation || "No explanation available."}
            markdownStyles={markdownStyles}
          />

          {/* Actions */}
          <View className="flex-row space-x-4 mt-8">
            {/* Learn More */}
            <Pressable
              onPress={handleLearnMore}
              className="flex-1 bg-slate-700/60 border border-slate-600/50 rounded-2xl py-4 px-6 shadow-lg active:scale-95 flex-row items-center justify-center"
            >
              <ExternalLink size={18} color="#94a3b8" />
              <Text className="text-slate-300 font-semibold text-base ml-2">
                Learn More
              </Text>
            </Pressable>

            {/* Next Button */}
            <Pressable
              onPress={onNext}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl py-4 px-6 shadow-xl active:scale-95 flex-row items-center justify-center"
            >
              <Text className="text-white font-bold text-base mr-2">
                Next → Conversation
              </Text>
              <ChevronRight size={18} color="#ffffff" />
            </Pressable>
          </View>
        </MotiView>
      </ScrollView>
    </View>
  );
}
