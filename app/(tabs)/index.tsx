import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-gesture-handler';
import Modal from 'react-native-modal';

import HomeScreen from './../../homeScreen';
import CaptainHomeScreen from './../../captainHomeScreen';
import Settings from './../../settings';
import TourPage from './../../TourPage';
import ListAds from './../../modules/listads';
import FavoriteTour from './../../FavoriteTour';
import PastTour from './../../PastTour';
import LoginScreen from './../../LogIn';
import SignupScreen from './../../SignUpScreen';
import TourCreation from './../../TourCreation';
import Maps from './../../maps';
import { Text, View, FlatList, TextInput } from 'react-native';



const Stack = createNativeStackNavigator();

// userSession state tipini tanımlayalım
interface UserSession {
  userId: string;
  userType: number;
  username: string;
  email: string;
  captainDetails: any;
}


const Index = () => {
  const [userSession, setUserSession] = useState<UserSession | null>(null);

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const sessionData = await AsyncStorage.getItem('userSession');
        
        if (sessionData) {
          setUserSession(JSON.parse(sessionData));
          
        }
      } catch (error) {
        console.error('Session check error:', error);
      }
    };
    
    checkUserSession();
  }, []);
 
  return (
    <Stack.Navigator initialRouteName={userSession ? (userSession.userType === 1 ? 'CaptainHome' : 'Home') : 'Login'}>
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Signup" 
        component={SignupScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ headerShown: false }} 
        initialParams={{ userType: 0 }} 
      />

      <Stack.Screen 
        name="CaptainHome" 
        component={CaptainHomeScreen} 
        options={{ headerShown: false }} 
        initialParams={{ 
          userType: 1,
          captainId: userSession?.userId 
        }}
      />
      
      <Stack.Screen 
        name="TourCreation" 
        component={TourCreation} 
        options={{ headerShown: false }} 
        initialParams={{ 
          captainId: userSession?.userId 
        }}
      />

      <Stack.Screen 
        name="Settings" 
        component={Settings} 
        options={{ headerShown: false }} 
        initialParams={{ userType: userSession?.userType }} 
      />
      <Stack.Screen 
        name="TourPage" 
        component={TourPage} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="ListAds" 
        component={ListAds} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="FavoriteTour" 
        component={FavoriteTour} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="PastTour" 
        component={PastTour} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen
        name = "Mymap"
        component={Maps}
        options={{ headerShown: false }} 
      />
      
    </Stack.Navigator>
  );
}
export default Index;