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

// Fungsi untuk mengatur visibilitas tab bar
const getTabBarVisibility = route => {
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
    "ProfileMain"
  ];

  if (hideOnScreens.includes(routeName)) {
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

const CustomTabBar = props => {
  const { state, descriptors, navigation } = props;
  const [pengujianDropdownVisible, setPengujianDropdownVisible] =
    useState(false);
  const [pembayaranDropdownVisible, setPembayaranDropdownVisible] =
    useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const pengujianTabRef = useRef(null);
  const pembayaranTabRef = useRef(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    }
  }, []);

  const handlePengujianPress = () => {
    if (pengujianTabRef.current) {
      pengujianTabRef.current.measure((x, y, width, height, pageX, pageY) => {
        setDropdownPosition({
          x: pageX,
          width: width,
        });
        setPengujianDropdownVisible(true);
        setPembayaranDropdownVisible(false);
      });
    }
  };

  const handlePembayaranPress = () => {
    if (pembayaranTabRef.current) {
      pembayaranTabRef.current.measure((x, y, width, height, pageX, pageY) => {
        setDropdownPosition({
          x: pageX,
          width: width,
        });
        setPembayaranDropdownVisible(true);
        setPengujianDropdownVisible(false);
      });
    }
  };

  const closeAllDropdowns = () => {
    setPengujianDropdownVisible(false);
    setPembayaranDropdownVisible(false);
  };

  if (!state) return null;

  return (
    <View style={{ position: "relative" }}>
      {/* Pengujian Dropdown Menu */}
      <Modal
        transparent={true}
        visible={pengujianDropdownVisible}
        onRequestClose={closeAllDropdowns}
        animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={closeAllDropdowns}>
          <View
            style={[
              styles.dropdownContainer,
              {
                left: dropdownPosition.x,
                width: dropdownPosition.width,
                bottom: 60,
              },
            ]}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                navigation.navigate("Permohonan");
                closeAllDropdowns();
              }}>
              <Text
                style={styles.dropdownText}
                className="font-poppins-semibold">
                Permohonan
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                navigation.navigate("TrackingPengujian");
                closeAllDropdowns();
              }}>
              <Text
                style={styles.dropdownText}
                className="font-poppins-semibold">
                Tracking Pengujian
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Pembayaran Dropdown Menu */}
      <Modal
        transparent={true}
        visible={pembayaranDropdownVisible}
        onRequestClose={closeAllDropdowns}
        animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={closeAllDropdowns}>
          <View
            style={[
              styles.dropdownContainer,
              {
                left: dropdownPosition.x,
                width: dropdownPosition.width,
                bottom: 60,
              },
            ]}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                navigation.navigate("PengujianPembayaran");
                closeAllDropdowns();
              }}>
              <Text
                style={styles.dropdownText}
                className="font-poppins-semibold">
                Pengujian
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                navigation.navigate("Multipayment");
                closeAllDropdowns();
              }}>
              <Text
                style={styles.dropdownText}
                className="font-poppins-semibold">
                Multi Payment
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            if (route.name === "PengujianTab") {
              handlePengujianPress();
              return;
            }
            if (route.name === "PembayaranTab") {
              handlePembayaranPress();
              return;
            }
            navigation.navigate(route.name);
          };

          return (
            <TouchableOpacity
              className=" border-gray-500"
              key={index}
              onPress={onPress}
              ref={
                route.name === "PengujianTab"
                  ? pengujianTabRef
                  : route.name === "PembayaranTab"
                  ? pembayaranTabRef
                  : null
              }
              style={[styles.tabItem, { borderTopWidth : 0.3}]}>
              {route.name === "Dashboard" && (
                <View
                  style={[
                    styles.iconContainer,
                  ]}>
                  <Ionicons
                    name="home"
                    size={25}
                    color={isFocused ? Colors.brand : Colors.grey} // Kondisi warna saat fokus
                  />
                  <Text
                    style={[styles.label, isFocused && styles.labelFocused]}
                    className="font-poppins-semibold">
                    Beranda
                  </Text>
                </View>
              )}
              {route.name === "PengujianTab" && (
                <View
                  style={[
                    styles.iconContainer,
                  ]}>
                  <Ionicons
                    name="document-text"
                    size={25}
                    color={isFocused ? Colors.brand : Colors.grey} // Kondisi warna saat fokus
                  />
                  <Text
                    style={[styles.label, isFocused && styles.labelFocused]}
                    className="font-poppins-semibold">
                    Pengujian
                  </Text>
                </View>
              )}
              {route.name === "PembayaranTab" && (
                <View
                  style={[
                    styles.iconContainer,
                    isFocused && styles.iconContainerFocused,
                  ]}>
                  <Ionicons
                    name="wallet"
                    size={25}
                    color={isFocused ? Colors.brand : Colors.grey} // Kondisi warna saat fokus
                  />
                  <Text
                    style={[styles.label, isFocused && styles.labelFocused]}
                    className="font-poppins-semibold">
                    Pembayaran
                  </Text>
                </View>
              )}
              {route.name === "Profile" && (
                <View
                  style={[
                    styles.iconContainer,
                    isFocused && styles.iconContainerFocused,
                  ]}>
                  <Ionicons
                    name="person-sharp"
                    size={25}
                    color={isFocused ? Colors.brand : Colors.grey} 
                  />
                  <Text
                    style={[styles.label, isFocused && styles.labelFocused]}
                    className="font-poppins-semibold">
                    Profil
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={Profile} />
      <Stack.Screen 
        name="Akun" 
        component={Akun}
        options={{ 
          tabBarStyle: { display: 'none' }
        }} 
      />
      <Stack.Screen 
        name="Perusahaan" 
        component={Perusahaan}
        options={{ 
          tabBarStyle: { display: 'none' }
        }} 
      />
      <Stack.Screen 
        name="Keamanan" 
        component={Keamanan}
        options={{ 
          tabBarStyle: { display: 'none' }
        }} 
      />
    </Stack.Navigator>
  );
};  
const TabNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs">
        {() => (
          <Tab.Navigator
            tabBar={props => <CustomTabBar {...props} />}
            screenOptions={screenOptions}>
            <Tab.Screen name="Dashboard" component={Dashboard} />
            <Tab.Screen
              name="PengujianTab"
              component={PengujianStack}
              options={({ route }) => ({
                tabBarStyle: getTabBarVisibility(route),
              })}
            />
            <Tab.Screen
              name="PembayaranTab"
              component={PembayaranStack}
              options={({ route }) => ({
                tabBarStyle: getTabBarVisibility(route),
              })}
            />
             <Tab.Screen 
              name="Profile" 
              component={ProfileStack}
              options={({ route }) => ({
                tabBarStyle: getTabBarVisibility(route),
              })} 
            />
          </Tab.Navigator>
        )}
      </Stack.Screen>
      <Stack.Screen name="Permohonan" component={PermohonanScreen} />
      <Stack.Screen
        name="TrackingPengujian"
        component={TrackingPengujianScreen}
      />
      <Stack.Screen
        name="PengujianPembayaran"
        component={PengujianPembayaran}
      />
      <Stack.Screen name="Multipayment" component={MultiPayment} />
      <Stack.Screen name="TitikUji" component={TitikUji} />
      <Stack.Screen name="FormTitikUji" component={FormTitikUji} />
      <Stack.Screen name="Parameter" component={Parameter} />
      <Stack.Screen name="TrackingList" component={TrackingList} />
      <Stack.Screen name="EditPermohonan" component={EditPermohonan} />
      <Stack.Screen name="TambahPermohonan" component={TambahPermohonan} />
      <Stack.Screen name="Pembayaran" component={Pembayaran} />
      <Stack.Screen name="PengujianDetail" component={PengujianDetail} />
      <Stack.Screen name="MultipaymentDetail" component={MultipaymentDetail} />
      <Stack.Screen
        name="Akun"
        component={Akun}
        options={{ tabBarStyle: { display: "none" } }}
      />
      <Stack.Screen
        name="Perusahaan"
        component={Perusahaan}
        options={{ tabBarStyle: { display: "none" } }}
      />
      <Stack.Screen
        name="Keamanan"
        component={Keamanan}
        options={{ tabBarStyle: { display: "none" } }}
      />
    </Stack.Navigator>
  );
};

export default function MainScreen() {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen name="TabNavigator" component={TabNavigator} />
        <Stack.Screen name="Profile" component={Profile} />
      </Stack.Navigator>
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