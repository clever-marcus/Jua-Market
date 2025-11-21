import React from "react";
import { TextInput, TextInputProps } from "react-native";
import { t } from "react-native-tailwindcss";

interface InputProps extends TextInputProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
}

const Input: React.FC<InputProps> = ({ placeholder, value, onChangeText, ...props }) => {
  return (
    <TextInput
      style={[t.border, t.roundedLg, t.p2, t.mB3]}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      {...props}
    />
  );
};

export default Input;
