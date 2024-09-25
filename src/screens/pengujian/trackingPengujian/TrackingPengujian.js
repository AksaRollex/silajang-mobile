import React, { useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import Header from "../../components/Header";
import Entypo from "react-native-vector-icons/Entypo";
import { MenuView } from "@react-native-menu/menu";
import { Colors } from "react-native-ui-lib";
import Paginate from "../../components/Paginate";

const rem = multiplier => baseRem * multiplier;
const baseRem = 16;

const TrackingPengujian = ({ navigation }) => {
  const paginateRef = useRef(false);

  const dropdownOptions = [
    {
      id: "Tracking",
      title: "Tracking",
      action: item => navigation.navigate("TrackingList", { uuid: item.uuid }),
      Icon: "list",
    },
  ];

  const CardTrackingPengujian = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cards}>
        <View className="p-1 my-2 bg-slate-200 rounded-md">
          <Text className="text-indigo-700 text-xs">{item.text_status}</Text>
        </View>
        <Text style={styles.cardTexts} className="text-sm">
          {item.lokasi}
        </Text>
        <Text style={[styles.cardTexts, { fontWeight: "bold", fontSize: 22 }]}>
          {item.kode}
        </Text>

        <Text style={[styles.cardTexts]} className="mt-2">
          Tanggal Diterima : {item.tanggal_diterima}
        </Text>
        <Text style={[styles.cardTexts]}>
          Tanggal Selesai : {item.tanggal_selesai}
        </Text>
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

  return (
    <>
      <Header />
      <View className=" bg-[#ececec] h-full w-full ">
        <Paginate
          ref={paginateRef}
          payload={{ tahun: new Date().getFullYear() }}
          url="/tracking"
          renderItem={CardTrackingPengujian}></Paginate>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    marginVertical: 10,
    width: "100%",
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginRight: 10,
  },
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

  cardTexts: {
    fontSize: rem(0.8),
    color: "black",
  },
});

export default TrackingPengujian;
