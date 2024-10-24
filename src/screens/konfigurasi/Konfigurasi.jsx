import { useNavigation } from "@react-navigation/native"
import { View, Colors} from "react-native-ui-lib"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import AccordionItem from "../components/AccordionItem"
import { TextFooter } from "../components/TextFooter" 

export default function Pengujian () {

const navigation = useNavigation()

return (
    <View className="bg-[#ececec] w-full h-full">
      <AccordionItem 
        title="Log TTE"
        right={props => <MaterialIcons {...props} name='arrow-forward-ios' size={12} color={Colors.grey} />}
        className='bg-white border-b-2 border-[#ececec] font-poppins-semibold'
        onPress={() => navigation.navigate("LogTte")}
        />
        <AccordionItem
        title="Tanda Tangan"
        right={props => <MaterialIcons {...props} name='arrow-forward-ios' size={12} color={Colors.grey} />}
        className='bg-white border-b-2 border-[#ececec] font-poppins-semibold'
        onPress={() => navigation.navigate("TandaTangan")}
        />
        <AccordionItem
        title="Umpan Balik"
        right={props => <MaterialIcons {...props} name='arrow-forward-ios' size={12} color={Colors.grey} />}
        className='bg-white border-b-2 border-[#ececec] font-poppins-semibold'
        onPress={() => navigation.navigate("UmpanBalik")}
        />
        <AccordionItem
        title="Tracking Pengujian"
        right={props => <MaterialIcons {...props} name='arrow-forward-ios' size={12} color={Colors.grey} />}
        className='bg-white border-b-2 border-[#ececec] font-poppins-semibold'
        onPress={() => navigation.navigate("TrackingPengujian")}
        />
        <TextFooter />
    </View>
 )
}
