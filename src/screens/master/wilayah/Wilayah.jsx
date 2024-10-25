import { useNavigation } from "@react-navigation/native";
import { View, Colors } from "react-native-ui-lib";
import AccordionItem from "../../components/AccordionItem";
import { TextFooter } from "../../components/TextFooter";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

export default function Wilayah() {

const navigation = useNavigation()

    return (
        <View className="bg-[#ececec] w-full h-full">
            <AccordionItem
                title="Kota dan Kabupaten"
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} Color={Colors.grey}/>}
                className="bg-white border-b-2 border-[#ececec] font-poppins-semibold"
                onPress={() => navigation.navigate("KotaKab")}
            />
            <AccordionItem
                title="Kecamatan"
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} Color={Colors.grey}/>}
                className="bg-white border-b-2 border-[#ececec] font-poppins-semibold"
                onPress={() => navigation.navigate("Kecamatan")}
                />
            <AccordionItem
                title="Kelurahan"
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} Color={Colors.grey}/>}
                className="bg-white border-b-2 border-[#ececec] font-poppins-semibold"
                onPress={() => navigation.navigate("Kelurahan")}
                />
            <TextFooter />
        </View>
    )
}
