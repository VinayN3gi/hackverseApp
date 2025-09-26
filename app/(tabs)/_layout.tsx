import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';


export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1d4ed8', 
        tabBarInactiveTintColor: Colors.light.tabIconDefault,
        tabBarStyle: {
          backgroundColor: Colors.light.background,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />


      <Tabs.Screen
        name="explore"
        options={{
          title: 'Safety',
          tabBarIcon: ({ color }) => (
             <Ionicons name="shield-checkmark" size={28} color={color} />
          ),
        }}
      />

       <Tabs.Screen
        name="history" 
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => (
            <Ionicons name="time" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
