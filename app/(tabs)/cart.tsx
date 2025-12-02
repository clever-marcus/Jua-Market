import { useRouter } from "expo-router";
import { collection, deleteDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { Minus, Plus, Trash2 } from "lucide-react-native";
import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { db } from "../../constants/firebaseConfig";
import { ThemeContext } from "../../context/ThemeContext";
import { useAuth } from "../../hooks/useAuth";

type CartItem = {
  id: string;
  productId: string;
  title: string;
  price: number;
  imageUrl: string;
  quantity: number;
};

export default function CartScreen() {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Theme Context
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark'

  // Defining my colors based on the current theme
  const colors = {
    background: isDark ? "#121212" : "#fff",
    cardBackground: isDark ? "#1f1f1f" : "#f9f9f9",
    text: isDark ? "#fff" : "#000",
    secondaryText: isDark ? "#ccc" : "#444",
    totalBorder: isDark ? "#333" : "#ddd",
    button: isDark ? "#696969" : "black", // Example: green button for dark mode
  };

  useEffect(() => {
    if (!user) return;

    const cartRef = collection(db, "carts", user.uid, "items");

    // 🔥 Realtime listener for live cart updates
    const unsubscribe = onSnapshot(
      cartRef,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          // Ensure that the structure matches CartItem type
          ...(doc.data() as Omit<CartItem, "id">),
        }));
        setCartItems(items);
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to cart:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleRemove = async (itemId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "carts", user.uid, "items", itemId));
      Toast.show({
        type: "info",
        text1: "Removed from Cart",
        text2: "Item successfully removed 🗑️",
      });
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (!user) return;
    if (newQuantity <= 0) {
      await handleRemove(itemId);
      return;
    }

    try {
      const itemRef = doc(db, "carts", user.uid, "items", itemId);
      await updateDoc(itemRef, { quantity: newQuantity });
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.text} />
        <Text>Loading your cart...</Text>
      </SafeAreaView>
    );
  }

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={{ 
        flex: 1, 
        justifyContent: "center", 
        alignItems: "center", 
        backgroundColor: colors.background,  
        }}>
        <Text style={{ color: colors.text }}>Your cart is empty 🛒</Text>
      </SafeAreaView>
    );
  }

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16, textAlign: "center", color: colors.text }}>
        Your Cart
      </Text>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
              backgroundColor: colors.cardBackground,
              borderRadius: 10,
              padding: 10,
            }}
          >
            {/* ✅ FIX: Conditional rendering with a fallback placeholder */}
            {typeof item.imageUrl === "string" && item.imageUrl.trim() !== "" ? (
              <Image
                source={{ uri: item.imageUrl }}
                style={{ width: 70, height: 70, borderRadius: 10 }}
              />
            ) : (
              <View 
                style={{ 
                  width: 70, 
                  height: 70, 
                  borderRadius: 10, 
                  backgroundColor: isDark ? "#333" : "#ccc", 
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 20 }}>🖼️</Text>
              </View>
            )}
            
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontWeight: "600", fontSize: 16, color: colors.text }}>{item.title}</Text>
              <Text style={{ color: colors.secondaryText }}>${item.price.toFixed(2)}</Text>

              {/* Quantity Control */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 8,
                  gap: 8,
                }}
              >
                <TouchableOpacity
                  style={{
                    backgroundColor: isDark ? "#333" : "#eee",
                    borderRadius: 8,
                    padding: 4,
                  }}
                  onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
                >
                  <Minus size={18} color={colors.text} />
                </TouchableOpacity>

                <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.text }}>
                  {item.quantity}
                </Text>

                <TouchableOpacity
                  style={{
                    backgroundColor: isDark ? "#333" : "#eee",
                    borderRadius: 8,
                    padding: 4,
                  }}
                  onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
                >
                  <Plus size={18} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity onPress={() => handleRemove(item.id)}>
              <Trash2 size={20} color="red" />
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Total + Checkout */}
      <View
        style={{
          position: "absolute",
          bottom: 20,
          left: 16,
          right: 16,
          borderTopWidth: 1,
          borderColor: colors.totalBorder,
          paddingTop: 12,
          backgroundColor: colors.background,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10, color: colors.text }}>
          Total: ${total.toFixed(2)}
        </Text>

        <TouchableOpacity
          onPress={() => router.push("/checkout")}
          style={{
            backgroundColor: colors.button,
            paddingVertical: 14,
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>
            Proceed to Checkout
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}