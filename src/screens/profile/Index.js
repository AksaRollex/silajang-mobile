import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Entypo";
import { Colors } from "react-native-ui-lib";
import { Image } from "react-native-ui-lib";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
const { Navigator, Screen } = createNativeStackNavigator();
import Dashboard from "./Dashboard";
import Profile from "../profile/Profile";
import Keamanan from "./Keamanan";
import Perusahaan from "./Perusahaan";
import Akun from "./Akun";
import Index from "../auth/Index";
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
    borderTopWidth: 0, // Hilangkan border top untuk membuat tampilan lebih clean
  },
};

export default function MainScreen() {
  return (
    
    <NavigationContainer independent={true}>
      <Tab.Navigator screenOptions={screenOptions}>
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
        <Tab.Screen
          name="Keamanan"
          component={Keamanan}
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
                  Keamanan
                </Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Perusahaan"
          component={Perusahaan}
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
                  Perusahaan
                </Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Akun"
          component={Akun}
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
                  Akun
                </Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Index"
          component={Index}
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
                  Index
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
    borderRadius: 50, // Membuat ikon dan gambar menjadi lebih bulat
    backgroundColor: "transparent", // Awalnya tanpa background
    paddingHorizontal: 10, // Menambahkan padding horizontal untuk ikon
  },
  iconContainerFocused: {
    backgroundColor: "rgba(255, 255, 255, 0.2)", // Warna background ketika tab aktif
  },
  logo: {
    width: 21,
    height: 21,
    marginBottom: 4,
    tintColor: "white", // Warna gambar default
  },
  logoFocused: {
    tintColor: "white", // Warna gambar ketika fokus
  },
  label: {
    fontSize: 12,
    color: "white", // Warna teks default
  },
  labelFocused: {
    color: "white", // Warna teks ketika fokus
  },
});
