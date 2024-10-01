import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import PengujianDetail from "./pengujian/Detail";
import MultipaymentDetail from "./multipayment/Detail";
import Pembayaran from "./Pembayaran";
import PengujianPembayaran from "../pembayaran/pengujian/Pengujian";
import Multipayment from "./multipayment/Multipayment";

const Stack = createNativeStackNavigator();

export default function MainScreen() {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Pembayaran" component={Pembayaran} />
        <Stack.Screen name="PengujianPembayaran" component={PengujianPembayaran} />
        <Stack.Screen name="PengujianDetail" component={PengujianDetail} />
        <Stack.Screen name="MultipaymentDetail" component={MultipaymentDetail} />
        <Stack.Screen name="Multipayment" component={Multipayment} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
