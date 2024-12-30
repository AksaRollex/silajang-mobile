import { View, Text, ScrollView, ImageBackground } from "react-native";
import React from "react";
import Header from "../../components/Header";
import AskButton from "../component/AskButton";
import FooterLanding from "../component/FooterLanding";

const MaklumatPelayanan = () => {
  return (
    <View className="w-full h-full bg-[#ececec]">
      <ScrollView>
        <ImageBackground
          source={require("../../../../assets/images/background.png")}
          style={{
            flex: 1,
            height: "100%",
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
          }}>
          <Header
            navigate={() => {
              navigation.navigate("Profile");
            }}
          />
        </ImageBackground>
        <View>
          <View className="flex-col p-3">
            <Text className="font-poppins-bold text-2xl text-[#252a61]">
              Maklumat Pelayanan
            </Text>
          </View>
        </View>
        <AskButton />
        <FooterLanding />
      </ScrollView>
    </View>
  );
};

export default MaklumatPelayanan;
