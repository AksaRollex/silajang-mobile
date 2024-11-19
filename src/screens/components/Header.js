import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import React from "react";
import { Colors } from "react-native-ui-lib";
import Icons from "react-native-vector-icons/Feather";

const baseRem = 16;
const rem = multiplier => baseRem * multiplier;

export default function Header({ navigate }) {
  return (
    <View style={styles.container}>
      <View className="p-2 flex-row justify-between items-center">
        <View className="flex-row items-center gap-2">
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logo}
            />
          <Text style={styles.headerText}>SI-LAJANG</Text>
          </View>
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
    // backgroundColor: Colors.brand,
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
    lineHeight: rem(1.75),
    fontFamily: "Poppins-Bold",
  },
});