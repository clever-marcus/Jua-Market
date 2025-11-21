import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/constants/firebaseConfig";
import { t } from "react-native-tailwindcss";
import { AdminRoute } from "@/providers/AdminRoute";

export default function ManageOrders() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "orders"), (snapshot) => {
      const fetchedOrders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(fetchedOrders);
    });

    return () => unsub();
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });
      Alert.alert("Success ✅", `Order updated to "${newStatus}"`);
    } catch (error) {
      console.error("Error updating status:", error);
      Alert.alert("Error", "Failed to update order status");
    }
  };

  return (
    <AdminRoute>
      <SafeAreaView style={[t.flex1, t.bgWhite]}>
        <ScrollView contentContainerStyle={[t.p6]}>
          <Text style={[t.text2xl, t.fontBold, t.mB4]}>Manage Orders</Text>

          {orders.map((order) => (
            <View
              key={order.id}
              style={[
                t.p4,
                t.mB4,
                t.roundedLg,
                t.bgGray100,
                t.border,
                t.borderGray300,
              ]}
            >
              <Text style={[t.fontSemibold]}>Order ID: {order.id}</Text>
              <Text>Title: {order.title}</Text>
              <Text>Price: ${order.price}</Text>
              <Text>Status: {order.status}</Text>

              <View style={[t.mT3]}>
                <Text style={[t.textGray700, t.mB2]}>Update Status:</Text>
                <View
                  style={[
                    t.bgWhite,
                    t.roundedLg,
                    t.border,
                    t.borderGray300,
                    t.overflowHidden,
                  ]}
                >
                  <Picker
                    selectedValue={order.status}
                    onValueChange={(value) => updateStatus(order.id, value)}
                  >
                    <Picker.Item label="Pending" value="Pending" />
                    <Picker.Item label="Processing" value="Processing" />
                    <Picker.Item label="Shipped" value="Shipped" />
                    <Picker.Item label="Delivered" value="Delivered" />
                  </Picker>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </AdminRoute>
  );
}
