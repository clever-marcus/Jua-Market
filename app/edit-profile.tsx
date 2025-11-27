import { auth, db, storage } from "@/constants/firebaseConfig";
import * as ImagePicker from "expo-image-picker";
import { updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore"; // Added getDoc
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useEffect, useState } from "react"; // Added useEffect
import { ActivityIndicator, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { SlideInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { t } from "react-native-tailwindcss";
import Toast from "react-native-toast-message";

export default function EditProfile() {
  const [loading, setLoading] = useState(true); // New state for loading data
  const [avatar, setAvatar] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  // --- Data Fetching Logic (Fixes Firestore Permission Error) ---
  useEffect(() => {
    const fetchProfile = async () => {
      // 🛑 CRITICAL CHECK: Only attempt to read Firestore if the user is authenticated.
      if (auth.currentUser) {
        try {
          const userRef = doc(db, "users", auth.currentUser.uid);
          const userSnap = await getDoc(userRef);
          const authData = auth.currentUser;

          if (userSnap.exists()) {
            const data = userSnap.data();
            // Populate state with existing data from Firestore or Auth
            setFullName(data.fullName || authData.displayName || "");
            setUsername(data.username || "");
            setPhone(data.phone || "");
            setAvatar(data.photoURL || authData.photoURL || null);
          } else {
            // Fallback for brand new users
            setFullName(authData.displayName || "");
            setAvatar(authData.photoURL || null);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          // The error will still be logged if rules are wrong, but this prevents a crash
        } finally {
          setLoading(false);
        }
      } else {
        // If auth is not ready, we still need to stop loading
        setLoading(false);
      }
    };

    fetchProfile();
  }, []); // Run once on mount

  // --- Image Picker and Upload Logic (Refactored from previous steps) ---
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      aspect: [1, 1],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (avatarUri: string) => {
    let blob;
    let downloadURL = null;

    try {
      // 1. Fetch the image and convert it to a Blob
      const response = await fetch(avatarUri);
      blob = await response.blob();

      // 2. Create storage reference
      const filename = avatarUri.substring(avatarUri.lastIndexOf("/") + 1);
      const storageRef = ref(storage, `avatars/${auth.currentUser?.uid}/${filename}`);

      // 3. Upload the Blob
      const uploadResult = await uploadBytes(storageRef, blob);

      // 4. Get the download URL
      downloadURL = await getDownloadURL(uploadResult.ref);

      Toast.show({ type: "success", text1: "Photo Uploaded", visibilityTime: 3000 });

      return downloadURL;

    } catch (err) {
      console.error("Upload Error:", err);
      throw new Error("Failed to upload image.");

    } finally {
      // 5. CRUCIAL: Close the blob to free up memory (TypeScript bypass)
      if (blob) {
        (blob as any).close && (blob as any).close();
      }
    }
  };

  // --- Save Changes Logic ---
  const handleSaveChanges = async () => {
    if (!auth.currentUser || saving) return;

    try {
      setSaving(true);

      let photoURL = avatar;

      // Upload new avatar if a local file is selected
      if (avatar && avatar.startsWith("file://")) {
        photoURL = await uploadAvatar(avatar);
        setAvatar(photoURL);
      }

      // 1. Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName: fullName, // Using fullName as the primary display name
        photoURL: photoURL || null,
      });

      // 2. Update Firestore user document
      const userRef = doc(db, "users", auth.currentUser.uid);

      await updateDoc(userRef, {
        username: username,
        fullName: fullName,
        phone: phone,
        photoURL: photoURL || null,
      });

      Toast.show({
        type: "success",
        text1: "🔥 Profile Updated",
        text2: "Your changes are saved!",
        visibilityTime: 3000,
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      Toast.show({
        type: "error",
        text1: "Couldn't update profile.",
        text2: (error as Error).message || "Try Again!",
        visibilityTime: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  // --- Custom Input Component for TikTok-style list ---
  const EditField = ({ label, value, onChangeText, placeholder, keyboardType = 'default' }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    keyboardType?: 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad';
  }) => (
    <View style={[t.wFull, t.pY3, t.borderB, t.borderGray200, t.flexRow, t.itemsCenter]}>
      <Text style={[t.w1_4, t.textSm, t.textBlack]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        placeholderTextColor="#9CA3AF"
        style={[t.flex1, t.textRight, t.textBlack, t.textBase]}
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[t.flex1, t.bgWhite, t.justifyCenter, t.itemsCenter]}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={[t.mT4, t.textGray500]}>Loading Profile...</Text>
      </SafeAreaView>
    );
  }

  // --- Main Render (TikTok Style) ---
  return (
    <SafeAreaView style={[t.flex1, t.bgWhite]}>
      <ScrollView
        contentContainerStyle={[t.itemsCenter, t.pT4, t.pB32]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card Section (Mimicking TikTok) */}
        <View style={[t.itemsCenter, t.mB6, t.pX6]}>
          <TouchableOpacity onPress={pickImage} style={[t.itemsCenter]}>
            {/* Avatar */}
            <View style={[
              { width: 100, height: 100, borderRadius: 9999, overflow: "hidden" },
              t.border4,
              t.borderWhite,
              t.shadowLg,
              t.justifyCenter, t.itemsCenter,
            ]}>
              {avatar ? (
                <Image
                  source={{ uri: avatar }}
                  style={{ width: 90, height: 90 }}
                  resizeMode="cover"
                />
              ) : (
                <View style={[t.bgGray200, t.justifyCenter, t.itemsCenter, { width: 90, height: 90, borderRadius: 9999 }]}>
                  <Text style={[t.textGray600, t.textXs]}>Add Photo</Text>
                </View>
              )}
            </View>
            {/* FLOATING + ICON */}
            <View
              style={[
              t.absolute,
              t.bgBlack,
              t.justifyCenter,
              t.itemsCenter,
              t.shadowLg,
              // Positioning: Right on the edge, small white border
              { bottom: 3, right: 3, width: 26, height: 26, borderRadius: 9999, borderWidth: 2 },
              ]}
            >
              <Text style={{ color: "white", fontSize: 18, marginTop: -1 }}>+</Text>
            </View>

          </TouchableOpacity>
        </View>


        {/* Input List Group (The actual edit fields) */}
        <View style={[t.wFull, t.pX6, t.mB8]}>
            <Text style={[t.textGray500, t.textXs, t.mB2]}>Profile Settings</Text>

            <View style={[t.borderT, t.borderGray200]}>
                {/* Full Name / Display Name */}
                <EditField
                    label="Name"
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="User Display Name"
                />

                {/* Username */}
                <EditField
                    label="Username"
                    value={username}
                    onChangeText={setUsername}
                    placeholder="unique_username"
                />

                {/* Phone */}
                <EditField
                    label="Phone"
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="07XXX"
                    keyboardType="phone-pad"
                />
                
                {/* Placeholder for Bio */}
                <View style={[t.wFull, t.pY3, t.flexRow, t.itemsCenter]}>
                    <Text style={[t.w1_4, t.textSm, t.textBlack]}>Bio</Text>
                    <Text style={[t.flex1, t.textRight, t.textGray500, t.textBase]}>
                        Tap to add bio...
                    </Text>
                </View>
            </View>
        </View>
      </ScrollView>

      {/* Save Button (Fixed at Bottom) */}
      <Animated.View
        entering={SlideInUp}
        style={[
          t.wFull,
          t.absolute,
          { bottom: 0 }, // Positioned right at the bottom edge
          t.p4,
          t.bgWhite,
          t.borderT,
          t.borderGray200,
        ]}
      >
        <TouchableOpacity
          style={[
            t.bgBlack,
            t.roundedLg,
            t.pY3,
            t.wFull,
            t.justifyCenter,
            t.itemsCenter,
            t.shadowLg,
            {bottom: 40},
            saving && t.opacity50,
          ]}
          disabled={saving}
          onPress={handleSaveChanges}
        >
          <Text style={[t.textWhite, t.fontSemibold, t.textLg]}>
            {saving ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}