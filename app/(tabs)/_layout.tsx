import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";

export default function TabLayout() {
  //  Consume Context
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  // Define dynamic colors
  const colors = {
    // Tab Bar Background
    tabBarBackground: isDark ? "#000" : "white",
    
    // Icon Colors
    tabBarActive: isDark ? "white" : "black",
    tabBarInactive: isDark ? "#666" : "gray",
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: { 
          backgroundColor: colors.tabBarBackground,
          borderTopColor: isDark ? "#333" : "#eee", 
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
      
     {/* <Tabs.Screen
        name="upload"
        options={{
            title: "Upload",
            tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" color={color} size={size} />
            ),
        }}
        />*/}
        
    </Tabs>
  );
}
