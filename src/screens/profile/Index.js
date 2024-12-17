import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Profile from "./Profile";
import Keamanan from "./Keamanan";
import Perusahaan from "./Perusahaan";
import Informasi from "./Informasi";
// import Akun from "./tabs/Akun";
// import Index from "../auth/Index";
import { ProfileProvider } from "./ProfileContext";
const Stack = createNativeStackNavigator();

export default function MainScreen() {
  return (
      <Stack.Navigator screenOptions={{ headerShown : false, animation : "slide_from_right", }}>
        <Stack.Screen name="IndexProfile" component={Profile} />
        <Stack.Screen name="Keamanan" component={Keamanan} />
        <Stack.Screen name="Perusahaan" component={Perusahaan} />
        <Stack.Screen name="Informasi" component={Informasi} />
        {/* <Stack.Screen name="Akun" component={Akun} /> */}
        {/* <Stack.Screen name="Index" component={Index} /> */}
      </Stack.Navigator>
  );
}