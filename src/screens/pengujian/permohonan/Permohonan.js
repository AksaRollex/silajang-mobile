import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import React, { useRef, useState, useCallback } from "react";
import { MenuView } from "@react-native-menu/menu";
import Paginate from "../../components/Paginate";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "../../components/Header";
import Icons from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";
import { useDelete } from "@/src/hooks/useDelete";
import { Picker } from "@react-native-picker/picker";
import { Colors } from "react-native-ui-lib";

const rem = multiplier => baseRem * multiplier;
const baseRem = 16;

const Permohonan = ({ navigation }) => {
  // const [tahun, setTahun] = useState(new Date().getFullYear());
  const [tahun, setTahun] = useState(2024);
  const [refreshKey, setRefreshKey] = useState(0);

  const tahuns = Array.from(
    { length: new Date().getFullYear() - 2021 },
    (_, i) => ({
      id: 2022 + i,
      text: `${2022 + i}`,
    }),
  );

  const handleYearChange = useCallback(itemValue => {
    setTahun(itemValue);
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  const paginateRef = useRef();
  const queryClient = useQueryClient();

  const { delete: deletePermohonan, DeleteConfirmationModal } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries(["permohonan"]);
      navigation.navigate("Permohonan");
    },
    onError: error => {
      console.log("Delete error : ", error);
    },
  });

  const dropdownOptions = [
    {
      id: "TitikUji",
      title: "TitikUji",
      action: item => navigation.navigate("TitikUji", { uuid: item.uuid }),
    },
    {
      id: "Edit",
      title: "Edit",
      action: item =>
        navigation.navigate("EditPermohonan", { uuid: item.uuid }),
      Icon: "edit",
    },
    {
      id: "Hapus",
      title: "Hapus",
      action: item => deletePermohonan(`/permohonan/${item.uuid}`),
    },
  ];

  const CardPermohonan = ({ item }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cards}>
          <Text style={[styles.cardTexts, { fontSize: 15 }]}>
            {item.tanggal}
          </Text>
          <Text
            style={[styles.cardTexts, { fontWeight: "bold", fontSize: 22 }]}>
            {item.industri}
          </Text>

          <View className="flex-row my-2 ">
            <View className="p-1   bg-slate-200 rounded-md justify-center">
              <Text className="text-indigo-700 text-xs text-center font-bold ">
                {item.is_mandiri ? "Kirim Mandiri" : "Ambil Petugas"}
              </Text>
            </View>
            <View className="p-1 w-14  mx-2 bg-green-200 rounded-md justify-center">
              <Text className="text-green-500 text-xs text-center font-bold ">
                {item.pembayaran}
              </Text>
            </View>
          </View>

          <Text style={[styles.cardTexts]}>{item.alamat}</Text>
        </View>
        <View style={styles.cards2}>
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
              <Entypo name="dots-three-vertical" size={16} color="#312e81" />
            </View>
          </MenuView>
        </View>
      </View>
    );
  };

  return (
    <>
      <Header navigate={() => navigation.navigate("Profile")} />
      <View className="bg-[#ececec] w-full h-full">
        <View className="p-4 ">
          <View className="flex flex-row justify-between bg-[#fff]">
            <Picker
              selectedValue={tahun}
              style={styles.picker}
              onValueChange={handleYearChange}>
              {tahuns.map(item => (
                <Picker.Item key={item.id} label={item.text} value={item.id} />
              ))}
            </Picker>
          </View>
        </View>
        <Paginate
          className="mb-28"
          ref={paginateRef}
          key={refreshKey}
          url="/permohonan"
          payload={{ tahun : tahun }}
          renderItem={CardPermohonan}></Paginate>
      </View>
      <Icons
        name="plus"
        size={28}
        color="#fff"
        style={styles.plusIcon}
        onPress={() => navigation.navigate("TambahPermohonan")}
      />
      <DeleteConfirmationModal />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 10,
    borderRadius: 15,
    padding: rem(0.7),
    backgroundColor: "#fff",
    flexDirection: "row",
    borderTopColor: Colors.brand,
    borderTopWidth: 7,
  },
  cards: {
    borderRadius: 10,
    width: "70%",
    marginBottom: 4,
  },
  cards2: {
    borderRadius: 10,
    width: "30%",
    marginBottom: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  picker: {
    flex: 1,
    marginHorizontal: 4,
  },
  cardTexts: {
    fontSize: rem(0.9),
    color: "black",
  },
  plusIcon: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#312e81",
    padding: 10,
    marginBottom: rem(4),
    borderRadius: 50,
  },
});
export default Permohonan;
