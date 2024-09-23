import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from "react-native-vector-icons/Entypo";

import Pengujian from "./Pengujian";

import TrackingList from "./TrackingList";
import TitikUji from "./TitikUji";
import Parameter from "./Parameter";
import EditPermohonan from "../formComponent/EditPermohonan";
import EditTitikUji from "../formComponent/EditTitikUji";
import EditPembayaran from "../formComponent/EditPembayaran";
import TambahPermohonan from "../formComponent/TambahPermohonan";

import Kontrak from "./administrasi/kontrak/Kontrak"
import DetailKontrak from "./administrasi/kontrak/Detail"
import Persetujuan from "./administrasi/Persetujuan"
import IndexPenerima from "./administrasi/PenerimaSampel/IndexPenerima"
import DetailPenerima from "./administrasi/PenerimaSampel/DetailPenerima"
import PengambilSample from "./administrasi/PengambilSample/PengambilSample"
import CetakLHU from "./administrasi/CetakLHU"

const Stack = createNativeStackNavigator();
const screenOptions = {
  tabBarShowLabel: false,
  headerShown: false,
  tabBarStyle: {
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
    elevation: 0,
    height: 60,
    backgroundColor: "#fff",
  },
};

export default function MainScreen() {
  return (
  <NavigationContainer independent={true}>
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="PengujianIndex"
        component={Pengujian}
      />
      
      <Stack.Screen
        name="TrackingList"
        component={TrackingList}
      />
      <Stack.Screen
        name="TitikUji"
        component={TitikUji}
      />
      <Stack.Screen
        name="Parameter"
        component={Parameter}
      />
      <Stack.Screen
        name="EditPermohonan"
        component={EditPermohonan}
      />
      <Stack.Screen
        name="EditTitikUji"
        component={EditTitikUji}
      />
      <Stack.Screen
        name="EditPembayaran"
        component={EditPembayaran}
      />
      <Stack.Screen
        name="TambahPermohonan"
        component={TambahPermohonan}
      />

      <Stack.Screen
        name="Kontrak"
        component={Kontrak}
      />
      <Stack.Screen
        name="DetailKontrak"
        component={DetailKontrak}
      />
      <Stack.Screen
        name="Persetujuan"
        component={Persetujuan}
      />
      <Stack.Screen
        name="IndexPenerima"
        component={IndexPenerima}
      />
      <Stack.Screen
        name="DetailPenerima"
        component={DetailPenerima}
      />
      <Stack.Screen
        name="PengambilSample"
        component={PengambilSample}
      />
      <Stack.Screen
        name="CetakLHU"
        component={CetakLHU}
      />
    </Stack.Navigator>
  </NavigationContainer>
  );
}