import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import React, { useRef, useState, useCallback, useEffect } from "react";
import { MenuView } from "@react-native-menu/menu";
import Paginate from "../../components/Paginate";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "../../components/Header";
import Icons from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";
import { useDelete } from "@/src/hooks/useDelete";
import { Picker } from "@react-native-picker/picker";
import RNPickerSelect from "react-native-picker-select";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Colors } from "react-native-ui-lib";
import { useUser } from "@/src/services";
import Back from "../../components/Back";

const rem = multiplier => baseRem * multiplier;
const baseRem = 16;

const Permohonan = ({ navigation }) => {
  const [tahun, setTahun] = useState(2024);
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: user } = useUser();

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
      // navigation.navigate("Permohonan");
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
          <Text style={[styles.cardTexts]}>{item.tanggal}</Text>
          <Text className="font-bold text-xl text-black my-1">
            {item.industri}
          </Text>

          <Text
            style={[styles.badge]}
            className="bg-indigo-400 text-white text-xs">
            Cara Pengambilan :{" "}
            {item.is_mandiri ? "Kirim Mandiri" : "Ambil Petugas"}
          </Text>
          <Text
            style={[styles.badge]}
            className="bg-emerald-400 text-white text-xs">
            Pembayaran : {item.pembayaran}
          </Text>

          <Text className="text-black text-xs font-bold">{item.alamat}</Text>
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

  const filtah = () => {
    return (
      <>
        <View className="flex flex-row justify-end">
          <RNPickerSelect
            onValueChange={handleYearChange}
            items={tahuns.map(item => ({ label: item.text, value: item.id }))}
            value={tahun}
            style={{
              inputIOS: {
                paddingHorizontal: rem(3.55),
                borderWidth: 3,
                color: "black",
              },
              inputAndroid: {
                paddingHorizontal: rem(3.55),
                borderWidth: 3,
                color: "black",
              },
            }}
            Icon={() => {
              return (
                <MaterialIcons
                  style={{ marginTop: 16, marginRight: 12 }}
                  name="keyboard-arrow-down"
                  size={24}
                  color="black"
                />
              );
            }}
            placeholder={{
              label: "Pilih Tahun",
              value: null,
              color: "grey",
            }}
          />
        </View>
      </>
    );
  };

  return (
    <>
      <View className="w-full">
        <View
          className="flex-row p-3 justify-between"
          style={{ backgroundColor: Colors.brand }}>
          <Back
            size={24}
            color={"white"}
            action={() => navigation.goBack()}
            className="mr-2 "
          />
          <Text className="font-bold text-white text-lg ">Permohonan</Text>
        </View>
      </View>
      <View className="bg-[#ececec] w-full h-full">
        {user.has_tagihan ? (
          <View className="p-2">
            <View className="flex items-center bg-yellow-100 w-full p-3 border border-yellow-400 rounded-md ">
              <Text className="text-black mb-0 text-sm">
                Tidak dapat membuat Permohonan Baru
              </Text>
              <Text className="text-black text-xs">
                Harap selesaikan tagihan pembayaran Anda terlebih dahulu.
              </Text>
            </View>
          </View>
        ) : (
          <></>
        )}
        <Paginate
          className="mb-20"
          ref={paginateRef}
          key={refreshKey}
          url="/permohonan"
          payload={{ tahun: tahun }}
          Plugin={filtah}
          renderItem={CardPermohonan}></Paginate>
        <Icons
          name="plus"
          size={28}
          color="#fff"
          style={styles.plusIcon}
          onPress={() => navigation.navigate("TambahPermohonan")}
        />
      </View>

      <DeleteConfirmationModal />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 15,
    padding: rem(0.7),
    backgroundColor: "#fff",
    flexDirection: "row",
    borderTopColor: Colors.brand,
    borderTopWidth: 7,
    marginVertical : 10
  },
  cards: {
    borderRadius: 10,
    width: "90%",
    marginBottom: 4,
  },
  cards2: {
    borderRadius: 10,
    width: "10%",
    marginBottom: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  picker: {
    flex: 1,
    marginHorizontal: 4,
    color: "black",
  },
  cardTexts: {
    fontSize: rem(0.9),
    color: "black",
  },
  plusIcon: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#312e81",
    padding: 10,
    marginBottom: rem(4),
    borderRadius: 50,
  },
  badge: {
    alignSelf: "flex-start",
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 4,
    marginBottom: 4,
    fontWeight: "bold",
  },
});
export default Permohonan;