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
const { Navigator, Screen } = createNativeStackNavigator();

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
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
    height: 65,
    backgroundColor: "#ffffff",
    borderTopWidth: 0.5,
    borderTopColor: "#E5E7EB",
    paddingHorizontal: 10,
  },
};
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
      // 'customer'
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
              if (navigation.isFocused()) {
                e.preventDefault();
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Pengujian' }],
                });
              }
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


const ProfileDetail = () => {
  const { data: user } = useUser();
  return (
    <View className="relative mb-5" style={{}}>
      {/* Background Image Container */}
      <View className="relative h-[160px] overflow-hidden">
        <Image
          source={require("@/assets/images/background.png")}
          className="w-full h-full absolute top-0 left-0"
          style={{ resizeMode: 'cover', }}
        />

        {/* Profile Content - Positioned over the background */}
        <View className="absolute p-2 mt-11">
          <View className="flex flex-row items-center gap-2">
            <Image
              source={{ uri: "https://i.pinimg.com/originals/c0/27/be/c027bec07c2dc08b9df60921dfd539bd.webp" }}
              className="w-12 h-12 rounded-full"
            />
            <View className="flex gap-y-0">
              <Text className="text-[17px] font-poppins-semibold text-white drop-shadow-lg">
                {user.nama}
              </Text>
              <Text className="text-sm font-poppins-semibold text-white/90 drop-shadow-lg">
                {user.email}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const CustomDrawerItem = ({ label, onPress, depth, isExpanded, isActive, hasSubItems, isSub, ionIcon, fontAwesome, fontAwesome6, setIcon }) => {
  const animatedHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: isExpanded ? 1 : 0,
      duration: 350,
      useNativeDriver: false,
    }).start();
  }, [isExpanded, animatedHeight]);

  const renderIcon = useMemo(() => {
    if (ionIcon) {
      return <IonIcons name={ionIcon} size={21} color={isActive ? '#312e81' : '#6b7280'} />
    }
    if (fontAwesome) {
      return <FontAwesome5Icon name={fontAwesome} size={21} color={isActive ? '#312e81' : '#6b7280'} />
    }
    if (fontAwesome6) {
      return <FontAwesome6Icon name={fontAwesome6} size={19} color={isActive ? '#312e81' : '#6b7280'} />
    }
    if (depth === 0 && hasSubItems && setIcon) {
      return <IonIcons name={setIcon} size={21} color={isActive ? '#312e81' : '#6b7280'} />
    }
    return <Icon name="fiber-manual-record" size={8} color={isActive ? '#312e81' : '#6b7280'} />
  }, [ionIcon, fontAwesome, depth, hasSubItems, isActive, setIcon]);


  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex flex-row space-x-3 items-center py-3 mx-2 my-1 rounded-lg ${isActive
        ? 'bg-indigo-100' // Light blue background when active
        : 'bg-transparent'
        }`}
      style={{
        paddingLeft: depth > 0 ? 5 + depth * 15 : 12,
        paddingRight: depth > 0 ? 5 + depth * 15 : 12,
      }}
    >
      {renderIcon}
      <Text
        className={`flex-1 font-poppins-medium ${isSub ? 'text-[15px]' : 'text-[16px]'
          } ${isActive
            ? 'text-[#312e81]' // Dark blue text when active
            : 'text-gray-500' // Gray text when inactive
          }`}
      >
        {label}
      </Text>
      {hasSubItems && (
        <Animated.View style={{
          transform: [{
            rotate: animatedHeight.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '180deg']
            })
          }]
        }}>
          <IonIcons name="chevron-down" size={20} color={isActive ? '#fff' : '#000'} />
        </Animated.View>
      )}
    </TouchableOpacity>
  );
};

const DrawerContent = (props) => {
  const [expandedMenus, setExpandedMenus] = useState({});
  const heightRef = useRef({});
  const queryClient = useQueryClient();

  const { data: user } = useUser();
  
  const toggleSubMenu = useCallback((menuName) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  }, []);

  const isExpanded = useCallback(
    (menuName) => {
      return !!expandedMenus[menuName];
    },
    [expandedMenus]
  );

  const getSubMenuHeight = useCallback((item) => {
    if (!item.subItems) return 0;
    return 50 * item.subItems.length;
  }, []);

  const animateHeight = useCallback((menuName, toValue) => {
    if (!heightRef.current[menuName]) {
      heightRef.current[menuName] = new Animated.Value(0);
    }
    Animated.timing(heightRef.current[menuName], {
      toValue,
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  }, []);

  const renderMenuItem = useCallback(
    (item) => {
      const expanded = isExpanded(item.name);
      const hasSubItems = item.subItems && item.subItems.length > 0;

      useEffect(() => {
        if (expanded) {
          animateHeight(item.name, getSubMenuHeight(item));
        } else {
          animateHeight(item.name, 0);
        }
      }, [expanded, item]);

      const handlePress = () => {
        if (hasSubItems) {
          toggleSubMenu(item.name);
        } else if (item.screen) {
          props.navigation.navigate(item.screen);
        }
      };

      return (
        <React.Fragment key={item.name}>
          <CustomDrawerItem
            label={item.name}
            onPress={handlePress}
            depth={0}
            isExpanded={expanded}
            isActive={props.state.routeNames[props.state.index] === item.screen}
            hasSubItems={hasSubItems}
            ionIcon={item.ionIcon}
            fontAwesome={item.fontAwesome}
            fontAwesome6={item.fontAwesome6}
            setIcon={item.setIcon}
          />
          {hasSubItems && (
            <Animated.View
              style={{
                height: heightRef.current[item.name] || new Animated.Value(0),
                overflow: 'hidden',
              }}
            >
              {item.subItems.map((subItem) => (
                <CustomDrawerItem
                  key={subItem.name}
                  label={subItem.name}
                  onPress={() => props.navigation.navigate(subItem.screen, subItem.params)}
                  isActive={props.state.routeNames[props.state.index] === subItem.screen}
                  depth={1}
                  isSub={true}
                  hasSubItems={false}
                />
              ))}
            </Animated.View>
          )}
        </React.Fragment>
      );
    },
    [
      isExpanded,
      toggleSubMenu,
      animateHeight,
      getSubMenuHeight,
      props.navigation,
      props.state.index,
      props.state.routeNames,
    ]
  );

  const customDrawerItems = [
    { name: "Home", screen: "Home", fontAwesome6: "house", },

    ...(user?.role?.name !== 'admin' ? [
      { name: "Profile", screen: "Profile", fontAwesome6: "user-large" }
    ] : []),

    ...(user?.role?.name === 'admin' ? [{
      name: "Master",
      fontAwesome6: "gear",
      subItems: [
        { name: 'Master', screen: 'Master', params: { screen: 'MasterIndex' } },
        { name: 'User', screen: 'User' },
        { name: 'Wilayah', screen: 'Wilayah' },
      ],
    }] : []),

    ...(['admin', 'koordinator-administrasi', 'koordinator-teknis', 'kepala-upt'].includes(user?.role?.name) ? [{
      name: "Konfigurasi",
      fontAwesome: "wrench",
      subItems: [
        { name: "Pengujian", screen: "PengujianKonfig", params: { screen: 'KonfigurasiIndex' } },
      ],
    }] : []),
  ];

  // return (
  //   <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
  //     <View style={{ flexGrow: 1 }}>
  //       {/* <ProfileDetail /> */}
  //       {/* {customDrawerItems.map((item) => renderMenuItem(item))} */}
  //     </View>
  //     {/* <Logout /> */}
  //   </DrawerContentScrollView>
  // );
};

const Admin = () => (
  <NavigationContainer independent={true}>
    <Stack.Navigator
      screenOptions={{
        headerRight: () => <Header />,
        headerTitle: () => <Text></Text>,
        headerBackVisible: false,
        headerStyle: {
          backgroundColor: "#312e81",
          borderBottomWidth: 0,        
        },
        headerTintColor: "white",
        headerLeft: () => null,
        gestureEnabled: false,
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
);

export default function MainScreen() {
  // const { data: user } = useUser();

  return (
    // user.role.name === 'admin' ?
    <Admin />
    // : 
    // <NonAdmin />
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
