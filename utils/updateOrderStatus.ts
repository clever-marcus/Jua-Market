import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/constants/firebaseConfig";

export const updateOrderStatus = async (orderId: string, newStatus: string) => {
  try {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, { status: newStatus });
    console.log("✅ Order status updated successfully!");
  } catch (error) {
    console.error("❌ Failed to update order status:", error);
    throw error;
  }
};
