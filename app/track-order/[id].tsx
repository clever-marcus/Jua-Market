import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/constants/firebaseConfig";
import { t } from "react-native-tailwindcss";
import { ArrowLeft } from "lucide-react-native";
import { TouchableOpacity } from "react-native";
import { ProtectedRoute } from "@/providers/ProtectedRoute";

export default function TrackOrderPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    // Real-time listener for order updates
    const unsub = onSnapshot(doc(db, "orders", id as string), (docSnap) => {
      if (docSnap.exists()) {
        setOrder({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    });

    return () => unsub();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={[t.flex1, t.justifyCenter, t.itemsCenter]}>
        <ActivityIndicator size="large" color="black" />
        <Text style={[t.mT3]}>Loading order status...</Text>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={[t.flex1, t.justifyCenter, t.itemsCenter]}>
        <Text>No order found 😕</Text>
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

        <ScrollView contentContainerStyle={[t.p6]}>
          <Image
            source={
              order.imageUrl
                ? { uri: order.imageUrl }
                : require("../../assets/images/placeholder.jpg")
            }
            style={{ width: "100%", height: 260, borderRadius: 16 }}
            resizeMode="cover"
          />

          <Text style={[t.text3xl, t.fontBold, t.mT4]}>{order.title}</Text>
          <Text style={[t.textLg, t.textGray700, t.mT2]}>
            Price: ${order.price}
          </Text>

          {/* --- Order Progress Section --- */}
          <View style={[t.mT8]}>
            <Text style={[t.textXl, t.fontSemibold, t.mB3]}>Order Progress</Text>

            {["Pending", "Processing", "Shipped", "Delivered"].map(
              (status, index) => {
                const isActive =
                  ["Pending", "Processing", "Shipped", "Delivered"].indexOf(
                    order.status
                  ) >= index;

                return (
                  <View key={status} style={[t.flexRow, t.itemsCenter, t.mB4]}>
                    <View
                      style={[
                        t.w6,
                        t.h6,
                        t.roundedFull,
                        isActive ? t.bgGreen500 : t.bgGray400,
                      ]}
                    />
                    <View style={[t.flex1, t.h1, t.bgGray300, t.mX2]}>
                      {index <
                        ["Pending", "Processing", "Shipped", "Delivered"]
                          .length -
                          1 && (
                        <View
                          style={[
                            t.h1,
                            {
                              backgroundColor: isActive ? "#22c55e" : "#d1d5db",
                              width: "100%",
                            },
                          ]}
                        />
                      )}
                    </View>
                    <Text
                      style={[
                        t.textBase,
                        isActive ? t.textGreen600 : t.textGray500,
                      ]}
                    >
                      {status}
                      {isActive && index === 3 ? " 🎉" : ""}
                      {isActive && index === 2 ? " 🚚" : ""}
                      {isActive && index === 1 ? " ⚙️" : ""}
                    </Text>
                  </View>
                );
              }
            )}
          </View>

          {/* --- Order Details --- */}
          <View style={[t.mT6]}>
            <Text style={[t.textBase, t.textGray600]}>
              <Text style={[t.fontSemibold]}>Order ID:</Text> {order.id}
            </Text>
            <Text style={[t.textBase, t.textGray600, t.mT2]}>
              <Text style={[t.fontSemibold]}>Status:</Text> {order.status}
            </Text>
            <Text style={[t.textBase, t.textGray600, t.mT2]}>
              <Text style={[t.fontSemibold]}>Placed on:</Text>{" "}
              {order.createdAt?.toDate
                ? order.createdAt.toDate().toLocaleString()
                : "N/A"}
            </Text>
          </View>

          <View style={[t.mT8, t.p4, t.roundedLg, t.bgGray100]}>
            <Text style={[t.textCenter, t.textGray700]}>
              You’ll get live updates as your order status changes 💨
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ProtectedRoute>
  );
}
