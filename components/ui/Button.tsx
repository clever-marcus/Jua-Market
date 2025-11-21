import React from "react";
import { TouchableOpacity, Text, GestureResponderEvent } from "react-native";
import { t } from "react-native-tailwindcss";

interface ButtonProps {
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
}

const Button: React.FC<ButtonProps> = ({ title, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[t.bgBlack, t.p3, t.roundedLg, t.itemsCenter, t.mT2]}
    >
      <Text style={[t.textWhite, t.fontSemibold]}>{title}</Text>
    </TouchableOpacity>
  );
};

export default Button;
