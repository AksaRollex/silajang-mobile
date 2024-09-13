import { useNavigation } from "@react-navigation/native"
import { View, Colors} from "react-native-ui-lib"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import AccordionItem from "../../components/AccordionItem"
import { TextFooter } from "../../components/TextFooter"

export default function Master () {

const navigation = useNavigation()

return (
    <View className="bg-[#ececec] w-full h-full">
      <AccordionItem 
        title="Metode"
        right={props => <MaterialIcons {...props} name='arrow-forward-ios' size={12} color={Colors.grey} />}
        className='bg-white border-b-2 border-[#ececec]'
        onPress={() => navigation.navigate("Metode")}
        />
      <AccordionItem 
        title="Peraturan"
        right={props => <MaterialIcons {...props} name='arrow-forward-ios' size={12} color={Colors.grey} />}
        className='bg-white border-b-2 border-[#ececec]'
        onPress={() => navigation.navigate("Peraturan")}
        />
      <AccordionItem 
        title="JasaPengambilan"
        right={props => <MaterialIcons {...props} name='arrow-forward-ios' size={12} color={Colors.grey} />}
        className='bg-white border-b-2 border-[#ececec]'
        onPress={() => navigation.navigate("JasaPengambilan")}
        />
      <AccordionItem 
        title="JenisSampel"
        right={props => <MaterialIcons {...props} name='arrow-forward-ios' size={12} color={Colors.grey} />}
        className='bg-white border-b-2 border-[#ececec]'
        onPress={() => navigation.navigate("JenisSampel")}
        />
      <AccordionItem 
        title="JenisWadah"
        right={props => <MaterialIcons {...props} name='arrow-forward-ios' size={12} color={Colors.grey} />}
        className='bg-white border-b-2 border-[#ececec]'
        onPress={() => navigation.navigate("JenisWadah")}
        />
      <AccordionItem 
        title="KodeRetribusi"
        right={props => <MaterialIcons {...props} name='arrow-forward-ios' size={12} color={Colors.grey} />}
        className='bg-white border-b-2 border-[#ececec]'
        onPress={() => navigation.navigate("KodeRetribusi")}
      />
      <AccordionItem 
        title="LiburCuti"
        right={props => <MaterialIcons {...props} name='arrow-forward-ios' size={12} color={Colors.grey} />}
        className='bg-white border-b-2 border-[#ececec]'
        onPress={() => navigation.navigate("LiburCuti")}
        />
      <AccordionItem 
        title="Paket"
        right={props => <MaterialIcons {...props} name='arrow-forward-ios' size={12} color={Colors.grey} />}
        className='bg-white border-b-2 border-[#ececec]'
        onPress={() => navigation.navigate("Paket")}
      />
      <AccordionItem 
        title="Parameter"
        right={props => <MaterialIcons {...props} name='arrow-forward-ios' size={12} color={Colors.grey} />}
        className='bg-white border-b-2 border-[#ececec]'
        onPress={() => navigation.navigate("Parameter")}
      />
      <AccordionItem 
        title="Pengawetan"
        right={props => <MaterialIcons {...props} name='arrow-forward-ios' size={12} color={Colors.grey} />}
        className='bg-white border-b-2 border-[#ececec]'
        onPress={() => navigation.navigate("Pengawetan")}
        />
      <AccordionItem 
        title="RadiusPengambilan"
        right={props => <MaterialIcons {...props} name='arrow-forward-ios' size={12} color={Colors.grey} />}
        className='bg-white border-b-2 border-[#ececec]'
        onPress={() => navigation.navigate("RadiusPengambilan")}
        />
        <TextFooter />
    </View>
 )
}
