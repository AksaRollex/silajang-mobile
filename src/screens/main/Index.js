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
  ];
  if (hideOnScreens.includes(routeName)) {
    return { display: "none" };
  }
  return screenOptions.tabBarStyle;
};

// Custom Tab Bar Component with Dropdown
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const pengujianTabRef = useRef(null);
  const isFirstRender = useRef(true);

  // Prevent modal from showing on first render
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
        setDropdownVisible(true);
      });
    }
  };

  const navigateToScreen = screenName => {
    setDropdownVisible(false);
    navigation.navigate("Permohonan");
  };

  return (
    <View style={{ position: "relative" }}>
      {/* Dropdown Menu */}
      <Modal
        transparent={true}
        visible={dropdownVisible}
        onRequestClose={() => setDropdownVisible(false)}
        animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setDropdownVisible(false)}>
          <View
            style={[
              styles.dropdownContainer,
              {
                left: dropdownPosition.x,
                width: dropdownPosition.width,
                bottom: 60, // Position above tab bar
              },
            ]}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                navigation.navigate("Permohonan");
                setDropdownVisible(false); // Tutup dropdown setelah navigasi
              }}>
              <Text style={styles.dropdownText}>Permohonan</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                navigation.navigate("TrackingPengujian");
                setDropdownVisible(false); // Tutup dropdown setelah navigasi
              }}>
              <Text style={styles.dropdownText}>Tracking Pengujian</Text>
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
            navigation.navigate(route.name);
          };

          return (
            <TouchableOpacity
              key={index}
              onPress={onPress}
              ref={route.name === "PengujianTab" ? pengujianTabRef : null}
              style={styles.tabItem}>
              {route.name === "Dashboard" && (
                <View
                  style={[
                    styles.iconContainer,
                    isFocused && styles.iconContainerFocused,
                  ]}>
                  <Image
                    source={require("@/assets/images/home.png")}
                    style={[styles.logo, isFocused && styles.logoFocused]}
                  />
                  <Text
                    style={[styles.label, isFocused && styles.labelFocused]}>
                    Beranda
                  </Text>
                </View>
              )}
              {route.name === "PengujianTab" && (
                <View
                  style={[
                    styles.iconContainer,
                    isFocused && styles.iconContainerFocused,
                  ]}>
                  <Image
                    source={require("@/assets/images/approval.png")}
                    style={[styles.logo, isFocused && styles.logoFocused]}
                  />
                  <Text
                    style={[styles.label, isFocused && styles.labelFocused]}>
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
                  <Image
                    source={require("@/assets/images/wallet.png")}
                    style={[styles.logo, isFocused && styles.logoFocused]}
                  />
                  <Text
                    style={[styles.label, isFocused && styles.labelFocused]}>
                    Pembayaran
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

const TabNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs">
        {() => (
          <Tab.Navigator
            tabBar={props => <CustomTabBar {...props} />}
            screenOptions={screenOptions}>
            <Tab.Screen name="Dashboard" component={Dashboard} />
            <Tab.Screen name="PengujianTab" component={PengujianStack} />
            <Tab.Screen name="PembayaranTab" component={PembayaranStack} />
          </Tab.Navigator>
        )}
      </Stack.Screen>
      <Stack.Screen name="Permohonan" component={PermohonanScreen} />
      <Stack.Screen name="TrackingPengujian" component={TrackingPengujianScreen} />
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
  // Existing styles
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

  // Styles for dropdown and tab bar
  tabBar: {
    flexDirection: "row",
    backgroundColor: Colors.brand,
    height: 60,
  },
  tabItem: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dropdownContainer: {
    position: "absolute",
    backgroundColor: "white",
    borderRadius: 8,
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
