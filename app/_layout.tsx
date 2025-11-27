import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import Toast from "react-native-toast-message";

// Import STRIPE
import { StripeProvider } from "@stripe/stripe-react-native";

import TopDashboardHeader from "@/components/dashboard/dashboardHeader";
import ThemeProvider from "@/context/ThemeContext";

function MainLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace("/auth/login");
      else router.replace("/(tabs)");
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="(tabs)" 
        options={{
          headerShown: true,
          header: () => <TopDashboardHeader />, // Render my custom component
          headerTitle: "", // Hide any default title text
          headerBackVisible: false,
        }}
      />
      <Stack.Screen name="auth/register" options={{ presentation: "modal" }} />
      <Stack.Screen name="auth/login" options={{ presentation: "modal" }} />
    
      <Stack.Screen name="payment/card-payment" />
      <Stack.Screen name="payment/order-success" />
    {/* payment routes */}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    
    <StripeProvider publishableKey={process.env.STRIPE_PUBLISHABLE_KEY!}>
      <ThemeProvider>
        <AuthProvider>
            <MainLayout />
          <Toast />
        </AuthProvider>
      </ThemeProvider>
      </StripeProvider>
      
  );
}
