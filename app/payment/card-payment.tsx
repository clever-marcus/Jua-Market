// app/card-payment.tsx
import { db } from "@/constants/firebaseConfig"; // Assuming you export db from this path
import { useStripe } from "@stripe/stripe-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, updateDoc } from "firebase/firestore"; // Import Firestore functions
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Button, Text, View } from "react-native";

export default function CardPayment() {
  const router = useRouter();
  const { clientSecret, orderId } = useLocalSearchParams();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(true);

  const updateOrderStatus = async (status: string) => {
    if (orderId) {
        const orderRef = doc(db, "orders", orderId as string);
        await updateDoc(orderRef, { status: status, paymentCompletedAt: new Date().toISOString() });
    }
  };



  useEffect(() => {
    // We only initialize if we have the secret
    if (clientSecret) {
      initializePaymentSheet();
    } else {
      Alert.alert("Error", "Payment details missing.");
      router.back();
    }
  }, [clientSecret]);

  const initializePaymentSheet = async () => {
    setLoading(true);
    try {
      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret as string,
        merchantDisplayName: "Jua Market", // Display your app/store name
        allowsDelayedPaymentMethods: true,
      });
  
      if (error) {
        Alert.alert("Payment Setup Error", error.message);
        router.back();
        return; // stop execution if there's an error
      }

      await openPaymentSheet(); // if setup is successful, automatically present the sheet.
    } catch (e) {
        console.error("Initialization failed:", e);
        Alert.alert("Initialization Failed", "Could not set up card payment interface.");
        router.back();
    } finally {
       // setLoading(false);
    }
  };

  const openPaymentSheet = async () => {
    const { error } = await presentPaymentSheet();

    if (error) {
      Alert.alert("Payment Failed", error.message);
      await updateOrderStatus("PaymentFailed");
      router.back();
    } else {
      Alert.alert("Success", "Payment complete!");
      await updateOrderStatus("Completed");
      // Navigate to a success page
      router.replace('/payment/order-success'); 
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="black" />
        <Text style={{ marginTop: 10 }}>Setting up card payment...</Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ marginBottom: 20, fontSize: 16 }}>
          Order ID: #{orderId}
      </Text>
      <Button 
        title="Continue to Card Payment" 
        onPress={openPaymentSheet} 
      />
    </View>
  );
}