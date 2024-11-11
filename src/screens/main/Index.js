import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  NavigationContainer,
  getFocusedRouteNameFromRoute,
} from "@react-navigation/native";
import { Colors } from "react-native-ui-lib";
import { Image } from "react-native-ui-lib";
import Dashboard from "./Dashboard";
import Profile from "../profile/Index";
import PengujianStack from "../pengujian/Index";
import PembayaranStack from "../pembayaran/Index";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PermohonanScreen from "../pengujian/permohonan/Permohonan";
import TrackingPengujianScreen from "../pengujian/trackingPengujian/TrackingPengujian";
import PengujianPembayaran from "../pembayaran/pengujian/Pengujian";
import MultiPayment from "../pembayaran/multipayment/Multipayment";
import TitikUji from "../pengujian/permohonan/titikUji/TitikUji";
import FormTitikUji from "../pengujian/permohonan/titikUji/Form";
import Parameter from "../pengujian/permohonan/parameter/Parameter";
import TrackingList from "../pengujian/trackingPengujian/Detail";
import EditPermohonan from "../pengujian/permohonan/FormEdit";
import TambahPermohonan from "../pengujian/permohonan/FormTambah";
import Pembayaran from "../pembayaran/Pembayaran";
import PengujianDetail from "../pembayaran/pengujian/Detail";
import MultipaymentDetail from "../pembayaran/multipayment/Detail";
import Akun from "../profile/tabs/Akun";
import Perusahaan from "../profile/tabs/Perusahaan";
import Keamanan from "../profile/tabs/Keamanan";
import Ionicons from "react-native-vector-icons/Ionicons";
import PengujianScreen from "../pengujian/Pengujian";
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

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

const getTabBarStyle = route => {
  const routeName = getFocusedRouteNameFromRoute(route) ?? "";
  const hideOnScreens = [
    "TrackingPengujian",
    "TrackingList",
    "Permohonan",
    "EditPermohonan",
    "TambahPermohonan",
    "TitikUji",
    "FormTitikUji",
    "Parameter",
    "PengujianPembayaran",
    "PengujianDetail",
    "Multipayment",
    "MultipaymentDetail",
    "Akun",
    "Keamanan",
    "Perusahaan",
    "ProfileMain",
  ];

  console.log('Current Route:', routeName);
  if (hideOnScreens.includes(routeName)) {
    console.log('Hiding tab bar for route:', routeName); // Tambahkan ini
    return { display: "none" };
  }


  return {
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
    elevation: 0,
    height: 60,
    backgroundColor: Colors.brand,
    borderTopWidth: 0,
  };
};

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={index}
            onPress={onPress}
            style={[styles.tabItem, { borderTopWidth: 0.1 }]}>
            <View style={[styles.iconContainer]}>
              <Ionicons
                name={
                  route.name === "Dashboard"
                    ? "home"
                    : route.name === "Pengujian"
                    ? "document-text"
                    : route.name === "Pembayaran"
                    ? "wallet"
                    : "person-sharp"
                }
                size={25}
                color={isFocused ? Colors.brand : Colors.grey}
              />
              <Text
                style={[styles.label, isFocused && styles.labelFocused]}
                className="font-poppins-semibold">
                {route.name === "Dashboard"
                  ? "Beranda"
                  : route.name === "Pengujian"
                  ? "Pengujian"
                  : route.name === "Pembayaran"
                  ? "Pembayaran"
                  : "Profil"}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const ProfileStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={Profile} />
      <Stack.Screen name="Akun" component={Akun} />
      <Stack.Screen name="Perusahaan" component={Perusahaan} />
      <Stack.Screen name="Keamanan" component={Keamanan} />
    </Stack.Navigator>
  );
};

const PembayaranStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PembayaranMain" component={Pembayaran} />
      <Stack.Screen
        name="PengujianPembayaran"
        component={PengujianPembayaran}
      />
      <Stack.Screen name="Multipayment" component={MultiPayment} />
      <Stack.Screen name="PengujianDetail" component={PengujianDetail} />
      <Stack.Screen name="MultipaymentDetail" component={MultipaymentDetail} />
    </Stack.Navigator>
  );
};

const PengujianStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PengujianMain" component={PengujianScreen} />
      <Stack.Screen name="Permohonan" component={PermohonanScreen} />
      <Stack.Screen
        name="TrackingPengujian"
        component={TrackingPengujianScreen}
      />
      <Stack.Screen name="TitikUji" component={TitikUji} />
      <Stack.Screen name="FormTitikUji" component={FormTitikUji} />
      <Stack.Screen name="Parameter" component={Parameter} />
      <Stack.Screen name="TrackingList" component={TrackingList} />
      <Stack.Screen name="EditPermohonan" component={EditPermohonan} />
      <Stack.Screen name="TambahPermohonan" component={TambahPermohonan} />
    </Stack.Navigator>
  );
};

export default function MainScreen() {
  return (
    <NavigationContainer independent={true}>
      <Tab.Navigator
        tabBar={props => <CustomTabBar {...props} />}
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: getTabBarStyle(route),
        })}>
        <Tab.Screen name="Dashboard" component={Dashboard} />
        <Tab.Screen name="Pengujian" component={PengujianStackNavigator} />
        <Tab.Screen name="Pembayaran" component={PembayaranStackNavigator} />
        <Tab.Screen name="Profile" component={ProfileStackNavigator} />
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
    color: "grey",
  },
  labelFocused: {
    color: Colors.brand,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#ececec",
    height: 60,
  },
  tabItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
  },
  dropdownContainer: {
    position: "absolute",
    backgroundColor: "white",
    borderRadius: 6,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dropdownText: {
    fontSize: 12,
    color: Colors.brand,
    textAlign: "center",
  },
});
