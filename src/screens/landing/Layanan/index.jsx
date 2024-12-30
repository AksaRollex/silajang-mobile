import {
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import Header from "../../components/Header";
import FooterLanding from "../component/FooterLanding";
import AskButton from "../component/AskButton";

const Layanan = ({ navigation }) => {
  const mainMenus = [
    {
      title: "Alur Permohonan",
      icon: "add-circle",
      screen: "AlurPermohonan",
      color: "#4CAF50",
      description: "Tekan Untuk Melihat",
    },
    {
      title: "Start Layanan",
      icon: "timeline",
      screen: "StartLayanan",
      color: "#2196F3",
      description: "tekan untuk melihat",
    },
    {
      title: "Maklumat Pelayanan",
      icon: "timeline",
      screen: "MaklumatPelayanan",
      color: "#2196F3",
      description: "tekan untuk melihat",
    },
  ];

  return (
    <View className="w-full h-full bg-[#ececec] ">
      <ScrollView
        className="flex-col  w-full"
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[]}>
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
        <View className="p-3 flex-col  w-full">
          <Text className="font-poppins-bold text-2xl text-[#252a61]">
            Layanan
          </Text>
          <View className="flex-row w-full my-2">
            <View className=" gap-y-2 w-full ">
              {mainMenus.map((menu, index) => (
                <View
                  key={index}
                  className="rounded-xl w-full h-32 bg-[#f8f8f8] flex-col justify-center items-center"
                  style={{
                    elevation: 4,
                    shadowColor: "#5C6BC0",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                  }}>
                  <View
                    className="flex-row gap-x-2"
                    style={{
                      elevation: 4,
                      shadowColor: "#5C6BC0",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 3,
                    }}>
                    {/* <MaterialIcons name={menu.icon} size={32} color={menu.color} /> */}

                    <Text className="font-poppins-bold text-base text-zinc-800">
                      {menu.title}
                    </Text>
                  </View>
                  <TouchableOpacity
                    className="p-3 my-3 rounded-xl bg-indigo-50"
                    style={{
                      borderWidth: 1,
                      borderStyle: "dashed",
                      borderColor: "#5C6BC0",
                    }}
                    onPress={() => navigation.navigate(menu.screen)}>
                    <Text className="capitalize font-poppins-medium text-center text-black">
                      {menu.description}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </View>
        <AskButton />
        <FooterLanding />
      </ScrollView>
    </View>
  );
};

export default Layanan;

