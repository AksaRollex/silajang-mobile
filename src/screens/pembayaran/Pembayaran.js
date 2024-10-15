import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from "react-native";
import Header from "../components/Header";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import FooterText from "../components/FooterText";
export default function PembayaranStack() {
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

  const buttonPressPengujianPembayaran = () => {
    navigation.navigate("PengujianPembayaran");
  };

  const buttonPressMultipayment = () => {
    navigation.navigate("Multipayment");
  };

  return (
    <>
      <Header
        navigate={() => {
          navigation.navigate("Profile");
        }}
      />
      <View style={styles.container}>
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />

        {/* Accordion for Pengujian */}
        <TouchableOpacity
          style={styles.accordionItem}
          onPress={toggleAccordion}>
          <Text style={styles.title} className="font-bold">
            Pilih Menu Pembayaran
          </Text>
          <MaterialIcons
            name={
              accordionExpanded ? "keyboard-arrow-down" : "keyboard-arrow-right"
            }
            size={20}
            color="#808080"
          />
        </TouchableOpacity>
        <ScrollView>
          {accordionExpanded && (
            <View style={styles.subMenu}>
              <TouchableOpacity
                style={styles.subMenuItem}
                onPress={buttonPressPengujianPembayaran}>
                <Text style={styles.subMenuText}>Pengujian</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.subMenuItem}
                onPress={buttonPressMultipayment}>
                <Text style={styles.subMenuText}>Multi Payment</Text>
              </TouchableOpacity>
            </View>
          )}
          <FooterText />
        </ScrollView>
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
