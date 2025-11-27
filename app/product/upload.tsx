import { View, Text, TextInput, Button } from "react-native";
import { useState } from "react";
import { t } from "react-native-tailwindcss";
import Input from "@/components/ui/Input";

export default function UploadProduct() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  

  

  return (
    <View style={[t.flex1, t.bgWhite, t.p4]}>
      <Input placeholder="Product title" value={title} onChangeText={setTitle} />
      <Input placeholder="Price in USD" value={price} onChangeText={setPrice} />
      <Button title="Upload" onPress={() => console.log("Upload pressed")} />
    </View>
  );
}
