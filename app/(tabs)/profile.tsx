import { auth } from "@/constants/firebaseConfig";
import { ProtectedRoute } from "@/providers/ProtectedRoute";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { HelpCircle, LogOut, Settings, User } from "lucide-react-native";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { t } from "react-native-tailwindcss";

import React, { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";


export default function Profile() {
  const router = useRouter();
  const user = auth.currentUser;
  
  // Consume Context
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  // 🚨 Dynamic Colors Definition 🚨
  const colors = {
    bgScreen: isDark ? t.bgBlack : t.bgWhite, // Main background
    textPrimary: isDark ? t.textWhite : t.textBlack, // Main text (name, menu items)
    textSecondary: isDark ? t.textGray400 : t.textGray600, // Secondary text (email, helper text)
    border: isDark ? t.bgGray700 : t.bgGray200, // Divider color
    icon: isDark ? "white" : "black", // Menu icon color
    
    // Logout Button Colors (Danger/Red for Dark Mode)
    btnLogoutBg: isDark ? t.bgRed700 : t.bgBlack, 
    btnLogoutText: t.textWhite,
    btnLogoutIcon: "white",
  };

  const handleLogout = async () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth);
            console.log("✅ Logged out successfully");
          } catch (error) {
            console.error("Logout error:", error);
          }
        },
      },
    ]);
  };

  return (
    <ProtectedRoute>
      <View style={[t.flex1, colors.bgScreen, t.itemsCenter, t.pT10]}>
        {/* Profile Info */}
        <Image
          source={{
            uri:
              user?.photoURL ||
              "https://ui-avatars.com/api/?name=" +
                encodeURIComponent(user?.displayName || "User"),
          }}
          style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 12 }}
        />
        <Text style={[t.textXl, t.fontBold, colors.textPrimary]}>
          {user?.displayName || "Guest User"}
        </Text>
        <Text style={[colors.textSecondary, t.mT1]}>{user?.email}</Text>

        {/* Divider */}
        <View style={[t.hPx, colors.border, t.w10_12, t.mT6, t.mB4]} />

        {/* Menu Options */}
        <TouchableOpacity
          style={[t.flexRow, t.itemsCenter, t.justifyBetween, t.w10_12, t.pY4]}
          onPress={() => router.push("/orders")}
        >
          <View style={[t.flexRow, t.itemsCenter]}>
            <User size={22} color={colors.icon} />
            <Text style={[t.textBase, t.mL3, colors.textPrimary]}>My Orders</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[t.flexRow, t.itemsCenter, t.justifyBetween, t.w10_12, t.pY4]}
          onPress={() => router.push("/edit-profile")}
        >
          <View style={[t.flexRow, t.itemsCenter]}>
            <Settings size={22} color={colors.icon} />
            <Text style={[t.textBase, t.mL3, colors.textPrimary]}>Edit Profile</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[t.flexRow, t.itemsCenter, t.justifyBetween, t.w10_12, t.pY4]}
          onPress={() => router.push("/help")}
        >
          <View style={[t.flexRow, t.itemsCenter]}>
            <HelpCircle size={22} color={colors.icon} />
            <Text style={[t.textBase, t.mL3, colors.textPrimary]}>Help & Support</Text>
          </View>
        </TouchableOpacity>

      

        {/* Logout */}
        <TouchableOpacity
          style={[
            t.flexRow,
            t.itemsCenter,
            t.justifyCenter,
            colors.btnLogoutBg,
            t.roundedLg,
            t.pY3,
            t.pX6,
            { bottom: 13 },
            t.mT8,
          ]}
          onPress={handleLogout}
        >
          <LogOut size={20} color={colors.btnLogoutIcon} />
          <Text style={[colors.btnLogoutText, t.fontMedium, t.mL2]}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ProtectedRoute>
  );
}
