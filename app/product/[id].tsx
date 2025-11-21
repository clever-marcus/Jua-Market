import { db } from "@/constants/firebaseConfig";
import { useAuth } from "@/hooks/useAuth";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { ArrowLeft, Heart, Share2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { t } from "react-native-tailwindcss";
import Toast from "react-native-toast-message";

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favId, setFavId] = useState<string | null>(null);
  const { user } = useAuth();
  const auth = getAuth();

  // 🔹 Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log("No such product found");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // 🔹 Check if favorited
  useEffect(() => {
    if (!user || !id) return;
    const checkFavorite = async () => {
      try {
        const favRef = collection(db, "favorites");
        const q = query(
          favRef,
          where("userId", "==", user.uid),
          where("productId", "==", id)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setIsFavorite(true);
          setFavId(snapshot.docs[0].id);
        }
      } catch (err) {
        console.error("Error checking favorites:", err);
      }
    };
    checkFavorite();
  }, [user, id]);

  // 🔹 Add to cart
  const handleAddToCart = async () => {
    if (!user) {
      Toast.show({
        type: "error",
        text1: "Please log in first",
        text2: "You need to be logged in to add items to your cart.",
      });
      return;
    }

    try {
      const cartItemRef = doc(collection(db, "carts", user.uid, "items"), product.id);
      const existing = await getDoc(cartItemRef);

      if (existing.exists()) {
        // If the item already exists, increase its quantity
        const existingQty = existing.data().quantity || 1;
        await setDoc(cartItemRef, {
          ...product,
          quantity: existingQty + 1,
        });
        Toast.show({
          type: "success",
          text1: "🛒 Cart Updated",
          text2: `${product.title} quantity increased.`,
          visibilityTime: 3000,
          position: "top"
        });
        
      } else {
        // Otherwise create a new one
        await setDoc(cartItemRef, {
          productId: product.id,
          title: product.title,
          price: product.price,
          imageUrl: product.imageUrl,
          quantity: 1,
        });
        Toast.show({
          type: "success",
          text1: "✅ Added to Cart",
          text2: `${product.title} added successfully.`,
          visibilityTime: 3000,
          position: "top"
        });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      Toast.show({
        type: "error",
        text1: "Error, adding item to cart.",
        text2: "Please try again later.",
        visibilityTime: 2000,
        position: "bottom"
      });
    }
  };

  // 🔹 Toggle favorite
  const toggleFavorite = async () => {
    if (!user) {
      Toast.show({
        type: "error",
        text1: "Login required",
        text2: "Please login to save favorites. 💖",
      });
      return;
    }

    try {
      const favRef = collection(db, "favorites");
      if (isFavorite && favId) {
        await deleteDoc(doc(db, "favorites", favId));
        setIsFavorite(false);
        setFavId(null);
      } else {
        const newFav = await addDoc(favRef, {
          userId: user.uid,
          productId: id,
          createdAt: new Date().toISOString(),
        });
        setIsFavorite(true);
        setFavId(newFav.id);
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    }
  };

  // 🔹 Loading & fallback states
  if (loading) {
    return (
      <SafeAreaView style={[t.flex1, t.justifyCenter, t.itemsCenter, t.bgWhite]}>
        <ActivityIndicator size="large" color="black" />
        <Text style={[t.textGray700, t.mT3]}>Loading artwork...</Text>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={[t.flex1, t.justifyCenter, t.itemsCenter, t.bgWhite]}>
        <Text style={[t.textGray700]}>Product not found</Text>
      </SafeAreaView>
    );
  }

  // 🔹 Main UI
  return (
    <SafeAreaView style={[t.flex1, t.bgWhite]}>
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={[
          t.absolute,
          { top: 40, left: 20 },
          t.z10,
          t.p2,
          t.bgTransparent,
          t.roundedFull,
          t.shadow,
        ]}
      >
        <ArrowLeft size={28} color="gray" />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={[t.p4, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={{ uri: product.imageUrl }}
          style={[{ width: "100%", height: 400, borderRadius: 12 }]}
          resizeMode="cover"
        />

        <View style={[t.flexRow, t.justifyBetween, t.itemsCenter, t.mT4]}>
          <Text style={[t.text3xl, t.fontBold]}>{product.title}</Text>
        </View>

        <Text style={[t.textGray700, t.textBase, t.mT2]}>
          {product.description || "No description available."}
        </Text>

        <View style={[t.flexRow, t.justifyBetween, t.itemsCenter, t.mT4]}>
          <Text style={[t.textBlack, t.fontSemibold, t.textLg]}>
            ${product.price?.toFixed ? product.price.toFixed(2) : product.price}
          </Text>

          <View style={[t.flexRow, t.itemsCenter]}>
            <TouchableOpacity onPress={toggleFavorite} style={[t.mR3]}>
              <Heart
                size={28}
                color={isFavorite ? "red" : "gray"}
                fill={isFavorite ? "red" : "none"}
              />
            </TouchableOpacity>

            <TouchableOpacity>
              <Share2 size={24} color="gray" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[t.mT3]}>
          <Text style={[t.textGray600, t.textSm]}>
            Seller ID: {product.sellerId}
          </Text>
          {product.createdAt && (
            <Text style={[t.textGray500, t.textXs]}>
              Added on: {new Date(product.createdAt).toLocaleDateString()}
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Add to Cart Button */}
      <View style={[t.absolute, { bottom: 50 }, t.left0, t.right0, t.itemsCenter]}>
        <TouchableOpacity
          style={[
            t.bgBlack,
            t.roundedLg,
            t.pY3,
            t.w11_12,
            t.justifyCenter,
            t.itemsCenter,
            t.shadow,
          ]}
          onPress={handleAddToCart}
        >
          <Text style={[t.textWhite, t.textLg, t.fontSemibold]}>
            Add to Cart
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
