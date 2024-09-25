import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import React from "react";
import { Colors } from "react-native-ui-lib";
import { useNavigation } from "@react-navigation/native";

const baseRem = 16;
const rem = multiplier => baseRem * multiplier;

export default function Header() {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>SI-LAJANG</Text>
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
  },
  headerContainer: {
    width: "100%",
    paddingVertical: 10,
    backgroundColor: Colors.brand,
    alignItems: "center",
    justifyContent: "flex-end",
    flexDirection: "row",
    elevation: 4,
    paddingHorizontal: "5%",
  },
  profileImage: {
    width: rem(2.25),
    height: rem(2.25),
    borderRadius: rem(2.75) / 2,
  },
  logo: {
    width: rem(2.25),
    height: rem(2.25),
  },
  headerText: {
    fontSize: rem(1.25),
    color: "white",
    fontWeight: "bold",
    lineHeight: rem(1.75),
  },
});
