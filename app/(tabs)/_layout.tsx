import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {Label, NativeTabs} from "expo-router/build/native-tabs";
import {FontAwesome} from "@expo/vector-icons";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
      <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
          <Tabs.Screen
              name="index"
              options={{
                  title: 'Home',
                  tabBarIcon: ({ color }) => <FontAwesome size={24} name="home" color="white" />,
              }}
          />
          <Tabs.Screen
              name="receiptScanner"
              options={{
                  title: 'Receipt Scanner',
                  tabBarIcon: ({ color }) => <AntDesign size={24} name="camera" color="white" />,
              }}
          />
          <Tabs.Screen
              name="recipes"
              options={{
                  title: 'Recipes',
                  tabBarIcon: ({ color }) => <FontAwesome6 size={24} name="kitchen-set" color="white" />,
              }}
          />
          <Tabs.Screen
              name="settings"
              options={{
                  title: 'Settings',
                  tabBarIcon: ({ color }) => <FontAwesome size={24} name="gear" color="white" />,
              }}
          />
      </Tabs>

  );
}
