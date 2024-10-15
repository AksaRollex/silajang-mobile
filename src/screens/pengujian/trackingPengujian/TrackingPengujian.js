import React, { useState, useCallback, useRef } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Colors } from "react-native-ui-lib";
import { MenuView } from "@react-native-menu/menu";
import Entypo from "react-native-vector-icons/Entypo";
import Paginate from "../../components/Paginate";
import Header from "../../components/Header";
import Back from "../../components/Back";
import RNPickerSelect from "react-native-picker-select";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const TrackingPengujian = ({ navigation }) => {
  const paginateRef = useRef();
  const [tahun, setTahun] = useState(new Date().getFullYear());
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

  const mapStatusPengujian = status => {
    return status < 0 ? "Revisi" : "Dalam Proses";
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={[styles.badge]} className="text-indigo-600 bg-slate-100">
          {item.text_status}
        </Text>
        <Text style={styles.lokasi} className="text-black">
          {item.lokasi}
        </Text>
        <Text style={styles.kode} className="text-black">
          {item.kode}
        </Text>
        <Text style={styles.date} className="text-black">
          Tanggal Diterima: {item.tanggal_diterima}
        </Text>
        <Text style={styles.date} className="text-black">
          Tanggal Selesai: {item.tanggal_selesai}
        </Text>
      </View>
      <View style={styles.cardActions}>
        <MenuView
          actions={[
            {
              id: "Tracking",
              title: "Tracking",
              systemIcon: "list.bullet",
            },
          ]}
          onPressAction={() => {
            navigation.navigate("TrackingList", { selected: item });
          }}>
          <Entypo name="dots-three-vertical" size={16} color="#312e81" />
        </MenuView>
      </View>
    </View>
  );

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
              color: "gray",
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
          <Text className="font-bold text-white text-lg ">
            Tracking Pengujian
          </Text>
        </View>
      </View>
      <View className="w-full h-full bg-[#ececec]">
        <Paginate
          key={refreshKey}
          ref={paginateRef}
          url="/tracking"
          className="mb-20"
          Plugin={filtah}
          payload={{ tahun }}
          renderItem={renderItem}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  filters: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  picker: {
    flex: 1,
    marginHorizontal: 4,
    color: "black",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    borderTopWidth: 4,
    borderTopColor: "#4f46e5",
    marginVertical : 10
  },
  cardContent: {
    borderRadius: 10,
    width: "90%",
    marginBottom: 4,
  },
  cardActions: {
    borderRadius: 10,
    width: "10%",
    marginBottom: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontWeight: "bold",
    marginBottom: 8,
  },
  lokasi: {
    fontSize: 14,
    marginBottom: 4,
  },
  kode: {
    fontSize: 22,
    fontWeight: "bold",
  },
  date: {
    fontSize: 12,
  },
});

export default TrackingPengujian;
