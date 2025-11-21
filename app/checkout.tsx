import { db } from "@/constants/firebaseConfig";
import { ProtectedRoute } from "@/providers/ProtectedRoute";
import { useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";
import { ArrowLeft, ChevronDown } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CountryPicker, { CountryCode } from 'react-native-country-picker-modal';
import { SafeAreaView } from "react-native-safe-area-context";
import { t } from "react-native-tailwindcss";
import Toast from "react-native-toast-message";




type CartItem = {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  quantity: number;
};

export type Address = {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  phone: string;
};

export type PaymentMethod = "visa" | "mpesa";

/* ---------------------------
   Small local components
   --------------------------- */

const AddressCard: React.FC<{
  address: Address;
  selected: boolean;
  onSelect: (a: Address) => void;
  onEdit: (a: Address) => void;
  onDelete: (id: string) => void;
}> = ({ address, selected, onSelect, onEdit, onDelete }) => {
  return (
    <TouchableOpacity
      onPress={() => onSelect(address)}
      style={[
        t.p4,
        t.mB4,
        t.roundedLg,
        t.shadow,
        selected ? t.border2 : t.border,
        selected ? t.borderBlue500 : t.borderGray300,
        t.bgWhite,
      ]}
    >
      <Text style={[t.fontBold]}>{address.name}</Text>
      <Text>{address.address}</Text>
      <Text>{address.city}, {address.country}</Text>
      <Text>{address.phone}</Text>

      <View style={[t.flexRow, t.mT2]}>
        <TouchableOpacity onPress={() => onEdit(address)} style={[t.mR4]}>
          <Text style={[t.textBlue500]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(address.id)}>
          <Text style={[t.textGray600]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const PaymentSelector: React.FC<{
  selected: PaymentMethod;
  onSelect: (m: PaymentMethod) => void;
}> = ({ selected, onSelect }) => {
  return (
    <View style={[t.flexRow, t.mB4]}>
      {(["visa", "mpesa"] as PaymentMethod[]).map((method) => (
        <TouchableOpacity
          key={method}
          onPress={() => onSelect(method)}
          style={[
            t.flex1,
            t.p4,
            t.mR2,
            t.roundedLg,
            selected === method ? t.bgBlack : t.bgGray200,
          ]}
        >
          <Text style={[selected === method ? t.textWhite : t.textBlack, t.textCenter]}>
            {method.toUpperCase()}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

/* ---------------------------
   Address form modal
   --------------------------- */

const AddressFormModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSave: (addr: Omit<Address, "id">, maybeId?: string) => Promise<void>;
  initial?: Address | null;
}> = ({ visible, onClose, onSave, initial = null }) => {
  const [name, setName] = useState(initial?.name || "");
  const [address, setAddress] = useState(initial?.address || "");
  const [city, setCity] = useState(initial?.city || "");
  const [country, setCountry] = useState(initial?.country || "");
  const [phone, setPhone] = useState(initial?.phone || "");
  const [saving, setSaving] = useState(false);
  const [displayCountryCode, setDisplayCountryCode] = useState<CountryCode>('US');
  const [showPicker, setShowPicker] = useState(false);

  

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setAddress(initial.address);
      setCity(initial.city);
      setCountry(initial.country);
      setPhone(initial.phone);
    } else {
      setName("");
      setAddress("");
      setCity("");
      setCountry("");
      setDisplayCountryCode('US');
      setPhone("");
    }
  }, [initial, visible]);

  const handleSave = async () => {
    if (!name || !address || !city || !country || !phone) {
      Alert.alert("Missing fields", "Please fill all fields");
      return;
    }
    setSaving(true);
    try {
      await onSave({ name, address, city, country, phone }, initial?.id);
      onClose();
    } catch (err) {
      console.error("Error saving address:", err);
      Alert.alert("Error", "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={[t.flex1, t.justifyEnd]}>
        <View style={[t.bgWhite, t.p6, t.roundedTl, { maxHeight: "90%" }]}>
          <Text style={[t.textXl, t.fontBold, t.mB4]}>{initial ? "Edit Address" : "Add Address"}</Text>

          <ScrollView>
            <Text style={[t.mB1]}>Name</Text>
            <TextInput value={name} onChangeText={setName} style={[t.border, t.p2, t.mB3, t.rounded]} />

            <Text style={[t.mB1]}>Address</Text>
            <TextInput value={address} onChangeText={setAddress} style={[t.border, t.p2, t.mB3, t.rounded]} />

            <Text style={[t.mB1]}>City</Text>
            <TextInput value={city} onChangeText={setCity} style={[t.border, t.p2, t.mB3, t.rounded]} />

            <Text style={[t.mB1]}>Country</Text>
            {/* --Country Picker Component */}
            <TouchableOpacity
            onPress={() => setShowPicker(true)}
            style={[t.border, t.p2, t.mB3, t.rounded, t.flexRow, t.itemsCenter, t.justifyBetween]}
            >
              <View style={[t.flexRow, t.itemsCenter]}>
              {/* Display the selected flag and country name */}
              <CountryPicker 
                countryCode={displayCountryCode}
                withFlag
                visible={false} // Hidden main picker
                renderFlagButton={() => null}
              />
              <Text style={[t.mL2, country ? {} : t.textGray500]}>
                {country || 'Select Country'}
              </Text>
              </View>
              <ChevronDown size={20} color={country ? "black" : "gray"}/>
            </TouchableOpacity>

            <CountryPicker
              withFilter
              withFlag
              withCallingCode={false}
              onSelect={(selectedCountry) => {
                setDisplayCountryCode(selectedCountry.cca2);
                const countryName = typeof selectedCountry.name === 'string'
                 ? selectedCountry.name
                 : selectedCountry.name.common;

                setCountry(countryName);
                setShowPicker(false);
              }}
              countryCode={displayCountryCode}
              visible={showPicker} // Controls the modal visibility
              onClose={() => setShowPicker(false)}
              // The trigger for this modal is the TouchableOpacity above.
              // We explicitly tell this picker not to render its own button here.
              renderFlagButton={() => null}
              containerButtonStyle={{ height: 0 }}
            />
            {/* --- End Country Picker Component --- */}
           
            <Text style={[t.mB1]}>Phone</Text>
            <TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={[t.border, t.p2, t.mB3, t.rounded]} />
          </ScrollView>

          <View style={[t.flexRow, t.mT4]}>
            <TouchableOpacity onPress={onClose} style={[t.flex1, t.pY3, t.roundedLg, t.mR2, t.bgGray200]}>
              <Text style={[t.textCenter]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={[t.flex1, t.pY3, t.roundedLg, t.bgBlack, t.itemsCenter]}>
              {saving ? <ActivityIndicator color="white" /> : <Text style={[t.textWhite]}>Save</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

/* ---------------------------
   CheckoutPage (main)
   --------------------------- */

export default function CheckoutPage() {
  const router = useRouter();
  const auth = getAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("visa");
  const [loading, setLoading] = useState(true);
  const [mpesaPhone, setMpesaPhone] = useState("");

  // modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  
  
  const fetchCartAndAddresses = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      // cart
      const cartSnap = await getDocs(collection(db, "carts", user.uid, "items"));
      const items = cartSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CartItem, "id">) }));
      setCartItems(items);

      // addresses
      const addrSnap = await getDocs(collection(db, "users", user.uid, "addresses"));
      const saved = addrSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Address, "id">) }));
      setAddresses(saved);
      if (saved.length > 0) {
        // if previously selected address still exists, keep it, else pick first.
        const stillExists = saved.find((a) => a.id === selectedAddress?.id);
        setSelectedAddress(stillExists ?? saved[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // load once on mount
    fetchCartAndAddresses();
  }, []);

  const handleSaveAddress = async (addr: Omit<Address, "id">, maybeId?: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not logged in");

    if (maybeId) {
      // update
      const addressRef = doc(db, "users", user.uid, "addresses", maybeId);
      await updateDoc(addressRef, { ...addr, updatedAt: serverTimestamp() });
    } else {
      // create
      await addDoc(collection(db, "users", user.uid, "addresses"), { ...addr, createdAt: serverTimestamp() });
    }

    // refetch
    await fetchCartAndAddresses();
  };

  const handleDeleteAddress = async (id: string) => {
    const user = auth.currentUser;
    if (!user) return;
    Alert.alert("Delete", "Delete this address?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "users", user.uid, "addresses", id));
            await fetchCartAndAddresses();
            if (selectedAddress?.id === id) setSelectedAddress(null);
          } catch (err) {
            console.error("Delete failed", err);
          }
        },
      },
    ]);
  };

  

  const handleMpesa = async (orderId: string, amount: number) => {
    if (!mpesaPhone) return alert("Enter MPesa phone number.");

    try {
      // 1. Make the request
      const res = await fetch("https://e3d248888bcb.ngrok-free.app/mpesa/stkpush", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true" // Crucial for free ngrok
        },
        body: JSON.stringify({
          orderId,
          phone: mpesaPhone,
          amount,
        }),
      });

    // 2. Get the data safely
    const textData = await res.text();
    let data;
    try {
      data = JSON.parse(textData);
    } catch (jsonError) {
      console.log("Raw non-JSON response:", textData);
      throw new Error("Server returned an error (not JSON). Check terminal.");
    }

    console.log("Mpesa Response:", data);

    // 3. CHECK FOR SAFARICOM SUCCESS CODE ("0")
    // Your backend sends raw Safaricom data, so we check ResponseCode, not data.ok
    if (res.ok && data.ResponseCode === "0") {
      Toast.show({
        type: "info",
        text1: "Payment Request Sent",
        text2: `Check your phone (${mpesaPhone}) to enter PIN.`,
        visibilityTime: 6000,
      });
      
    } else {
      // Show the specific error from Safaricom or your Backend
      const errorMsg = data.CustomerMessage || data.ResponseDescription || data.message || "Unknown Error";
      alert("MPesa Error: " + errorMsg);
    }

  } catch (e: any) {
    // 4. SHOW THE REAL ERROR IN THE ALERT
    console.error("Payment Exception:", e);
    alert("Payment failed: " + e.message);
  }
};

