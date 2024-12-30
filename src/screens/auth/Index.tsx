import React, { memo } from "react";

// Navigation
import { createNativeStackNavigator } from "@react-navigation/native-stack";
const { Navigator, Screen } = createNativeStackNavigator();

// Screens
import Login from "./login/Index";
import Register from "./register/Index";

const screenOptions = {
  headerShown: false,
};

export default memo(function Auth() {
  return (
    <Navigator screenOptions={screenOptions}>
      <Screen name="Login" component={Login} />
      <Screen name="Register" component={Register} />
    </Navigator>
  );
});
