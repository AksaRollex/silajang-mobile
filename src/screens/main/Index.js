import axios from "@/src/libs/axios";
import { useUser } from "@/src/services";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator, DrawerContentScrollView } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Modal, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { Image } from "react-native-ui-lib";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import FontAwesome6Icon from "react-native-vector-icons/FontAwesome6";
import IonIcons from "react-native-vector-icons/Ionicons";
import Entypo from "react-native-vector-icons/Entypo";
import Icon from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import KonfigurasiNavigator from "../konfigurasi/Index";
import MasterNavigator from "../master/master/Index";
import IndexUser from "../master/user/Index";
import IndexWilayah from "../master/wilayah/Index";
import IndexPembayaran from "../pembayaran/Index";
import IndexPengujian from "../pengujian/Index";
import Dashboard from "./Dashboard";
import Profile from "../profile/Index";
import IndexMaster from "../masterdash/index/index";
import IndexKonfigurasi from "../masterdash/index/IndexKonfig";
import LinearGradient from "react-native-linear-gradient";
import { ToggleButton } from "react-native-paper";
import { useHeaderStore } from "@/App";

const { Navigator, Screen } = createNativeStackNavigator();

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

const Header = () => {
  return (
    <View className="flex flex-row gap-2 items-center">
      <Text className="text-white text-xl font-poppins-bold" >SI-LAJANG</Text>
      <Image
        source={require("@/assets/images/logo.png")}
        className="w-9 h-9"
      />
    </View>
  );
};


const TabNavigator = () => {
  const { data: user } = useUser();
  const userRole = user?.role?.name;


  const tabPermissions = {
    Dashboard: [
      'admin',
      'pengambil-sample',
      'analis',
      'koordinator-administrasi',
      'koordinator-teknis',
      'kepala-upt',
    ],
    Pengujian: [
      'admin',
      'pengambil-sample',
      'analis',
      'koordinator-administrasi',
      'koordinator-teknis',
      'kepala-upt',
    ],
    Pembayaran: [
      'admin',
      'koordinator-administrasi',
      'koordinator-teknis',
      'kepala-upt',
    ],
    Profile: [
      'pengambil-sample',
      'analis',
      'koordinator-administrasi',
      'koordinator-teknis',
      'kepala-upt',
      'customer'
    ],
  };

  const hasPermission = (tabName) => {
    if (!tabPermissions[tabName] || !userRole) return false;
    return tabPermissions[tabName].includes(userRole);
  };

  const TabIcon = ({ focused, iconName, label }) => (
    <View 
      className="items-center justify-center w-full"
      style={{
        height: 50,
        position: 'relative',
      }}
    >
      {focused && (
        <View
          style={{
            width: 70,
            height: 3.5,
            backgroundColor: "#312e81",
            borderBottomRightRadius: 999,
            borderBottomLeftRadius: 999,
            position: "absolute",
            top: -7.5,
          }}
        />
      )}
      <View
        className="items-center justify-center"
        style={{
          shadowColor: focused ? "#4338ca" : "transparent",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: focused ? 0.3 : 0,
          shadowRadius: 4,
          elevation: focused ? 5 : 0,
        }}
      >
        <IonIcons 
          name={iconName} 
          size={21} 
          color={focused ? '#4338ca' : '#a1a1aa'} 
        />
        <Text
          className={`text-[10px] mt-1 ${
            focused 
              ? 'text-[#312e81] font-poppins-semibold' 
              : 'text-gray-400 font-poppins-semibold'
          }`}
        >
          {label}
        </Text>
      </View>
    </View>
  );

  const { header } = useHeaderStore();

  const screenOptions = {
    tabBarShowLabel: false,
    headerShown: false,
    tabBarStyle: {
      position: "absolute",
      display: header ? "flex" : "none",
      bottom: 0,
      right: 0,
      left: 0,
      elevation: 0,
      height: 65,
      backgroundColor: "#ffffff",
      borderTopWidth: 0.5,
      borderTopColor: "#E5E7EB",
      paddingHorizontal: 10,
    },
    unmountOnBlur: true
  };
  
  return (
    <Tab.Navigator 
      screenOptions={screenOptions}
      initialRouteName="Dashboard"
    >
      <Tab.Screen
        name="Dashboard"
        component={Dashboard}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon 
              focused={focused} 
              iconName="home" 
              label="Beranda" 
            />
          ),
        }}
      />
  
      {hasPermission('Pengujian') && (
        <Tab.Screen
          name="Pengujian"
          component={IndexPengujian}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon 
                focused={focused} 
                iconName="document-text" 
                label="Pengujian" 
              />
            ),
          }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.navigate("Pengujian", {
                screen: "PengujianIndex"
              });
            },
          })}
        />
      )}
  
      {hasPermission('Pembayaran') && (
        <Tab.Screen
          name="Pembayaran"
          component={IndexPembayaran}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon 
                focused={focused} 
                iconName="wallet" 
                label="Pembayaran" 
              />
            ),
          }}
        />
      )}
  
      {hasPermission('Profile') && (
        <Tab.Screen
          name="Profile"
          component={Profile}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon 
                focused={focused} 
                iconName="person" 
                label="Profile" 
              />
            ),
          }}
        />
      )}
    </Tab.Navigator>
  );
};

const Admin = () => {
    const { header } = useHeaderStore();
    useEffect(() => {
      console.log(header)
    }, [header])
  return (
  <NavigationContainer independent={true}>
    <Stack.Navigator
      screenOptions={{
        headerShown: header ? true : false,
        headerRight: () => header ? <Header /> : null,
        headerTitle: () => <Text></Text>,
        headerBackVisible: false,
        headerStyle: {
          backgroundColor: "#312e81",
          borderBottomWidth: 0,        
        },
        headerTintColor: "white",
        headerLeft: () => null,
        gestureEnabled: false, 
        animation:'slide_from_right'
      
      }}
    >
      <Stack.Screen name="Home" component={TabNavigator} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="Master" component={MasterNavigator} />
      <Stack.Screen name="PengujianKonfig" component={KonfigurasiNavigator} />
      <Stack.Screen name="User" component={IndexUser} />
      <Stack.Screen name="Wilayah" component={IndexWilayah} />
      <Stack.Screen name="IndexMaster" component={IndexMaster} />
      <Stack.Screen name="IndexKonfigurasi" component={IndexKonfigurasi} />
    </Stack.Navigator>
  </NavigationContainer>
)};

export default function MainScreen() {
  // const { data: user } = useUser();

  return (
    // user.role.name === 'admin' ?
    <Admin />
    // : 
    // <NonAdmin />
  );
}

export { useHeaderStore };
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
