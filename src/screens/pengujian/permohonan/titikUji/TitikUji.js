import React, { useCallback, useRef, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/src/libs/axios";
import { Colors } from "react-native-ui-lib";
import Header from "@/src/screens/components/Header";
import Entypo from "react-native-vector-icons/Entypo";
import { MenuView } from "@react-native-menu/menu";
import { useDelete } from "@/src/hooks/useDelete";
import Icons from "react-native-vector-icons/AntDesign";
import Paginate from "@/src/screens/components/Paginate";
import { usePermohonan } from "@/src/services/usePermohonan";
import BackButton from "@/src/screens/components/Back";

const baseRem = 16;
const rem = multiplier => baseRem * multiplier;

const TitikUji = ({ navigation, route, status }) => {
  const { uuid } = route.params || {};
  const { data: permohonan } = usePermohonan(uuid);
  // console.log("data permohonan", permohonan);

  const queryClient = useQueryClient();

  const paginateRef = useRef();

  const { delete: deleteTitikUji, DeleteConfirmationModal } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries(["/permohonan/titik"]);
      navigation.navigate("TitikUji");
    },
    onError: error => {
      console.log("Delete error : ", error);
    },
  });

  const dropdownOptions = [
    {
      id: "Report",
      title: "Report",
    },
    {
      id: "Parameter",
      title: "Parameter",
      action: item => navigation.navigate("Parameter", { uuid: item.uuid }),
    },
    {
      id: "Edit",
      title: "Edit",
      action: item => navigation.navigate("FormTitikUji", { uuid: item.uuid }),
    },
    {
      id: "Hapus",
      title: "Hapus",
      action: item => deleteTitikUji(`/permohonan/titik/${item.uuid}`),
    },
  ];

  const statusList = [
    "Mengajukan Permohonan", // 0
    "Menyerahkan Sampel", // 1
    "Menyerahkan Surat Perintah Pengujian", // 2
    "Menyerahkan sampel untuk Proses Pengujian", // 3
    "Menyerahkan RDPS", // 4
    "Menyerahkan RDPS untuk Pengetikan LHU", // 5
    "Menyerahkan LHU untuk Diverifikasi", // 6
    "Mengesahkan LHU", // 7
    "Pembayaran", // 8
    "Penyerahan LHU", // 9
    "Penyerahan LHU Amandemen (Jika ada)", // 10
    "Selesai", // 11
    "Menunggu", // default
  ];

  const statusBackgroundColors = [
    "bg-green-400", // 0
    "bg-slate-100", // 1
    "bg-slate-100", // 2
    "bg-slate-100", // 3
    "bg-slate-100", // 4
    "bg-slate-100", // 5
    "bg-slate-100", // 6
    "bg-slate-100", // 7
    "bg-slate-100", // 8
    "bg-slate-100", // 9
    "bg-slate-100", // 10
    "bg-slate-100", // 11
    "bg-slate-100", // default
  ];

  const statusTextColors = [
    "text-black", // 0
    "text-black", // 1
    "text-black", // 2
    "text-black", // 3
    "text-black", // 4
    "text-black", // 5
    "text-black", // 6
    "text-black", // 7
    "text-black", // 8
    "text-black", // 9
    "text-black", // 10
    "text-black", // 11
    "text-black", // default
  ];

  const currentStatusText = statusList[status] || statusList[12]; // Default "Menunggu"
  const currentStatusBackground =
    statusBackgroundColors[status] || statusBackgroundColors[12]; // Default "bg-slate-100"
  const currentStatusTextColor =
    statusTextColors[status] || statusTextColors[12]; // Default "text-black"
  const CardTitikUji = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.card}>
        <View style={styles.cards}>
          <Text className="text-black text-base font-bold">{item.lokasi}</Text>
          <Text className="font-bold text-2xl text-black my-1">
            {item.kode}
          </Text>
          <View className="py-1">
            <Text className=" text-xs pt-1 text-black ">
              Diambil : {item.tanggal_pengambilan || "-"}
            </Text>
            <Text className=" text-xs pt-1 text-black ">
              Diterima : {item.tanggal_diterima || "-"}
            </Text>
            <Text className=" text-xs pt-1 text-black ">
              Selesai : {item.tanggal_selesai_uji || "-"}
            </Text>
          </View>

          <View>
            <Text
              style={styles.badge}
              className={`text-xs mt-2 ${currentStatusBackground} ${currentStatusTextColor}`}>
              Pengambilan : {currentStatusText}
            </Text>

            <Text
              style={styles.badge}
              className={`text-xs text-black ${currentStatusBackground}`}>
              Penerimaan : {currentStatusText}
            </Text>
            <Text
              style={styles.badge}
              className="text-xs text-black  bg-slate-100 ">
              Pengujian : {item.text_status || "-"}
            </Text>
          </View>
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
    </View>
  );

  return (
    <>
      <View className="w-full">
        <View
          className="flex-row mb-4 p-3 justify-between"
          style={{ backgroundColor: Colors.brand }}>
          <BackButton
            size={24}
            color={"white"}
            action={() => navigation.goBack()}
            className="mr-2 "
          />
          {permohonan ? (
            <Text className="font-bold text-white text-lg ">
              {permohonan?.industri} : Titik Pengujian
            </Text>
          ) : (
            <Text></Text>
          )}
        </View>
      </View>
      <View className="bg-[#ececec] w-full h-full">
        <Paginate
          ref={paginateRef}
          payload={{ permohonan_uuid: { uuid } }}
          url="/permohonan/titik"
          className="mb-28"
          renderItem={CardTitikUji}></Paginate>
      </View>

      <Icons
        name="plus"
        size={28}
        color="#fff"
        style={styles.plusIcon}
        onPress={() => navigation.navigate("FormTitikUji")}
      />
      <DeleteConfirmationModal />
    </>
  );
};
const styles = StyleSheet.create({
  backButton: {
    padding: 4,
    backgroundColor: "#6b7fde",
    borderRadius: 5,
    alignItems: "center",
    width: "10%",
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  topText: {
    fontWeight: "bold",
    color: "black",
    fontSize: rem(1),
  },
  badge: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 4,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  picker: {
    flex: 1,
    marginHorizontal: 4,
  },
  card: {
    marginVertical: 10,
    borderRadius: 15,
    padding: rem(0.8),
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
    fontSize: 13,
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

export default TitikUji;
