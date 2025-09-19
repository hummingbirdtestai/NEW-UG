// src/components/Sidebar.tsx
import React, { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { MotiView } from "moti";
import {
  Chromium as Home,
  GitBranch,
  CircleAlert as AlertCircle,
  Radar,
  Clock,
  Navigation2 as NavigationIcon,
  ChartBar as BarChart3,
  Zap,
  Target,
  RotateCcw,
  BookMarked,
  Award,
  Users,
  UserCheck,
  UsersRound,
  Heart,
  TrendingUp,
  ChevronRight,
  Bird,
  User,
  LogOut,
} from "lucide-react-native";
import { Flame } from "lucide-react-native";
import { Users as Users2 } from "lucide-react-native";
import { Wrench } from "lucide-react-native";
import { Gauge } from "lucide-react-native";
import { MapPin as MapIcon } from "lucide-react-native";

import PhoneLoginModal from "./modals/PhoneLoginModal";
import OTPModal from "./modals/OTPModal";
import RegistrationModal from "./modals/RegistrationModal";
import ErrorModal from "./modals/ErrorModal";

import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabaseClient";

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

interface NavigationItem {
  id: string;
  name: string;
  icon: any;
  route: string;
}

interface NavigationGroup {
  id: string;
  name: string;
  icon: any;
  items: NavigationItem[];
}

const navigationGroups: NavigationGroup[] = [
  {
    id: "learning-path",
    name: "My Learning Path",
    icon: MapIcon,
    items: [
      { id: "prep-overview", name: "Prep Overview", icon: Home, route: "/analytics/prep-overview" },
      { id: "mastery-map", name: "Mastery Map", icon: MapIcon, route: "/analytics/mastery-map" },
      { id: "gap-chains", name: "Gap Chains", icon: GitBranch, route: "/analytics/gap-chains" },
      { id: "root-causes", name: "Root Causes", icon: AlertCircle, route: "/analytics/root-causes" },
      { id: "neural-radar", name: "Neural Radar", icon: Radar, route: "/analytics/neural-radar" },
      { id: "time-to-mastery", name: "Time-to-Mastery Clock", icon: Clock, route: "/analytics/time-to-mastery" },
      { id: "mentor-flight-path", name: "Mentor Flight Path", icon: NavigationIcon, route: "/analytics/mentor-flight-path" },
    ],
  },
  {
    id: "study-efficiency",
    name: "Study Efficiency & Revision",
    icon: BarChart3,
    items: [
      { id: "study-sessions", name: "Study Sessions", icon: BarChart3, route: "/analytics/study-sessions" },
      { id: "speed-accuracy", name: "Speed & Accuracy", icon: Zap, route: "/analytics/speed-accuracy" },
      { id: "confidence-reality", name: "Confidence vs Reality", icon: Target, route: "/analytics/confidence-reality" },
      { id: "confidence-vs-reality", name: "Confidence vs Reality", icon: Gauge, route: "/confidence-vs-reality" },
      { id: "smart-revision", name: "Smart Revision", icon: RotateCcw, route: "/SmartRevisionPage" },
      { id: "quick-fix-lessons", name: "Quick Fix Lessons", icon: Wrench, route: "/QuickFixLessonsPage" },
      { id: "mistakes-correct", name: "Mistakes to Correct", icon: AlertCircle, route: "/analytics/mistakes-correct" },
      { id: "achievements-rewards", name: "Achievements & Rewards", icon: Award, route: "/AchievementsRewardsPage" },
    ],
  },
  {
    id: "knowledge-assets",
    name: "Knowledge Assets",
    icon: BookMarked,
    items: [
      { id: "flashcards-bookmarks", name: "Flashcards & Bookmarks", icon: BookMarked, route: "/analytics/flashcards-bookmarks" },
    ],
  },
  {
    id: "peer-cohorts",
    name: "Peer & Cohorts",
    icon: Users2,
    items: [
      { id: "peer-comparison", name: "Peer Comparison", icon: Users2, route: "/analytics/peer-comparison" },
      { id: "buddy-mode", name: "Buddy Mode", icon: UserCheck, route: "/analytics/buddy-mode" },
      { id: "dynamic-cohorts", name: "Dynamic Cohorts", icon: Flame, route: "/analytics/dynamic-cohorts" },
      { id: "wellness-balance", name: "Wellness & Balance", icon: Heart, route: "/analytics/wellness-balance" },
    ],
  },
  {
    id: "performance-simulation",
    name: "Performance Simulation",
    icon: TrendingUp,
    items: [
      { id: "rank-score-simulator", name: "Rank & Score Simulator", icon: TrendingUp, route: "/analytics/rank-score-simulator" },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  selectedClass?: ClassItem | null;
  selectedSubject?: Subject | null;
  selectedChapter?: Chapter | null;
  onClassSelect?: (cls: ClassItem) => void;
  onSubjectSelect?: (subject: Subject) => void;
  onChapterSelect?: (chapter: Chapter) => void;
  onProfileClick?: () => void;
  isMobile: boolean;
  onHomeClick?: () => void;
  onAnalyticsNavigate?: (route: string) => void;
  onConceptMapNavigate?: () => void;
  onConfidenceNavigate?: () => void;
  onSmartRevisionNavigate?: () => void;
  onQuickFixNavigate?: () => void;
  onAchievementsNavigate?: () => void;
  onPeerComparisonNavigate?: () => void;
  onBuddyModeNavigate?: () => void;
  onDynamicCohortsNavigate?: () => void;
}

export default function Sidebar({
  isOpen,
  onToggle,
  selectedClass,
  selectedSubject,
  selectedChapter,
  onClassSelect,
  onSubjectSelect,
  onChapterSelect,
  onProfileClick,
  isMobile,
  onHomeClick,
  onAnalyticsNavigate,
  onConceptMapNavigate,
  onSmartRevisionNavigate,
  onQuickFixNavigate,
  onAchievementsNavigate,
  onPeerComparisonNavigate,
  onBuddyModeNavigate,
  onDynamicCohortsNavigate,
}: SidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["learning-path"]));
  const [isExamsExpanded, setIsExamsExpanded] = useState(false);
  const [isSubjectsExpanded, setIsSubjectsExpanded] = useState(false);
  const [isChaptersExpanded, setIsChaptersExpanded] = useState(false);

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  const { session, login, logout } = useAuth();

  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [showRegModal, setShowRegModal] = useState(false);
  const [showError, setShowError] = useState(false);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);
  const [tempUserId, setTempUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) newExpanded.delete(groupId);
    else newExpanded.add(groupId);
    setExpandedGroups(newExpanded);
  };

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from("get_class_subject_chapter")
        .select("class_id, class_name");
      if (error) throw error;

      const uniqueClasses = Array.from(
        new Map(data.map((c) => [c.class_id, { id: c.class_id, name: c.class_name }])).values()
      );
      setClasses(uniqueClasses);
    } catch (err) {
      console.error("Error fetching classes:", err);
    }
  };

  const fetchSubjects = async (classId: string) => {
    try {
      const { data, error } = await supabase
        .from("get_class_subject_chapter")
        .select("subject_id, subject_name")
        .eq("class_id", classId);
      if (error) throw error;

      const uniqueSubjects = Array.from(
        new Map(data.map((s) => [s.subject_id, { id: s.subject_id, name: s.subject_name }])).values()
      );
      setSubjects(uniqueSubjects);
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
  };

  const fetchChapters = async (subjectId: string) => {
    try {
      const { data, error } = await supabase
        .from("get_class_subject_chapter")
        .select("chapter_id, chapter_name, chapter_order")
        .eq("subject_id", subjectId)
        .order("chapter_order", { ascending: true });

      if (error) throw error;

      setChapters(
        data.map((c) => ({
          id: c.chapter_id,
          name: c.chapter_name,
          order: c.chapter_order,
        }))
      );
    } catch (err) {
      console.error("Error fetching chapters:", err);
    }
  };

  const handleAnalyticsItemClick = (item: NavigationItem) => {
    if (item.route === "/SmartRevisionPage") {
      onSmartRevisionNavigate?.();
    } else if (item.route === "/QuickFixLessonsPage") {
      onQuickFixNavigate?.();
    } else if (item.route === "/AchievementsRewardsPage") {
      onAchievementsNavigate?.();
    } else if (item.route === "/analytics/peer-comparison") {
      onPeerComparisonNavigate?.();
    } else if (item.id === "buddy-mode") {
      onBuddyModeNavigate?.();
    } else if (item.id === "dynamic-cohorts") {
      onDynamicCohortsNavigate?.();
    } else {
      onAnalyticsNavigate?.(item.route);
    }

    if (isMobile) onToggle(false);
  };

  const handleClassSelect = (cls: ClassItem) => {
    onClassSelect?.(cls);
    fetchSubjects(cls.id);
    setIsSubjectsExpanded(true);
    setIsExamsExpanded(false);
  };

  const handleSubjectSelect = (sub: Subject) => {
    onSubjectSelect?.(sub);
    fetchChapters(sub.id);
    setIsChaptersExpanded(true);
    setIsSubjectsExpanded(false);
  };

 const { session, user, logout } = useAuth();  


const handleChapterSelect = (ch: Chapter) => {
  if (!session) {
    setShowPhoneModal(true);
    return;
  }

  if (!user?.is_subscribed) {
    alert("🔒 Please subscribe to access this chapter");
    return;
  }

  onChapterSelect?.(ch);
  setIsChaptersExpanded(false);
};


  // --- OTP handlers (same as before) ---
  const handleSendOTP = async (phone: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: `+91${phone}` });
      if (error) throw error;
      setPendingPhone(phone);
      setShowPhoneModal(false);
      setShowOTPModal(true);
    } catch (err) {
      console.error("Send OTP failed:", err);
      setShowError(true);
    }
  };

  const handleSubmitOTP = async (otp: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: `+91${pendingPhone}`,
        token: otp,
        type: "sms",
      });
      if (error) throw error;

      const sessionData = data.session;
      const userData = data.user;
      if (!sessionData || !userData) throw new Error("OTP verification failed");

      const { data: existingUser, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userData.id)
        .maybeSingle();

      if (userError && userError.code !== "PGRST116") throw userError;

      if (existingUser) {
  setShowOTPModal(false);   // just close modal
  setPendingPhone(null);
} else {
  setTempUserId(userData.id);
  setShowOTPModal(false);
  setShowRegModal(true);
}
    } catch (err) {
      console.error("OTP verification failed:", err);
      setShowError(true);
    }
  };

  const handleRegister = async (name: string) => {
    try {
      if (!tempUserId || !pendingPhone) throw new Error("Missing phone or user ID");

      const { data, error } = await supabase
        .from("users")
        .insert([{ id: tempUserId, phone: pendingPhone, country_code: "+91", name }])
        .select()
        .maybeSingle();

      if (error) throw error;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session after registration");

      setShowRegModal(false);
setPendingPhone(null);
setTempUserId(null);

    } catch (err) {
      console.error("Registration failed:", err);
      setShowError(true);
    }
  };

  const sidebarWidth = 240;

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/50 z-40">
          <Pressable onPress={() => onToggle(false)} className="flex-1" />
        </MotiView>
      )}

      {/* Sidebar */}
      <MotiView
        from={{ translateX: isMobile ? -sidebarWidth : 0 }}
        animate={{ translateX: isMobile && !isOpen ? -sidebarWidth : 0 }}
        className="fixed left-0 top-0 bg-slate-900 border-r border-slate-700/50 z-50 shadow-2xl"
        style={{ width: sidebarWidth, height: "100%" }}
      >
        {/* Header */}
        <MotiView className="flex-row items-center justify-between p-4 border-b border-slate-700/50 bg-slate-800/60">
          <Pressable
            onPress={() => {
              if (isMobile) onToggle(false);
              onHomeClick?.();
            }}
            className="flex-row items-center flex-1"
          >
            <View className="w-8 h-8 rounded-lg bg-teal-500 items-center justify-center mr-3">
              <Bird size={16} color="#fff" />
            </View>
            <Text className="text-slate-100 text-lg font-bold">HummingBird</Text>
          </Pressable>
        </MotiView>

        <ScrollView className="flex-1 p-2">
          {/* Analytics Groups */}
          {navigationGroups.map((group) => {
            const isExpanded = expandedGroups.has(group.id);
            const IconComponent = group.icon;

            return (
              <View key={group.id} className="mb-2">
                <Pressable
                  onPress={() => toggleGroup(group.id)}
                  className="flex-row items-center p-3 bg-slate-800/40 rounded-xl"
                >
                  <IconComponent size={16} color="#94a3b8" />
                  <Text className="flex-1 text-slate-300 ml-2 font-medium">{group.name}</Text>
                  <MotiView animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ type: "spring", duration: 300 }}>
                    <ChevronRight size={16} color="#64748b" />
                  </MotiView>
                </Pressable>

                {isExpanded && (
                  <MotiView
                    from={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ type: "spring", duration: 400 }}
                    className="ml-4 mt-1"
                  >
                    {group.items.map((item) => {
                      const ItemIcon = item.icon;
                      const isActive = false; // activeItem logic can move to parent if needed
                      return (
                        <Pressable
                          key={item.id}
                          onPress={() => handleAnalyticsItemClick(item)}
                          className={`flex-row items-center p-2 rounded-lg mb-1 ${
                            isActive ? "bg-teal-600/30 border border-teal-500/50" : "bg-slate-800/30"
                          }`}
                        >
                          <ItemIcon size={14} color={isActive ? "#5eead4" : "#94a3b8"} />
                          <Text className={`text-sm ml-2 ${isActive ? "text-teal-300 font-medium" : "text-slate-400"}`}>
                            {item.name}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </MotiView>
                )}
              </View>
            );
          })}

          {/* Exams (Classes) */}
          <Pressable
            onPress={() => {
              setIsExamsExpanded(!isExamsExpanded);
              if (!isExamsExpanded) fetchClasses();
              setExpandedGroups(new Set());
            }}
            className="flex-row items-center p-3 bg-slate-800/40 rounded-xl"
          >
            <Award size={16} color="#94a3b8" />
            <Text className="flex-1 text-slate-300 ml-2">
              {selectedClass ? selectedClass.name : "Exams"}
            </Text>
            <ChevronRight
              size={16}
              color="#64748b"
              style={{ transform: [{ rotate: isExamsExpanded ? "90deg" : "0deg" }] }}
            />
          </Pressable>

          {isExamsExpanded &&
            classes.map((cls) => (
              <Pressable
                key={cls.id}
                onPress={() => handleClassSelect(cls)}
                className={`p-2 ml-4 rounded-lg ${
                  selectedClass?.id === cls.id ? "bg-teal-600/30 border border-teal-500/50" : "bg-slate-800/30"
                }`}
              >
                <Text className={`text-sm ${selectedClass?.id === cls.id ? "text-teal-300" : "text-slate-400"}`}>
                  {cls.name}
                </Text>
              </Pressable>
            ))}

          {/* Subjects */}
          {selectedClass && subjects.length > 0 && (
            <>
              <Pressable
                onPress={() => setIsSubjectsExpanded(!isSubjectsExpanded)}
                className="flex-row items-center p-3 mt-2 bg-slate-800/40 rounded-xl"
              >
                <BookMarked size={16} color="#94a3b8" />
                <Text className="flex-1 text-slate-300 ml-2">
                  {selectedSubject ? selectedSubject.name : "Subjects"}
                </Text>
                <ChevronRight
                  size={16}
                  color="#64748b"
                  style={{ transform: [{ rotate: isSubjectsExpanded ? "90deg" : "0deg" }] }}
                />
              </Pressable>
              {isSubjectsExpanded &&
                subjects.map((sub) => (
                  <Pressable
                    key={sub.id}
                    onPress={() => handleSubjectSelect(sub)}
                    className={`p-2 ml-4 rounded-lg ${
                      selectedSubject?.id === sub.id ? "bg-teal-600/30 border border-teal-500/50" : "bg-slate-800/30"
                    }`}
                  >
                    <Text className={`text-sm ${selectedSubject?.id === sub.id ? "text-teal-300" : "text-slate-400"}`}>
                      {sub.name}
                    </Text>
                  </Pressable>
                ))}
            </>
          )}

          {/* Chapters */}
          {selectedSubject && chapters.length > 0 && (
            <>
              <Pressable
                onPress={() => setIsChaptersExpanded(!isChaptersExpanded)}
                className="flex-row items-center p-3 mt-2 bg-slate-800/40 rounded-xl"
              >
                <GitBranch size={16} color="#94a3b8" />
                <Text className="flex-1 text-slate-300 ml-2">
                  {selectedChapter ? selectedChapter.name : "Chapters"}
                </Text>
                <ChevronRight
                  size={16}
                  color="#64748b"
                  style={{ transform: [{ rotate: isChaptersExpanded ? "90deg" : "0deg" }] }}
                />
              </Pressable>
              {isChaptersExpanded &&
                chapters.map((ch) => (
                  <Pressable
                    key={ch.id}
                    onPress={() => handleChapterSelect(ch)}
                    className={`p-2 ml-4 rounded-lg ${
                      selectedChapter?.id === ch.id ? "bg-teal-600/30 border border-teal-500/50" : "bg-slate-800/30"
                    }`}
                  >
                    <Text className={`text-sm ${selectedChapter?.id === ch.id ? "text-teal-300" : "text-slate-400"}`}>
                      {ch.name}
                    </Text>
                  </Pressable>
                ))}
            </>
          )}

          {/* Concept Map */}
          <Pressable
            onPress={() => {
              onConceptMapNavigate?.();
              if (isMobile) onToggle(false);
            }}
            className="flex-row items-center p-3 mt-2 bg-slate-800/40 rounded-xl"
          >
            <GitBranch size={16} color="#94a3b8" />
            <Text className="ml-2 text-slate-300">Concept Map</Text>
          </Pressable>

          {/* Profile */}
          <Pressable
            onPress={() => {
              if (!session) {
                setShowPhoneModal(true);
                return;
              }
              onProfileClick?.();
            }}
            className="flex-row items-center p-3 mt-2 bg-slate-800/40 rounded-xl"
          >
            <User size={16} color="#94a3b8" />
            <Text className="ml-2 text-slate-300">Profile</Text>
          </Pressable>

          {/* Login / Logout */}
          <Pressable
            onPress={() => (session ? logout() : setShowPhoneModal(true))}
            className="flex-row items-center p-3 mt-2 bg-slate-800/40 rounded-xl"
          >
            <LogOut size={16} color="#94a3b8" />
            <Text className="ml-2 text-slate-300">{session ? "Logout" : "Login"}</Text>
          </Pressable>
        </ScrollView>
      </MotiView>

      {/* Modals */}
      <PhoneLoginModal isVisible={showPhoneModal} onClose={() => setShowPhoneModal(false)} onSendOTP={handleSendOTP} />
      <OTPModal
        isVisible={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onSubmitOTP={handleSubmitOTP}
        phoneNumber={pendingPhone || ""}
      />
      <RegistrationModal isVisible={showRegModal} onClose={() => setShowRegModal(false)} onRegister={handleRegister} />
      <ErrorModal isVisible={showError} onClose={() => setShowError(false)} />
    </>
  );
}
