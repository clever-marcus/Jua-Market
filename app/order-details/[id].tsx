import React, { useEffect, useState } from "react";
import { View, Text, Image, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/constants/firebaseConfig";
import { t } from "react-native-tailwindcss";
import { ArrowLeft } from "lucide-react-native";
import { ProtectedRoute } from "@/providers/ProtectedRoute";


export default function OrderDetailsPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const docRef = doc(db, "orders", id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setOrder({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={[t.flex1, t.justifyCenter, t.itemsCenter]}>
        <ActivityIndicator size="large" color="black" />
        <Text style={[t.mT3]}>Loading order details...</Text>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={[t.flex1, t.justifyCenter, t.itemsCenter]}>
        <Text>Order not found 🫤</Text>
      </SafeAreaView>
    );
  }

  return (
    <ProtectedRoute>
      <SafeAreaView style={[t.flex1, t.bgWhite]}>
        {/* Back Button */}
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

        <ScrollView contentContainerStyle={[t.p6, { paddingBottom: 100 }]}>
          <Image
            source={
              order.imageUrl
                ? { uri: order.imageUrl }
                : require("../../assets/images/placeholder.jpg")
            }
            style={{ width: "100%", height: 300, borderRadius: 16 }}
            resizeMode="cover"
          />
          <Text style={[t.text3xl, t.fontBold, t.mT4]}>{order.title}</Text>
          <Text style={[t.textLg, t.textGray700, t.mT2]}>
            Price: ${order.price?.toFixed ? order.price.toFixed(2) : order.price}
          </Text>

          <View style={[t.mT6]}>
            <Text style={[t.textBase, t.textGray600]}>
              <Text style={[t.fontSemibold]}>Order Status: </Text>
              {order.status || "Pending"}
            </Text>
            <Text style={[t.textBase, t.textGray600, t.mT2]}>
              <Text style={[t.fontSemibold]}>Order Date: </Text>
              {order.createdAt?.toDate
                ? order.createdAt.toDate().toLocaleString()
                : order.createdAt}
            </Text>
          </View>
        </ScrollView>

        {/* Bottom Action Button */}
        <View
          style={[
            t.absolute,
            t.left0,
            t.right0,
            { bottom: 40 },
            t.itemsCenter,
            t.pX6,
          ]}
        >
          <TouchableOpacity
            style={[
              t.bgBlack,
              t.roundedLg,
              t.pY3,
              t.wFull,
              t.itemsCenter,
              t.shadow,
            ]}
            onPress={() => alert("Tracking feature coming soon 🚚")}
          >
            <Text style={[t.textWhite, t.textLg, t.fontSemibold]}>
              Track Order
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ProtectedRoute>
  );
}
