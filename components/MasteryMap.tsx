import React from 'react';
import { View, Text } from 'react-native';

export default function MasteryMap() {
  return (
    <View className="flex-1 bg-slate-900 items-center justify-center p-6">
      <Text className="text-2xl font-bold text-slate-100 mb-4">
        Mastery Map
      </Text>
      <Text className="text-slate-400 text-center">
        Ready for your code - paste it here!
      </Text>
    </View>
  );
}