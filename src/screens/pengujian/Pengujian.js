import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, RefreshControl } from "react-native";
import React, { useState } from "react";
import { Colors } from "react-native-ui-lib";
import Permohonan from "./Permohonan";
import TrackingPengujian from "./TrackingPengujian";

export default function Pengujian() {
  const [activeComponent, setActiveComponent] = useState(null);
  const [ refreshing, setRefreshing ] = useState(false);

  const onRefresh = () => {
    setRefreshing(false);
    setRefreshing(true);
  }
  let RenderedComponent;
  switch (activeComponent) {
    case "Permohonan":
      RenderedComponent = <Permohonan />;
      break;
    case "Tracking Pengujian":
      RenderedComponent = <TrackingPengujian />;
      break;
    default:
      RenderedComponent = null;
      break;
  }

  return (
    <View style={styles.container} >
      <ScrollView contentContainerStyle={styles.contentContainer} refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    }>
        <View style={styles.headerContainer}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logo}
          />
          <Text style={styles.headerText}>SI - LAJANG</Text>
        </View>
        {/* Render the active component here */}
        {/* <View style={{ display : 'flex', alignItems : 'center', justifyContent : 'center' }}>
          <Text style={{ fontSize : 20, }}>
            Pilih Menu Pengujian
          </Text>
        </View> */}
        <View style={styles.activeComponentContainer}>{RenderedComponent}</View>
      </ScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setActiveComponent("Permohonan")}>
          <Text style={styles.buttonText}>Permohonan</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setActiveComponent("Tracking Pengujian")}>
          <Text style={styles.buttonText}>Tracking Pengujian</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(13, 71, 161, 0.2)",
    justifyContent: "flex-start", // Ensure content starts from the top
  },
  contentContainer: {
    paddingBottom: 100, // Add padding to avoid content being hidden behind the buttons
  },
  headerContainer: {
    width: "100%",
    paddingVertical: 10,
    backgroundColor: Colors.brand,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    elevation: 4,
  },
  logo: {
    width: 40,
    height: 40,
    marginTop: 8,
  },
  headerText: {
    fontSize: 22,
    color: "white",
    fontWeight: "bold",
    marginLeft: 10,
    alignSelf: "center",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0, // Position buttons at the bottom
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    marginBottom : 60,
    // backgroundColor: "rgba(255, 255, 255, 0.9)", // Optional: Semi-transparent background
  },
  button: {
    paddingVertical: 10,
    width: 190,
    borderRadius: 10,
    margin: 10,
    borderWidth : 1,
    borderColor : "rgba(13, 71, 161, 0.2)",
    backgroundColor: "#6b7fde",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    alignSelf: "center",
    fontWeight: "bold",
  },
  activeComponentContainer: {
    flex: 1,
    width: "100%",
  },
});
