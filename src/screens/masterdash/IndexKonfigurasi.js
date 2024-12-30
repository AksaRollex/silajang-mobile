import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from "react-native";
import React, { useState } from "react";
import { Colors } from "react-native-ui-lib";
import { useUser } from "@/src/services";
import { List } from 'react-native-paper';
import BackButton from "../components/BackButton";
import { useNavigation } from '@react-navigation/native';
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import { TextFooter } from "../components/TextFooter";
import Permohonan from "../pengujian/Permohonan";
import TrackingPengujian from "../pengujian/TrackingPengujian";
export default function IndexKonfigurasi() {
  const navigation = useNavigation();
  const [activeComponent, setActiveComponent] = useState(null);
  const { data: user } = useUser();

  const roleAccess = {
    admin: {
      sections: ['konfigurasi'],
      items: ['log-tte', 'tanda-tangan', 'umpan-balik', 'tracking-pengujian', 'denda']
    },
    'kepala-upt': {
      sections: ['konfigurasi'],
      items: ['tracking-pengujian']
    },
    'koordinator-administrasi': {
      sections: ['konfigurasi'],
      items: ['tracking-pengujian']
    },
    'koordinator-teknis': {
      sections: ['konfigurasi'],
      items: ['tracking-pengujian']
    },
  };
  const getVisibleMenuItems = () => {
    const allItems = ['denda', 'log-tte', 'tanda-tangan', 'umpan-balik', 'tracking-pengujian'];
    return allItems.filter(item => hasItemAccess(item));
  };

  const getItemStyle = (item) => {
    const visibleItems = getVisibleMenuItems();
    const isFirst = visibleItems[0] === item;
    const isLast = visibleItems[visibleItems.length - 1] === item;

    return {
      borderTopLeftRadius: isFirst ? 10 : 0,
      borderTopRightRadius: isFirst ? 10 : 0,
      borderBottomLeftRadius: isLast ? 10 : 0,
      borderBottomRightRadius: isLast ? 10 : 0,
    };
  };

  const shouldShowBorder = (item) => {
    const visibleItems = getVisibleMenuItems();
    return visibleItems.indexOf(item) !== visibleItems.length - 1;
  };

  const userRoles = user?.roles?.map(role => role.name.toLowerCase()) || [];
  const hasAccess = (section) => {
    return userRoles.some(role =>
      roleAccess[role]?.sections?.includes(section)
    );
  };
  const hasItemAccess = (item) => {
    return userRoles.some(role =>
      roleAccess[role]?.items?.includes(item)
    );
  };

  // Check if user is only a customer
  const isCustomerOnly = () => {
    return userRoles.length === 1 && userRoles[0] === 'customer';
  };
  let RenderedComponent;
  switch (activeComponent) {
    case "Permohonan":
      RenderedComponent = <Permohonan />;
      break;
    case "Tracking Pengujian":
      RenderedComponent = <TrackingPengujian />;
      break;
    default:
      RenderedComponent = null;
      break;
  }

  // Customer view
  if (user?.role?.name?.toLowerCase() === 'customer') {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logo}
            />
            <Text style={styles.headerText}>SI - LAJANG</Text>
          </View>
          <View style={styles.activeComponentContainer}>{RenderedComponent}</View>
        </ScrollView>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setActiveComponent("Permohonan")}>
            <Text style={styles.buttonText}>Permohonan</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setActiveComponent("Tracking Pengujian")}>
            <Text style={styles.buttonText}>Tracking Pengujian</Text>
          </TouchableOpacity>
        </View>
        <TextFooter />
      </View>
    );
  }

  return (
    <View className="bg-[#ececec] flex-1 flex-start">
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {hasAccess('konfigurasi') && (
          <>
            <View className="flex-row items-center space-x-2 mt-5 bg-white p-2 ml-3 mr-3 rounded-xl py-2.5">
              <BackButton action={() => navigation.goBack()} size={26} className="ml-2" />

              <View className="w-px h-full bg-gray-200 " />

              <View className="flex-1 items-center mr-11">
                <Text className="text-[18px] text-black font-poppins-semibold">
                  Menu Konfigurasi
                </Text>
              </View>
            </View>


            <View className=" mt-2 p-4 flex flex-row items-center ">
              {/* <FontAwesome6 name="computer" size={22} style={{ color: "black" }} /> */}
              <Text className="font-poppins-semibold text-black text-lg ml-2">Konfigurasi</Text>
            </View>

            {hasItemAccess('denda') && (
              <View>
                <List.Item
                  style={getItemStyle('denda')}
                  title={<Text className="font-poppins-medium text-[15px]">Denda</Text>}
                  left={() => (
                    <View className="bg-rose-600 rounded-full">
                      <Ionicons name="receipt" size={17} color={'white'} style={{ padding: 5 }} />
                    </View>
                  )}
                  right={props => (
                    <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.black} />
                  )}
                  className="px-5 bg-[#ffffff] ml-3 mr-3"
                  onPress={() => navigation.navigate("Denda")}
                />
                {shouldShowBorder('denda') && (
                  <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
                )}
              </View>
            )}


            {hasItemAccess('log-tte') && (
              <View>
                <List.Item
                  style={getItemStyle('log-tte')}
                  title={<Text className="font-poppins-medium text-[15px]">Log TTE</Text>}
                  left={() => (
                    <View className="bg-blue-600 rounded-full">
                      <Ionicons name="document-text" size={17} color={'white'} style={{ padding: 5 }} />
                    </View>
                  )}
                  right={props => (
                    <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.black} />
                  )}
                  className="px-5 bg-[#ffffff] ml-3 mr-3"
                  onPress={() => navigation.navigate("LogTte")}
                />
                {shouldShowBorder('log-tte') && (
                  <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
                )}              
                </View>

            )}
            {hasItemAccess('tanda-tangan') && (
              <View>
                <List.Item
                  style={getItemStyle('tanda-tangan')}
                  title={<Text className="font-poppins-medium text-[15px]">Tanda Tangan</Text>}
                  right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.black} />}
                  left={() => (
                    <View className="bg-orange-600 rounded-full">
                      <Ionicons name="create" size={17} color={'white'} style={{ padding: 5 }} />
                    </View>
                  )}
                  className='px-5 bg-[#ffffff] ml-3 mr-3'
                  onPress={() => navigation.navigate("TandaTangan")}
                />
                {shouldShowBorder('tanda-tangan') && (
                  <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
                )}
              </View>
            )}
            {hasItemAccess('umpan-balik') && (
              <View>
                <List.Item
                  style={getItemStyle('umpan-balik')}
                  title={<Text className="font-poppins-medium text-[15px]">Umpan Balik</Text>}
                  right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.black} />}
                  left={() => (
                    <View className="bg-green-600 rounded-full">
                      <Ionicons name="chatbubble-ellipses" size={17} color={'white'} style={{ padding: 5 }} />
                    </View>
                  )}
                  className='px-5 bg-[#ffffff] ml-3 mr-3'
                  onPress={() => navigation.navigate("UmpanBalik")}
                />
                {shouldShowBorder('umpan-balik') && (
                  <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
                )}           
               </View>
            )}

            {hasItemAccess('tracking-pengujian') && (
              <View>
                <List.Item
                  style={getItemStyle('tracking-pengujian')}
                  title={<Text className="font-poppins-medium text-[15px]">Tracking Pengujian</Text>}
                  right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.black} />}
                  left={() => (
                    <View className="bg-purple-600 rounded-full">
                      <Ionicons name="analytics" size={17} color={'white'} style={{ padding: 5 }} />
                    </View>
                  )}
                  className='px-5 bg-[#ffffff] ml-3 mr-3'
                  onPress={() => navigation.navigate("TrackingPengujian")}
                />
                {shouldShowBorder('tracking-pengujian') && (
                  <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
                )}            
                  </View>
            )}

          </>
        )}
        <View className="mt-[80%]">
          <TextFooter />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(13, 71, 161, 0.2)",
    justifyContent: "flex-start",
  },
  headerContainer: {
    width: "100%",
    paddingVertical: 10,
    backgroundColor: Colors.brand,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    elevation: 4,
  },
  logo: {
    width: 40,
    height: 40,
    marginTop: 8,
  },
  headerText: {
    fontSize: 22,
    color: "white",
    fontWeight: "bold",
    marginLeft: 10,
    alignSelf: "center",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    marginBottom: 60,
  },
  button: {
    paddingVertical: 10,
    width: 190,
    borderRadius: 10,
    margin: 10,
    borderWidth: 1,
    borderColor: "rgba(13, 71, 161, 0.2)",
    backgroundColor: "#6b7fde",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    alignSelf: "center",
    fontWeight: "bold",
  },
  activeComponentContainer: {
    flex: 1,
    width: "100%",
  },
});