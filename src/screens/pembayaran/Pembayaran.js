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

const Pembayaran = () => {
  const navigation = useNavigation();

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

      <View className=" p-4 flex flex-row items-center mt-2">
        {/* <Ionicons name="document-text" size={22} style={{ color: "black" }}/> */}
        <Text className="font-poppins-semibold ml-2 text-black text-lg">Pembayaran</Text>
      </View>
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

        <View>
          <List.Item
          style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
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
    // alignItems: "center",
    // backgroundColor: "#f1f5f9",
    justifyContent: "flex-start", // Ensure content starts from the top
  },
 
  scrollViewContent: {
    flexGrow: 1, // Ensures that ScrollView content is scrollable
    paddingBottom: 100, // Add padding to avoid content being hidden behind the buttons
  },
});

export default Pembayaran
