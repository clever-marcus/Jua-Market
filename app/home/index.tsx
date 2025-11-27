import { ScrollView, Text, View, TouchableOpacity, Image } from "react-native";
import { t } from "react-native-tailwindcss"

const dummyProducts = [
  { id: "1", title: "Beaded Bracelet", price: 25, image: "https://via.placeholder.com/150" },
  { id: "2", title: "Kitenge Tote Bag", price: 45, image: "https://via.placeholder.com/150" },
];

export default function HomeScreen() {
    return (
        <ScrollView style={[t.flex1, t.bgWhite, t.p4]}>
            <Text style={[t.text2xl, t.fontBold, t.mB3]}>Explore African Crafts</Text>
            <View style={[t.flexRow, t.flexWrap, t.justifyBetween]}>
                {dummyProducts.map((item) => (
                    <TouchableOpacity key={item.id} style={[t.w1_2, t.p2]}>
                        <Image source={{ uri: item.image }} style={[t.h40, t.wFull, t.roundedLg]} />
                        <Text style={[t.textLg, t.fontSemibold, t.mT2]}>{item.title}</Text>
                        <Text style={[t.textGray600]}>${item.price}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    )
}