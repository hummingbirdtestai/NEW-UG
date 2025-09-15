import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { MapPin, ChevronRight, ChevronLeft, Target, Clock, TrendingUp, BookOpen, MessageCircle, Video, CreditCard, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, Trophy, Zap, ChartBar as BarChart3, Activity } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

// Mock data structure
const mockMasteryData = {
  subjects: [
    {
      id: 'physics',
      name: 'Physics',
      eri: 72,
      timeSpent: 145,
      totalTime: 200,
      status: 'strong',
      chapters: [
        {
          id: 'mechanics',
          name: 'Mechanics',
          eri: 85,
          timeSpent: 45,
          status: 'strong',
          topics: [
            {
              id: 'kinematics',
              name: 'Kinematics',
              mastery: 90,
              accuracy: 85,
              speed: 75,
              concepts: [
                {
                  id: 'motion-1d',
                  name: 'Motion in 1D',
                  eri: 80,
                  timeSpent: 25,
                  phases: {
                    concept: true,
                    conversation: true,
                    media: true,
                    flashcards: false,
                    mcqs: true
                  }
                }
              ]
            }
          ]
        },
        {
          id: 'thermodynamics',
          name: 'Thermodynamics',
          eri: 45,
          timeSpent: 30,
          status: 'weak',
          topics: []
        }
      ]
    },
    {
      id: 'chemistry',
      name: 'Chemistry',
      eri: 58,
      timeSpent: 120,
      totalTime: 180,
      status: 'moderate',
      chapters: []
    },
    {
      id: 'biology',
      name: 'Biology',
      eri: 82,
      timeSpent: 95,
      totalTime: 150,
      status: 'strong',
      chapters: []
    }
  ]
};

interface NavigationState {
  level: 'subject' | 'chapter' | 'topic' | 'concept';
  subjectId?: string;
  chapterId?: string;
  topicId?: string;
  conceptId?: string;
}

interface ProgressRingProps {
  percentage: number;
  size: number;
  strokeWidth: number;
  color: string;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ percentage, size, strokeWidth, color }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View className="items-center justify-center" style={{ width: size, height: size }}>
      <View className="absolute">
        <View
          className="rounded-full border-4 border-slate-700"
          style={{ width: size, height: size }}
        />
        <MotiView
          from={{ rotate: '0deg' }}
          animate={{ rotate: `${(percentage / 100) * 360}deg` }}
          transition={{ type: 'spring', duration: 1000 }}
          className="absolute inset-0 rounded-full border-4 border-transparent"
          style={{
            borderTopColor: color,
            borderRightColor: percentage > 25 ? color : 'transparent',
            borderBottomColor: percentage > 50 ? color : 'transparent',
            borderLeftColor: percentage > 75 ? color : 'transparent',
          }}
        />
      </View>
      <Text className="text-slate-100 font-bold text-lg absolute">
        {percentage}%
      </Text>
    </View>
  );
};

