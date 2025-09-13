import React, { useState } from "react";
import { View, Dimensions, ScrollView } from "react-native";
import Sidebar from "@/components/Sidebar";
import HomePage from "@/components/HomePage";
import AdaptiveChat from "@/components/AdaptiveChat";
import AnalyticsPage from "@/components/AnalyticsPage";
import ConceptPrerequisiteMap from "@/components/ConceptPrerequisiteMap";
import ConfidenceVsRealityPage from "@/app/confidence-vs-reality";
import SmartRevisionPage from "@/app/SmartRevisionPage";
import QuickFixLessonsPage from "@/app/QuickFixLessonsPage";
import AchievementsRewardsPage from "@/app/AchievementsRewardsPage";
import PeerComparisonPage from "@/components/PeerComparisonPage";
import BuddyModePage from "@/app/BuddyModePage";
import DynamicCohortsPage from "@/app/DynamicCohortsPage";

interface ClassItem {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
}

interface Chapter {
  id: string;
  name: string;
  order: number;
}

export default function LayoutWithSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { width } = Dimensions.get("window");
  const isMobile = width < 768;
  const sidebarWidth = 240;

  const [currentView, setCurrentView] = useState<
    | "home"
    | "exam"
    | "subject"
    | "analytics"
    | "concept-map"
    | "confidence"
    | "smart-revision"
    | "quick-fix"
    | "achievements"
    | "peer-comparison"
    | "buddy-mode"
    | "dynamic-cohorts"
    | "chapter"
  >("analytics");

  const [analyticsRoute, setAnalyticsRoute] = useState("/analytics/prep-overview");

  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

  return (
    <View className="flex-1 bg-slate-900">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={setSidebarOpen}
        selectedClass={selectedClass}
        selectedSubject={selectedSubject}
        selectedChapter={selectedChapter}
        onClassSelect={(cls) => {
          setSelectedClass(cls);
          setSelectedSubject(null);
          setSelectedChapter(null);
          setCurrentView("class");
          if (isMobile) setSidebarOpen(false);
        }}
        onSubjectSelect={(sub) => {
          setSelectedSubject(sub);
          setSelectedChapter(null);
          setCurrentView("subject");
          if (isMobile) setSidebarOpen(false);
        }}
        onChapterSelect={(ch) => {
          setSelectedChapter(ch);
          setCurrentView("chapter");
          if (isMobile) setSidebarOpen(false);
        }}
        onProfileClick={() => isMobile && setSidebarOpen(false)}
        isMobile={isMobile}
        onHomeClick={() => {
          setCurrentView("home");
          setSelectedClass(null);
          setSelectedSubject(null);
          setSelectedChapter(null);
          if (isMobile) setSidebarOpen(false);
        }}
        onAnalyticsNavigate={(route) => {
          setAnalyticsRoute(route);
          setCurrentView("analytics");
          if (isMobile) setSidebarOpen(false);
        }}
        onConceptMapNavigate={() => {
          setCurrentView("concept-map");
          if (isMobile) setSidebarOpen(false);
        }}
        onConfidenceNavigate={() => {
          setCurrentView("confidence");
          if (isMobile) setSidebarOpen(false);
        }}
        onSmartRevisionNavigate={() => {
          setCurrentView("smart-revision");
          if (isMobile) setSidebarOpen(false);
        }}
        onQuickFixNavigate={() => {
          setCurrentView("quick-fix");
          if (isMobile) setSidebarOpen(false);
        }}
        onAchievementsNavigate={() => {
          setCurrentView("achievements");
          if (isMobile) setSidebarOpen(false);
        }}
        onPeerComparisonNavigate={() => {
          setCurrentView("peer-comparison");
          if (isMobile) setSidebarOpen(false);
        }}
        onBuddyModeNavigate={() => {
          setCurrentView("buddy-mode");
          if (isMobile) setSidebarOpen(false);
        }}
        onDynamicCohortsNavigate={() => {
          setCurrentView("dynamic-cohorts");
          if (isMobile) setSidebarOpen(false);
        }}
      />

      {/* Main Content */}
      <View className="flex-1" style={{ marginLeft: !isMobile ? sidebarWidth : 0 }}>
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: isMobile ? 16 : 32,
            paddingVertical: isMobile ? 16 : 24,
            flexGrow: 1,
            width: "100%",
          }}
        >
          {currentView === "home" && <HomePage />}
          {currentView === "analytics" && <AnalyticsPage route={analyticsRoute} />}
          {currentView === "concept-map" && <ConceptPrerequisiteMap />}
          {currentView === "confidence" && <ConfidenceVsRealityPage />}
          {currentView === "smart-revision" && <SmartRevisionPage />}
          {currentView === "quick-fix" && <QuickFixLessonsPage />}
          {currentView === "achievements" && <AchievementsRewardsPage />}
          {currentView === "peer-comparison" && <PeerComparisonPage />}
          {currentView === "buddy-mode" && <BuddyModePage />}
          {currentView === "dynamic-cohorts" && <DynamicCohortsPage />}
          {currentView === "chapter" && selectedChapter && (
            <AdaptiveChat
              key={selectedChapter.id}   // 🔑 force remount on chapter change
              chapterId={selectedChapter.id}
            />
          )}
        </ScrollView>
      </View>
    </View>
  );
}
