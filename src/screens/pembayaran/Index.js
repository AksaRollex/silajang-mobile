import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Entypo';
import PengambilanSampel from "./PengambilanSampel";

import Pembayaran from './Pembayaran';
import EditPembayaran from '../formComponent/EditPembayaran'
import Detail from './Detail';
import Pengujian from './Pengujian';
import NonPengujian from './NonPengujian';
import Global from './Global';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const screenOptions = {
  tabBarShowLabel: false,
  headerShown: false,
  tabBarStyle: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    elevation: 0,
    height: 60,
    backgroundColor: '#fff',
  },
};

export default function MainScreen() {
  return (
    <NavigationContainer independent={true}>
      <Tab.Navigator screenOptions={screenOptions}>
  

        <Tab.Screen
          name="Pembayaran"
          component={Pembayaran}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={styles.iconContainer}>
                <Icon name="user" size={24} color={focused ? "#16247d" : "#111"} />
                <Text style={{ fontSize: 12, color: focused ? "#16247d" : "#111" }}>Pembayaran</Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="EditPembayaran"
          component={EditPembayaran}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={styles.iconContainer}>
                <Icon name="user" size={24} color={focused ? "#16247d" : "#111"} />
                <Text style={{ fontSize: 12, color: focused ? "#16247d" : "#111" }}>EditPembayaran</Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Detail"
          component={Detail}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={styles.iconContainer}>
                <Icon name="user" size={24} color={focused ? "#16247d" : "#111"} />
                <Text style={{ fontSize: 12, color: focused ? "#16247d" : "#111" }}>Detail</Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="PengambilanSampel"
          component={PengambilanSampel}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={styles.iconContainer}>
                <Icon name="user" size={24} color={focused ? "#16247d" : "#111"} />
                <Text style={{ fontSize: 12, color: focused ? "#16247d" : "#111" }}>PengambilanSampel</Text>
              </View>
            ),
          }}
        />
        <Stack.Screen name="Pengujian" component={Pengujian}/>
        <Stack.Screen name="NonPengujian" component={NonPengujian}/>
        <Stack.Screen name="Global" component={Global}/>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
