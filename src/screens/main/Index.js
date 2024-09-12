import axios from "@/src/libs/axios";
import { useUser } from "@/src/services";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator, DrawerContentScrollView } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Modal, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { Image } from "react-native-ui-lib";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import IonIcons from "react-native-vector-icons/Ionicons";
import Icon from "react-native-vector-icons/MaterialIcons";
import Pengujian from "../konfigurasi/Pengujian";
import Website from "../konfigurasi/Website";
import MasterNavigator from "../master/master/Index";
import IndexUser from "../master/user/Index";
import IndexWilayah from "../master/wilayah/Index";
import IndexPembayaran from "../pembayaran/Index";
import Index from "../pengujian/Index";
import Dashboard from "./Dashboard";
import Profile from "./Profile";
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
    height: 60,
    backgroundColor: "#312e81",
    borderTopWidth: 0, // Hilangkan border top untuk membuat tampilan lebih clean
  },
};

const Header = () => {
  return (
    <View className="flex flex-row gap-2 items-center mx-4">
      <Text className="text-white text-xl font-bold " >SI-LAJANG</Text>
      <Image
        source={require("@/assets/images/logo.png")}
        className="w-9 h-9"
      />
    </View>
  );
};

const customHeaderLeft = () => {
  const navigation = useNavigation();
  return (
    <View className="flex flex-row items-center justify-between">
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 10 }}>
        <IonIcons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      <Text className="text-white text-xl font-bold " >SI-LAJANG</Text>
      <Image
        source={require("@/assets/images/logo.png")}
        className="w-9 h-9"
      />
    </View>
  )
}

const TabNavigator = () => {
  return (
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
              ]}
            >
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
              ]}
            >
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
              ]}
            >
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
    </Tab.Navigator>
  );
};

const ProfileDetail = () => {
  const { data: user } = useUser();
  return (
    <View className="text-black p-3 border-b-[1px] m-2">
      <View className="flex gap-2">
        <Image source={{ uri: user.photo ?? "https://i.pinimg.com/originals/c0/27/be/c027bec07c2dc08b9df60921dfd539bd.webp" }}
          className="w-12 h-12 rounded-full" />
        <View className="flex gao-y-0">
          <Text className="text-xl font-bold" >{user.nama}</Text>
          <Text className="text-medium font-bold" >{user.email}</Text>
        </View>
      </View>
    </View>
  )
}

