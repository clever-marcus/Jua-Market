import React, { ReactNode, useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "./AuthProvider";
import { ActivityIndicator, View } from "react-native";
import { t } from "react-native-tailwindcss";

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login"); // 🚪 redirect if not logged in
    }
  }, [loading, user]);

  if (loading) {
    return (
      <View style={[t.flex1, t.justifyCenter, t.itemsCenter]}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  if (!user) return null; // avoid flashing content before redirect

  return <>{children}</>;
};
