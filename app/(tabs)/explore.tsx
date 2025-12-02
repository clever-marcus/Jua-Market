import { db } from "@/constants/firebaseConfig";
import { useRouter } from "expo-router";
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
  where
} from "firebase/firestore";
import { Heart, Share2, ShoppingCart } from "lucide-react-native";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Share as NativeShare,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context"; // ✅ the right import
import { t } from "react-native-tailwindcss";
import Toast from "react-native-toast-message";

import { ThemeContext } from "../../context/ThemeContext";



export default function Explore() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const router = useRouter();

  // Theme Context 
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const colors = {
    bgScreen: isDark ? t.bgBlack : t.bgWhite, // Main screen background
    bgCard: isDark ? t.bgBlack : t.bgGray100, // Product card background

    // Text Colors
    textPrimary: isDark ? t.textWhite : t.textBlack, // Main text (titles, price)
    textSecondary: isDark ? t.textGray400 : t.textGray700, // Secondary text (description)
    textPlaceholder: isDark ? t.textGray600 : t.textGray500, // Placeholder/small text

    // Borders
    border: isDark ? t.borderGray700 : t.borderGray300,
    icon: isDark ? t.textGray400 : t.textGray600,
  }

  const auth = getAuth();
  const user = auth.currentUser;
  const heartScale = useSharedValue(1);

  const animateHeart = () => {
    heartScale.value = 0.8;
    heartScale.value = withSpring(1.2, {}, () => {
      heartScale.value = withSpring(1);
    });
  };

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const openShareMenu = async (item: any) => {
    const message = `Check out this amazing product on AfriCart!\n\n${item.title} - $${item.price}\n\n${item.imageUrl}`;
    try {
      await NativeShare.share({ message });
    } catch (error) {
      console.error("Error sharing:", error)
    }
  }

  

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const items: any[] = [];
        querySnapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });
        setProducts(items);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchWishlist = async () => {
      try {
        const favRef = collection(db, "favorites");
        const q = query(favRef, where("userId", "==", user.uid));

        const snap = await getDocs(q);
        const ids = snap.docs.map(doc => doc.data().productId);

        setWishlist(ids);
      } catch (err) {
        console.error("🔥 Error loading wishlist:", err);
      }
    };

    fetchWishlist();
  }, [user]);


  const toggleWishlist = async (productId: string) => {
    if (!user) return; // prevent crashes

    try {
      const favRef = collection(db, "favorites");

      //check if exists
      const q = query(
        favRef,
        where("userId", "==", user.uid),
        where("productId", "==", productId)
      );

      const snap = await getDocs(q);

      if (!snap.empty) {
        // remove
        await deleteDoc(doc(db, "favorites", snap.docs[0].id));
        setWishlist(prev => prev.filter(id => id !== productId));
      } else {
        // add
        await addDoc(favRef, {
          userId: user.uid,
          productId,
          createdAt: new Date(),
        });
        setWishlist(prev => [...prev, productId]);
      }      
    } catch (err) {
      console.error("🔥 toggleWishlist error:", err)
    }
  };

  const addToCart = async (product: any) => {
    if (!user) {
      Toast.show({
        type: "error",
        text1: "Please log in first",
        text2: "You need to be logged in to add items to your cart.",
      });
      return;
    }

    try {
      const cartItemRef = doc(
        collection(db, "carts", user.uid, "items"),
        product.id
      );

      const existing = await getDoc(cartItemRef);

      if (existing.exists()) {
        const existingQty = existing.data().quantity || 1;

        await setDoc(cartItemRef, {
          productId: product.id,
          title: product.title,
          price: product.price,
          imageUrl: product.imageUrl,
          quantity: existingQty + 1,
        });

        Toast.show({
          type: "success",
          text1: "🛒 Cart Updated",
          text2: `${product.title} quantity increased.`,
          visibilityTime: 3000,
          position: "top",
        });
      } else {
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
          position: "top",
        });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      Toast.show({
        type: "error",
        text1: "Error adding item to cart",
        text2: "Please try again later.",
        visibilityTime: 2000,
        position: "bottom",
      });
    }
  };




  if (loading) {
    return (
      <SafeAreaView style={[t.flex1, t.justifyCenter, t.itemsCenter, colors.bgScreen]}>
        <ActivityIndicator size="large" color={isDark ? "white" : "black"} />
        <Text style={[colors.textSecondary, t.mT3]}>Loading amazing art...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[t.flex1, t.justifyCenter, t.itemsCenter,  colors.bgScreen]} edges={["top"]}>
      <Text style={[t.text2xl, t.fontBold, t.m4, colors.textPrimary, t.mB3, t.mT0]}>Explore Products</Text>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }} // space above nav
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/product/${item.id}`)}>
            <View
              style={[
                colors.bgCard,
                t.roundedLg,
                t.mB6,
                t.shadow,
                { overflow: "hidden" },
              ]}
            >
              <Image
                source={{ uri: Array.isArray(item.imageUrl) ? item.imageUrl[0] : item.imageUrl }}
                style={{ width: "100%", height: 300 }}
                resizeMode="cover"
              />

              <View style={[t.p4]}>
                <Text style={[t.fontBold, t.textLg, colors.textPrimary]}>{item.title}</Text>

                {item.description ? (
                  <Text style={[colors.textSecondary, t.textSm, t.mT1]}>
                    {item.description}
                  </Text>
                ) : (
                  <Text style={[colors.textPlaceholder, t.textXs, t.mT1]}>
                    No description available
                  </Text>
                )}

                <View
                  style={[
                    t.flexRow,
                    t.justifyBetween,
                    t.itemsCenter,
                    t.mT3,
                    t.borderT,
                    colors.border,
                    t.pT2,
                  ]}
                >
                  {/* Left: Price */}
                  <Text style={[colors.textPrimary, t.fontSemibold]}>
                    ${item.price?.toFixed ? item.price.toFixed(2) : item.price}
                  </Text>

                  {/* Right: Wishlist + Share */}
                  <View style={[t.flexRow, t.itemsCenter]}>
                    {/* Add to Cart Button */}
                    <TouchableOpacity
                      onPress={() => addToCart(item)}
                      style={[t.mR3]}
                    >
                      <ShoppingCart size={22} color={isDark ? "white" : "gray"} />

                    </TouchableOpacity>

                    <TouchableOpacity 
                      onPress={() => {
                        animateHeart();
                        toggleWishlist(item.id);
                      }} 
                      style={[t.mR3]}
                    >
                      <Animated.View style={heartStyle}>
                      <Heart
                        size={22}
                        color={wishlist.includes(item.id) ? "red" : (isDark ? "white" : "gray")}
                        fill={wishlist.includes(item.id) ? "red" : "none"}
                      />
                      </Animated.View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => openShareMenu(item)}>
                      <Share2 size={22} color={isDark ? "white" : "gray"} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