interface SubjectCardProps {
  subject: any;
  onPress: () => void;
  index: number;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ subject, onPress, index }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'strong': return { bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', text: 'text-emerald-400' };
      case 'moderate': return { bg: 'bg-amber-500/20', border: 'border-amber-500/40', text: 'text-amber-400' };
      case 'weak': return { bg: 'bg-red-500/20', border: 'border-red-500/40', text: 'text-red-400' };
      default: return { bg: 'bg-slate-500/20', border: 'border-slate-500/40', text: 'text-slate-400' };
    }
  };

  const statusColors = getStatusColor(subject.status);
  const progressColor = subject.status === 'strong' ? '#10b981' : subject.status === 'moderate' ? '#f59e0b' : '#ef4444';

  return (
    <MotiView
      from={{ opacity: 0, translateY: 50, scale: 0.9 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: 'spring', duration: 600, delay: index * 150 }}
    >
      <Pressable
        onPress={onPress}
        className={`bg-slate-800/60 rounded-2xl p-6 border ${statusColors.border} shadow-lg active:scale-95`}
        style={{
          shadowColor: progressColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-1">
            <Text className="text-xl font-bold text-slate-100 mb-1">
              {subject.name}
            </Text>
            <View className={`px-3 py-1 rounded-full ${statusColors.bg} self-start`}>
              <Text className={`text-xs font-semibold ${statusColors.text} capitalize`}>
                {subject.status}
              </Text>
            </View>
          </View>
          <ChevronRight size={24} color="#94a3b8" />
        </View>

        {/* Progress Ring and Stats */}
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <View className="mb-4">
              <Text className="text-slate-400 text-sm mb-2">Exam Readiness Index</Text>
              <ProgressRing
                percentage={subject.eri}
                size={80}
                strokeWidth={8}
                color={progressColor}
              />
            </View>
          </View>

          <View className="flex-1 ml-6">
            {/* Time Spent */}
            <View className="mb-4">
              <View className="flex-row items-center mb-2">
                <Clock size={16} color="#94a3b8" />
                <Text className="text-slate-400 text-sm ml-2">Time Spent</Text>
              </View>
              <Text className="text-slate-100 text-2xl font-bold">
                {subject.timeSpent}h
              </Text>
              <View className="w-full bg-slate-700 rounded-full h-2 mt-2">
                <MotiView
                  from={{ width: 0 }}
                  animate={{ width: `${(subject.timeSpent / subject.totalTime) * 100}%` }}
                  transition={{ type: 'spring', duration: 1000, delay: index * 150 + 500 }}
                  className="h-2 rounded-full"
                  style={{ backgroundColor: progressColor }}
                />
              </View>
              <Text className="text-slate-500 text-xs mt-1">
                {subject.totalTime}h total
              </Text>
            </View>

            {/* Chapters Count */}
            <View className="flex-row items-center">
              <BookOpen size={16} color="#94a3b8" />
              <Text className="text-slate-400 text-sm ml-2">
                {subject.chaptersCount} chapters
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </MotiView>
  );
};

interface ChapterHeatmapProps {
  chapters: any[];
  onChapterPress: (chapter: any) => void;
}

const ChapterHeatmap: React.FC<ChapterHeatmapProps> = ({ chapters, onChapterPress }) => {
  const getHeatmapColor = (eri: number) => {
    if (eri >= 75) return { bg: 'bg-emerald-500', opacity: 'opacity-80' };
    if (eri >= 50) return { bg: 'bg-amber-500', opacity: 'opacity-70' };
    return { bg: 'bg-red-500', opacity: 'opacity-60' };
  };

  return (
    <View className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/40">
      <View className="flex-row items-center mb-4">
        <Activity size={20} color="#3b82f6" />
        <Text className="text-lg font-bold text-slate-100 ml-3">
          Chapter Mastery Heatmap
        </Text>
      </View>

      <View className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {chapters.map((chapter, index) => {
          const colors = getHeatmapColor(chapter.eri);
          return (
            <MotiView
              key={chapter.id}
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', duration: 500, delay: index * 100 }}
            >
              <Pressable
                onPress={() => onChapterPress(chapter)}
                className={`${colors.bg} ${colors.opacity} rounded-xl p-4 active:scale-95`}
              >
                <Text className="text-white font-semibold text-sm mb-2">
                  {chapter.name}
                </Text>
                <Text className="text-white/90 text-xs">
                  ERI: {chapter.eri}%
                </Text>
                <Text className="text-white/80 text-xs">
                  {chapter.timeSpent}h spent
                </Text>
              </Pressable>
            </MotiView>
          );
        })}
      </View>
    </View>
  );
};

interface WeakestChaptersProps {
  chapters: any[];
  onChapterPress: (chapter: any) => void;
}

const WeakestChapters: React.FC<WeakestChaptersProps> = ({ chapters, onChapterPress }) => {
  const weakestChapters = chapters
    .filter(c => c.eri < 60)
    .sort((a, b) => a.eri - b.eri)
    .slice(0, 3);

  if (weakestChapters.length === 0) {
    return (
      <View className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
        <View className="flex-row items-center mb-2">
          <Trophy size={20} color="#10b981" />
          <Text className="text-emerald-400 font-bold text-lg ml-3">
            Great Progress!
          </Text>
        </View>
        <Text className="text-emerald-300 text-sm">
          All chapters are performing well. Keep up the excellent work!
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/40">
      <View className="flex-row items-center mb-4">
        <AlertTriangle size={20} color="#ef4444" />
        <Text className="text-lg font-bold text-slate-100 ml-3">
          Focus Areas
        </Text>
      </View>

      <View className="space-y-3">
        {weakestChapters.map((chapter, index) => (
          <MotiView
            key={chapter.id}
            from={{ opacity: 0, translateX: -30 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ type: 'spring', duration: 500, delay: index * 150 }}
          >
            <Pressable
              onPress={() => onChapterPress(chapter)}
              className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 active:bg-red-500/20"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-slate-100 font-semibold mb-1">
                    {chapter.name}
                  </Text>
                  <Text className="text-red-400 text-sm">
                    ERI: {chapter.eri}% • {chapter.timeSpent}h spent
                  </Text>
                </View>
                <View className="w-12 h-12 bg-red-500/20 rounded-full items-center justify-center">
                  <Text className="text-red-400 font-bold text-sm">
                    #{index + 1}
                  </Text>
                </View>
              </View>
            </Pressable>
          </MotiView>
        ))}
      </View>
    </View>
  );
};

interface TopicProgressProps {
  topics: any[];
  onTopicPress: (topic: any) => void;
}

const TopicProgress: React.FC<TopicProgressProps> = ({ topics, onTopicPress }) => {
  return (
    <View className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/40">
      <View className="flex-row items-center mb-4">
        <Target size={20} color="#8b5cf6" />
        <Text className="text-lg font-bold text-slate-100 ml-3">
          Topic Mastery
        </Text>
      </View>

      <View className="space-y-4">
        {topics.map((topic, index) => {
          const masteryColor = topic.mastery >= 75 ? '#10b981' : topic.mastery >= 50 ? '#f59e0b' : '#ef4444';
          
          return (
            <MotiView
              key={topic.id}
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'spring', duration: 500, delay: index * 100 }}
            >
              <Pressable
                onPress={() => onTopicPress(topic)}
                className="bg-slate-700/40 rounded-xl p-4 border border-slate-600/30 active:bg-slate-600/40"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-slate-100 font-semibold flex-1">
                    {topic.name}
                  </Text>
                  <Text className="text-slate-400 text-sm">
                    {topic.mastery}%
                  </Text>
                </View>

                {/* Progress Bar */}
                <View className="w-full bg-slate-600 rounded-full h-3 mb-3">
                  <MotiView
                    from={{ width: 0 }}
                    animate={{ width: `${topic.mastery}%` }}
                    transition={{ type: 'spring', duration: 1000, delay: index * 100 + 300 }}
                    className="h-3 rounded-full"
                    style={{ backgroundColor: masteryColor }}
                  />
                </View>

                {/* Stats */}
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="w-2 h-2 bg-blue-400 rounded-full mr-2" />
                    <Text className="text-slate-400 text-xs">
                      Accuracy: {topic.accuracy}%
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-2 h-2 bg-purple-400 rounded-full mr-2" />
                    <Text className="text-slate-400 text-xs">
                      Speed: {topic.speed}%
                    </Text>
                  </View>
                </View>
              </Pressable>
            </MotiView>
          );
        })}
      </View>
    </View>
  );
};

