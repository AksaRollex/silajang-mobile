import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Profile from "../profile/Profile";
import Keamanan from "./tabs/Keamanan";
import Perusahaan from "./tabs/Perusahaan";
import Akun from "./tabs/Akun";
import Index from "../auth/Index";
import { ProfileProvider } from "./ProfileContext";
const Stack = createNativeStackNavigator();

export default function MainScreen() {
  return (
    <ProfileProvider>
      <NavigationContainer independent={true}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="Keamanan" component={Keamanan} />
          <Stack.Screen name="Perusahaan" component={Perusahaan} />
          <Stack.Screen name="Akun" component={Akun} />
          <Stack.Screen name="Index" component={Index} />
        </Stack.Navigator>
      </NavigationContainer>
    </ProfileProvider>
  );
}
