import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer, useNavigation } from "@react-navigation/native";

import Pengujian from "./Pengujian";
import TrackingList from "./trackingPengujian/Detail";
import Parameter from "./permohonan/parameter/Parameter";
import TitikUji from "./permohonan/titikUji/TitikUji";
import EditPembayaran from "../formComponent/EditPembayaran";
import Permohonan from "./permohonan/Permohonan";
import FormTitikUji from "./permohonan/titikUji/Form";
import TrackingPengujian from "./trackingPengujian/TrackingPengujian";
import EditPermohonan from "./permohonan/FormEdit";
import TambahPermohonan from "./permohonan/FormTambah";

const Stack = createNativeStackNavigator();

export default function MainScreen() {
  const navigation = useNavigation();
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Pengujian" component={Pengujian} />

        <Stack.Screen name="TrackingPengujian" component={TrackingPengujian} />
        <Stack.Screen name="TrackingList" component={TrackingList} />

        <Stack.Screen name="Permohonan" component={Permohonan} />
        <Stack.Screen name="EditPermohonan" component={EditPermohonan} />
        <Stack.Screen name="TambahPermohonan" component={TambahPermohonan} />
        <Stack.Screen name="TitikUji" component={TitikUji} />
        <Stack.Screen name="FormTitikUji" component={FormTitikUji} />
        <Stack.Screen name="Parameter" component={Parameter} />

        <Stack.Screen name="EditPembayaran" component={EditPembayaran} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
