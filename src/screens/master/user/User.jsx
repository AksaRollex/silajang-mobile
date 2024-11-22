import { useNavigation } from "@react-navigation/native";
import { View, Colors} from "react-native-ui-lib"
import AccordionItem from "../../components/AccordionItem";
import { TextFooter } from "../../components/TextFooter";
import MaterialIcons from "react-native-vector-icons/MaterialIcons"; 

export default function User () {

const navigation = useNavigation()

    return (
        <View className="bg-[#ececec] w-full h-full">
            <AccordionItem
                title="Jabatan"
                right={props => <MaterialIcons {...props} name='arrow-forward-ios' size={12} color={Colors.grey} />}
                className="bg-white border-b-2 border-[#ececec] font-poppins-semibold"
                onPress={() => navigation.navigate("Jabatan")}
                />
            <AccordionItem
                title="User"
                right={props => <MaterialIcons {...props} name='arrow-forward-ios' size={12} color={Colors.grey} />}
                className="bg-white border-b-2 border-[#ececec] font-poppins-semibold"
                onPress={() => navigation.navigate("Users")}
            />
          <TextFooter/>
        </View>
    )
}