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
import LaporanHasilPengujian from "./report/LaporanHasilPengujian"
import KendaliMutu from "./report/KendaliMutu";
import RegistrasiSampel from "./report/RegistrasiSampel"
import RekapData from "./report/RekapData"
import RekapParameter from "./report/RekapParameter";

import { LinearProgress } from "@rneui/base";

const Stack = createNativeStackNavigator();
const getScreenOptions = (animation = "slide_from_right") => ({
  tabBarShowLabel: false,
  headerShown: false,
  animation: animation,
  tabBarStyle: {
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
    elevation: 0,
    height: 60,
    backgroundColor: "#fff",  
  },
});

export default function MainScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="PengujianIndex"
        component={Pengujian}
        options={{ ...getScreenOptions() }}
      />

      <Stack.Screen
        name="Kontrak"
        component={Kontrak}
        options={{ ...getScreenOptions() }}
      />
      <Stack.Screen
        name="DetailKontrak"
        component={DetailKontrak}
        options={{ ...getScreenOptions("fade_from_bottom") }}
      />
      <Stack.Screen
        name="Persetujuan"
        component={Persetujuan}
        options={{ ...getScreenOptions() }}
      />
      <Stack.Screen
        name="DetailPersetujuan"
        component={DetailPersetujuan}
        options={{ ...getScreenOptions("fade_from_bottom") }}
      />
      <Stack.Screen
        name="IndexPenerima"
        component={IndexPenerima}
        options={{ ...getScreenOptions() }}
      />
      <Stack.Screen
        name="DetailPenerima"
        component={DetailPenerima}
        options={{ ...getScreenOptions("fade_from_bottom") }}
      />
      <Stack.Screen
        name="PengambilSample"
        component={PengambilSample}
        options={{ ...getScreenOptions() }}
      />
      <Stack.Screen
        name="DetailPengambilSample"
        component={DetailPengambilSample}
        options={{ ...getScreenOptions("fade_from_bottom") }}
      />
      <Stack.Screen
        name="DetailPengisian"
        component={DetailPengisian}
        options={{ ...getScreenOptions("fade_from_bottom") }}
      />
      <Stack.Screen
        name="CetakLHU"
        component={CetakLHU}
        options={{ ...getScreenOptions() }}
      />
      <Stack.Screen
        name="Analis"
        component={Analis}
        options={{ ...getScreenOptions() }}
      />
      <Stack.Screen
        name="DetailAnalis"
        component={DetailAnalis}
        options={{ ...getScreenOptions("fade_from_bottom") }}
      />
      <Stack.Screen
        name="Kortek"
        component={Kortek}
        options={{ ...getScreenOptions() }}
      />
      <Stack.Screen
        name="HasilUjis"
        component={HasilUjis}
        options={{ ...getScreenOptions("fade_from_bottom") }}
      />
     
      <Stack.Screen
        name="VerifikasiLhu"
        component={VerifikasiLhu}
        options={{ ...getScreenOptions() }}
      />

      <Stack.Screen
        name="LaporanHasilPengujian"
        component={LaporanHasilPengujian}
        options={{ ...getScreenOptions() }}
      />

      <Stack.Screen
        name="KendaliMutu"
        component={KendaliMutu}
        options={{ ...getScreenOptions() }}
      />

      <Stack.Screen
        name="RegistrasiSampel"
        component={RegistrasiSampel}
        options={{ ...getScreenOptions() }}
      />

      <Stack.Screen
        name="RekapData"
        component={RekapData}
        options={{ ...getScreenOptions() }}
      />

      <Stack.Screen
        name="RekapParameter"
        component={RekapParameter}
        options={{ ...getScreenOptions() }}
      />

   </Stack.Navigator>
  );
}