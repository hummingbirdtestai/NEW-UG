// src/components/FlightPath.tsx
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { supabase } from "@/lib/supabaseClient";
import { MotiView } from "moti";
import { Bird } from "lucide-react-native";

interface SubjectProgress {
  subject_id: string;
  subject_name?: string;
  total_pyqs: number;
  total_recursive: number;
  attempted_pyqs: number;
  correct_pyqs: number;
  attempted_recursive: number;
  correct_recursive: number;
  total_attempted: number;
  total_correct: number;
  progress_percent: number;
}

export default function FlightPath({ studentId }: { studentId: string }) {
  const [progress, setProgress] = useState<SubjectProgress[]>([]);
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(2);

  useEffect(() => {
    const fetchProgress = async () => {
      // Mock data for demo - replace with actual progress tracking
      const mockProgress: SubjectProgress[] = [
        {
          subject_id: '1',
          subject_name: 'Anatomy',
          total_pyqs: 150,
          total_recursive: 50,
          attempted_pyqs: 120,
          correct_pyqs: 95,
          attempted_recursive: 30,
          correct_recursive: 25,
          total_attempted: 150,
          total_correct: 120,
          progress_percent: 80
        },
        {
          subject_id: '2',
          subject_name: 'Physiology',
          total_pyqs: 120,
          total_recursive: 40,
          attempted_pyqs: 80,
          correct_pyqs: 60,
          attempted_recursive: 20,
          correct_recursive: 15,
          total_attempted: 100,
          total_correct: 75,
          progress_percent: 75
        },
        {
          subject_id: '3',
          subject_name: 'Biochemistry',
          total_pyqs: 100,
          total_recursive: 30,
          attempted_pyqs: 60,
          correct_pyqs: 40,
          attempted_recursive: 15,
          correct_recursive: 10,
          total_attempted: 75,
          total_correct: 50,
          progress_percent: 67
        },
        {
          subject_id: '4',
          subject_name: 'Pathology',
          total_pyqs: 180,
          total_recursive: 60,
          attempted_pyqs: 90,
          correct_pyqs: 65,
          attempted_recursive: 25,
          correct_recursive: 18,
          total_attempted: 115,
          total_correct: 83,
          progress_percent: 72
        },
        {
          subject_id: '5',
          subject_name: 'Pharmacology',
          total_pyqs: 140,
          total_recursive: 45,
          attempted_pyqs: 70,
          correct_pyqs: 45,
          attempted_recursive: 20,
          correct_recursive: 12,
          total_attempted: 90,
          total_correct: 57,
          progress_percent: 63
        }
      ];
      
      setProgress(mockProgress);
    };

    fetchProgress();
  }, [studentId]);

  return (
    <View className="bg-slate-900 p-6 rounded-2xl mb-6">
      {/* Header */}
      <View className="flex-row items-center mb-4">
        <View className="w-10 h-10 bg-blue-600 rounded-full items-center justify-center mr-3">
          <Bird size={20} color="#fff" />
        </View>
        <View>
          <Text className="text-xl font-bold text-white">NEETPG Flight Path</Text>
          <Text className="text-sm text-slate-300">
            {progress.length} subjects • Your journey to mastery
          </Text>
        </View>
      </View>

      {/* Subjects Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
      >
        {progress.map((subj, index) => {
          const isCurrent = index === currentSubjectIndex;
          const percent = subj.progress_percent || 0;
          const total = subj.total_pyqs + subj.total_recursive;

          const borderColor =
            percent >= 70 ? "#10b981" : percent >= 50 ? "#f59e0b" : "#ef4444";

          return (
            <Pressable
              key={subj.subject_id}
              className="flex flex-col items-center w-28 mr-4"
              onPress={() => console.log("Selected:", subj.subject_name)}
            >
              {/* Animated Circle */}
              <View className="relative">
                <View className="w-24 h-24 rounded-full border-4 border-slate-700 items-center justify-center">
                  {/* Progress Arc */}
                  <MotiView
                    from={{ rotate: "0deg" }}
                    animate={{ rotate: `${(percent / 100) * 360}deg` }}
                    transition={{ type: "timing", duration: 1200 }}
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(from 0deg, ${borderColor} 0deg, ${borderColor} ${(percent / 100) * 360}deg, transparent ${(percent / 100) * 360}deg, transparent 360deg)`,
                      borderRadius: "50%",
                      mask: "radial-gradient(circle, transparent 36px, black 40px)",
                      WebkitMask:
                        "radial-gradient(circle, transparent 36px, black 40px)",
                    }}
                  />
                  <Text className="text-lg font-bold text-white">
                    {percent.toFixed(2)}%
                  </Text>
                </View>

                {/* Pulsing Hummingbird */}
                {isCurrent && (
                  <MotiView
                    from={{ scale: 1, opacity: 0.8 }}
                    animate={{ scale: 1.3, opacity: 0 }}
                    transition={{
                      loop: true,
                      type: "timing",
                      duration: 1500,
                    }}
                    className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-teal-400/40 items-center justify-center"
                  >
                    <Bird size={18} color="#06b6d4" />
                  </MotiView>
                )}
              </View>

              {/* Subject Name */}
              <Text className="mt-2 text-sm font-semibold text-white text-center">
                {subj.subject_name}
              </Text>

              {/* Attempted vs Total */}
              <Text className="text-xs text-slate-400">
                {subj.total_correct}/{total}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
