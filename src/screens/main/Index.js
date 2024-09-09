import React, { useState, useEffect, useRef } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Animated, Easing } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Colors } from "react-native-ui-lib";
import IonIcons from "react-native-vector-icons/Ionicons";
import { Image } from "react-native-ui-lib";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
const { Navigator, Screen } = createNativeStackNavigator();
import Dashboard from "./Dashboard";
import Profile from "./Profile";
import Index from "../pengujian/Index";
import IndexPembayaran from "../pembayaran/Index";
import IndexMaster from "../master/Index";
import Sub from "../master/Sub";
import { useUser } from "@/src/services";

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

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
  const {data: user} = useUser();
  return (
    <View className="text-black p-3 border-b-[1px] m-2">
      <View className="flex gap-2">
        <Image source={{uri: user.photo ?? "https://i.pinimg.com/originals/c0/27/be/c027bec07c2dc08b9df60921dfd539bd.webp"}}
         className="w-12 h-12 rounded-full"/>
         <View className="flex gao-y-0">
            <Text className="text-xl font-bold" >{user.nama}</Text>
            <Text className="text-medium font-bold" >{user.email}</Text>
         </View>
      </View>
    </View>
  )
}

const CustomDrawerItem = ({ label, onPress, depth, isExpanded, isActive, hasSubItems, icon, setIcon }) => {
  const animatedHeight = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: isExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isExpanded]);

  const renderIcon = () => {
    if(icon){
      return <IonIcons name={icon} size={20} color={isActive ? '#fff' : '#000'} />
    }
    if(depth === 0 && hasSubItems && setIcon){
      return <IonIcons name={setIcon} size={20} color={isActive ? '#fff' : '#000'} />
    }
    return <Icon name="fiber-manual-record" size={8} color={isActive ? '#fff' : '#000'} />
  }


  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex flex-row space-x-2 items-center p-4 ${depth > 0 ? `pl-${8 + depth * 4}` : ''} ${
        isActive ? 'bg-indigo-900' : ''
      }`}
    >
      {renderIcon()}
      <Text className={`flex-1 text-[17px] ${isActive ? 'text-white' : 'text-black'}`}>{label}</Text>
      {hasSubItems && (
        <IonIcons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={isActive ? '#fff' : '#000'} />
      )}
    </TouchableOpacity>
  );
};

const DrawerContent = (props) => {
  const [expandedMenus, setExpandedMenus] = useState({});
  const [heights, setHeights] = useState({});

  const toggleSubMenu = (menuPath) => {
    setExpandedMenus(prev => {
      const newState = { ...prev };
      let current = newState;
      for (let i = 0; i < menuPath.length - 1; i++) {
        if (!current[menuPath[i]]) current[menuPath[i]] = {};
        current = current[menuPath[i]];
      }
      current._expanded = !current._expanded;
      return newState;
    });

    const pathKey = menuPath.join('-');
    const isCurrentlyExpanded = isExpanded(menuPath);

    Animated.timing(heights[pathKey], {
      toValue: isCurrentlyExpanded ? 0 : getSubMenuHeight(menuPath), 
      duration: 300,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
};


  const isExpanded = (menuPath) => {
    let current = expandedMenus;
    for (let key of menuPath) {
      if (!current[key]) return false;
      current = current[key];
    }
    return true;
  }

  const getSubMenuHeight = (menuPath) => {
    const visibleSubItemCount = getVisibleSubItemCount(menuPath);
    return visibleSubItemCount * 50; // Sesuaikan nilai 50 sesuai dengan tinggi item Anda
  };
  

  const getVisibleSubItemCount = (menuPath) => {
    let current = customDrawerItems;
    for (let key of menuPath) {
      current = current.find(item => item.name === key)?.subItems;
      if (!current) return 0;
    }
    return current.length;
  }

  const renderMenuItem = (item, depth = 0, path = []) => {
    const currentPath = [...path, item.name];
    const expanded = isExpanded(currentPath);
    const pathKey = currentPath.join('-');

    // Initialize height Animated.Value if not already set
    useEffect(() => {
      if (!heights[pathKey]) {
        setHeights(prev => ({ ...prev, [pathKey]: new Animated.Value(expanded ? getSubMenuHeight(currentPath) : 0) }));
      }
    }, [pathKey]);

    return (
      <React.Fragment key={item.name}>
        <CustomDrawerItem
          label={item.name}
          onPress={() => {
            if (item.subItems) {
              toggleSubMenu(currentPath);
            } else if (item.screen) {
              props.navigation.navigate(item.screen);
            }
          }}
          depth={depth}
          isExpanded={expanded}
          isActive={props.state.routeNames[props.state.index] === item.screen}
          hasSubItems={!!item.subItems}
          icon={item.icon}
          setIcon={item.setIcon}
        />
        {item.subItems && (
          <Animated.View
            style={{
              height: heights[pathKey],
              overflow: 'hidden',
            }}
          >
            {item.subItems.map(subItem => renderMenuItem(subItem, depth + 1, currentPath))}
          </Animated.View>
        )}
      </React.Fragment>
    );
};


  const customDrawerItems = [
    { name: 'Home', screen: 'Home', icon: 'home' },
    { name: 'Profile', screen: 'Profile', icon: 'person' },
    {
      name: 'Master',
      setIcon: 'grid',
      subItems: [
        {
          name: 'Master',
          subItems: [
            { name: 'Sub', screen: 'Sub' },
            { name: 'Sub Sub Menu 2', screen: 'SubSubMenu2' },
          ]
        },
        {
          name: 'User',
          subItems: [
            { name: 'Sub', screen: 'Sub' },
            { name: 'Sub Sub Menu 2', screen: 'SubSubMenu2' },
          ]
        },
        {
          name: 'Wilayah',
          subItems: [
            { name: 'Sub', screen: 'Sub' },
            { name: 'Sub Sub Menu 2', screen: 'SubSubMenu2' },
          ]
        },
      ],
    },
  ];

  return (
    <DrawerContentScrollView {...props} className="flex-1">
      <ProfileDetail />
      {customDrawerItems.map(item => renderMenuItem(item))}
    </DrawerContentScrollView>
  );
};

export default function MainScreen() {
  return (
    <NavigationContainer independent={true}>
      <Drawer.Navigator 
        drawerContent={(props) => <DrawerContent {...props}/>} 
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
        <Drawer.Screen name="Sub" component={Sub} />
      </Drawer.Navigator>
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
