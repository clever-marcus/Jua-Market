// app/cart/index.tsx
import React from "react";
import { View, Text } from "react-native";
import { t } from "react-native-tailwindcss";

export default function CartScreen() {
  return (
    <View style={[t.flex1, t.justifyCenter, t.itemsCenter, t.bgWhite]}>
      <Text style={[t.textLg, t.fontSemibold]}>Your cart is empty 🛒</Text>
    </View>
  );
}
