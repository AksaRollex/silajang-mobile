import { View, Text, TouchableOpacity } from "react-native";
import { Searchbar } from "react-native-paper";
import React, { useState, useEffect } from "react";
import Entypo from "react-native-vector-icons/Entypo";
import Icon from "react-native-vector-icons/AntDesign";
import { useNavigation } from "@react-navigation/native";

const Metode = () => {
  const navigation = useNavigation();
  const [metode, setMetode] = useState([]);
  const [visibleDropdown, setVisibleDropdown] = useState(false);

  function TabelMetode({ metodeName, id}) {
    // isDropdown = visibleDropdown === id;
    return (
      <View className="my-3 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-3">
        <View className="flex-row justify-between">
          <Text className="text-[17px]">{metodeName}</Text>
          <View>
            <TouchableOpacity onPress={() => handleDropdown(id)}>
              <Entypo name={"dots-three-vertical"} size={18} color={"black"} />
            </TouchableOpacity>
          </View>
            {
              isDropdown && (
                <View className="absolute top-10 bg-gray-400 rounded -right-2 p-1" style={{zIndex: 999}}>
                  <TouchableOpacity className="z-10">
                    <Text className="text-[17px]">Delete</Text>
                  </TouchableOpacity>
                </View>
              )
            }
        </View>
      </View>
    );
  }

  // function handleDropdown(id) {
  //   if(visibleDropdown === id) {
  //     setVisibleDropdown(null);
  //   } else {
  //     setVisibleDropdown(id);
  //   }
  // } 

  return (
    <View className="bg-[#ececec] w-full h-full">
      <View className="bg-white p-4 rounded">
        <View className="flex-row w-full items-center space-x-2">
          <Searchbar
            className="bg-[#f2f2f2] flex-1"
            placeholder="Cari Metode"
          />
          <Icon name={"plus"} size={24} color={"black"} />
        </View>
        <TabelMetode metodeName="Metode 1"/>
        <TabelMetode metodeName="Metode 1"/>
        <TabelMetode metodeName="Metode 1"/>
      </View>
    </View>
  );
};

export default Metode;
