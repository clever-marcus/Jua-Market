import { auth, db, storage } from "@/constants/firebaseConfig";
import * as ImagePicker from "expo-image-picker";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { t } from "react-native-tailwindcss";
import Toast from "react-native-toast-message";
import uuid from "react-native-uuid";



export default function Upload() {
  const [image, setImage] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const user = auth.currentUser;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const q = query(collection(db, "products"), where("sellerId", "==", user.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // ✅ no cropping or editing
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri); // directly show in box
      }
    } catch (err) {
      console.error("Image pick error:", err);
    }
  };

const uploadImageAndGetURL = async (uri: string): Promise<string> => {
  try {
    // ✅ Convert local URI to blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // ✅ Create unique file ref in Firebase Storage
    const filename = `products/${uuid.v4()}.jpg`;
    const imageRef = ref(storage, filename);

    // ✅ Upload to Firebase Storage
    await uploadBytes(imageRef, blob);

    // ✅ Get downloadable URL
    const downloadURL = await getDownloadURL(imageRef);
    console.log("✅ Uploaded:", downloadURL);
    return downloadURL;
  } catch (error) {
    console.error("🔥 Error uploading image:", error);
    throw error;
  }
};



  const handleSave = async () => {
    if (!title || !price || !description) {
      alert("Please fill all required fields!");
      Toast.show({
        type: "error",
        text1: "Please fill all required fields!",
        visibilityTime: 4000,
      });
      return;
    }

    setUploading(true);
    try {
      let imageUrl = null;
      if (image) {
        imageUrl = await uploadImageAndGetURL(image);
      }

      const productData = {
        title,
        price: parseFloat(price),
        description,
        imageUrl: imageUrl || "",
        sellerId: user?.uid || "guest",
        isFavorite: false,
        createdAt: new Date().toISOString(),
      };

      if (editingId) {
        const refDoc = doc(db, "products", editingId);
        await updateDoc(refDoc, productData);
        Alert.alert("✅ Product updated!");
      } else {
        await addDoc(collection(db, "products"), productData);
        Toast.show({
          type: "success",
          text1: "✅ Product added!",
          visibilityTime: 3000,
        });

        // Reset UI + refresh list
        setTitle("");
        setPrice("");
        setDescription("");
        setImage(null);
        setEditingId(null);
      }

     
      fetchProducts();
    } catch (err) {
      console.error(err);
      Toast.show({
          type: "error",
          text1: "Error saving product 😞",
          visibilityTime: 3000,
        });
    } finally {
      setUploading(false);
    }
  };



  return (
    <View style={[t.flex1, t.bgWhite, t.p6]}>
      <Text style={[t.text2xl, t.fontBold, t.mB4]}>
        {editingId ? "✏️ Edit Product" : "📤 Add Product"}
      </Text>

      {/* Image upload box (no crop or preview step) */}
      <TouchableOpacity onPress={pickImage} style={[t.mB4]}>
        {image ? (
          <Image
            source={{ uri: image }}
            style={[{ width: "100%", height: 200 }, t.roundedLg]}
          />
        ) : (
          <View
            style={[
              t.h48,
              t.border2,
              t.borderGray300,
              t.roundedLg,
              t.justifyCenter,
              t.itemsCenter,
            ]}
          >
            <Text style={[t.textGray600]}>Tap to select image</Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        style={[t.border, t.borderGray300, t.roundedLg, t.p3, t.mB3]}
      />

      <TextInput
        placeholder="Price (USD)"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        style={[t.border, t.borderGray300, t.roundedLg, t.p3, t.mB3]}
      />

      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        style={[t.border, t.borderGray300, t.roundedLg, t.p3, t.mB4]}
      />

      <TouchableOpacity
        style={[
          t.bgBlack,
          t.pY3,
          t.roundedLg,
          uploading && t.opacity50,
          t.justifyCenter,
          t.itemsCenter,
        ]}
        onPress={handleSave}
        disabled={uploading}
      >
        <Text style={[t.textWhite, t.fontMedium]}>
          {uploading ? "Saving..." : editingId ? "Update Product" : "Upload Product"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
