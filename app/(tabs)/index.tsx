import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import { t } from "react-native-tailwindcss";
import { Link, useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/constants/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists() && userDoc.data().role === "admin") {
          setIsAdmin(true);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={[t.flex1, t.justifyCenter, t.itemsCenter, t.bgWhite]}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[t.flex1 ]} edges={["top"]}>
      <ImageBackground
        source={require("../../assets/images/africart-bg.jpg")} // ← Add your image here
        style={[t.flex1, t.justifyCenter, t.itemsCenter]}
        resizeMode="cover"
      >
        {/* Overlay for text visibility */}
        <View
          style={[
            t.absolute,
            t.inset0,
            { backgroundColor: "rgba(0, 0, 0, 0.5)" },
          ]}
        />

        {/* Content */}
        <View style={[t.z10, t.pX8, t.itemsCenter]}>
          <Text
            style={[
              t.text3xl,
              t.fontBold,
              t.mB4,
              t.textCenter,
              { color: "white", textShadowColor: "rgba(0,0,0,0.3)", textShadowRadius: 4 },
            ]}
          >
            Welcome to AfriCart
          </Text>

          <Text
            style={[
              t.textBase,
              t.textCenter,
              t.mB8,
              { color: "white", opacity: 0.9 },
            ]}
          >
            Discover authentic African art, jewelry, and handmade crafts from
            talented artisans across the continent.
          </Text>

          {user ? (
            <>
              <TouchableOpacity
                onPress={() => router.push("/explore")}
                style={[
                  t.bgGray500,
                  t.pY3,
                  t.pX6,
                  t.roundedLg,
                  t.mB4,
                  t.shadowMd,
                  t.flexRow,
                  t.itemsCenter,
                  t.justifyCenter,
                  t.opacity75
                ]}
              >
                <Text style={[t.textBlack, t.textLg, t.fontMedium]}>
                  Explore Products
                  
                </Text>
              </TouchableOpacity>


              {isAdmin && (
                <TouchableOpacity
                  onPress={() => router.push("/admin/manage-orders")}
                  style={[t.bgGreen600, t.pY3, t.pX6, t.roundedLg, t.mB4]}
                >
                  <Text style={[t.textWhite, t.textCenter]}>
                    Go to Admin Panel
                  </Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <Link href="/auth/login" asChild>
              <TouchableOpacity
                style={[t.bgWhite, t.pY3, t.pX6, t.roundedLg, t.shadowMd]}
              >
                <Text style={[t.textBlack, t.fontMedium]}>Get Started</Text>
              </TouchableOpacity>
            </Link>
          )}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}
