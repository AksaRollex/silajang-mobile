import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import PaymentDetail from "./pengujian/PaymentDetail";
import Pembayaran from "./Pembayaran";
import PengujianPembayaran from "../pembayaran/pengujian/Pengujian";
import Multipayment from "./multipayment/Multipayment";

const Stack = createNativeStackNavigator();

export default function MainScreen() {
  return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Pembayaran" component={Pembayaran} />
        <Stack.Screen name="PengujianPembayaran" component={PengujianPembayaran} />
        <Stack.Screen name="PaymentDetail" component={PaymentDetail} />
        <Stack.Screen name="Multipayment" component={Multipayment} />
      </Stack.Navigator>
  );
}
