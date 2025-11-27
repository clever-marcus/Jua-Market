import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { auth } from "@/constants/firebaseConfig";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import React, { useState } from "react";
import { Alert, Text, View } from "react-native";
import { t } from "react-native-tailwindcss";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password || !name)
      return Alert.alert("Error", "Please fill all fields.");
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      Alert.alert("Success", "Account created successfully!");
      router.replace("/(tabs)"); // jump to home after signup
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[t.flex1, t.justifyCenter, t.p6, t.bgWhite]}>
      <Text style={[t.text2xl, t.fontBold, t.mB4]}>Create Account</Text>
      <Input placeholder="Full Name" value={name} onChangeText={setName} />
      <Input placeholder="Email" value={email} onChangeText={setEmail} />
      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title={loading ? "Creating..." : "Sign Up"} onPress={handleRegister} />
      <Text
        style={[t.textCenter, t.mT4, t.textGray600]}
        onPress={() => router.push("/auth/login")}
      >
        Already have an account? {""}
        <Text style={[t.textBlue500, t.fontSemibold]}>Log in</Text>
      </Text>
    </View>
  );
}
