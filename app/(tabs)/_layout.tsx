import { Tabs } from 'expo-router';
import React from 'react';
import { Image } from 'react-native'

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'code-slash' : 'code-slash-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name = "signin"
        options= {{
          title : 'Sign In',
          tabBarIcon: ({color, focused}) => (
            <Image 
              source = {
                focused 
                  ? require('./../../assets/images/user.png')
                  : require('./../../assets/images/user.png')
              } 
              style={{ width: 24, height: 24, tintColor: color }}
              resizeMode="contain"
            />
          )
        }}
      />
    </Tabs>
  );
}
