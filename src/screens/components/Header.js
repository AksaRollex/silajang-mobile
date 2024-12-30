import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import Auth from "../auth/Index";
import { Screen } from "react-native-screens";
import { useUser } from "@/src/services";
const baseRem = 16;
const rem = multiplier => baseRem * multiplier;

export default function Header({}) {
  const navigation = useNavigation();
  const { data: user, isSuccess } = useUser();

  return (
    <View className="w-full">
      <View className="p-2 flex-row justify-between items-center">
        <View className="flex-row items-center gap-2">
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logo}
          />
          <Text style={styles.headerText}>SI-LAJANG</Text>
        </View>

        {user && isSuccess ? (
          <View></View>
        ) : (
          <TouchableOpacity
            className="p-2  rounded-xl"
            onPress={() => navigation.navigate("Auth", { screen: "Login" })}
            style={{
              borderWidth: 1,
              borderStyle: "dashed",
              borderColor: "#5C6BC0",
            }}>
            <Text className="capitalize font-poppins-medium text-center text-white">
              Masuk
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