const handleStripe = async (orderId: string, amount: number) => {
  try {
    const res = await fetch("https://e3d248888bcb.ngrok-free.app/stripe/create-intent", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true"
      },
      body: JSON.stringify({ orderId, amount }),
    });
    const data = await res.json();

    if (!data.clientSecret) {
      Toast.show({
        type: "error",
        text1: "Stripe Error ❌ ",
        text2: "Could not start card payment.",
        visibilityTime: 4000,
      });
      return;
    }

    router.push({
      pathname: "/payment/card-payment",
      params: {
        clientSecret: data.clientSecret,
        orderId: orderId
      }
    } as any);


  } catch (err) {
    console.log(err);
    alert("Payment failed.");
  }
};


  const handleConfirmOrder = async () => {
    const user = auth.currentUser;
    if (!user) return alert("Please log in.");
    if (cartItems.length === 0) return alert("Your cart is empty.");
    if (!selectedAddress) return alert("Please select an address.");

    //👀 1. Save order first (pending)
    const totalAmount = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    let orderRef = await addDoc(collection(db, "orders"), {
      userId: user.uid,
      items: cartItems,
      total: totalAmount,
      shippingAddress: selectedAddress,
      paymentMethod,
      status: "PendingPayment",
      createdAt: serverTimestamp(),
    });

    //👀 2. Trigger payment based on method
    if (paymentMethod === "mpesa") return handleMpesa(orderRef.id, totalAmount);
    if (paymentMethod === "visa") return handleStripe(orderRef.id, totalAmount);
  };


  if (loading) {
    return (
      <SafeAreaView style={[t.flex1, t.justifyCenter, t.itemsCenter, t.bgWhite]}>
        <ActivityIndicator size="large" color="black" />
        <Text style={[t.textGray700, t.mT3]}>Loading your checkout...</Text>
      </SafeAreaView>
    );
  }

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={[t.flex1, t.justifyCenter, t.itemsCenter, t.bgWhite]}>
        <Text style={[t.textGray700]}>Your cart is empty 🛒</Text>
      </SafeAreaView>
    );
  }

  

  return (
    <ProtectedRoute>
      <SafeAreaView style={[t.flex1, t.bgWhite]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[t.absolute, { top: 40, left: 20 }, t.z10, t.p2, t.bgTransparent, t.roundedFull, t.shadow]}
        >
          <ArrowLeft size={22} color="black" />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={[t.p6, { paddingBottom: 140 }]} showsVerticalScrollIndicator={false}>
          <Text style={[t.text3xl, t.fontBold, t.mB6, t.textCenter]}>Checkout 🛒</Text>

          {/* Cart Items */}
          {cartItems.map((item) => (
            <View
              key={item.id}
              style={[t.flexRow, t.itemsCenter, t.justifyBetween, t.mB4, t.bgGray100, t.roundedLg, t.p3]}
            >
              <Image source={{ uri: item.imageUrl }} style={{ width: 60, height: 60, borderRadius: 8 }} />
              <View style={[t.flex1, t.mL3]}>
                <Text style={[t.fontSemibold, t.textBase]}>{item.title}</Text>
                <Text style={[t.textGray600]}>{item.quantity} × ${item.price.toFixed(2)}</Text>
              </View>
              <Text style={[t.fontBold]}>${(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}

          {/* Addresses */}
          <View style={[t.mT6]}>
            <Text style={[t.textGray700, t.mB2, t.textBase]}>Shipping Address</Text>

            {addresses.length === 0 && <Text style={[t.mB4]}>No saved addresses. Add one below.</Text>}

            {addresses.map((addr) => (
              <View key={addr.id}>
                <AddressCard
                  address={addr}
                  selected={selectedAddress?.id === addr.id}
                  onSelect={(a) => setSelectedAddress(a)}
                  onEdit={(a) => {
                    setEditingAddress(a);
                    setModalVisible(true);
                  }}
                  onDelete={handleDeleteAddress}
                />
                
              </View>
            ))}

            <TouchableOpacity
              style={[t.bgGreen500, t.pY2, t.pX4, t.roundedLg, t.itemsCenter]}
              onPress={() => {
                setEditingAddress(null);
                setModalVisible(true);
              }}
            >
              <Text style={[t.textWhite, t.textCenter]}>Add New Address</Text>
            </TouchableOpacity>

            {/* Delivery Estimate */}
            {selectedAddress && (
              <Text style={[t.mT2, t.textGray600]}>Estimated delivery: 3–5 business days 🚚</Text>
            )}
          </View>

          {/* Payment Method */}
          <View style={[t.mT6]}>
            <Text style={[t.textGray700, t.mB2]}>Payment Method</Text>
            <PaymentSelector selected={paymentMethod} onSelect={setPaymentMethod} />

            {/* optional: show extra input when mpesa selected */}
            {paymentMethod === "mpesa" && (
              <View style={[t.mT2]}>
                <Text style={[t.textGray700, t.mB1]}>MPesa Phone Number</Text>
                  <TextInput
                    keyboardType="phone-pad"
                    placeholder="2547XXXXXXXX"
                    value={mpesaPhone}
                    onChangeText={setMpesaPhone}
                    style={[t.border, t.rounded, t.p2]}
                  />
              </View>
            )}

            {/* Visa extra info */}
            {paymentMethod === "visa" && (
              <View>
                
                <Text style={[t.textGray600]}>
                  Card payment will open securely after confirming your order.
                </Text>
              </View>
            )}
          </View>

          {/* Total */}
          <View style={[t.mT8, t.borderT, t.borderGray300, t.pT4]}>
            <Text style={[t.textXl, t.fontBold]}>
              Total: ${cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
            </Text>
          </View>
        </ScrollView>

        {/* Confirm Button */}
        <View style={[t.absolute, { bottom: 40 }, t.left0, t.right0, t.itemsCenter]}>
          <TouchableOpacity
            style={[t.bgBlack, t.roundedLg, t.pY3, t.w11_12, t.justifyCenter, t.itemsCenter, t.shadow]}
            onPress={handleConfirmOrder}
          >
            <Text style={[t.textWhite, t.textLg, t.fontSemibold]}>Confirm Order</Text>
          </TouchableOpacity>
        </View>

        {/* Address Modal */}
        <AddressFormModal
          visible={modalVisible}
          initial={editingAddress}
          onClose={() => {
            setModalVisible(false);
            setEditingAddress(null);
          }}
          onSave={async (addr, maybeId) => {
            await handleSaveAddress(addr, maybeId);
          }}
        />
      </SafeAreaView>
    </ProtectedRoute>
  );
}
