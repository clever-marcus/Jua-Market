import { db } from "@/constants/firebaseConfig";
import { ThemeContext } from "@/context/ThemeContext";
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
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { t } from "react-native-tailwindcss";
import Toast from "react-native-toast-message";

// Get screen width for carousel image dimensions
const { width: screenWidth } = Dimensions.get("window"); 

// Defining dynamic colors structure
const getColors = (isDark: boolean) => ({
  // Screen / Container Colors
    bgScreen: isDark ? t.bgGray900 : t.bgWhite,
    bgPrimary: isDark ? t.bgGray800 : t.bgWhite,
    
    // Text Colors
    textPrimary: isDark ? t.textWhite : t.textBlack,
    textSecondary: isDark ? t.textGray400 : t.textGray700,
    textDisabled: isDark ? t.textGray600 : t.textGray700,
    textLight: t.textGray400, // For seller ID, dates, etc.
    
    // Border Colors
    border: isDark ? t.borderGray700 : t.borderGray300,

    // Button Colors
    bgAddCart: t.bgBlack, // Keep black for visibility
    textAddCart: t.textWhite,
});

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favId, setFavId] = useState<string | null>(null);
  const { user } = useAuth();
  const auth = getAuth();

  // Consume Context
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  const colors = getColors(isDark);

  const [selectedImage, setSelectedImage] = useState(0);

  // 🔹 Fetch product details (No change)
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

  // 🔹 Check if favorited (No change)
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

  // 🔹 Add to cart (No change)
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
          imageUrl: 
            Array.isArray(product.images)
              ? product.images[0]
              : Array.isArray(product.imageUrl)
              ? product.imageUrl[0]
              : product.imageUrl || null,
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

  // 🔹 Toggle favorite (No change)
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

  // 🔹 Loading & fallback states (No change)
  if (loading) {
    return (
      <SafeAreaView style={[t.flex1, t.justifyCenter, t.itemsCenter, colors.bgScreen]}>
        <ActivityIndicator size="large" color={colors.textPrimary.color} />
        <Text style={[colors.textDisabled, t.mT3]}>Loading artwork...</Text>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={[t.flex1, t.justifyCenter, t.itemsCenter, colors.bgScreen]}>
        <Text style={[colors.textDisabled]}>Product not found</Text>
      </SafeAreaView>
    );
  }


  const imagesArray = Array.isArray(product?.images)
    ? product.images
    : Array.isArray(product?.imageUrl)
      ? product.imageUrl
      : (product?.imageUrl ? [product.imageUrl] : []); // Fallback to single URL or empty array

  // 🔹 Main UI
  return (
    <SafeAreaView style={[t.flex1, colors.bgScreen]}>

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
       <ArrowLeft size={28} color={colors.textDisabled.color} />
      </TouchableOpacity>


      <ScrollView
        contentContainerStyle={[t.p4, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Image source={{ uri: imagesArray[selectedImage] }} 
          style={{
            width: screenWidth - 32,
            height: 380,
            borderRadius: 12,
            alignSelf: "center",
          }}
          resizeMode="cover"
        />
        
        {/* THUMBNAILS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 15 }}
          contentContainerStyle={[t.flexRow]}
        >
          {imagesArray.map((img: string, index: number) => {
            const isActive = index === selectedImage;

            return (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedImage(index)}
                style={{ marginRight: 10 }}
              >
                <Image
                  source={{ uri: img }}
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: 8,
                    borderWidth: isActive ? 2 : 1,
                    borderColor: isActive ? "#FF9900" : colors.border.borderColor,
                  }}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        
        {/* START OF FIX: Removed extra newlines/whitespace between tags */}
        <View style={[t.flexRow, t.justifyBetween, t.itemsCenter, t.mT4]}>
          <Text style={[t.text3xl, t.fontBold, colors.textPrimary]}>{product.title}</Text>
        </View>

        <Text style={[colors.textSecondary, t.textBase, t.mT2]}>
          {product.description || "No description available."}
        </Text>
        {/* END OF FIX */}

        <View style={[t.flexRow, t.justifyBetween, t.itemsCenter, t.mT4]}>
          <Text style={[colors.textPrimary, t.fontSemibold, t.textLg]}>
            ${product.price?.toFixed ? product.price.toFixed(2) : product.price}
          </Text>

          <View style={[t.flexRow, t.itemsCenter]}>
            <TouchableOpacity onPress={toggleFavorite} style={[t.mR3]}>
              <Heart
                size={28}
                color={isFavorite ? "red" : colors.textDisabled.color}
                fill={isFavorite ? "red" : "none"}
              />
            </TouchableOpacity>

            <TouchableOpacity>
              <Share2 size={24} color={colors.textDisabled.color} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[t.mT3]}>
          <Text style={[colors.textLight, t.textSm]}>
            Seller ID: {product.sellerId}
          </Text>
          {product.createdAt && (
            <Text style={[colors.textLight, t.textXs]}>
              Added on: {new Date(product.createdAt).toLocaleDateString()}
            </Text>
          )}
        </View>
      </ScrollView>


      <View style={[t.absolute, { bottom: 50 }, t.left0, t.right0, t.itemsCenter]}>
        <TouchableOpacity
          style={[
            colors.bgAddCart,
            t.roundedLg,
            t.pY3,
            t.w11_12,
            t.justifyCenter,
            t.itemsCenter,
            t.shadow,
          ]}
          onPress={handleAddToCart}
        >
          <Text style={[colors.textAddCart, t.textLg, t.fontSemibold]}>
            Add to Cart
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}