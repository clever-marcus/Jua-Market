import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { t } from "react-native-tailwindcss";

export default function OrderSuccess() {
  const router = useRouter();

  return (
    <SafeAreaView style={[t.flex1, t.justifyCenter, t.itemsCenter, t.bgWhite]}>
      <Image
        source={{ uri: "https://cdn-icons-png.flaticon.com/512/190/190411.png" }}
        style={{ width: 120, height: 120, marginBottom: 20 }}
      />

      <Text style={[t.text2xl, t.fontSemibold, t.textCenter]}>
        🎉 Order Successful!
      </Text>
      <Text style={[t.textGray600, t.textCenter, t.mT2, t.pX6]}>
        Your order has been placed successfully. We’ll notify you when it ships!
      </Text>

      <TouchableOpacity
        style={[
          t.bgBlack,
          t.roundedLg,
          t.pY3,
          t.pX6,
          t.mT8,
          t.shadow,
        ]}
        onPress={() => router.push("/explore")}
      >
        <Text style={[t.textWhite, t.textLg, t.fontSemibold]}>
          Go Back Home
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
