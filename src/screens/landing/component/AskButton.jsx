import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";

const AskButton = () => {
  const navigation = useNavigation();
  return (
    <View
      className="p-3 m-3 rounded-xl justify-center items-center bg-[#f8f8f8]"
      style={{
        elevation: 4,
        shadowColor: "#5C6BC0",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      }}>
      <Text className="text-black text-base font-poppins-semibold capitalize">
        ada yang ingin anda tanyakan ?{" "}
      </Text>
      <TouchableOpacity
        onPress={() => navigation.navigate("Kontak")}
        className="p-3 my-3 rounded-xl bg-indigo-50"
        style={{
          borderWidth: 1,
          borderStyle: "dashed",
          borderColor: "#5C6BC0",
        }}>
        <Text className="capitalize font-poppins-medium text-center text-black">
          Hubungi kami
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AskButton;
