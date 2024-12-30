import React from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  NavigationContainer,
  getFocusedRouteNameFromRoute,
} from "@react-navigation/native";
import { Colors } from "react-native-ui-lib";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Kontak from "./Kontak/Index";
import FAQ from "./FAQ";
import DashboardLanding from "./DashboardLanding";
import IonIcons from "react-native-vector-icons/Ionicons";
import Layanan from "./Layanan";
import ProdukHukum from "./ProdukHukum/Index";
import Alurpermohonan from "./Layanan/Alurpermohonan";
import StartLayanan from "./Layanan/StartLayanan";
import MaklumatPelayanan from "./Layanan/MaklumatPelayanan";
import PeraturanGubernur from "./ProdukHukum/PeraturanGubernur";
import PeraturanMenteriRepublikIndonesia from "./ProdukHukum/PeraturanMenteriRepublikIndonesia";
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
import Auth from "../auth/Index";
const { Navigator, Screen } = createNativeStackNavigator();
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const route = state.routes[state.index];
  const routeName = getFocusedRouteNameFromRoute(route) ?? "";

  const hideOnScreens = ["Auth"];

  if (hideOnScreens.includes(routeName)) {
    return null;
  }

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
              <IonIcons
                name={
                  route.name === "Dashboard"
                    ? "home"
                    : route.name === "Layanan"
                    ? "layers-sharp"
                    : route.name === "ProdukHukum"
                    ? "library"
                    : route.name === "FAQ"
                    ? "book"
                    : "call"
                }
                size={25}
                color={isFocused ? Colors.brand : "#5f5f5f"}
              />
              <Text
                style={[styles.label, isFocused && styles.labelFocused]}
                className="font-poppins-semibold">
                {route.name === "Dashboard"
                  ? "Beranda"
                  : route.name === "Layanan"
                  ? "Layanan"
                  : route.name === "ProdukHukum"
                  ? "Produk Hukum"
                  : route.name === "FAQ"
                  ? "FAQ"
                  : "Kontak"}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const DashboardLandingNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardLanding} />
      <Stack.Screen name="Auth" component={Auth} />
    </Stack.Navigator>
  );
};
const LayananStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LayananMain" component={Layanan} />
      <Stack.Screen name="AlurPermohonan" component={Alurpermohonan} />
      <Stack.Screen name="StartLayanan" component={StartLayanan} />
      <Stack.Screen name="MaklumatPelayanan" component={MaklumatPelayanan} />
    </Stack.Navigator>
  );
};
const ProdukHukumStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProdukHukum" component={ProdukHukum} />
      <Stack.Screen name="PeraturanGubernur" component={PeraturanGubernur} />
      <Stack.Screen
        name="PeraturanMenteriRepublikIndonesia"
        component={PeraturanMenteriRepublikIndonesia}
      />
    </Stack.Navigator>
  );
};

export default function MainScreen() {
  return (
    <>
      <NavigationContainer independent={true}>
        <Tab.Navigator
          tabBar={props => <CustomTabBar {...props} />}
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarShowLabel: false,
            tabBarStyle: (() => {
              const routeName = getFocusedRouteNameFromRoute(route);
              const hideOnScreens = [
              ];

              if (hideOnScreens.includes(routeName)) {
                return {
                  display: "none",
                  height: 0,
                  opacity: 0,
                  position: "absolute",
                };
              }

              return styles.tabBar;
            })(),
          })}>
          <Tab.Screen
            name="Dashboard"
            component={DashboardLandingNavigator}
            options={({ route }) => ({
              tabBarVisible: getFocusedRouteNameFromRoute(route) === "Layanan",
            })}
          />
          <Tab.Screen
            name="Layanan"
            component={LayananStackNavigator}
            options={({ route }) => ({
              tabBarVisible: getFocusedRouteNameFromRoute(route) === "Layanan",
            })}
          />
          <Tab.Screen
            name="ProdukHukum"
            component={ProdukHukumStackNavigator}
            options={({ route }) => ({
              tabBarVisible:
                getFocusedRouteNameFromRoute(route) === "ProdukHukum",
            })}
          />
          <Tab.Screen name="FAQ" component={FAQ} />
          <Tab.Screen name="Kontak" component={Kontak} />
        </Tab.Navigator>
      </NavigationContainer>
    </>
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
    fontSize: 10,
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
