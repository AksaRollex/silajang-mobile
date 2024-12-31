import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  Linking,
  Button,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import FooterLanding from "../component/FooterLanding";
import { useSetting } from "@/src/services";
import Header from "../../components/Header";
import IonIcons from "react-native-vector-icons/Ionicons";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import AskButton from "../component/AskButton";
import MapView, { Marker } from "react-native-maps";

const Kontak = ({ navigation }) => {
  const { data: dataSetting } = useSetting();

  const [coordinates, setCoordinates] = useState({
    latitude: -7.537917,
    longitude: 112.2406,
  });

  const openLargerMap = () => {
    const url = `https://www.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`;
    Linking.openURL(url).catch(err =>
      console.error("Error opening map: ", err),
    );
  };

  const mapUrl = `https://www.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}&z=15`;

  return (
    <View className="w-full h-full bg-[#ececec]">
      <ScrollView
        className="flex-col "
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[]}>
        <ImageBackground
          source={require("../../../../assets/images/background.png")}
          style={{
            flex: 1,
            height: "100%",
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
          }}>
          <Header
            navigate={() => {
              navigation.navigate("Profile");
            }}
          />
        </ImageBackground>
        <View className="flex-col p-3 ">
          <Text className="font-poppins-bold text-2xl text-[#252a61]">
            Hubungi Kami
          </Text>
          <Text className="font-poppins-regular text-base text-[#252a61]">
            Tim kami tersedia untuk memberikan dukungan dan informasi yang anda
            butuhkan
          </Text>
        </View>
        <View className="flex-col p-3 gap-y-3">
          <View
            className="rounded-xl p-5 bg-[#f8f8f8] flex-col justify-start"
            style={{
              elevation: 4,
              shadowColor: "#5C6BC0",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 3,
            }}>
            <View
              className="flex-row gap-x-2"
              style={{
                elevation: 4,
                shadowColor: "#5C6BC0",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 3,
              }}>
              <IonIcons name="call" size={20} color="#000" />
              <Text className="font-poppins-bold text-base text-zinc-800">
                Nomor Telepon
              </Text>
            </View>
            <Text className="font-poppins-bold text-base text-[#252a61]">
              {dataSetting?.telepon}
            </Text>
          </View>
          <View
            className="rounded-xl p-5 bg-[#f8f8f8] flex-col justify-start"
            style={{
              elevation: 4,
              shadowColor: "#5C6BC0",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 3,
            }}>
            <View className="flex-row gap-x-2">
              <IonIcons name="mail" size={20} color="#000" />
              <Text className="font-poppins-bold text-base text-zinc-800">
                Email
              </Text>
            </View>
            <Text className="font-poppins-bold text-base text-[#252a61]">
              {dataSetting?.email}
            </Text>
          </View>
          <View className="rounded-xl p-5 bg-[#f8f8f8] flex-col justify-start">
            <View className="flex-row gap-x-2">
              <FontAwesome6 name="map-location" size={20} color="#000" />
              <Text className="font-poppins-bold text-base text-zinc-800">
                Alamat
              </Text>
            </View>
            <Text className="font-poppins-bold text-base text-[#252a61]">
              {dataSetting?.alamat}
            </Text>
            
            <TouchableOpacity
              onPress={openLargerMap}
              className="p-3 mt-3 rounded-xl bg-indigo-50"
              style={{
                borderWidth: 1,
                borderStyle: "dashed",
                borderColor: "#5C6BC0",
              }}>
              <Text className="capitalize font-poppins-medium text-center text-black">Buka Di Google Maps</Text>
            </TouchableOpacity>
          </View>
          <View>
            {/* <View style={{ flex: 1 }}>
              <Text>Google Maps Preview</Text>
              <MapView
                style={{ flex: 1 }}
                initialRegion={{
                  latitude: coordinates.latitude,
                  longitude: coordinates.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}>
                <Marker coordinate={coordinates} title="Lokasi Kami" />
              </MapView>
            </View> */}

          </View>
        </View>
        <AskButton />
        <FooterLanding />
      </ScrollView>
    </View>
  );
};

export default Kontak;
