import { db } from "@/constants/firebaseConfig";
import { ProtectedRoute } from "@/providers/ProtectedRoute";
import { useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { ArrowLeft, Trash2 } from "lucide-react-native";
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

export default function Orders() {
  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchOrdersAndExpandItems = async () => {
      try {
        const q = query(collection(db, "orders"), where("userId", "==", user.uid));
        const snap = await getDocs(q);
        const rawOrders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        const expandedOrders = await Promise.all(
          rawOrders.map(async (order: any) => {
            const items = Array.isArray(order.items) ? order.items : [];
            const expandedItems = await Promise.all(
              items.map(async (it: any) => {
                if (it.title && it.price && it.imageUrl) return it;

                const productId = it.productId ?? it.id;
                if (!productId)
                  return { id: it.id ?? null, title: it.title ?? "Product", price: it.price ?? 0, imageUrl: it.imageUrl ?? null, quantity: it.quantity ?? 1 };

                try {
                  const prodSnap = await getDoc(doc(db, "products", productId));
                  if (prodSnap.exists()) {
                    const p = prodSnap.data();
                    return {
                      id: productId,
                      title: p.title ?? it.title ?? "Product",
                      price: typeof p.price === "number" ? p.price : Number(p.price) || (it.price ?? 0),
                      imageUrl: p.imageUrl ?? it.imageUrl ?? null,
                      quantity: it.quantity ?? 1,
                    };
                  } else {
                    return {
                      id: productId,
                      title: it.title ?? "Product (removed)",
                      price: it.price ?? 0,
                      imageUrl: it.imageUrl ?? null,
                      quantity: it.quantity ?? 1,
                    };
                  }
                } catch (err) {
                  console.error("Error fetching product for order item:", err);
                  return {
                    id: productId,
                    title: it.title ?? "Product",
                    price: it.price ?? 0,
                    imageUrl: it.imageUrl ?? null,
                    quantity: it.quantity ?? 1,
                  };
                }
              })
            );

            let createdAtDate: Date | null = null;
            if (order.createdAt && typeof order.createdAt === "object" && order.createdAt.toDate) {
              createdAtDate = order.createdAt.toDate();
            } else if (typeof order.createdAt === "string") {
              const d = new Date(order.createdAt);
              createdAtDate = isNaN(d.getTime()) ? null : d;
            } else if (order.createdAt instanceof Date) {
              createdAtDate = order.createdAt;
            }

            return {
              ...order,
              items: expandedItems,
              total: order.total ?? expandedItems.reduce((s: number, i: any) => s + (Number(i.price) || 0) * (i.quantity || 1), 0),
              createdAt: createdAtDate,
            };
          })
        );

        expandedOrders.sort((a, b) => {
          const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dbt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dbt - da;
        });

        setOrders(expandedOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersAndExpandItems();
  }, [user]);

  // Toast-based delete confirmation
  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteDoc(doc(db, "orders", orderId));
      setOrders((prev) => prev.filter((o) => o.id !== orderId));

      Toast.show({
        type: "success",
        text1: "Order deleted ✅",
        visibilityTime: 3000,
      });
    } catch (err) {
      console.error("Error deleting order:", err);
      Toast.show({
        type: "error",
        text1: "Failed to delete the order ❌",
        visibilityTime: 4000,
      });
    }
  };


  if (loading) {
    return (
      <SafeAreaView style={[t.flex1, t.justifyCenter, t.itemsCenter, t.bgWhite]}>
        <ActivityIndicator size="large" color="black" />
        <Text style={[t.textGray700, t.mT3]}>Loading your orders...</Text>
      </SafeAreaView>
    );
  }

  if (!orders.length) {
    return (
      <SafeAreaView style={[t.flex1, t.justifyCenter, t.itemsCenter, t.bgWhite]}>
        <Text style={[t.textGray700, t.textCenter]}>
          You don’t have any orders yet 🛍️
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/explore")}
          style={[t.bgBlack, t.roundedLg, t.pY3, t.pX6, t.mT6]}
        >
          <Text style={[t.textWhite, t.textBase, t.fontSemibold]}>Go Shopping</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <ProtectedRoute>
      <SafeAreaView style={[t.flex1, t.bgWhite]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[t.absolute, { top: 40, left: 20 }, t.z10, t.p2, t.bgWhite, t.roundedFull, t.shadow]}
        >
          <ArrowLeft size={22} color="black" />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={[t.p6, { paddingBottom: 80 }]} showsVerticalScrollIndicator={false}>
          <Text style={[t.text3xl, t.fontBold, t.textCenter, t.mB6]}>My Orders</Text>

          {orders.map((order) => (
            <TouchableOpacity
              key={order.id}
              onPress={() => router.push(`/order-details/${order.id}` as any)}
              style={[t.bgGray100, t.roundedLg, t.mB4, t.p4, t.flexRow, t.itemsCenter, t.shadow]}
            >
              <Image
                source={
                  order.items && order.items[0] && order.items[0].imageUrl
                    ? { uri: order.items[0].imageUrl }
                    : require("../assets/images/placeholder.jpg")
                }
                style={{ width: 80, height: 80, borderRadius: 10, marginRight: 12 }}
                resizeMode="cover"
              />

              <View style={[t.flex1]}>
                <Text style={[t.textLg, t.fontSemibold]} numberOfLines={1}>
                  {order.items && order.items[0] ? order.items[0].title : "Product"}
                </Text>

                <Text style={[t.textGray700, t.mT1]}>
                  ${order.items && order.items[0] ? (Number(order.items[0].price) || 0).toFixed(2) : (order.total ?? 0).toFixed(2)}
                </Text>

                <Text style={[t.mT1, { color: order.status === "Delivered" ? "green" : "#555" }]}>
                  Status: {order.status ?? "Pending"}
                </Text>

                <Text style={[t.mT1, t.textGray500]}>
                  Total: ${Number(order.total ?? 0).toFixed(2)}
                </Text>

                {order.createdAt && (
                  <Text style={[t.textXs, t.textGray500, t.mT1]}>
                    {new Date(order.createdAt).toLocaleString()}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                onPress={() => handleDeleteOrder(order.id)}
                style={{
                  padding: 8,
                  
                  borderRadius: 8,
                  alignSelf: "flex-start",
                  marginTop: 10,
                }}
              >
                
                <Trash2 size={20} color="red" />
                
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </ProtectedRoute>
  );
}

