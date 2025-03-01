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
import BackButton from "../components/BackButton";


export default function IndexMaster() {
  const navigation = useNavigation();
  const [activeComponent, setActiveComponent] = useState(null);
  const { data: user } = useUser();

  const roleAccess = {
    admin: {
      sections: ['master', 'user', 'wilayah'],
      items: ['metode', 'peraturan', 'parameter', 'paket', 'pengawetan', 'jenis-sampel', 'jenis-wadah', 'jasa-pengambilan', 'radius-pengambilan', 'libur-cuti', 'kode-retribusi',
        'jabatan', 'user',
        'kota-dan-kabupaten', 'kecamatan', 'kelurahan',]
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
        {hasAccess('master') && (
          <>

            <View className="flex-row items-center space-x-2 mt-5 bg-white p-2 ml-3 mr-3 rounded-xl py-2.5">
              <BackButton action={() => navigation.navigate("Dashboard", { screen: 'Dashboard' })} size={26} className="ml-2" />

              <View className="w-px h-full bg-gray-200 " />

              <View className="flex-1 items-center mr-11">
                <Text className="text-[18px] text-black font-poppins-semibold">
                  Menu Master
                </Text>
              </View>
            </View>

            <View className=" mt-2 p-4 flex flex-row items-center ">
              {/* <FontAwesome6 name="computer" size={22} style={{ color: "black" }} /> */}
              <Text className="font-poppins-semibold text-black text-lg ml-2">Master</Text>
            </View>
            
            {hasItemAccess('metode') && (
              <View>

              <List.Item
                
                style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
                title={<Text className="font-poppins-medium text-[15px]">Metode</Text>}
                left={() => (
                  <View className="bg-blue-600 rounded-full">
                    <Ionicons name="flask" size={17} color={'white'} style={{padding: 5}}/>
                  </View>
                )}
                right={props => (
                  <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.black} />
                )}
                className="px-5 bg-[#ffffff] ml-3 mr-3"
                onPress={() => navigation.navigate("Metode")}
              />
              <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
            </View>
              
            )}
            {hasItemAccess('peraturan') && (
              <View>
              <List.Item
                title={<Text className="font-poppins-medium text-[15px]">Peraturan</Text>}
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.black} />}
                left={() => (
                   <View className="bg-emerald-500 rounded-full">
                    <Ionicons name="document-text" size={17} color={'white'} style={{padding: 5}}/>
                  </View>
                )}
                className='px-5 bg-[#ffffff] ml-3 mr-3'
                onPress={() => navigation.navigate("Peraturan")}
              />
              <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
              </View>
            )}
            {hasItemAccess('parameter') && (
            <View>
              <List.Item
                title={<Text className="font-poppins-medium text-[15px]">Parameter</Text>}
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.black} />}
                left={() => (
                   <View className="bg-purple-500 rounded-full">
                    <Ionicons name="filter" size={17} color={'white'} style={{padding: 5}}/>
                  </View>
                )}
                className='px-5 bg-[#ffffff] ml-3 mr-3'
                onPress={() => navigation.navigate("Parameter")}
              />
              <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
              </View>
            )}
            {hasItemAccess('paket') && (
              <View>
              <List.Item
                title={<Text className="font-poppins-medium text-[15px]">Paket</Text>}
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.black} />}
                left={() => (
                   <View className="bg-orange-500 rounded-full">
                    <Ionicons name="cube" size={17} color={'white'} style={{padding: 5}}/>
                  </View>
                )}
                className='px-5 bg-[#ffffff] ml-3 mr-3'
                onPress={() => navigation.navigate("Paket")}
              />
              <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
              </View>
            )}
            {hasItemAccess('pengawetan') && (
              <View>
              <List.Item
                title={<Text className="font-poppins-medium text-[15px]">Pengawetan</Text>}
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.black} />}
                left={() => (
                   <View className="bg-pink-500 rounded-full">
                    <Ionicons name="water" size={17} color={'white'} style={{padding: 5}}/>
                  </View>
                )}
                className='px-5 bg-[#ffffff] ml-3 mr-3'
                onPress={() => navigation.navigate("Pengawetan")}
                
              />
              <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
              </View>
            )}
            {hasItemAccess('jenis-sampel') && (
              <View>
              <List.Item
                title={<Text className="font-poppins-medium text-[15px]">Jenis Sampel</Text>}
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.black} />}
                left={() => (
                   <View className="bg-teal-500 rounded-full">
                    <Ionicons name="beaker" size={17} color={'white'} style={{padding: 5}}/>
                  </View>
                )}
                className='px-5 bg-[#ffffff] ml-3 mr-3'
                onPress={() => navigation.navigate("JenisSampel")}
                
              />
              <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
              </View>
            )}
            {hasItemAccess('jenis-wadah') && (
              <View>
              <List.Item
                title={<Text className="font-poppins-medium text-[15px]">Jenis Wadah</Text>}
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.black} />}
                left={() => (
                   <View className="bg-indigo-500 rounded-full">
                    <Ionicons name="bag-handle" size={17} color={'white'} style={{padding: 5}}/>
                  </View>
                )}
                className='px-5 bg-[#ffffff] ml-3 mr-3'
                onPress={() => navigation.navigate("JenisWadah")}
                
              />
              <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
              </View>
            )}
            {hasItemAccess('jasa-pengambilan') && (
              <View>
              <List.Item
                title={<Text className="font-poppins-medium text-[15px]">Jasa Pengambilan</Text>}
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.black} />}
                left={() => (
                   <View className="bg-rose-500 rounded-full">
                    <Ionicons name="car" size={17} color={'white'} style={{padding: 5}}/>
                  </View>
                )}
                className='px-5 bg-[#ffffff] ml-3 mr-3'
                onPress={() => navigation.navigate("JasaPengambilan")}
                
              />
              <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
              </View>
            )}
            {hasItemAccess('radius-pengambilan') && (
              <View>
              <List.Item
                title={<Text className="font-poppins-medium text-[15px]">Radius Pengambilan</Text>}
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.black} />}
                left={() => (
                   <View className="bg-cyan-600 rounded-full">
                    <Ionicons name="location" size={17} color={'white'} style={{padding: 5}}/>
                  </View>
                )}
                className='px-5 bg-[#ffffff] ml-3 mr-3'
                onPress={() => navigation.navigate("RadiusPengambilan")}
                
              />
              <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
              </View>
            )}
            {hasItemAccess('libur-cuti') && (
              <View>
              <List.Item
                title={<Text className="font-poppins-medium text-[15px]">Libur Cuti</Text>}
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.black} />}
                left={() => (
                   <View className="bg-violet-500 rounded-full">
                    <Ionicons name="calendar" size={17} color={'white'} style={{padding: 5}}/>
                  </View>
                )}
                className='px-5 bg-[#ffffff] ml-3 mr-3'
                onPress={() => navigation.navigate("LiburCuti")}
                
              />
              <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
              </View>
            )}
            {hasItemAccess('kode-retribusi') && (
              <View>
              <List.Item
                style={{ borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}
                title={<Text className="font-poppins-medium text-[15px]">Kode Retribusi</Text>}
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.black} />}
                left={() => (
                   <View className="bg-amber-500 rounded-full">
                    <Ionicons name="barcode" size={17} color={'white'} style={{padding: 5}}/>
                  </View>
                )}
                className='px-5 bg-[#ffffff] ml-3 mr-3'
                onPress={() => navigation.navigate("KodeRetribusi")}
              />
              <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
              </View>
            )}
          </>
        )}
  
        {hasAccess('user') && (
          <>
            <View className=" p-4 flex flex-row items-center mt-1">
              {/* <Ionicons name="shield-checkmark" size={22} style={{ color: "black" }} /> */}
              <Text className="font-poppins-semibold ml-2 text-black text-lg">User</Text>
            </View>
            
            {hasItemAccess('jabatan') && (
              <View>
              <List.Item
              style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
                title={<Text className="font-poppins-medium text-[15px]">Jabatan</Text>}
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.black} />}
                left={() => (
                   <View className="bg-sky-500 rounded-full">
                    <Ionicons name="briefcase" size={17} color={'white'} style={{padding: 5}}/>
                  </View>
                )}
                className='px-5 bg-[#ffffff] ml-3 mr-3'
                onPress={() => navigation.navigate("Jabatan")}
              />
              <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
              </View>
            )}
            {hasItemAccess('user') && (
              <View>
              <List.Item
                style={{ borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}
                title={<Text className="font-poppins-medium text-[15px]">User</Text>}
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.black} />}
                left={() => (
                   <View className="bg-blue-600 rounded-full">
                    <Ionicons name="person" size={17} color={'white'} style={{padding: 5}}/>
                  </View>
                )}
                className='px-5 bg-[#ffffff] ml-3 mr-3'
                onPress={() => navigation.navigate("Users")}
              />
              <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
              </View>
            )}
          </>
        )}
  
        {hasAccess('wilayah') && (
          <>
            <View className=" p-4 flex flex-row items-center mt-1">
              {/* <Ionicons name="document-text" size={22} style={{ color: "black" }}/> */}
              <Text className="font-poppins-semibold ml-2 text-black text-lg">Wilayah</Text>
            </View>
            
            {hasItemAccess('kota-dan-kabupaten') && (
              <View>
              <List.Item
              style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
                title={<Text className="font-poppins-medium text-[15px]">Kota dan kabupaten</Text>}
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.black} />}
                left={() => (
                   <View className="bg-red-500 rounded-full">
                    <Ionicons name="business" size={17} color={'white'} style={{padding: 5}}/>
                  </View>
                )}
                className='px-5 bg-[#ffffff] ml-3 mr-3'
                onPress={() => navigation.navigate("KotaKab")}
              />
              <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
              </View>
            )}
            {hasItemAccess('kecamatan') && (
              <View>
              <List.Item
                title={<Text className="font-poppins-medium text-[15px]">Kecamatan</Text>}
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.black} />}
                left={() => (
                   <View className="bg-lime-400 rounded-full">
                    <Ionicons name="map" size={17} color={'white'} style={{padding: 5}}/>
                  </View>
                )}
                className='px-5 bg-[#ffffff] ml-3 mr-3'
                onPress={() => navigation.navigate("Kecamatan")}

              />
              <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
              </View>
            )}
            {hasItemAccess('kelurahan') && (
              <View>
              <List.Item
                style={{ borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}
                title={<Text className="font-poppins-medium text-[15px]">Kelurahan</Text>}
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.black} />}
                left={() => (
                   <View className="bg-yellow-400 rounded-full">
                    <Ionicons name="home" size={17} color={'white'} style={{padding: 5}}/>
                  </View>
                )}
                className='px-5 bg-[#ffffff] ml-3 mr-3'
                onPress={() => navigation.navigate("Kelurahan")}
              />
              <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
              </View>
            )}
          </>
        )}
        <View className="mt-14 mb-8">
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