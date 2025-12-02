import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { auth } from "@/constants/firebaseConfig";
import { useRouter } from "expo-router";
import { sendEmailVerification, sendPasswordResetEmail } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { t } from "react-native-tailwindcss";
import Toast from "react-native-toast-message";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [showResend, setShowResend] = useState(false);
  const [timer, setTimer] = useState(0); // TIMER STARTS AT 0 (not counting until user clicks)

  const router = useRouter();

  const handleReset = async () => {
    if (!email) {
      Toast.show({
        type: "error",
        text1: "Email Required",
        text2: "Please enter your email address.",
      });
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);

      Toast.show({
        type: "success",
        text1: "Reset Email Sent!",
        text2: "Check your inbox for password reset instructions.",
      });

      // 🔥 Start the 30-second timer AFTER sending reset email
      setShowResend(false);
      setTimer(30);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Failed to send reset email",
        text2: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // ⏱️ Timer countdown logic
  useEffect(() => {
    if (timer <= 0) {
      if (timer === 0) setShowResend(true); // show resend only AFTER countdown finishes
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleResendVerification = async () => {
    if (!auth.currentUser) {
      return Toast.show({
        type: "error",
        text1: "Not Logged In",
        text2: "You must be logged in to resend verification email.",
      });
    }

    try {
      await sendEmailVerification(auth.currentUser);

      Toast.show({
        type: "success",
        text1: "Verification Email Sent",
        text2: "A new verification email has been sent.",
      });

      // Restart timer
      setShowResend(false);
      setTimer(30);
    } catch (err: any) {
      Toast.show({
        type: "error",
        text1: "Could not send email",
        text2: err.message,
      });
    }
  };

  return (
    <View style={[t.flex1, t.justifyCenter, t.pX6, t.bgWhite]}>
      <Text style={[t.text2xl, t.fontBold, t.textCenter, t.mB4]}>
        Reset Password
      </Text>

      <Input
        placeholder="Enter your account email"
        value={email}
        onChangeText={setEmail}
      />

      <Button
        title={loading ? "Sending..." : "Send Reset Email"}
        onPress={handleReset}
      />

      {/* 🔥 Show timer ONLY after user pressed reset */}
      {timer > 0 && (
        <Text style={[t.textCenter, t.textGray500, t.mT4]}>
          You can resend verification email in {timer}s
        </Text>
      )}

      {/* 🔥 Show resend link ONLY after timer reaches 0 */}
      {showResend && (
        <TouchableOpacity onPress={handleResendVerification} style={[t.mT4]}>
          <Text style={[t.textCenter, t.textBlue500, t.fontSemibold]}>
            Resend Verification Email
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => router.back()} style={[t.mT6]}>
        <Text style={[t.textCenter, t.textBlue500]}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}
