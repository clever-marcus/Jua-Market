// providers/AdminRoute.tsx
import React, { ReactNode, useEffect } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "./AuthProvider";
import { t } from "react-native-tailwindcss";

export const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // not logged in -> go login
        router.replace("/auth/login");
      } else if (!isAdmin) {
        // logged in but not admin -> redirect home (or show forbidden)
        router.replace("/"); // or "/(tabs)"
      }
    }
  }, [loading, user, isAdmin]);

  if (loading) {
    return (
      <View style={[t.flex1, t.justifyCenter, t.itemsCenter]}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  if (!user || !isAdmin) {
    // don't render children
    return (
      <View style={[t.flex1, t.justifyCenter, t.itemsCenter]}>
        <Text style={[t.textGray700]}>Not authorized</Text>
      </View>
    );
  }

  return <>{children}</>;
};