const CustomDrawerItem = ({ label, onPress, depth, isExpanded, isActive, hasSubItems, isSub, ionIcon, fontAwesome, setIcon }) => {
  const animatedHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: isExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isExpanded, animatedHeight]);

  const renderIcon = useMemo(() => {
    if(ionIcon){
      return <IonIcons name={ionIcon} size={21} color={isActive ? '#fff' : '#000'} />
    }
    if(fontAwesome){
      return <FontAwesome5Icon name={fontAwesome} size={21} color={isActive ? '#fff' : '#000'} />
    }
    if(depth === 0 && hasSubItems && setIcon){
      return <IonIcons name={setIcon} size={21} color={isActive ? '#fff' : '#000'} />
    }
    return <Icon name="fiber-manual-record" size={8} color={isActive ? '#fff' : '#000'} />
  }, [ionIcon, fontAwesome, depth, hasSubItems, isActive, setIcon]);


  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex flex-row space-x-3 items-center py-4 ${isActive ? 'bg-indigo-900' : ''
        }`}
      style={{ paddingLeft: depth > 0 ? 5 + depth * 15 : 12, paddingRight: depth > 0 ? 5 + depth * 15 : 12, }}
    >
      {renderIcon}
      <Text className={`flex-1 ${isSub ? 'text-[15px]' : 'text-[17px]'} ${isActive ? 'text-white' : 'text-indigo-900'}`}>{label}</Text>
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

  const Logout = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const queryClient = useQueryClient();

    const { mutate: logout } = useMutation(
      () => axios.post("/auth/logout"),
      {
        onSuccess: async () => {
          await AsyncStorage.removeItem("@auth-token");
          Toast.show({
            type: "success",
            text1: "Logout Berhasil",
          });
          queryClient.invalidateQueries(["auth", "user"]);
        },
        onError: () => {
          Toast.show({
            type: "error",
            text1: "Gagal Logout",
          });
        },
      }
    );

    const handleLogout = () => {
      setModalVisible(true);
    };

    const confirmLogout = () => {
      setModalVisible(false);
      logout();
    };

    return (
      <View style={{ paddingHorizontal: 13, paddingBottom: 20 }}>
        <View style={{
          height: 1,
          backgroundColor: 'black', // Warna garis
          marginBottom: 10, // Jarak antara garis dan button
        }}
        />
        <TouchableHighlight
          onPress={handleLogout}
          underlayColor="rgba(242, 65, 110, 0.2)"
          style={{
            borderRadius: 5,
            paddingVertical: 10,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }} className="ml-2">
            <IonIcons name="log-out" size={25} color="#f2416e" />
            <Text className="font-semibold text-lg ml-2" style={{ color: "#f2416e" }}>
              Logout
            </Text>
          </View>
        </TouchableHighlight>

        <Modal
          transparent={true}
          visible={modalVisible}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}>
            <View style={{
              width: 300,
              padding: 20,
              backgroundColor: 'white',
              borderRadius: 10,
              alignItems: 'center',
            }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>Konfirmasi Logout</Text>

              <View style={{
                width: '100%',
                borderBottomWidth: 1,
                borderBottomColor: '#dedede',
                marginBottom: 15,
              }} />

              <Text style={{ fontSize: 16, marginBottom: 25 }}>Apakah Anda yakin ingin keluar?</Text>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    backgroundColor: '#dedede',
                    borderRadius: 5,
                    marginRight: 10,
                  }}
                >
                  <Text style={{ color: 'black' }}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={confirmLogout}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    backgroundColor: '#f2416e',
                    borderRadius: 5,
                  }}
                >
                  <Text style={{ color: 'white' }}>Ya, Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

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
    { name: "Home", screen: "Home", ionIcon: "home" },
    { name: "Profile", screen: "Profile", ionIcon: "person" },
    {
      name: "Master",
      setIcon: "grid",
      subItems: [
          { name: 'Master', screen: 'Master', params: {screen: 'MasterIndex'} },
          { name: 'User', screen: 'User' },
          { name: 'Wilayah', screen: 'Wilayah' },
      ],
    },
    {
      name: "Konfigurasi",
      fontAwesome: "wrench",
      subItems: [
        { name: "Pengujian", screen: "Pengujian" },
        { name: "Website", screen: "Website" },
      ],
    },
  ];

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <View style={{ flexGrow: 1 }}>
        <ProfileDetail />
        {customDrawerItems.map((item) => renderMenuItem(item))}
      </View>
      <Logout />
    </DrawerContentScrollView>
  );
};

const Admin = () =>  (
    <NavigationContainer independent={true}>
      <Drawer.Navigator
        drawerContent={(props) => <DrawerContent {...props} />}
        screenOptions={{
          headerRight: () => <Header />,
          headerTitle: () => <Text></Text>,
          headerStyle: { backgroundColor: "#312e81" },
          headerTintColor: "white",
          drawerActiveBackgroundColor: "#312e81",
          drawerActiveTintColor: "#fff"
        }}
      >
        <Drawer.Screen name="Home" component={TabNavigator} />
        <Drawer.Screen name="Profile" component={Profile} />
        {/* <Drawer.Screen name="MasterIndex" component={MasterNavigator} /> */}
        <Drawer.Screen name="Master" component={MasterNavigator} />
        <Drawer.Screen name="User" component={IndexUser} />
        <Drawer.Screen name="Wilayah" component={IndexWilayah} />
        <Drawer.Screen name="Pengujian" component={Pengujian} />
        <Drawer.Screen name="Website" component={Website} />
      </Drawer.Navigator>
    </NavigationContainer>
  )


const NonAdmin = () => (
    <NavigationContainer independent={true}>
    <Stack.Navigator>
      <Stack.Screen name="Dashboard" component={Dashboard} />
    </Stack.Navigator>
  </NavigationContainer>
)


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
