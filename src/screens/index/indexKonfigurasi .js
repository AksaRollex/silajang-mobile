import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from "react-native";
import React, { useState } from "react";
import { Colors } from "react-native-ui-lib";
import { useUser } from "@/src/services";
import { List } from 'react-native-paper';
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
      items: ['kota_dan_kabupaten','kecamatan','kelurahan']
    },
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
        {hasAccess('master') && (
          <>
            <View className=" mt-2 p-4 flex flex-row items-center ">
              {/* <FontAwesome6 name="computer" size={22} style={{ color: "black" }} /> */}
              <Text className="font-poppins-semibold text-black text-lg ml-2">Konfigurasi</Text>
            </View>
            
            {hasItemAccess('metode') && (
              <View>

              <List.Item
                
                style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
                title={<Text className="font-poppins-medium text-[15px]">Kota dan Kabupaten</Text>}
                left={() => (
                  <FontAwesome6 name="computer" size={18} style={{ color: "black", }} />
                )}
                right={props => (
                  <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.grey} />
                )}
                className="px-5 bg-[#f8f8f8] ml-3 mr-3"
                onPress={() => navigation.navigate("Kontrak")}
              />
              <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
            </View>
              
            )}
            {hasItemAccess('peraturan') && (
              <View>
              <List.Item
                title={<Text className="font-poppins-medium text-[15px]">Kecamatan</Text>}
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.grey} />}
                left={() => (
                  <FontAwesome6 name="computer" size={18} style={{ color: "black", }} />
                )}
                className='px-5 bg-[#f8f8f8] ml-3 mr-3'
                onPress={() => navigation.navigate("Persetujuan")}
              />
              <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
              </View>
            )}
            {hasItemAccess('parameter') && (
            <View>
              <List.Item
                title={<Text className="font-poppins-medium text-[15px]">Kelurahan</Text>}
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.grey} />}
                left={() => (
                  <FontAwesome6 name="computer" size={18} style={{ color: "black", }} />
                )}
                className='px-5 bg-[#f8f8f8] ml-3 mr-3'
                onPress={() => navigation.navigate("PengambilSample")}
              />
              <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
              </View>
            )}
            
          </>
        )}
        <TextFooter />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(13, 71, 161, 0.2)",
    justifyContent: "flex-start", // Ensure content starts from the top
  },
  contentContainer: {
    paddingBottom: 100, // Add padding to avoid content being hidden behind the buttons
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
    bottom: 0, // Position buttons at the bottom
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    marginBottom: 60,
    // backgroundColor: "rgba(255, 255, 255, 0.9)", // Optional: Semi-transparent background
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