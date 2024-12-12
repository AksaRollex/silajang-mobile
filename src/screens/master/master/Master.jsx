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
        className='bg-[#ffffff] border-b-2 border-[#ffffff] font-poppins-semibold'
        onPress={() => navigation.navigate("Metode")}
        />
      <AccordionItem 
        title="Peraturan"
        right={props => <MaterialIcons {...props} name='arrow-forward-ios' size={12} color={Colors.grey} />}
        className='bg-[#ffffff] border-b-2 border-[#ffffff] font-poppins-semibold'
        onPress={() => navigation.navigate("Peraturan")}
        />
        <AccordionItem 
          title="Parameter"
          right={props => <MaterialIcons {...props} name='arrow-forward-ios' size={12} color={Colors.grey} />}
          className='bg-[#ffffff] border-b-2 border-[#ffffff] font-poppins-semibold'
          onPress={() => navigation.navigate("Parameter")}
        />
        <AccordionItem 
          title="Paket"
          right={props => <MaterialIcons {...props} name='arrow-forward-ios' size={12} color={Colors.grey} />}
          className='bg-[#ffffff] border-b-2 border-[#ffffff] font-poppins-semibold'
          onPress={() => navigation.navigate("Paket")}
        />
        <AccordionItem 
          title="Pengawetan"
          right={props => <MaterialIcons {...props} name='arrow-forward-ios' size={12} color={Colors.grey} />}
          className='bg-[#ffffff] border-b-2 border-[#ffffff] font-poppins-semibold'
          onPress={() => navigation.navigate("Pengawetan")}
          />
        <AccordionItem 
          title="Jenis Sampel"
          right={props => <MaterialIcons {...props} name='arrow-forward-ios' size={12} color={Colors.grey} />}
          className='bg-[#ffffff] border-b-2 border-[#ffffff] font-poppins-semibold'
          onPress={() => navigation.navigate("JenisSampel")}
          />
        <AccordionItem 
          title="Jenis Wadah"
          right={props => <MaterialIcons {...props} name='arrow-forward-ios' size={12} color={Colors.grey} />}
          className='bg-[#ffffff] border-b-2 border-[#ffffff] font-poppins-semibold'
          onPress={() => navigation.navigate("JenisWadah")}
          />
      <AccordionItem 
        title="Jasa Pengambilan"
        right={props => <MaterialIcons {...props} name='arrow-forward-ios' size={12} color={Colors.grey} />}
        className='bg-[#ffffff] border-b-2 border-[#ffffff] font-poppins-semibold'
        onPress={() => navigation.navigate("JasaPengambilan")}
        />
        <AccordionItem 
          title="Radius Pengambilan"
          right={props => <MaterialIcons {...props} name='arrow-forward-ios' size={12} color={Colors.grey} />}
          className='bg-[#ffffff] border-b-2 border-[#ffffff] font-poppins-semibold'
          onPress={() => navigation.navigate("RadiusPengambilan")}
          />
      <AccordionItem 
        title="Libur Cuti"
        right={props => <MaterialIcons {...props} name='arrow-forward-ios' size={12} color={Colors.grey} />}
        className='bg-[#ffffff] border-b-2 border-[#ffffff] font-poppins-semibold'
        onPress={() => navigation.navigate("LiburCuti")}
        />
      <AccordionItem 
        title="Kode Retribusi"
        right={props => <MaterialIcons {...props} name='arrow-forward-ios' size={12} color={Colors.grey} />}
        className='bg-[#ffffff] border-b-2 border-[#ffffff] font-poppins-semibold'
        onPress={() => navigation.navigate("KodeRetribusi")}
      />
        <TextFooter />
    </View>
 )
}
