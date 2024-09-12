import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Entypo";

import TrackingList from "./TrackingList";
import Pengujian from "./Pengujian";
import TitikUji from "./TitikUji";
import Parameter from "./Parameter";
import EditPermohonan from "../formComponent/EditPermohonan";
import EditTitikUji from "../formComponent/EditTitikUji";
import EditPembayaran from "../formComponent/EditPembayaran";
import TambahPermohonan from "../formComponent/TambahPermohonan";
import Penerima from "./Penerima";
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
    backgroundColor: "#fff",
  },
};

export default function MainScreen() {
  return (
    <NavigationContainer independent={true}>
      <Tab.Navigator screenOptions={screenOptions}>
        <Tab.Screen
          name="Pengujian"
          component={Pengujian}
          options={{
            tabBarIcon: ({ focused }) => (
              <View>
                <Icon
                  name="user"
                  size={24}
                  color={focused ? "#16247d" : "#111"}
                />
                <Text
                  style={{ fontSize: 12, color: focused ? "#16247d" : "#111" }}>
                  Pengujian
                </Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="TrackingList"
          component={TrackingList}
          options={{
            tabBarIcon: ({ focused }) => (
              <View>
                <Icon
                  name="user"
                  size={24}
                  color={focused ? "#16247d" : "#111"}
                />
                <Text
                  style={{ fontSize: 12, color: focused ? "#16247d" : "#111" }}>
                  Tracking List
                </Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="TitikUji"
          component={TitikUji}
          options={{
            tabBarIcon: ({ focused }) => (
              <View>
                <Icon
                  name="user"
                  size={24}
                  color={focused ? "#16247d" : "#111"}
                />
                <Text
                  style={{ fontSize: 12, color: focused ? "#16247d" : "#111" }}>
                  Titik Uji
                </Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Parameter"
          component={Parameter}
          options={{
            tabBarIcon: ({ focused }) => (
              <View>
                <Icon
                  name="user"
                  size={24}
                  color={focused ? "#16247d" : "#111"}
                />
                <Text
                  style={{ fontSize: 12, color: focused ? "#16247d" : "#111" }}>
                  Parameter
                </Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="EditPermohonan"
          component={EditPermohonan}
          options={{
            tabBarIcon: ({ focused }) => (
              <View>
                <Icon
                  name="user"
                  size={24}
                  color={focused ? "#16247d" : "#111"}
                />
                <Text
                  style={{ fontSize: 12, color: focused ? "#16247d" : "#111" }}>
                  EditPermohonan
                </Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="EditTitikUji"
          component={EditTitikUji}
          options={{
            tabBarIcon: ({ focused }) => (
              <View>
                <Icon
                  name="user"
                  size={24}
                  color={focused ? "#16247d" : "#111"}
                />
                <Text
                  style={{ fontSize: 12, color: focused ? "#16247d" : "#111" }}>
                  EditTitikUji
                </Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="EditPembayaran"
          component={EditPembayaran}
          options={{
            tabBarIcon: ({ focused }) => (
              <View>
                <Icon
                  name="user"
                  size={24}
                  color={focused ? "#16247d" : "#111"}
                />
                <Text
                  style={{ fontSize: 12, color: focused ? "#16247d" : "#111" }}>
                  EditPembayaran
                </Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="TambahPermohonan"
          component={TambahPermohonan}
          options={{
            tabBarIcon: ({ focused }) => (
              <View>
                <Icon
                  name="user"
                  size={24}
                  color={focused ? "#16247d" : "#111"}
                />
                <Text
                  style={{ fontSize: 12, color: focused ? "#16247d" : "#111" }}>
                  TambahPermohonan
                </Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Penerima"
          component={Penerima}
          options={{
            tabBarIcon: ({ focused }) => (
              <View>
                <Icon
                  name="user"
                  size={24}
                  color={focused ? "#16247d" : "#111"}
                />
                <Text
                  style={{ fontSize: 12, color: focused ? "#16247d" : "#111" }}>
                  Penerima
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
  },
});