interface ConceptDetailProps {
  concept: any;
}

const ConceptDetail: React.FC<ConceptDetailProps> = ({ concept }) => {
  const phases = [
    { key: 'concept', icon: BookOpen, label: 'Concept', color: '#3b82f6' },
    { key: 'conversation', icon: MessageCircle, label: 'Conversation', color: '#10b981' },
    { key: 'media', icon: Video, label: 'Media', color: '#f59e0b' },
    { key: 'flashcards', icon: CreditCard, label: 'Flashcards', color: '#8b5cf6' },
    { key: 'mcqs', icon: CheckCircle, label: 'MCQs', color: '#ef4444' }
  ];

  const completedPhases = Object.values(concept.phases).filter(Boolean).length;
  const eriPercentage = (completedPhases / 5) * 100;

  return (
    <View className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/40">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-1">
          <Text className="text-xl font-bold text-slate-100 mb-2">
            {concept.name}
          </Text>
          <View className="flex-row items-center">
            <View className="bg-blue-500/20 px-3 py-1 rounded-full mr-3">
              <Text className="text-blue-400 text-sm font-semibold">
                ERI: {Math.round(eriPercentage)}%
              </Text>
            </View>
            <View className="bg-amber-500/20 px-3 py-1 rounded-full">
              <Text className="text-amber-400 text-sm font-semibold">
                {concept.timeSpent}min
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Progress Overview */}
      <View className="mb-6">
        <Text className="text-slate-300 font-semibold mb-3">
          Learning Progress
        </Text>
        <View className="w-full bg-slate-700 rounded-full h-4">
          <MotiView
            from={{ width: 0 }}
            animate={{ width: `${eriPercentage}%` }}
            transition={{ type: 'spring', duration: 1000 }}
            className="h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
          />
        </View>
        <Text className="text-slate-400 text-sm mt-2">
          {completedPhases} of 5 phases completed
        </Text>
      </View>

      {/* Phase Timeline */}
      <View>
        <Text className="text-slate-300 font-semibold mb-4">
          Learning Phases
        </Text>
        <View className="space-y-4">
          {phases.map((phase, index) => {
            const isCompleted = concept.phases[phase.key];
            const IconComponent = phase.icon;

            return (
              <MotiView
                key={phase.key}
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'spring', duration: 500, delay: index * 150 }}
                className="flex-row items-center"
              >
                {/* Timeline Line */}
                <View className="flex-col items-center mr-4">
                  <View
                    className={`w-10 h-10 rounded-full items-center justify-center ${
                      isCompleted ? 'bg-emerald-500' : 'bg-slate-600'
                    }`}
                  >
                    <IconComponent 
                      size={20} 
                      color={isCompleted ? '#ffffff' : '#94a3b8'} 
                    />
                  </View>
                  {index < phases.length - 1 && (
                    <View 
                      className={`w-0.5 h-8 mt-2 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-slate-600'
                      }`} 
                    />
                  )}
                </View>

                {/* Phase Content */}
                <View className="flex-1">
                  <View className={`rounded-xl p-4 border ${
                    isCompleted 
                      ? 'bg-emerald-500/10 border-emerald-500/30' 
                      : 'bg-slate-700/40 border-slate-600/30'
                  }`}>
                    <View className="flex-row items-center justify-between">
                      <Text className={`font-semibold ${
                        isCompleted ? 'text-emerald-300' : 'text-slate-300'
                      }`}>
                        {phase.label}
                      </Text>
                      {isCompleted && (
                        <View className="bg-emerald-500 rounded-full p-1">
                          <CheckCircle size={16} color="#ffffff" />
                        </View>
                      )}
                    </View>
                    <Text className={`text-sm mt-1 ${
                      isCompleted ? 'text-emerald-400' : 'text-slate-400'
                    }`}>
                      {isCompleted ? 'Completed' : 'Not started'}
                    </Text>
                  </View>
                </View>
              </MotiView>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default function MasteryMapDashboard() {
  const { width } = Dimensions.get('window');
  const isMobile = width < 768;

  const [navigation, setNavigation] = useState<NavigationState>({
    level: 'subject'
  });

  const [breadcrumb, setBreadcrumb] = useState<string[]>(['Mastery Map']);

  const { user } = useAuth();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!user) return;
  
      const { data, error } = await supabase
        .from("student_subject_progress")
        .select("subject_id, subject_name, eri_percent, time_spent_minutes, expected_hours, avg_subject_score, chapters_touched")
        .eq("student_id", user.id);
  
      if (error) {
        console.error("Error fetching mastery data:", error);
      } else {
        setSubjects(data || []);
      }
      setLoading(false);
    };
  
    fetchSubjects();
  }, [user]);

  // Get current data based on navigation state
  const getCurrentData = () => {
    const { level, subjectId, chapterId, topicId } = navigation;
    
    switch (level) {
      case 'subject':
        return mockMasteryData.subjects;
      
      case 'chapter':
        const subject = mockMasteryData.subjects.find(s => s.id === subjectId);
        return subject?.chapters || [];
      
      case 'topic':
        const subjectForTopics = mockMasteryData.subjects.find(s => s.id === subjectId);
        const chapter = subjectForTopics?.chapters.find(c => c.id === chapterId);
        return chapter?.topics || [];
      
      case 'concept':
        const subjectForConcepts = mockMasteryData.subjects.find(s => s.id === subjectId);
        const chapterForConcepts = subjectForConcepts?.chapters.find(c => c.id === chapterId);
        const topic = chapterForConcepts?.topics.find(t => t.id === topicId);
        return topic?.concepts || [];
      
      default:
        return [];
    }
  };

  const handleNavigation = (type: string, item: any) => {
    switch (type) {
      case 'subject':
        setNavigation({
          level: 'chapter',
          subjectId: item.id
        });
        setBreadcrumb(['Mastery Map', item.name]);
        break;
      
      case 'chapter':
        setNavigation({
          level: 'topic',
          subjectId: navigation.subjectId,
          chapterId: item.id
        });
        setBreadcrumb(prev => [...prev, item.name]);
        break;
      
      case 'topic':
        setNavigation({
          level: 'concept',
          subjectId: navigation.subjectId,
          chapterId: navigation.chapterId,
          topicId: item.id
        });
        setBreadcrumb(prev => [...prev, item.name]);
        break;
    }
  };

  const handleBack = () => {
    const { level } = navigation;
    
    switch (level) {
      case 'chapter':
        setNavigation({ level: 'subject' });
        setBreadcrumb(['Mastery Map']);
        break;
      
      case 'topic':
        setNavigation({
          level: 'chapter',
          subjectId: navigation.subjectId
        });
        setBreadcrumb(prev => prev.slice(0, -1));
        break;
      
      case 'concept':
        setNavigation({
          level: 'topic',
          subjectId: navigation.subjectId,
          chapterId: navigation.chapterId
        });
        setBreadcrumb(prev => prev.slice(0, -1));
        break;
    }
  };

  const currentData = getCurrentData();

  return (
    <View className="flex-1 bg-slate-900">
      <StatusBar style="light" />
      
      {/* Header */}
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
          className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-indigo-500/20"
        />
        
        <View className="flex-row items-center justify-between p-8 pt-16 border-b border-slate-700/30">
          <View className="flex-row items-center flex-1">
            {navigation.level !== 'subject' && (
              <Pressable
                onPress={handleBack}
                className="w-10 h-10 bg-slate-700/50 rounded-full items-center justify-center mr-4 active:scale-95"
              >
                <ChevronLeft size={20} color="#94a3b8" />
              </Pressable>
            )}
            
            <MotiView
              from={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', duration: 1000, delay: 200 }}
              className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl items-center justify-center mr-6 shadow-2xl"
              style={{
                shadowColor: '#3b82f6',
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.4,
                shadowRadius: 24,
                elevation: 12,
              }}
            >
              <MapPin size={32} color="#ffffff" />
            </MotiView>
            
            <View className="flex-1">
              <MotiView
                from={{ opacity: 0, translateX: -30 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: 'spring', duration: 800, delay: 400 }}
              >
                <Text className="text-4xl font-bold text-slate-100 mb-2">
                  Mastery Map 🗺️
                </Text>
                <Text className="text-xl text-slate-300">
                  {navigation.level === 'subject' && 'Subject Overview'}
                  {navigation.level === 'chapter' && 'Chapter Analysis'}
                  {navigation.level === 'topic' && 'Topic Deep Dive'}
                  {navigation.level === 'concept' && 'Concept Details'}
                </Text>
              </MotiView>
            </View>
          </View>
        </View>

        {/* Breadcrumb */}
        <View className="px-8 py-4 border-b border-slate-700/30">
          <View className="flex-row items-center">
            {breadcrumb.map((crumb, index) => (
              <View key={index} className="flex-row items-center">
                <Text className={`text-sm ${
                  index === breadcrumb.length - 1 
                    ? 'text-blue-400 font-semibold' 
                    : 'text-slate-400'
                }`}>
                  {crumb}
                </Text>
                {index < breadcrumb.length - 1 && (
                  <ChevronRight size={16} color="#64748b" className="mx-2" />
                )}
              </View>
            ))}
          </View>
        </View>
      </MotiView>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: isMobile ? 16 : 32,
          paddingVertical: 24,
          paddingBottom: 32,
        }}
      >
        <AnimatePresence mode="wait">
          {/* Subject Level */}
          {navigation.level === 'subject' && (
            <MotiView
              key="subject-view"
              from={{ opacity: 0, translateY: 30 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: -30 }}
              transition={{ type: 'spring', duration: 600 }}
            >
              {/* Summary Stats */}
              <View className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <View className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
                  <View className="flex-row items-center mb-3">
                    <BarChart3 size={24} color="#3b82f6" />
                    <Text className="text-blue-400 font-bold text-lg ml-3">
                      Overall ERI
                    </Text>
                  </View>
                  {/* Overall ERI */}
                  <Text className="text-blue-200 text-3xl font-bold">
                    {subjects.length > 0
                      ? Math.round(
                          subjects.reduce((sum, s) => sum + Number(s.eri_percent || 0), 0) / subjects.length
                        )
                      : 0}%
                  </Text>
                </View>

                <View className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
                  <View className="flex-row items-center mb-3">
                    <Clock size={24} color="#10b981" />
                    <Text className="text-emerald-400 font-bold text-lg ml-3">
                      Total Time
                    </Text>
                  </View>
                  {/* Total Time */}
                  <Text className="text-emerald-200 text-3xl font-bold">
                    {Math.round(
                      subjects.reduce((sum, s) => sum + (s.time_spent_minutes || 0), 0) / 60
                    )}h
                  </Text>
                </View>

                <View className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-6">
                  <View className="flex-row items-center mb-3">
                    <Trophy size={24} color="#8b5cf6" />
                    <Text className="text-purple-400 font-bold text-lg ml-3">
                      Strongest
                    </Text>
                  </View>
                  {/* Strongest */}
                  <Text className="text-purple-200 text-xl font-bold">
                    {subjects.length > 0
                      ? subjects.reduce(
                          (best, s) =>
                            !best || Number(s.avg_subject_score) > Number(best.avg_subject_score) ? s : best,
                          null
                        )?.subject_name || "None"
                      : "None"}
                  </Text>
                </View>
              </View>

              {/* Subject Cards */}
              <View className="space-y-6">
                {subjects.map((subject, index) => (
                  <SubjectCard
                    key={subject.subject_id}
                    subject={{
                      id: subject.subject_id,
                      name: subject.subject_name,
                      eri: Number(subject.eri_percent),
                      timeSpent: Math.round((subject.time_spent_minutes || 0) / 60), // convert min → hours
                      totalTime: subject.expected_hours || 0,
                      status: Number(subject.eri_percent) >= 75
                        ? "strong"
                        : Number(subject.eri_percent) >= 50
                          ? "moderate"
                          : "weak",
                      chaptersCount: subject.chapters_touched || 0
                    }}
                    onPress={() => handleNavigation("subject", subject)}
                    index={index}
                  />
                ))}
              </View>
            </MotiView>
          )}

          {/* Chapter Level */}
          {navigation.level === 'chapter' && (
            <MotiView
              key="chapter-view"
              from={{ opacity: 0, translateY: 30 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: -30 }}
              transition={{ type: 'spring', duration: 600 }}
              className="space-y-8"
            >
              <ChapterHeatmap
                chapters={currentData}
                onChapterPress={(chapter) => handleNavigation('chapter', chapter)}
              />
              
              <WeakestChapters
                chapters={currentData}
                onChapterPress={(chapter) => handleNavigation('chapter', chapter)}
              />
            </MotiView>
          )}

          {/* Topic Level */}
          {navigation.level === 'topic' && (
            <MotiView
              key="topic-view"
              from={{ opacity: 0, translateY: 30 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: -30 }}
              transition={{ type: 'spring', duration: 600 }}
            >
              <TopicProgress
                topics={currentData}
                onTopicPress={(topic) => handleNavigation('topic', topic)}
              />
            </MotiView>
          )}

          {/* Concept Level */}
          {navigation.level === 'concept' && currentData.length > 0 && (
            <MotiView
              key="concept-view"
              from={{ opacity: 0, translateY: 30 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: -30 }}
              transition={{ type: 'spring', duration: 600 }}
            >
              <ConceptDetail concept={currentData[0]} />
            </MotiView>
          )}
        </AnimatePresence>
      </ScrollView>
    </View>
  );
}
