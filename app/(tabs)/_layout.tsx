import { Tabs } from 'expo-router';
import React from 'react';
import { FontAwesome } from "@expo/vector-icons";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#C4845A',
                tabBarInactiveTintColor: '#A08070',
                tabBarStyle: {
                    backgroundColor: '#FDF6F0',
                    borderTopColor: '#E8D5C4',
                    borderTopWidth: 0.5,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    headerShown: false,
                    tabBarIcon: ({ color }) => <FontAwesome size={22} name="home" color={color} />,
                }}
            />
            <Tabs.Screen
                name="receiptScanner"
                options={{
                    title: 'Scanner',
                    headerShown: false,
                    tabBarIcon: ({ color }) => <AntDesign size={22} name="camera" color={color} />,
                }}
            />
            <Tabs.Screen
                name="recipes"
                options={{
                    title: 'Recipes',
                    headerShown: false,
                    tabBarIcon: ({ color }) => <FontAwesome6 size={22} name="kitchen-set" color={color} />,
                }}
            />
            <Tabs.Screen
                name="pantry"
                options={{
                    title: 'Pantry',
                    headerShown: false,
                    tabBarIcon: ({ color }) => <FontAwesome size={22} name="list" color={color} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    headerShown: false,
                    tabBarIcon: ({ color }) => <FontAwesome size={22} name="gear" color={color} />,
                }}
            />
        </Tabs>
    );
}