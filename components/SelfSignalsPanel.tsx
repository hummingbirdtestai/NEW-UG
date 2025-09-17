import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { MotiView } from 'moti';
import { Target, Bookmark, BookmarkCheck, ThumbsUp, ThumbsDown, CreditCard as Edit3, Check } from 'lucide-react-native';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { toggleBookmark } from '@/lib/bookmarkUtils';

interface StudentSignal {
  bookmark: boolean;
  difficulty: 'easy' | 'medium' | 'hard' | 'stuck' | 'too_easy' | null;
  usefulness: boolean | null;
  note: string;
}

interface SelfSignalsPanelProps {
  objectType: 'concept' | 'mcq' | 'flashcard' | 'image_search' | 'video_search' | 'conversation_hyf' | 'conversation_mcq';
  objectUuid: string;
  topicName: string;
}

export default function SelfSignalsPanel({ objectType, objectUuid, topicName }: SelfSignalsPanelProps) {
  const { user } = useAuth();
  const [signals, setSignals] = useState<StudentSignal>({
    bookmark: false,
    difficulty: null,
    usefulness: null,
    note: ''
  });
  const [isNoteExpanded, setIsNoteExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Don't render if no user
  if (!user?.id) {
    return null;
  }

  // Load existing signals on mount
  useEffect(() => {
    const loadSignals = async () => {
      try {
        const { data, error } = await supabase
          .from('student_signals')
          .select('bookmark, difficulty, usefulness, note')
          .eq('student_id', user.id)
          .eq('object_type', objectType)
          .eq('object_uuid', objectUuid)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading signals:', error);
          return;
        }

        if (data) {
          setSignals({
            bookmark: data.bookmark || false,
            difficulty: data.difficulty || null,
            usefulness: data.usefulness,
            note: data.note || ''
          });
          setIsNoteExpanded(!!data.note);
        }
      } catch (err) {
        console.error('Failed to load signals:', err);
      }
    };

    loadSignals();
  }, [user.id, objectType, objectUuid]);

  // Update student signal in Supabase
  const updateStudentSignal = async (updates: Partial<StudentSignal>) => {
    setIsSaving(true);
    setSaveStatus('saving');

    try {
      const newSignals = { ...signals, ...updates };
      
      const { error } = await supabase
        .from('student_signals')
        .upsert({
          student_id: user.id,
          object_type: objectType,
          object_uuid: objectUuid,
          bookmark: newSignals.bookmark,
          difficulty: newSignals.difficulty,
          usefulness: newSignals.usefulness,
          note: newSignals.note,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'student_id,object_type,object_uuid'
        });

      if (error) {
        console.error('Error updating signals:', error);
        return;
      }

      setSignals(newSignals);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to update signals:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBookmarkToggle = () => {
    const newValue = !signals.bookmark;
    toggleBookmark(objectType, objectUuid, newValue, user.id);
    setSignals(prev => ({ ...prev, bookmark: newValue }));
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleDifficultySelect = (difficulty: StudentSignal['difficulty']) => {
    updateStudentSignal({ difficulty: signals.difficulty === difficulty ? null : difficulty });
  };

  const handleUsefulnessSelect = (useful: boolean) => {
    updateStudentSignal({ usefulness: signals.usefulness === useful ? null : useful });
  };

  const handleNoteChange = (note: string) => {
    setSignals(prev => ({ ...prev, note }));
  };

  const handleNoteSave = () => {
    updateStudentSignal({ note: signals.note });
  };

  const difficultyOptions = [
    { key: 'easy' as const, label: 'Easy', emoji: '🟢', color: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' },
    { key: 'medium' as const, label: 'Medium', emoji: '🟡', color: 'bg-amber-500/20 border-amber-500/50 text-amber-300' },
    { key: 'hard' as const, label: 'Hard', emoji: '🔴', color: 'bg-red-500/20 border-red-500/50 text-red-300' },
    { key: 'stuck' as const, label: 'Stuck', emoji: '🛑', color: 'bg-rose-500/20 border-rose-500/50 text-rose-300' },
    { key: 'too_easy' as const, label: 'Too Easy', emoji: '🚀', color: 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' }
  ];

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'spring', duration: 600, delay: 200 }}
      className="mt-4 pt-4 border-t border-slate-600/30"
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View className="w-6 h-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg items-center justify-center mr-2">
            <Target size={12} color="#ffffff" />
          </View>
          <Text className="text-slate-100 font-semibold text-base">
            Self Signals
          </Text>
        </View>
        {saveStatus === 'saved' && (
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', duration: 400 }}
            className="flex-row items-center"
          >
            <Check size={14} color="#10b981" />
            <Text className="text-emerald-400 text-xs ml-1 font-medium">Saved</Text>
          </MotiView>
        )}
      </View>

      {/* Bookmark Toggle */}
      <View className="mb-4">
        <Text className="text-slate-300 text-sm font-medium mb-2">Bookmark</Text>
        <Pressable
          onPress={handleBookmarkToggle}
          disabled={isSaving}
          className={`flex-row items-center p-3 rounded-xl border-2 active:scale-95 ${
            signals.bookmark
              ? 'bg-amber-500/20 border-amber-500/50'
              : 'bg-slate-700/40 border-slate-600/50'
          }`}
        >
          <MotiView
            animate={{
              scale: signals.bookmark ? [1, 1.2, 1] : 1,
              rotate: signals.bookmark ? [0, 10, -10, 0] : 0,
            }}
            transition={{ type: 'spring', duration: 400 }}
          >
            {signals.bookmark ? (
              <BookmarkCheck size={18} color="#fbbf24" fill="#fbbf24" />
            ) : (
              <Bookmark size={18} color="#94a3b8" />
            )}
          </MotiView>
          <Text className={`ml-2 font-medium ${
            signals.bookmark ? 'text-amber-300' : 'text-slate-400'
          }`}>
            {signals.bookmark ? 'Bookmarked' : 'Add Bookmark'}
          </Text>
        </Pressable>
      </View>

      {/* Difficulty Rating */}
      <View className="mb-4">
        <Text className="text-slate-300 text-sm font-medium mb-2">Difficulty Rating</Text>
        <View className="flex-row flex-wrap gap-2">
          {difficultyOptions.map((option) => (
            <Pressable
              key={option.key}
              onPress={() => handleDifficultySelect(option.key)}
              disabled={isSaving}
              className={`flex-row items-center px-3 py-2 rounded-lg border active:scale-95 ${
                signals.difficulty === option.key
                  ? option.color
                  : 'bg-slate-700/40 border-slate-600/50 text-slate-400'
              }`}
            >
              <Text className="text-sm mr-1">{option.emoji}</Text>
              <Text className={`text-xs font-medium ${
                signals.difficulty === option.key
                  ? option.color.split(' ')[2] // Extract text color class
                  : 'text-slate-400'
              }`}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Usefulness Toggle */}
      <View className="mb-4">
        <Text className="text-slate-300 text-sm font-medium mb-2">Usefulness</Text>
        <View className="flex-row space-x-2">
          <Pressable
            onPress={() => handleUsefulnessSelect(true)}
            disabled={isSaving}
            className={`flex-1 flex-row items-center justify-center p-3 rounded-xl border active:scale-95 ${
              signals.usefulness === true
                ? 'bg-emerald-500/20 border-emerald-500/50'
                : 'bg-slate-700/40 border-slate-600/50'
            }`}
          >
            <ThumbsUp size={16} color={signals.usefulness === true ? '#10b981' : '#94a3b8'} />
            <Text className={`ml-2 text-sm font-medium ${
              signals.usefulness === true ? 'text-emerald-300' : 'text-slate-400'
            }`}>
              Helpful
            </Text>
          </Pressable>
          
          <Pressable
            onPress={() => handleUsefulnessSelect(false)}
            disabled={isSaving}
            className={`flex-1 flex-row items-center justify-center p-3 rounded-xl border active:scale-95 ${
              signals.usefulness === false
                ? 'bg-red-500/20 border-red-500/50'
                : 'bg-slate-700/40 border-slate-600/50'
            }`}
          >
            <ThumbsDown size={16} color={signals.usefulness === false ? '#ef4444' : '#94a3b8'} />
            <Text className={`ml-2 text-sm font-medium ${
              signals.usefulness === false ? 'text-red-300' : 'text-slate-400'
            }`}>
              Not Helpful
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Note Input */}
      <View>
        <Pressable
          onPress={() => setIsNoteExpanded(!isNoteExpanded)}
          className="flex-row items-center justify-between mb-2"
        >
          <View className="flex-row items-center">
            <Text className="text-slate-300 text-sm font-medium">Personal Note</Text>
            {signals.note && (
              <View className="ml-2 w-4 h-4 bg-blue-500/20 rounded-full items-center justify-center">
                <Edit3 size={10} color="#60a5fa" />
              </View>
            )}
          </View>
          <Text className="text-slate-400 text-xs">
            {isNoteExpanded ? 'Collapse' : 'Expand'}
          </Text>
        </Pressable>
        
        {isNoteExpanded && (
          <MotiView
            from={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ type: 'spring', duration: 400 }}
          >
            <TextInput
              value={signals.note}
              onChangeText={handleNoteChange}
              onBlur={handleNoteSave}
              onSubmitEditing={handleNoteSave}
              placeholder={`Add a note about ${topicName}...`}
              placeholderTextColor="#64748b"
              multiline
              numberOfLines={3}
              className="bg-slate-700/40 border border-slate-600/50 rounded-lg p-3 text-slate-100 text-sm"
              style={{
                minHeight: 80,
                textAlignVertical: 'top',
              }}
            />
            {saveStatus === 'saving' && (
              <Text className="text-blue-400 text-xs mt-1">Saving...</Text>
            )}
          </MotiView>
        )}
      </View>
    </MotiView>
  );
}