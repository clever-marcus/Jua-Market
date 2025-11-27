import { useRouter } from "expo-router";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Mail,
  MessageSquare,
  Phone,
} from "lucide-react-native";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { t } from "react-native-tailwindcss";

// Prop interface for reusable collapsible items
interface CollapsibleItemProps {
  title: string;
  content: string;
  icon?: React.ReactNode;
}

// Reusable Collapsible Item (FAQ / Accordion)
const CollapsibleItem: React.FC<CollapsibleItemProps> = ({ title, content, icon }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <View style={[t.mB3]}>
      {/* Header */}
      <TouchableOpacity
        style={[
          t.flexRow,
          t.itemsCenter,
          t.justifyBetween,
          t.p3,
          t.bgGray100,
          t.roundedLg,
        ]}
        onPress={toggleDropdown}
        activeOpacity={0.7}
      >
        {/* Left side: Icon + Title */}
        <View style={[t.flexRow, t.itemsCenter, t.flex1]}>
          {icon && <View style={[t.mR3]}>{icon}</View>}
          <Text style={[t.fontSemibold]}>{title}</Text>
        </View>

        {/* Right side: Chevron */}
        {isOpen ? (
          <ChevronUp size={20} color="black" />
        ) : (
          <ChevronDown size={20} color="black" />
        )}
      </TouchableOpacity>

      {/* Expanded Content */}
      {isOpen && (
        <View
          style={[
            t.pX3,
            t.pY3,
            t.bgGray500,
            t.borderX,
            t.borderB,
            t.borderGray200,
            t.roundedBLg,
            t.roundedBrLg,
          ]}
        >
          <Text style={[t.textGray700]}>{content}</Text>
        </View>
      )}
    </View>
  );
};

// Main Help Screen
export default function Help() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView style={[t.flex1, t.bgWhite]}>
      {/* Back Button – now perfectly aligned with safe area */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          position: "absolute",
          left: 16,
          top: insets.top + 7,   // 16px from the safe area top
          zIndex: 50,
          padding: 8,
          backgroundColor: "transparent",
          borderRadius: 99,
          borderWidth: 0,
          elevation: 5,
        }}
        activeOpacity={0.7}
      >
        <ArrowLeft size={28} color="#374151" />
      </TouchableOpacity>

      {/* Main Content – starts right after the safe area */}
      <ScrollView
        contentContainerStyle={[t.pX5, t.pT2, t.pB5]}  // pt20 gives breathing room below back button
        showsVerticalScrollIndicator={false}
      >
        {/* Title – now perfectly aligned horizontally with back button */}
        <Text style={[t.text3xl, t.fontBold, t.mT8, t.mB3]}>
          Customer Support
        </Text>
        <Text style={[t.textGray600, t.textCenter, t.mB10]}>
          How can we help you today? Browse the options below.
        </Text>

        <View style={[t.hPx, t.wFull, t.bgGray300, t.mY8]} />

        {/* Contact Options */}
        <View style={[t.mB10]}>
          <Text style={[t.textLg, t.fontSemibold, t.mB5]}>Contact Us</Text>

          <TouchableOpacity style={[t.flexRow, t.itemsCenter, t.p4, t.roundedLg, t.bgGray100, t.mB3]}>
            <Phone size={24} color="#1f2937" />
            <Text style={[t.mL4, t.textBase, t.fontMedium]}>Call Support</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[t.flexRow, t.itemsCenter, t.p4, t.roundedLg, t.bgGray100, t.mB3]}>
            <Mail size={24} color="#1f2937" />
            <Text style={[t.mL4, t.textBase, t.fontMedium]}>Email Support</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[t.flexRow, t.itemsCenter, t.p4, t.roundedLg, t.bgGray100]}>
            <MessageSquare size={24} color="#1f2937" />
            <Text style={[t.mL4, t.textBase, t.fontMedium]}>Live Chat (coming soon)</Text>
          </TouchableOpacity>
        </View>

        <View style={[t.hPx, t.wFull, t.bgGray300, t.mY8]} />

        {/* FAQ Section */}
        <View>
          <Text style={[t.textLg, t.fontSemibold, t.mB5]}>
            Frequently Asked Questions
          </Text>

          <CollapsibleItem
            title="How do I track my order?"
            content="You can track your order by navigating to the 'My Orders' section in your account. The tracking link and estimated delivery time will be available once the order has been shipped."
          />
          <CollapsibleItem
            title="Can I return an item?"
            content="Yes, we offer a 30-day return policy for most items. The item must be unused, in its original packaging, and in the same condition that you received it. Please initiate the return from the 'Order History' page."
          />
          <CollapsibleItem
            title="How do I change my password?"
            content="To change your password, go to 'Account Settings' → 'Change Password'. Enter your current password and then your new one twice for confirmation."
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}