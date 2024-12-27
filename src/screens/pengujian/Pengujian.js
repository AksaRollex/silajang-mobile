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
      items: ['analis', 'koordinator-teknis', 'cetak-lhu',
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

  const getVisibleMenuItems = (section) => {
    const items = {
      'administrasi': ['kontrak', 'persetujuan', 'pengambil-sampel', 'penerima-sampel'],
      'verifikasi': ['analis', 'koordinator-teknis', 'cetak-lhu', 'verifikasi-lhu'],
      'report': ['laporan-hasil', 'kendali-mutu', 'registrasi-sampel', 'rekap-data', 'rekap-parameter']
    };

    return items[section]?.filter(item => hasItemAccess(item)) || [];
  };

  const getItemStyle = (section, item) => {
    const visibleItems = getVisibleMenuItems(section);
    const isFirst = visibleItems[0] === item;
    const isLast = visibleItems[visibleItems.length - 1] === item;

    return {
      borderTopLeftRadius: isFirst ? 10 : 0,
      borderTopRightRadius: isFirst ? 10 : 0,
      borderBottomLeftRadius: isLast ? 10 : 0,
      borderBottomRightRadius: isLast ? 10 : 0,
    };
  };

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
                    <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.black} />
                  )}
                  className="px-5 bg-[#ffffff] ml-3 mr-3"
                  onPress={() => navigation.navigate("Kontrak")}
                />
                {getVisibleMenuItems('administrasi').indexOf('kontrak') !== getVisibleMenuItems('administrasi').length - 1 && (
                  <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
                )}
              </View>
              
            )}
            {hasItemAccess('persetujuan') && (
              <View>
              <List.Item
                style={getItemStyle('administrasi', 'persetujuan')}
                title={<Text className="font-poppins-medium text-[15px]">Persetujuan</Text>}
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.black} />}
                left={() => (
                  <View className="bg-green-600 rounded-full">
                  <Ionicons name="checkmark-done" size={17} color={'white'} style={{padding: 5}}/>
                </View>
                )}
                className='px-5 bg-[#ffffff] ml-3 mr-3'
                onPress={() => navigation.navigate("Persetujuan")}
              />
                {getVisibleMenuItems('administrasi').indexOf('persetujuan') !== getVisibleMenuItems('administrasi').length - 1 && (
                  <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
                )}
              </View>
            )}
            {hasItemAccess('pengambil-sampel') && (
            <View>
              <List.Item
                style={getItemStyle('administrasi', 'pengambil-sampel')}
                title={<Text className="font-poppins-medium text-[15px]">Pengambil Sampel</Text>}
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.black} />}
                left={() => (
                  <View className="bg-indigo-600 rounded-full">
                  <Ionicons name="people" size={17} color={'white'} style={{padding: 5}}/>
                </View>
                )}
                className='px-5 bg-[#ffffff] ml-3 mr-3'
                onPress={() => navigation.navigate("PengambilSample")}
              />
                {getVisibleMenuItems('administrasi').indexOf('pengambil-sampel') !== getVisibleMenuItems('administrasi').length - 1 && (
                  <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
                )}
              </View>
            )}
            {hasItemAccess('penerima-sampel') && (
              <View>
                <List.Item
                  style={getItemStyle('administrasi', 'penerima-sampel')}
                  title={<Text className="font-poppins-medium text-[15px]">Penerima Sampel</Text>}
                  left={() => (
                    <View className="bg-cyan-600 rounded-full">
                      <Ionicons name="person" size={17} color={'white'} style={{padding: 5}}/>
                    </View>
                  )}
                  right={props => (
                    <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.black} />
                  )}
                  className="px-5 bg-[#ffffff] ml-3 mr-3"
                  onPress={() => navigation.navigate("IndexPenerima")}
                />
                {getVisibleMenuItems('administrasi').indexOf('penerima-sampel') !== getVisibleMenuItems('administrasi').length - 1 && (
                  <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
                )}
              </View>
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
                style={getItemStyle('verifikasi', 'analis')}
                title={<Text className="font-poppins-medium text-[15px]">Analis</Text>}
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.black} />}
                left={() => (
                  <View className="bg-yellow-400 rounded-full">
                  <Ionicons name="analytics" size={17} color={'white'} style={{padding: 5}}/>
                </View>
                )}
                className='px-5 bg-[#ffffff] ml-3 mr-3'
                onPress={() => navigation.navigate("Analis")}
              />
                {getVisibleMenuItems('verifikasi').indexOf('analis') !== getVisibleMenuItems('verifikasi').length - 1 && (
                  <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
                )}
              </View>
            )}
            {hasItemAccess('koordinator-teknis') && (
              <View>
              <List.Item
                style={getItemStyle('verifikasi', 'koordinator-teknis')}
                title={<Text className="font-poppins-medium text-[15px]">Koordinator Teknis</Text>}
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.black} />}
                left={() => (
                  <View className="bg-red-600 rounded-full">
                  <Ionicons name="settings" size={17} color={'white'} style={{padding: 5}}/>
                </View>
                )}
                className='px-5 bg-[#ffffff] ml-3 mr-3'
                onPress={() => navigation.navigate("Kortek")}
              />
              {getVisibleMenuItems('verifikasi').indexOf('koordinator-teknis') !== getVisibleMenuItems('verifikasi').length - 1 && (
                  <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
                )}
              </View>
            )}
            {hasItemAccess('cetak-lhu') && (
              <View>
              <List.Item
                style={getItemStyle('verifikasi', 'cetak-lhu')}
                title={<Text className="font-poppins-medium text-[15px]">Cetak LHU</Text>}
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.black} />}
                left={() => (
                  <View className="bg-sky-600 rounded-full">
                  <Ionicons name="print" size={17} color={'white'} style={{padding: 5}}/>
                </View>
                )}
                className='px-5 bg-[#ffffff] ml-3 mr-3'
                onPress={() => navigation.navigate("CetakLHU")}
              />
                {getVisibleMenuItems('verifikasi').indexOf('cetak-lhu') !== getVisibleMenuItems('verifikasi').length - 1 && (
                  <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
                )}
              </View>
            )}
             {hasItemAccess('verifikasi-lhu') && (
              <View>
                <List.Item
                  style={getItemStyle('verifikasi', 'verifikasi-lhu')}
                  title={<Text className="font-poppins-medium text-[15px]">Verifikasi LHU</Text>}
                  left={() => (
                    <View className="bg-amber-600 rounded-full">
                      <Ionicons name="shield-checkmark" size={17} color={'white'} style={{padding: 5}}/>
                    </View>
                  )}
                  right={props => (
                    <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.black} />
                  )}
                  className="px-5 bg-[#ffffff] ml-3 mr-3"
                  onPress={() => navigation.navigate("VerifikasiLHU")}
                />
                {getVisibleMenuItems('verifikasi').indexOf('verifikasi-lhu') !== getVisibleMenuItems('verifikasi').length - 1 && (
                  <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
                )}
              </View>
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
                style={getItemStyle('report', 'laporan-hasil')}
                title={<Text className="font-poppins-medium text-[15px]">Laporan Hasil Pengujian</Text>}
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.black} />}
                left={() => (
                  <View className="bg-rose-600 rounded-full">
                  <Ionicons name="newspaper" size={17} color={'white'} style={{padding: 5}}/>
                </View>
                )}
                className='px-5 bg-[#ffffff] ml-3 mr-3'
                onPress={() => navigation.navigate("LaporanHasilPengujian")}
              />
                {getVisibleMenuItems('report').indexOf('laporan-hasil') !== getVisibleMenuItems('report').length - 1 && (
                  <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
                )}
              </View>
            )}
            {hasItemAccess('kendali-mutu') && (
              <View>
              <List.Item
                style={getItemStyle('report', 'kendali-mutu')}
                title={<Text className="font-poppins-medium text-[15px]">Kendali Mutu</Text>}
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.black} />}
                left={() => (
                  <View className="bg-lime-600 rounded-full">
                  <Ionicons name="create" size={17} color={'white'} style={{padding: 5}}/>
                </View>
                )}
                className='px-5 bg-[#ffffff] ml-3 mr-3'
                onPress={() => navigation.navigate("KendaliMutu")}
              />
                 {getVisibleMenuItems('report').indexOf('kendali-mutu') !== getVisibleMenuItems('report').length - 1 && (
                  <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
                )}
              </View>
            )}
            {hasItemAccess('registrasi-sampel') && (
              <View>
              <List.Item
                style={getItemStyle('report', 'registrasi-sampel')}
                title={<Text className="font-poppins-medium text-[15px]">Registrasi Sampel</Text>}
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.black} />}
                left={() => (
                  <View className="bg-teal-600 rounded-full">
                  <Ionicons name="list" size={17} color={'white'} style={{padding: 5}}/>
                </View>
                )}
                className='px-5 bg-[#ffffff] ml-3 mr-3'
                onPress={() => navigation.navigate("RegistrasiSampel")}
              />
                 {getVisibleMenuItems('report').indexOf('kendali-mutu') !== getVisibleMenuItems('report').length - 1 && (
                  <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
                )}
              </View>
            )}
            {hasItemAccess('rekap-data') && (
              <View>
              <List.Item
                style={getItemStyle('report', 'rekap-data')}
                title={<Text className="font-poppins-medium text-[15px]">Rekap Data</Text>}
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.black} />}
                left={() => (
                  <View className="bg-fuchsia-500 rounded-full">
                  <Ionicons name="reader" size={17} color={'white'} style={{padding: 5}}/>
                </View>
                )}
                className='px-5 bg-[#ffffff] ml-3 mr-3'
                onPress={() => navigation.navigate("RekapData")}
              />
                 {getVisibleMenuItems('report').indexOf('rekap-data') !== getVisibleMenuItems('report').length - 1 && (
                  <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
                )}
              </View>
            )}
           {hasItemAccess('rekap-parameter') && (
              <View>
                <List.Item
                  style={getItemStyle('report', 'rekap-parameter')}
                  title={<Text className="font-poppins-medium text-[15px]">Rekap Parameter</Text>}
                  left={() => (
                    <View className="bg-emerald-500 rounded-full">
                      <Ionicons name="filter" size={17} color={'white'} style={{padding: 5}}/>
                    </View>
                  )}
                  right={props => (
                    <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.black} />
                  )}
                  className="px-5 bg-[#ffffff] ml-3 mr-3"
                  onPress={() => navigation.navigate("RekapParameter")}
                />
                {getVisibleMenuItems('report').indexOf('rekap-parameter') !== getVisibleMenuItems('report').length - 1 && (
                  <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
                )}
              </View>
            )}
          </>
        )}
        <View className="mt-10">
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
    justifyContent: "flex-start", // Ensure content starts from the top
  },
  contentContainer: {
    paddingBottom: 100, // Add padding to avoid content being hidden behind the buttons
    // backgroundColor: "#f1f5f9"
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