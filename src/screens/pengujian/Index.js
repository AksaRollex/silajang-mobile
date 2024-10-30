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
import DetailKontrak from "./administrasi/kontrak/DetailKontrak"
import Persetujuan from "./administrasi/Persetujuan/Persetujuan"
import DetailPersetujuan from "./administrasi/Persetujuan/DetailPersetujuan"
import IndexPenerima from "./administrasi/PenerimaSampel/IndexPenerima"
import DetailPenerima from "./administrasi/PenerimaSampel/DetailPenerima"
import PengambilSample from "./administrasi/PengambilSample/PengambilSample"
import DetailPengisian from "./administrasi/PengambilSample/DetailPengisian"
import DetailPengambilSample from "./administrasi/PengambilSample/DetailPengambilSample"


import Analis from "./verifikasi/Analis/Analis"
import DetailAnalis from "./verifikasi/Analis/DetailAnalis"
import Kortek from "./verifikasi/Kortek/Kortek"
import HasilUjis from "./verifikasi/Kortek/HasilUjis"
import CetakLHU from "./verifikasi/CetakLHU"
import VerifikasiLhu from "./verifikasi/VerifikasiLhu/VerifikasiLhu"
import LaporanHasilPengujian from "./report/LaporanHasilPengujian/"
import { LinearProgress } from "@rneui/base";

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
        name="DetailPersetujuan"
        component={DetailPersetujuan}
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
        name="DetailPengambilSample"
        component={DetailPengambilSample}
      />
      <Stack.Screen
        name="DetailPengisian"
        component={DetailPengisian}
      />
      <Stack.Screen
        name="CetakLHU"
        component={CetakLHU}
      />
      <Stack.Screen
        name="Analis"
        component={Analis}
      />
      <Stack.Screen
        name="DetailAnalis"
        component={DetailAnalis}
      />
      <Stack.Screen
        name="Kortek"
        component={Kortek}
      />
      <Stack.Screen
        name="HasilUjis"
        component={HasilUjis}
      />
     
      <Stack.Screen
        name="VerifikasiLhu"
        component={VerifikasiLhu}
      />

      <Stack.Screen
        name="LaporanHasilPengujian"
        component={LaporanHasilPengujian}
      />
    </Stack.Navigator>
  );
}