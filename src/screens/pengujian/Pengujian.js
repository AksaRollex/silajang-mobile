import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import Header from "../components/Header";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import FooterText from "../components/FooterText";
export default function Pengujian() {
  const [refreshing, setRefreshing] = useState(false);
  const [accordionExpanded, setAccordionExpanded] = useState(false);
  const [activeComponent, setActiveComponent] = useState(null);
  const navigation = useNavigation();
  const onRefresh = () => {
    setRefreshing(false);
    setRefreshing(true);
  };

  const toggleAccordion = () => {
    setAccordionExpanded(!accordionExpanded);
  };

  const handleMenuSelection = option => {
    setActiveComponent(option);
  };

  const buttonPressPermohonan = () => {
    navigation.navigate("Permohonan");
  };

  const buttonPressTrackingPengujian = () => {
    navigation.navigate("TrackingPengujian");
  };

  return (
    <>
      <Header />
      <View style={styles.container}>
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />

        {/* Accordion for Pengujian */}
        <TouchableOpacity
          style={styles.accordionItem}
          onPress={toggleAccordion}>
          <Text style={styles.title} className="font-bold">
            Pilih Menu Pengujian
          </Text>

          <MaterialIcons
            name={
              accordionExpanded ? "keyboard-arrow-down" : "keyboard-arrow-right"
            }
            size={20}
            color="#808080"
          />
        </TouchableOpacity>

        {accordionExpanded && (
          <View style={styles.subMenu}>
            <TouchableOpacity
              style={styles.subMenuItem}
              onPress={buttonPressPermohonan}>
              <Text style={styles.subMenuText}>Permohonan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.subMenuItem}
              onPress={buttonPressTrackingPengujian}>
              <Text style={styles.subMenuText}>Tracking Pengujian</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ececec",
  },
  accordionItem: {
    backgroundColor: "white",
    borderBottomWidth: 2,
    borderBottomColor: "#ececec",
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    color: "#000",
  },
  subMenu: {},
  subMenuItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "white",
  },
  subMenuText: {
    fontSize: 14,
    color: "black",
  },
  defaultView: {
    marginTop: 20,
    alignItems: "center",
  },
  defaultText: {
    fontSize: 16,
    color: "#808080",
  },
});
