import { auth } from "@/constants/firebaseConfig";
import { ProtectedRoute } from "@/providers/ProtectedRoute";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { HelpCircle, LogOut, Settings, User } from "lucide-react-native";
import React from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { t } from "react-native-tailwindcss";

export default function Profile() {
  const router = useRouter();
  const user = auth.currentUser;

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
      <View style={[t.flex1, t.bgWhite, t.itemsCenter, t.pT10]}>
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
        <Text style={[t.textXl, t.fontBold]}>
          {user?.displayName || "Guest User"}
        </Text>
        <Text style={[t.textGray600, t.mT1]}>{user?.email}</Text>

        {/* Divider */}
        <View style={[t.hPx, t.bgGray200, t.w10_12, t.mT6, t.mB4]} />

        {/* Menu Options */}
        <TouchableOpacity
          style={[t.flexRow, t.itemsCenter, t.justifyBetween, t.w10_12, t.pY4]}
          onPress={() => router.push("/orders")}
        >
          <View style={[t.flexRow, t.itemsCenter]}>
            <User size={22} color="black" />
            <Text style={[t.textBase, t.mL3]}>My Orders</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[t.flexRow, t.itemsCenter, t.justifyBetween, t.w10_12, t.pY4]}
          onPress={() => router.push("/edit-profile")}
        >
          <View style={[t.flexRow, t.itemsCenter]}>
            <Settings size={22} color="black" />
            <Text style={[t.textBase, t.mL3]}>Edit Profile</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[t.flexRow, t.itemsCenter, t.justifyBetween, t.w10_12, t.pY4]}
          onPress={() => router.push("/help")}
        >
          <View style={[t.flexRow, t.itemsCenter]}>
            <HelpCircle size={22} color="black" />
            <Text style={[t.textBase, t.mL3]}>Help & Support</Text>
          </View>
        </TouchableOpacity>

        {/* Divider */}
        <View style={[t.hPx, t.bgGray200, t.w10_12, t.mT6]} />

        {/* Logout */}
        <TouchableOpacity
          style={[
            t.flexRow,
            t.itemsCenter,
            t.justifyCenter,
            t.bgBlack,
            t.roundedLg,
            t.pY3,
            t.pX6,
            t.mT8,
          ]}
          onPress={handleLogout}
        >
          <LogOut size={20} color="white" />
          <Text style={[t.textWhite, t.fontMedium, t.mL2]}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ProtectedRoute>
  );
}
