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

  return (
      user.role.name === 'customer' ? (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.contentContainer}>
            <View style={styles.headerContainer}>
              <Image
                source={require("@/assets/images/logo.png")}
                style={styles.logo}
              />
              <Text style={styles.headerText}>SI - LAJANG</Text>
            </View>
            {/* Render the active component here */}
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
        <TextFooter/>

        </View>
      ) : (
        <View className="bg-[#ececec] flex-1 flex-start">
          <ScrollView contentContainerStyle={styles.contentContainer}>
            <List.Accordion
              title="Administrasi"
              left={props => <FontAwesome6 {...props} name="computer" size={22} />}
              className='bg-[#ffffff]'
            >
              <List.Item 
                title="Kontrak"
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.grey} />}
                className='px-5 bg-[#f8f8f8]' 
                onPress={() => navigation.navigate("Kontrak")}   
              />
              <List.Item 
                title="Persetujuan" 
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.grey} />}
                className='px-5 bg-[#f8f8f8]'
                onPress={() => navigation.navigate("Persetujuan")}   
              />
              <List.Item 
                title="Pengambil Sampel" 
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.grey} />}
                className='px-5 bg-[#f8f8f8]' 
                onPress={() => navigation.navigate("PengambilSample")}    
              />
              <List.Item 
                title="Penerima Sampel" 
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.grey} />}
                className='px-5 bg-[#f8f8f8]'
                onPress={() => navigation.navigate("IndexPenerima")}  
              />
            
            </List.Accordion>

            <List.Accordion
              title="Verifikasi"
              left={props => <Ionicons {...props} name="shield-checkmark" size={22} />}
              className='bg-[#ffffff]'
            >
              <List.Item 
                title="Analis"
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.grey} />}
                className='px-5 bg-[#f8f8f8]' 
                onPress={() => navigation.navigate("Analis")}    

              />
              <List.Item 
                title="Koordinator Teknis" 
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.grey} />}
                className='px-5 bg-[#f8f8f8]'
                onPress={() => navigation.navigate("Kortek")}
              />
                <List.Item 
                title="Cetak LHU" 
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.grey} />}
                className='px-5 bg-[#f8f8f8]' 
                onPress={() => navigation.navigate("CetakLHU")}    
              />
              <List.Item 
                title="Verifikasi LHU" 
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.grey} />}
                className='px-5 bg-[#f8f8f8]'
                onPress={() => navigation.navigate("VerifikasiLhu")} 
              />
            </List.Accordion>

            <List.Accordion
              title="Report"
              left={props => <Ionicons {...props} name="document-text" size={22} />}
              className='bg-[#ffffff]'
            >
              <List.Item 
                title="Laporan Hasil Pengujian"
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.grey} />}
                className='px-5 bg-[#f8f8f8]'
                onPress={() => navigation.navigate("LaporanHasilPengujian")} 
              />
              <List.Item 
                title="Kendali Mutu" 
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.grey} />}
                className='px-5 bg-[#f8f8f8]'
              />
              <List.Item 
                title="Registrasi Sampel" 
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.grey} />}
                className='px-5 bg-[#f8f8f8]' 
              />
              <List.Item 
                title="Rekap Data" 
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.grey} />}
                className='px-5 bg-[#f8f8f8]'
              />
              <List.Item 
                title="Rekap Parameter" 
                right={props => <MaterialIcons {...props} name="arrow-forward-ios" size={12} color={Colors.grey} />}
                className='px-5 bg-[#f8f8f8]' 
              />
            </List.Accordion>
            <TextFooter/>
          </ScrollView>
        </View>
      )
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
