import React, { useContext } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ThemeContext } from "../context/ThemeContext";

export default function DashboardHeader() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <View style={[styles.header, theme === "light" ? styles.light : styles.dark]}>
      <Text style={styles.greeting}>Hello Marcus</Text>

      <Pressable onPress={toggleTheme}>
        <Text style={styles.icon}>
          {theme === "light" ? "🌙" : "☀️"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  light: {
    backgroundColor: "#fff",
  },
  dark: {
    backgroundColor: "#222",
  },
  greeting: {
    fontSize: 18,
    fontWeight: "600",
  },
  icon: {
    fontSize: 25,
  },
});
