import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Platform } from "react-native";
import { useAuthStore } from "@/store/authStore";
import { registerForPushNotifications } from "@/lib/notifications";
import { useTheme } from "@/hooks/useTheme";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function RootLayoutNav() {
  const { isLoading, isAuthenticated, loadUser } = useAuthStore();
  const { loadTheme } = useTheme();

  useEffect(() => {
    const autoLogin = async () => {
      await loadTheme();
      await loadUser();
    };
    autoLogin();
  }, [loadUser, loadTheme]);

  useEffect(() => {
    if (Platform.OS !== "web") {
      registerForPushNotifications();
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading, isAuthenticated]);

  return (
    <Stack screenOptions={{ headerBackTitle: "Back", headerShown: true }}>
      <Stack.Screen name="auth/login" options={{ headerShown: false }} />
      <Stack.Screen name="auth/register" options={{ title: "Create Account" }} />
      <Stack.Screen name="punch-in" options={{ headerShown: false }} />
      <Stack.Screen name="ai-plan-setup" options={{ title: "AI Plan Setup" }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="job/[id]" options={{ title: "Job Details" }} />
      <Stack.Screen name="car/profile" options={{ title: "Car Profile" }} />
      <Stack.Screen name="settings/automation" options={{ title: "Uno AI Bot" }} />
      <Stack.Screen name="expenses/tracker" options={{ title: "Expenses & Mileage" }} />
      <Stack.Screen name="ai/agent" options={{ title: "Uno - AI Assistant" }} />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="profile/edit" options={{ title: "Edit Profile" }} />
      <Stack.Screen name="settings/parameters" options={{ title: "Parameters" }} />
      <Stack.Screen name="settings/safety" options={{ title: "Safety Settings" }} />
      <Stack.Screen name="history/rides" options={{ title: "Ride History" }} />
      <Stack.Screen name="history/customers" options={{ title: "Customer History" }} />
      <Stack.Screen name="schedule/ride/[id]" options={{ title: "Ride Details" }} />
      <Stack.Screen name="chat/[rideId]" options={{ title: "Chat" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <RootLayoutNav />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
