import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Animated,
  ActivityIndicator,
} from "react-native";
import axios from "@/src/libs/axios";
import Akun from "./tabs/Akun";
import Perusahaan from "./tabs/Perusahaan";
import Keamanan from "./tabs/Keamanan";
import Ionicons from "react-native-vector-icons/Ionicons";
import Fontawesome5 from "react-native-vector-icons/FontAwesome5";
import MaterialIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { API_URL } from "@env";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { Button } from "react-native-ui-lib";
import FastImage from "react-native-fast-image";
export default function Profile({ navigation }) {
  const [activeComponent, setActiveComponent] = useState("Akun");
  const [userData, setUserData] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const QueryClient = useQueryClient();const [imageLoadError, setImageLoadError] = useState(false);
  const fetchData = async () => {
    try {
      const response = await axios.get("/auth");
      const { nama, email, phone, golongan, photo } = response.data.user;
      console.log(response.data.user);
      setData({ nama, email, phone, golongan });
      setLoading(false);

      const fullImageUrl = `${API_URL}${photo}?t=${new Date().getTime()}`;
      setImageUrl(fullImageUrl);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    axios
      .get("/auth")
      .then(response => {
        setUserData(response.data);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const handlePress = component => {
    setActiveComponent(component);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const handleCancel = () => {
    setActiveComponent(null);
  };

  let RenderedComponent;
  switch (activeComponent) {
    case "Akun":
      RenderedComponent = <Akun onCancel={handleCancel} />;
      break;
    case "Perusahaan":
      RenderedComponent = <Perusahaan onCancel={handleCancel} />;
      break;
    case "Keamanan":
      RenderedComponent = <Keamanan onCancel={handleCancel} />;
      break;
    default:
      RenderedComponent = null;
      break;
  }

  const { mutate: logout } = useMutation(() => axios.post("/auth/logout"), {
    onSuccess: async () => {
      await AsyncStorage.removeItem("@auth-token");
      Toast.show({
        type: "success",
        text1: "Logout Berhasil",
      });
      QueryClient.invalidateQueries(["auth", "user"]);
      navigation.navigate("Login");
    },
    onError: error => {
      Toast.show({
        type: "error",
        text1: "Gagal Logout",
      });
    },
  });

  return (
    <View style={styles.container}>
      <View
        style={{
          backgroundColor: "#312e81",
          flexDirection: "row",
          justifyContent: "flex-start",
        }}>
        <Button style={{ backgroundColor: "transparent" }} onPress={logout}>
          <MaterialIcons name="power" size={40} color="red" />
        </Button>
      </View>

      <ScrollView>
        <View style={styles.header} className="pt-52" />

        <View style={styles.cardContainer}>
          <View style={[styles.profileCard, styles.shadow]}>
            <View style={styles.photoProfileCard}>
              {imageUrl ? (
                <FastImage
                  style={styles.image}
                  source={{
                    uri: imageUrl,
                    priority: FastImage.priority.high,
                  }}
                  resizeMode={FastImage.resizeMode.cover}
                  onError={() => {
                    console.error("Error loading image:", imageUrl);
                    setImageLoadError(true);
                  }}
                />
              ) : (
                <View
                  style={[
                    styles.image,
                    {
                      backgroundColor: "#ddd",
                      justifyContent: "center",
                      alignItems: "center",
                    },
                  ]}>
                  <Text>No Image</Text>
                </View>
              )}
            </View>
            <View style={styles.ProfileCardText}>
              {userData ? (
                <>
                  <View style={styles.iconTextRow}>
                    <MaterialIcons
                      name="check-decagram"
                      color="#64748b"
                      size={13}
                    />
                    <Text style={styles.text}>{userData.user.nama}</Text>
                  </View>
                  <View style={styles.iconTextRow}>
                    <Ionicons name="mail" color="#64748b" />
                    <Text style={styles.text}>{userData.user.email}</Text>
                  </View>
                  <View style={styles.iconTextRow}>
                    <Fontawesome5 name="phone-alt" color="#64748b" size={11} />
                    <Text style={styles.text}>{userData.user.phone}</Text>
                  </View>
                  <View style={styles.iconTextRow}>
                    <Ionicons
                      name="person-circle-outline"
                      color="#64748b"
                      size={14}
                    />
                    <Text style={styles.text}>
                      {userData.user.golongan.nama}
                    </Text>
                  </View>
                </>
              ) : (
                <View className="flex-1 justify-center items-center">
                  <ActivityIndicator size="large" color="#4299e1" />
                </View>
              )}
            </View>
          </View>

          <View style={styles.editProfileTextContainer}></View>
          <View style={styles.divider} />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.buttonBox,
                activeComponent === "Akun" && styles.activeButtonBox,
              ]}
              onPress={() => handlePress("Akun")}>
              <View
                style={[
                  styles.buttonLine,
                  { backgroundColor: "#6b7fde" },
                  activeComponent === "Akun"
                    ? styles.activeButtonLine
                    : styles.inactiveButtonLine,
                ]}
              />
              <Ionicons name="person" color="#6b7fde" size={15} />
              <Text style={styles.buttonText}>Akun</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.buttonBox,
                activeComponent === "Keamanan" && styles.activeButtonBox,
              ]}
              onPress={() => handlePress("Keamanan")}>
              <View
                style={[
                  styles.buttonLine,
                  { backgroundColor: "#6b7fde" },
                  activeComponent === "Keamanan"
                    ? styles.activeButtonLine
                    : styles.inactiveButtonLine,
                ]}
              />
              <Fontawesome5 name="lock" color="#6b7fde" size={15} />
              <Text style={styles.buttonText}>Keamanan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.buttonBox,
                activeComponent === "Perusahaan" && styles.activeButtonBox,
              ]}
              onPress={() => handlePress("Perusahaan")}>
              <View
                style={[
                  styles.buttonLine,
                  { backgroundColor: "#6b7fde" },
                  activeComponent === "Perusahaan"
                    ? styles.activeButtonLine
                    : styles.inactiveButtonLine,
                ]}
              />
              <Fontawesome5 name="briefcase" color="#6b7fde" size={15} />
              <Text style={styles.buttonText}>Perusahaan</Text>
            </TouchableOpacity>
          </View>

          <Animated.View
            style={[styles.activeComponentContainer, { opacity: fadeAnim }]}>
            {RenderedComponent}
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ececec",
  },
  header: {
    backgroundColor: "#312e81",
    justifyContent: "flex-end",
    zIndex: 1,
  },
  cardContainer: {
    backgroundColor: "#f8f8f8",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 28,
    zIndex: 2,
    alignItems: "center",
  },
  profileCard: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginVertical: 20,
    backgroundColor: "white",
    overflow: "hidden",
    marginTop: -187,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  photoProfileCard: {
    height: 120,
    width: 120,
    marginHorizontal: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
  image: {
    height: "100%",
    width: "100%",
  },
  ProfileCardText: {
    width: 220,
    height: 120,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  iconTextRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    color: "#333",
    fontSize: 14,
    paddingVertical: 4,
    paddingHorizontal: 12,
    fontWeight: "600",
    lineHeight: 24,
  },
  editProfileTextContainer: {
    marginBottom: 10,
    alignItems: "center",
  },
  editProfileText: {
    color: "#64748b",
    fontSize: 19,
    fontWeight: "bold",
  },
  divider: {
    width: "90%",
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 10,
    alignSelf: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 2,
    width: "95%",
    paddingHorizontal: 10,
  },
  activeButtonBox: {
    backgroundColor: "#e1e7ff",
  },
  buttonText: {
    color: "black",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 5,
  },
  activeComponentContainer: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 20,
  },
  buttonLine: {
    position: "absolute",
    top: 0,
    width: "97%",
    height: 4,
    borderRadius: 0,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    zIndex: 1,
  },
  activeButtonLine: {
    backgroundColor: "#312e81",
  },
  inactiveButtonLine: {
    backgroundColor: "#6b7fde",
  },

  buttonBox: {
    width: 100,
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
    margin: 10,
    position: "relative",
  },
});
