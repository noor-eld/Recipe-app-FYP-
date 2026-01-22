import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {Label, NativeTabs} from "expo-router/build/native-tabs";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
      <NativeTabs minimizeBehavior="onScrollDown">
          <NativeTabs.Trigger name="home">
              <Label>Home</Label>
          </NativeTabs.Trigger>
      </NativeTabs>
  );
}
