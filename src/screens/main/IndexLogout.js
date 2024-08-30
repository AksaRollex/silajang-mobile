import React, { memo } from "react";

// Navigation
import { createNativeStackNavigator } from "@react-navigation/native-stack";
const { Navigator, Screen } = createNativeStackNavigator();

// Screens
import Login from '../auth/login/Index'

const screenOptions = {
  headerShown: false,
};

export default memo(function Auth() {
  return (
    <Navigator screenOptions={screenOptions}>
      <Screen name="login" component={Login} />
    </Navigator>
  );
});
