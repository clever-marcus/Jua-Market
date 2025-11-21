import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { db } from "@/constants/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { t } from "react-native-tailwindcss";
import { ArrowLeft, Heart } from "lucide-react-native";
import { ProtectedRoute } from "@/providers/ProtectedRoute";

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const favRef = collection(db, "favorites");
        const q = query(favRef, where("userId", "==", user.uid));
        const snapshot = await getDocs(q);

        const products: any[] = [];
        for (const docSnap of snapshot.docs) {
          const favData = docSnap.data();
          const productRef = doc(db, "products", favData.productId);
          const productSnap = await getDoc(productRef);
          if (productSnap.exists()) {
            products.push({
              id: productSnap.id,
              ...productSnap.data(),
              favId: docSnap.id,
            });
          }
        }

        setFavorites(products);
      } catch (err) {
        console.error("Error fetching favorites:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  const removeFavorite = async (favId: string) => {
    try {
      await deleteDoc(doc(db, "favorites", favId));
      setFavorites((prev) => prev.filter((f) => f.favId !== favId));
    } catch (err) {
      console.error("Error removing favorite:", err);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[t.flex1, t.justifyCenter, t.itemsCenter]}>
        <ActivityIndicator size="large" color="black" />
        <Text style={[t.textGray700, t.mT3]}>Loading favorites...</Text>
      </SafeAreaView>
    );
  }

  if (favorites.length === 0) {
    return (
      <SafeAreaView style={[t.flex1, t.justifyCenter, t.itemsCenter]}>
        <Text style={[t.textGray700]}>No favorites yet 💔</Text>
      </SafeAreaView>
    );
  }

  return (
    <ProtectedRoute>
      <SafeAreaView style={[t.flex1, t.bgWhite]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            t.absolute,
            { top: 40, left: 20 },
            t.z10,
            t.p2,
            t.bgWhite,
            t.roundedFull,
            t.shadow,
          ]}
        >
          <ArrowLeft size={22} color="black" />
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={[t.p4]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[t.text3xl, t.fontBold, t.mB4]}>My Favorites ❤️</Text>

          {favorites.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => router.push(`/product/${item.id}`)}
              style={[
                t.flexRow,
                t.mB4,
                t.p3,
                t.roundedLg,
                t.bgGray100,
                t.itemsCenter,
                t.shadow,
              ]}
            >
              <Image
                source={{ uri: item.imageUrl }}
                style={{ width: 80, height: 80, borderRadius: 10 }}
                resizeMode="cover"
              />
              <View style={[t.flex1, t.mL3]}>
                <Text style={[t.textLg, t.fontSemibold]}>{item.title}</Text>
                <Text style={[t.textGray600]}>${item.price}</Text>
              </View>
              <TouchableOpacity onPress={() => removeFavorite(item.favId)}>
                <Heart size={24} color="red" fill="red" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </ProtectedRoute>
  );
}
