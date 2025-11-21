import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { auth } from "@/constants/firebaseConfig";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { t } from "react-native-tailwindcss";
import Toast from "react-native-toast-message";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert("Error", "Please fill all fields.");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Toast.show({
        type: "success",
        text1: "Logged in successfully ✅ ",
        visibilityTime: 3000,
      });
      router.replace("/(tabs)"); // redirect to home tab after login
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Login Failed ❌ ",
        text2: "Please check credentials and try again.",
        visibilityTime: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[t.flex1, t.justifyCenter, t.p6, t.bgWhite]}>
      <Text style={[t.text2xl, t.fontBold, t.mB4, t.textCenter]}>Welcome Back</Text>

      <Input placeholder="Email" value={email} onChangeText={setEmail} />
      <Input placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

      <Button title={loading ? "Signing in..." : "Login"} onPress={handleLogin} />

      {/* Signup Link */}
      <TouchableOpacity onPress={() => router.push("/auth/register")} style={[t.mT4]}>
        <Text style={[t.textCenter, t.textGray600]}>
          Don’t have an account?{" "}
          <Text style={[t.textBlue500, t.fontSemibold]}>Sign up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}
