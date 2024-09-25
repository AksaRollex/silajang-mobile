import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { Colors } from "react-native-ui-lib";
import { Image } from "react-native-ui-lib";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Dashboard from "./Dashboard";
import Profile from "../profile/Profile";
import Index from "../pengujian/Index";
import IndexPembayaran from "../pembayaran/Index";

const Tab = createBottomTabNavigator();

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
    backgroundColor: Colors.brand,
    borderTopWidth: 0, 
  },
};

export default function MainScreen() {
  return (
    <NavigationContainer independent={true}>
      <Tab.Navigator screenOptions={screenOptions}>
        <Tab.Screen
          name="Dashboard"
          component={Dashboard}
          options={{
            tabBarIcon: ({ focused }) => (
              <View
                style={[
                  styles.iconContainer,
                  focused && styles.iconContainerFocused,
                ]}>
                <Image
                  source={require("@/assets/images/home.png")}
                  style={[styles.logo, focused && styles.logoFocused]}
                />

                <Text style={[styles.label, focused && styles.labelFocused]}>
                  Beranda
                </Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Pengujian.Index"
          component={Index}
          options={{
            tabBarIcon: ({ focused }) => (  
              <View
                style={[
                  styles.iconContainer,
                  focused && styles.iconContainerFocused,
                ]}>
                <Image
                  source={require("@/assets/images/approval.png")}
                  style={[styles.logo, focused && styles.logoFocused]}
                />

                <Text style={[styles.label, focused && styles.labelFocused]}>
                  Pengujian
                </Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Pembayaran.Index"
          component={IndexPembayaran}
          options={{
            tabBarIcon: ({ focused }) => (
              <View
                style={[
                  styles.iconContainer,
                  focused && styles.iconContainerFocused,
                ]}>
                <Image
                  source={require("@/assets/images/wallet.png")}
                  style={[styles.logo, focused && styles.logoFocused]}
                />

                <Text style={[styles.label, focused && styles.labelFocused]}>
                  Pembayaran
                </Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={Profile}
          options={{
            tabBarIcon: ({ focused }) => (
              <View
                style={[
                  styles.iconContainer,
                  focused && styles.iconContainerFocused,
                ]}>
                <Image
                  source={require("@/assets/images/user.png")}
                  style={[styles.logo, focused && styles.logoFocused]}
                />

                <Text style={[styles.label, focused && styles.labelFocused]}>
                  Profil
                </Text>
              </View>
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 50, 
    backgroundColor: "transparent", 
    paddingHorizontal: 10, 
  },
  iconContainerFocused: {
    backgroundColor: "rgba(255, 255, 255, 0.2)", 
  },
  logo: {
    width: 21,
    height: 21,
    marginBottom: 4,
    tintColor: "white", 
  },
  logoFocused: {
    tintColor: "white", 
  },
  label: {
    fontSize: 12,
    color: "white", 
  },
  labelFocused: {
    color: "white", 
  },
});
