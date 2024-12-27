import React from "react";
import axios from "@/src/libs/axios";
import {
  View,
  ScrollView,
  StyleSheet,
  Text
} from "react-native";
import { Colors, Button } from "react-native-ui-lib";
import { useNavigation } from "@react-navigation/native";
import { List } from "react-native-paper";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import FontAwesome6Icon from "react-native-vector-icons/FontAwesome6";
import { TextFooter } from "../components/TextFooter";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useUser } from "@/src/services";

const Pembayaran = () => {
  const navigation = useNavigation();
  const { data: user } = useUser();

  const roleAccess = {
    admin: {
      items: ['pengujian', 'multi-payment', 'non-pengujian', 'global']
    },
    'kepala-upt': {
      items: ['pengujian', 'multi-payment', 'non-pengujian', 'global']
    },
    'koordinator-administrasi': {
      items: ['pengujian', 'non-pengujian', 'global']
    },
    'koordinator-teknis': {
      items: ['pengujian', 'non-pengujian', 'global']
    },
    'customer': {
      items: ['pengujian', 'non-pengujian', 'global']
    }
  };

  const userRoles = user?.roles?.map(role => role.name.toLowerCase()) || [];
  
  const hasItemAccess = (item) => {
    return userRoles.some(role =>
      roleAccess[role]?.items?.includes(item)
    );
  };

  const Pengujian = () => {
    navigation.navigate("Pengujian");
  };

  const NonPengujian = () => {
    navigation.navigate("NonPengujian");
  };

  const MultiPayment = () => {
    navigation.navigate("MultiPayment");
  };

  const Global = () => {
    navigation.navigate("Global");
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View className="p-4 flex flex-row items-center mt-2">
          <Text className="font-poppins-semibold ml-2 text-black text-lg">Pembayaran</Text>
        </View>

        {hasItemAccess('pengujian') && (
          <View>
            <List.Item
              style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
              title={<Text className="font-poppins-medium text-[15px]">Pengujian</Text>}
              left={() => (
                <View className="bg-green-600 rounded-full ml-3">
                  <Ionicons name="wallet" size={17} color={'white'} style={{padding: 5}}/>
                </View>
              )}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              className='bg-[#ffffff] border-black p-2 ml-3 mr-3'
              onPress={Pengujian}
            />
            <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
          </View>
        )}

        {hasItemAccess('multi-payment') && (
          <View>
            <List.Item
              title={<Text className="font-poppins-medium text-[15px]">Multi Payment</Text>}
              left={() => (
                <View className="bg-green-600 rounded-full ml-3">
                  <MaterialCommunityIcons name="credit-card-multiple" size={17} color={'white'} style={{padding: 5}}/>
                </View>
              )}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              className='bg-[#ffffff] border-black p-2 ml-3 mr-3'
              onPress={MultiPayment}
            />
            <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
          </View>
        )}

        {hasItemAccess('non-pengujian') && (
          <View>
            <List.Item
              title={<Text className="font-poppins-medium text-[15px]">Non Pengujian</Text>}
              left={() => (
                <View className="bg-green-600 rounded-full ml-3">
                  <Ionicons name="card" size={17} color={'white'} style={{padding: 5}}/>
                </View>
              )}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              className='bg-[#ffffff] border-black p-2 ml-3 mr-3'
              onPress={NonPengujian}
            />
            <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
          </View>
        )}

        {hasItemAccess('global') && (
          <View>
            <List.Item
              style={{ borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}
              title={<Text className="font-poppins-medium text-[15px]">Global</Text>}
              left={() => (
                <View className="bg-green-600 rounded-full ml-3">
                  <Ionicons name="globe" size={17} color={'white'} style={{padding: 5}}/>
                </View>
              )}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              className='bg-[#ffffff] border-black p-2 ml-3 mr-3'
              onPress={Global}
            />
            <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
          </View>
        )}

        <View className="mt-[97%]">
          <TextFooter/>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
});

export default Pembayaran;