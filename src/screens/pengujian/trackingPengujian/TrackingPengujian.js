import React, { useState, useCallback, useRef } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { MenuView } from "@react-native-menu/menu";
import Entypo from "react-native-vector-icons/Entypo";
import Paginate from "../../components/Paginate";
import Header from "../../components/Header";

const TrackingPengujian = ({ navigation }) => {
  const paginateRef = useRef();
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [refreshKey, setRefreshKey] = useState(0);

  const tahuns = Array.from(
    { length: new Date().getFullYear() - 2021 },
    (_, i) => ({
      id: 2022 + i,
      text: `${2022 + i}`,
    }),
  );

  const bulans = [
    { id: 1, text: "Januari" },
    { id: 2, text: "Februari" },
    { id: 3, text: "Maret" },
    { id: 4, text: "April" },
    { id: 5, text: "Mei" },
    { id: 6, text: "Juni" },
    { id: 7, text: "Juli" },
    { id: 8, text: "Agustus" },
    { id: 9, text: "September" },
    { id: 10, text: "Oktober" },
    { id: 11, text: "November" },
    { id: 12, text: "Desember" },
  ];

  const handleYearChange = useCallback(itemValue => {
    setTahun(itemValue);
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  const handleMonthChange = useCallback(itemValue => {
    setBulan(itemValue);
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

  return (
    <>
      <Header />
      <View className="w-full h-full bg-[#ececec]">
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
            <Picker
              selectedValue={bulan}
              style={styles.picker}
              onValueChange={handleMonthChange}>
              {bulans.map(item => (
                <Picker.Item key={item.id} label={item.text} value={item.id} />
              ))}
            </Picker>
          </View>
        </View>
        <Paginate
          key={refreshKey}
          ref={paginateRef}
          url="/tracking"
          className="mb-28"
          payload={{ tahun, bulan }}
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
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    borderTopWidth: 4,
    borderTopColor: "#4f46e5",
  },
  cardContent: {
    flex: 1,
  },
  cardActions: {
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
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
  },
});

export default TrackingPengujian;
