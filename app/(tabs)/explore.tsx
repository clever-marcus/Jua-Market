import { db } from "@/constants/firebaseConfig";
import { useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where
} from "firebase/firestore";
import { Heart, Share2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
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



export default function Explore() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const router = useRouter();

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

  if (loading) {
    return (
      <SafeAreaView style={[t.flex1, t.justifyCenter, t.itemsCenter, t.bgWhite]}>
        <ActivityIndicator size="large" color="black" />
        <Text style={[t.textGray700, t.mT3]}>Loading amazing art...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[t.flex1, t.justifyCenter, t.itemsCenter]} edges={["top"]}>
      <Text style={[t.text2xl, t.fontBold, t.m4]}>Explore Products</Text>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }} // space above nav
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/product/${item.id}`)}>
            <View
              style={[
                t.bgGray100,
                t.roundedLg,
                t.mB6,
                t.shadow,
                { overflow: "hidden" },
              ]}
            >
              <Image
                source={{ uri: item.imageUrl }}
                style={{ width: "100%", height: 300 }}
                resizeMode="cover"
              />

              

              <View style={[t.p4]}>
                <Text style={[t.fontBold, t.textLg]}>{item.title}</Text>

                {item.description ? (
                  <Text style={[t.textGray700, t.textSm, t.mT1]}>
                    {item.description}
                  </Text>
                ) : (
                  <Text style={[t.textGray500, t.textXs, t.mT1]}>
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
                    t.borderGray300,
                    t.pT2,
                  ]}
                >
                  {/* Left: Price */}
                  <Text style={[t.textBlack, t.fontSemibold]}>
                    ${item.price?.toFixed ? item.price.toFixed(2) : item.price}
                  </Text>

                  {/* Right: Wishlist + Share */}
                  <View style={[t.flexRow, t.itemsCenter]}>
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
                        color={wishlist.includes(item.id) ? "red" : "gray"}
                        fill={wishlist.includes(item.id) ? "red" : "none"}
                      />
                      </Animated.View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => openShareMenu(item)}>
                      <Share2 size={22} color="gray" />
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
