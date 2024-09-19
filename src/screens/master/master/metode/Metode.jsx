import axios from "@/src/libs/axios";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { FlatList, Text, View, ScrollView } from "react-native";
import { Searchbar } from "react-native-paper";
import Icon from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";
import { MenuView } from "@react-native-menu/menu";
import BackButton from "@/src/screens/components/BackButton";
const Metode = ({ navigation }) => {
  const dropdownOptions = [
    {
      id: "Edit",
      title: "Edit",
      action: item => navigation.navigate("FormMetode", { uuid: item.uuid }),
    },
    { id: "Hapus", title: "Hapus", action: item => console.log("Hapus") },
    {
      id: "Deletedaowkoakowk",
      title: "Deletedaowkoakowk",
      action: item => console.log("Husep"),
    },
  ];

  const [metode, setMetode] = useState([]);

  async function getMetode() {
    try {
      const res = await axios.post("/master/acuan-metode");
      setMetode(res.data.data);
    } catch (err) {
      console.log(err);
    }
  } 

  useEffect(() => {
    getMetode();
  }, []);

  const TabelMetode = ({ item }) => {
    return (
      <View
        className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
        style={{
          elevation: 4,
        }}>
        <View className="flex-row justify-between items-center">
          <Text className="text-[18px] font-bold">{item.nama}</Text>
          <MenuView
            title="Menu Title"
            actions={dropdownOptions.map(option => ({
              ...option,
            }))}
            onPressAction={({ nativeEvent }) => {
              const selectedOption = dropdownOptions.find(
                option => option.title === nativeEvent.event,
              );
              if (selectedOption) {
                selectedOption.action(item);
              }
            }}
            shouldOpenOnLongPress={false}>
            <View>
              <Entypo name="dots-three-vertical" size={18} color="#312e81" />
            </View>
          </MenuView>
        </View>
      </View>
    );
  };

  return (
    <View>
      {metode ? (
        <View className="bg-[#ececec] w-full h-full">
          <View className="bg-white p-4 rounded">
            <View className="flex-row w-full items-center space-x-2">
              <BackButton action={() => navigation.goBack()} size={24} />
              <Searchbar
                className="bg-[#f2f2f2] flex-1"
                placeholder="Cari Metode"
              />
            </View>
            <FlatList
              className="mt-4"
              data={metode}
              renderItem={({ item }) => <TabelMetode item={item} />}
              keyExtractor={item => item.id.toString()}
            />
          </View>
          <Icon
            name="plus"
            size={28}
            color="black"
            style={{ position: "absolute", bottom: 20, right: 20 }}
            onPress={() => navigation.navigate("FormMetode")}
          />
        </View>
      ) : (
        <Text className="text-2xl font-bold text-center">Loading...</Text>
      )}
    </View>
  );
};

export default Metode;
