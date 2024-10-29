import { useNavigation } from "@react-navigation/native";
import { View, Colors } from "react-native-ui-lib";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import AccordionItem from "../components/AccordionItem";
import { TextFooter } from "../components/TextFooter";
import { useUser } from "@/src/services";

export default function Konfigurasi() {
  const navigation = useNavigation();
  const { data: user } = useUser();

  // Define role access configurations
  const roleAccess = {
    admin: {
      items: ['log-tte', 'tanda-tangan', 'umpan-balik', 'tracking-pengujian']
    },
    'kepala-upt': {
      items: [ 'tracking-pengujian']
    },
    'koordinator-administrasi': {
      items: [ 'tracking-pengujian']
    },
    'koordinator-teknis': {
      items: ['tracking-pengujian']
    },
  };

  const userRoles = user?.roles?.map(role => role.name.toLowerCase()) || [];

  const hasItemAccess = (item) => {
    return userRoles.some(role => 
      roleAccess[role]?.items?.includes(item)
    );
  };

  const accordionItems = [
    {
      id: 'log-tte',
      title: 'Log TTE',
      route: 'LogTte'
    },
    {
      id: 'tanda-tangan',
      title: 'Tanda Tangan',
      route: 'TandaTangan'
    },
    {
      id: 'umpan-balik',
      title: 'Umpan Balik',
      route: 'UmpanBalik'
    },
    {
      id: 'tracking-pengujian',
      title: 'Tracking Pengujian',
      route: 'TrackingPengujian'
    }
  ];

  return (
    <View className="bg-[#ececec] w-full h-full">
      {accordionItems.map((item) => 
        hasItemAccess(item.id) && (
          <AccordionItem
            key={item.id}
            title={item.title}
            right={props => <MaterialIcons {...props} name='arrow-forward-ios' size={12} color={Colors.grey} />}
            className='bg-white border-b-2 border-[#ececec] font-poppins-semibold'
            onPress={() => navigation.navigate(item.route)}
          />
        )
      )}
      <TextFooter />
    </View>
  );
}