import * as Haptics from "expo-haptics";
import { getAuth } from "firebase/auth";
import { Moon, Sun } from "lucide-react-native";
import React, { useContext, useEffect, useState } from "react";
import {
  Image,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from "react-native";

// 🚨 ThemeContext Import 🚨
import { ThemeContext } from "../../context/ThemeContext";


export default function TopDashboardHeader() {
  const auth = getAuth();
  const user = auth.currentUser;

  const [firstName, setFirstName] = useState("User");
  const [photo, setPhoto] = useState<string | null>(null);

  const { theme, toggleTheme: contextToggleTheme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  // Fetch displayName or photoURL
  useEffect(() => {
    if (user?.displayName) {
      setFirstName(user.displayName.split(" ")[0]);
    }
    if (user?.photoURL) {
      setPhoto(user.photoURL);
    }
  }, [user]);

  const handleToggleTheme = () => {
    Haptics.selectionAsync();
    contextToggleTheme();
  };

  return (
    // 🚨 1. USE SafeAreaView as the container 🚨
    <SafeAreaView
      style={{
        width: "100%",
        // 🚨 2. REMOVE FIXED PADDING TOP (was paddingTop: 50) 🚨
        paddingTop: 25,
        paddingBottom: 5,
        backgroundColor: isDark ? "#000" : "#fff",
      }}
    >

      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark? "#000" : "#fff"}
      />
     
      <View
        style={{
          paddingHorizontal: 20,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* 🟢 LEFT CONTAINER: Photo + Name 🟢 */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          
          {/* Profile image */}
          <Image
            source={{
              uri:
                user?.photoURL ||
                "https://ui-avatars.com/api/?name=" +
                  encodeURIComponent(user?.displayName || "User"),
            }}
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              marginRight: 10,
            }}
          />
          
          {/* Name */}
          <Text
            style={{
              fontSize: 15,
              fontWeight: "bold",
              color: isDark ? "white" : "black",
            }}
          >
            Hello, {firstName} 👋
          </Text>
        </View>

        {/* 🟡 RIGHT CONTAINER: Theme Toggle 🟡 */}
        <View style={{ flexDirection: "row", alignItems: "center", }}>
          {/* Theme toggle */}
          <TouchableOpacity onPress={handleToggleTheme}> 
            {isDark ? (
              <Sun size={22} color="white" />
            ) : (
              <Moon size={22} color="black" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}