import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainScreen from "../profile/Index";
const Stack = createNativeStackNavigator();


export default function MainScreen() {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator screenOptions={{ headerShown : false }}>
        <Stack.Screen name="Profile" component={MainScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
