import React from 'react';
import { useColorScheme } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';

import { PeaksProvider } from './src/store/PeaksContext';
import { PlannerProvider } from './src/store/PlannerContext';
import { Colors } from './src/utils/theme';
import type { RootStackParamList, PlannerStackParamList, TabParamList } from './src/types/navigation';

import HomeScreen from './src/screens/HomeScreen';
import PeakDetailScreen from './src/screens/PeakDetailScreen';
import PlannerScreen from './src/screens/PlannerScreen';
import ManageBlocksScreen from './src/screens/ManageBlocksScreen';
import TodayScreen from './src/screens/TodayScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from './src/utils/i18n';

const Stack = createNativeStackNavigator<RootStackParamList>();
const PlannerStack = createNativeStackNavigator<PlannerStackParamList>();
const BlocchiStackNav = createNativeStackNavigator<any>();
const Tab = createBottomTabNavigator<TabParamList>();

function VetteStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="PeakDetail" component={PeakDetailScreen} />
    </Stack.Navigator>
  );
}

function PlannerStackNavigator() {
  return (
    <PlannerStack.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <PlannerStack.Screen name="PlannerHome" component={PlannerScreen} />
    </PlannerStack.Navigator>
  );
}

function BlocchiStack() {
  return (
    <BlocchiStackNav.Navigator
      screenOptions={{
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <BlocchiStackNav.Screen name="GestisciBlocchi" component={ManageBlocksScreen} />
    </BlocchiStackNav.Navigator>
  );
}

import { t } from './src/utils/i18n';

function TabNavigator() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tab.Screen 
        name="OggiTab" 
        component={TodayScreen} 
        options={{ 
          title: t('tabs.today'),
          tabBarIcon: ({ color }) => <Text style={{color}}>🌅</Text> 
        }} 
      />
      <Tab.Screen 
        name="VetteTab" 
        component={VetteStack} 
        options={{ 
          title: t('tabs.peaks'),
          tabBarIcon: ({ color }) => <Text style={{color}}>🏔️</Text> 
        }} 
      />
      <Tab.Screen 
        name="PlannerTab" 
        component={PlannerStackNavigator} 
        options={{ 
          title: t('tabs.planner'),
          tabBarIcon: ({ color }) => <Text style={{color}}>📅</Text> 
        }} 
      />
      <Tab.Screen 
        name="BlocchiTab" 
        component={BlocchiStack} 
        options={{ 
          title: t('tabs.blocks'),
          tabBarIcon: ({ color }) => <Text style={{color}}>🧩</Text> 
        }} 
      />
      <Tab.Screen 
        name="SettingsTab" 
        component={SettingsScreen} 
        options={{ 
          title: '⚙️',
          tabBarIcon: ({ color }) => <Text style={{color}}>⚙️</Text> 
        }} 
      />
    </Tab.Navigator>
  );
}

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text } from 'react-native';

const LightNavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.light.background,
    card: Colors.light.surface,
    text: Colors.light.text,
    border: Colors.light.border,
    primary: Colors.light.primary,
  },
};

const DarkNavTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.dark.background,
    card: Colors.dark.surface,
    text: Colors.dark.text,
    border: Colors.dark.border,
    primary: Colors.dark.primary,
  },
};

export default function App() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const [langLoaded, setLangLoaded] = React.useState(false);

  React.useEffect(() => {
    AsyncStorage.getItem('app_language').then((lang) => {
      if (lang) {
        i18n.locale = lang;
      }
      setLangLoaded(true);
    });
  }, []);

  if (!langLoaded) return null;

  return (
    <SafeAreaProvider>
      <PeaksProvider>
        <PlannerProvider>
          <NavigationContainer theme={isDark ? DarkNavTheme : LightNavTheme}>
            <TabNavigator />
          </NavigationContainer>
          <StatusBar style="auto" />
        </PlannerProvider>
      </PeaksProvider>
    </SafeAreaProvider>
  );
}
