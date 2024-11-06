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
import Permohonan from "./Permohonan";
import TrackingPengujian from "./TrackingPengujian";

export default function Pengujian() {
  const navigation = useNavigation();
  const [activeComponent, setActiveComponent] = useState(null);
  const { data: user } = useUser();

  const roleAccess = {
    admin: {
      sections: ['administrasi', 'verifikasi', 'report'],
      items: ['kontrak', 'persetujuan', 'pengambil-sampel', 'penerima-sampel',
        'analis', 'koordinator-teknis', 'cetak-lhu', 'verifikasi-lhu',
        'laporan-hasil', 'kendali-mutu', 'registrasi-sampel', 'rekap-data', 'rekap-parameter']
    },
    'kepala-upt': {
      sections: ['verifikasi', 'report'],
      items: ['analis', 'koordinator-teknis',
        'laporan-hasil', 'kendali-mutu', 'registrasi-sampel', 'rekap-data', 'rekap-parameter']
    },
    'pengambil-sample': {
      sections: ['administrasi',],
      items: ['pengambil-sampel']
    },
    analis: {
      sections: ['verifikasi',],
      items: ['analis']
    },
    'koordinator-administrasi': {
      sections: ['administrasi', 'verifikasi', 'report'],
      items: ['persetujuan', 'penerima-sampel',
        'analis', 'cetak-lhu',
        'laporan-hasil', 'registrasi-sampel', 'rekap-parameter']
    },
    'koordinator-teknis': {
      sections: ['verifikasi', 'report'],
      items: ['analis', 'koordinator-teknis', 'cetak-lhu', 'verifikasi-lhu',
        'laporan-hasil', 'kendali-mutu', 'registrasi-sampel', 'rekap-data', 'rekap-parameter']
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
        {hasAccess('administrasi') && (
          <>
            <View className=" mt-2 p-4 flex flex-row items-center ">
              {/* <FontAwesome6 name="computer" size={22} style={{ color: "black" }} /> */}
              <Text className="font-poppins-semibold text-black text-lg ml-2">Administrasi</Text>
            </View>
            
            {hasItemAccess('kontrak') && (
              <View>

                <List.Item
                  
                  style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
                  title={<Text className="font-poppins-medium text-[15px]">Kontrak</Text>}
                  left={() => (
                    <View className="bg-blue-600 rounded-full">
                      <Ionicons name="document-text" size={17} color={'white'} style={{padding: 5}}/>
                    </View>
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
            {hasItemAccess('persetujuan') && (
              <View>
              <List.Item
                title={<Text className="font-poppins-medium text-[15px]">Persetujuan</Text>}
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.grey} />}
                left={() => (
                  <View className="bg-green-600 rounded-full">
                  <Ionicons name="checkmark-done" size={17} color={'white'} style={{padding: 5}}/>
                </View>
                )}
                className='px-5 bg-[#f8f8f8] ml-3 mr-3'
                onPress={() => navigation.navigate("Persetujuan")}
              />
              <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
              </View>
            )}
            {hasItemAccess('pengambil-sampel') && (
            <View>
              <List.Item
                title={<Text className="font-poppins-medium text-[15px]">Pengambil Sampel</Text>}
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.grey} />}
                left={() => (
                  <View className="bg-indigo-600 rounded-full">
                  <Ionicons name="people" size={17} color={'white'} style={{padding: 5}}/>
                </View>
                )}
                className='px-5 bg-[#f8f8f8] ml-3 mr-3'
                onPress={() => navigation.navigate("PengambilSample")}
              />
              <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
              </View>
            )}
            {hasItemAccess('penerima-sampel') && (
              <List.Item
                style={{ borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}
                title={<Text className="font-poppins-medium text-[15px]">Penerima Sampel</Text>}
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.grey} />}
                left={() => (
                  <View className="bg-cyan-600 rounded-full">
                  <Ionicons name="person" size={17} color={'white'} style={{padding: 5}}/>
                </View>
                )}
                className='px-5 bg-[#f8f8f8] ml-3 mr-3'
                onPress={() => navigation.navigate("IndexPenerima")}
              />
            )}
          </>
        )}
  
        {hasAccess('verifikasi') && (
          <>
            <View className=" p-4 flex flex-row items-center mt-1">
              {/* <Ionicons name="shield-checkmark" size={22} style={{ color: "black" }} /> */}
              <Text className="font-poppins-semibold ml-2 text-black text-lg">Verifikasi</Text>
            </View>
            
            {hasItemAccess('analis') && (
              <View>
              <List.Item
              style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
                title={<Text className="font-poppins-medium text-[15px]">Analis</Text>}
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.grey} />}
                left={() => (
                  <View className="bg-yellow-400 rounded-full">
                  <Ionicons name="analytics" size={17} color={'white'} style={{padding: 5}}/>
                </View>
                )}
                className='px-5 bg-[#f8f8f8] ml-3 mr-3'
                onPress={() => navigation.navigate("Analis")}
              />
              <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
              </View>
            )}
            {hasItemAccess('koordinator-teknis') && (
              <View>
              <List.Item
                title={<Text className="font-poppins-medium text-[15px]">Koordinator Teknis</Text>}
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.grey} />}
                left={() => (
                  <View className="bg-red-600 rounded-full">
                  <Ionicons name="settings" size={17} color={'white'} style={{padding: 5}}/>
                </View>
                )}
                className='px-5 bg-[#f8f8f8] ml-3 mr-3'
                onPress={() => navigation.navigate("Kortek")}
              />
              <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
              </View>
            )}
            {hasItemAccess('cetak-lhu') && (
              <View>
              <List.Item
                title={<Text className="font-poppins-medium text-[15px]">Cetak LHU</Text>}
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.grey} />}
                left={() => (
                  <View className="bg-sky-600 rounded-full">
                  <Ionicons name="print" size={17} color={'white'} style={{padding: 5}}/>
                </View>
                )}
                className='px-5 bg-[#f8f8f8] ml-3 mr-3'
                onPress={() => navigation.navigate("CetakLHU")}
              />
              <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
              </View>
            )}
            {hasItemAccess('verifikasi-lhu') && (
              <List.Item
              style={{ borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}
                title={<Text className="font-poppins-medium text-[15px]">Verifikasi LHU</Text>}
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.grey} />}
                left={() => (
                  <View className="bg-amber-600 rounded-full">
                  <Ionicons name="shield-checkmark" size={17} color={'white'} style={{padding: 5}}/>
                </View>
                )}
                className='px-5 bg-[#f8f8f8] ml-3 mr-3'
                onPress={() => navigation.navigate("VerifikasiLhu")}
              />
            )}
          </>
        )}
  
        {hasAccess('report') && (
          <>
            <View className=" p-4 flex flex-row items-center mt-1">
              {/* <Ionicons name="document-text" size={22} style={{ color: "black" }}/> */}
              <Text className="font-poppins-semibold ml-2 text-black text-lg">Report</Text>
            </View>
            
            {hasItemAccess('laporan-hasil') && (
              <View>
              <List.Item
              style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
                title={<Text className="font-poppins-medium text-[15px]">Laporan Hasil Pengujian</Text>}
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.grey} />}
                left={() => (
                  <View className="bg-rose-600 rounded-full">
                  <Ionicons name="newspaper" size={17} color={'white'} style={{padding: 5}}/>
                </View>
                )}
                className='px-5 bg-[#f8f8f8] ml-3 mr-3'
                onPress={() => navigation.navigate("LaporanHasilPengujian")}
              />
              <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
              </View>
            )}
            {hasItemAccess('kendali-mutu') && (
              <View>
              <List.Item
                title={<Text className="font-poppins-medium text-[15px]">Kendali Mutu</Text>}
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.grey} />}
                left={() => (
                  <View className="bg-lime-600 rounded-full">
                  <Ionicons name="create" size={17} color={'white'} style={{padding: 5}}/>
                </View>
                )}
                className='px-5 bg-[#f8f8f8] ml-3 mr-3'
              />
              <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
              </View>
            )}
            {hasItemAccess('registrasi-sampel') && (
              <View>
              <List.Item
                title={<Text className="font-poppins-medium text-[15px]">Registrasi Sampel</Text>}
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.grey} />}
                left={() => (
                  <View className="bg-teal-600 rounded-full">
                  <Ionicons name="list" size={17} color={'white'} style={{padding: 5}}/>
                </View>
                )}
                className='px-5 bg-[#f8f8f8] ml-3 mr-3'
                onPress={() => navigation.navigate("RegistrasiSampel")}
              />
              <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
              </View>
            )}
            {hasItemAccess('rekap-data') && (
              <View>
              <List.Item
                title={<Text className="font-poppins-medium text-[15px]">Rekap Data</Text>}
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.grey} />}
                left={() => (
                  <View className="bg-fuchsia-500 rounded-full">
                  <Ionicons name="reader" size={17} color={'white'} style={{padding: 5}}/>
                </View>
                )}
                className='px-5 bg-[#f8f8f8] ml-3 mr-3'
                onPress={() => navigation.navigate("RekapData")}
              />
              <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
              </View>
            )}
            {hasItemAccess('rekap-parameter') && (
              <List.Item
              style={{ borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}
                title={<Text className="font-poppins-medium text-[15px]">Rekap Parameter</Text>}
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.grey} />}
                left={() => (
                  <View className="bg-emerald-500 rounded-full">
                  <Ionicons name="filter" size={17} color={'white'} style={{padding: 5}}/>
                </View>
                )}
                className='px-5 bg-[#f8f8f8] ml-3 mr-3'
              />
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