import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Animated,
} from "react-native";
import axios from "@/src/libs/axios";
import Akun from "./Akun";
import Perusahaan from "./Perusahaan";
import Keamanan from "./Keamanan";
import Ionicons from "react-native-vector-icons/Ionicons";
import Fontawesome5 from "react-native-vector-icons/FontAwesome5";

export default function Profile() {
  const [activeComponent, setActiveComponent] = useState(null);
  const [userData, setUserData] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    axios
      .get("/auth")
      .then((response) => {
        setUserData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const handlePress = (component) => {
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

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header} />
        <View style={styles.cardContainer}>
          <View style={[styles.profileCard, styles.shadow]}>
            <View style={styles.photoProfileCard}>
              <Image
                style={styles.image}
                source={{
                  uri: "https://i.pinimg.com/originals/c0/27/be/c027bec07c2dc08b9df60921dfd539bd.webp",
                }}
                resizeMode="cover"
              />
            </View>
            <View style={styles.ProfileCardText}>
              {userData ? (
                <>
                  <View style={styles.iconTextRow}>
                    <Fontawesome5 name="user-circle" color="#64748b" />
                    <Text style={styles.text}>{userData.user.nama}</Text>
                  </View>
                  <View style={styles.iconTextRow}>
                    <Ionicons name="mail" color="#64748b" />
                    <Text style={styles.text}>{userData.user.email}</Text>
                  </View>
                  <View style={styles.iconTextRow}>
                    <Fontawesome5 name="phone-alt" color="#64748b" />
                    <Text style={styles.text}>{userData.user.phone}</Text>
                  </View>
                  <View style={styles.iconTextRow}>
                    <Fontawesome5 name="user-check" color="#64748b" />
                    <Text style={styles.text}>{userData.user.golongan.nama}</Text>
                  </View>
                </>
              ) : (
                <Text style={styles.text}>Loading...</Text>
              )}
            </View>
          </View>

          {/* Instruction to Edit Profile */}
          <View style={styles.editProfileTextContainer}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </View>
          <View style={styles.divider} />

          {/* Buttons for switching components */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.buttonBox,
                activeComponent === "Akun" && styles.activeButtonBox,
              ]}
              onPress={() => handlePress("Akun")}
            >
              <Ionicons name="person" color="#6b7fde" size={20} />
              <Text style={styles.buttonText}>Akun</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.buttonBox,
                activeComponent === "Keamanan" && styles.activeButtonBox,
              ]}
              onPress={() => handlePress("Keamanan")}
            >
              <Fontawesome5 name="lock" color="#6b7fde" size={20} />
              <Text style={styles.buttonText}>Keamanan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.buttonBox,
                activeComponent === "Perusahaan" && styles.activeButtonBox,
              ]}
              onPress={() => handlePress("Perusahaan")}
            >
              <Fontawesome5 name="briefcase" color="#6b7fde" size={20} />
              <Text style={styles.buttonText}>Perusahaan</Text>
            </TouchableOpacity>
          </View>

          {/* Animated form rendering */}
          <Animated.View style={[styles.activeComponentContainer, { opacity: fadeAnim }]}>
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
    backgroundColor: "#f8f8f8",
  },
  header: {
    height: 220,
    backgroundColor: "#312e81",
    justifyContent: "flex-end",
    zIndex: 1,
  },
  cardContainer: {
    marginTop: -30,
    backgroundColor: "#f8f8f8",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 28,
    paddingTop: 20,
    zIndex: 2,
    alignItems: "center",
  },
  profileCard: {
    height: 150,
    width: 375,
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
    marginTop: 18,
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
    marginTop: 10,
    width: "100%",
    paddingHorizontal: 10,
  },
  buttonBox: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
    margin: 10,
    position: "relative",
  },
  activeButtonBox: {
    backgroundColor: "#e1e7ff",
  },
  buttonText: {
    color: "#6b7fde",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 5,
  },
  activeComponentContainer: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 20,
  },
});
