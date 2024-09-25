import React, { useRef } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "react-native-ui-lib";
import Back from "@/src/screens/components/Back";
import Header from "@/src/screens/components/Header";
import Entypo from "react-native-vector-icons/Entypo";
import { MenuView } from "@react-native-menu/menu";
import { useDelete } from "@/src/hooks/useDelete";
import Icons from "react-native-vector-icons/AntDesign";
import Paginate from "@/src/screens/components/Paginate";

const baseRem = 16;
const rem = multiplier => baseRem * multiplier;

const TitikUji = ({ navigation, route, status }) => {
  const { uuid } = route.params || {};
  const paginateRef = useRef();

  const { delete: deleteTitikUji, DeleteConfirmationModal } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries(["TitikUji"]);
      navigation.navigate("TitikUji");
    },
    onError: error => {
      console.log("Delete error : ", error);
    },
  });

  const dropdownOptions = [
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

  const CardTitikUji = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.card}>
        <View style={styles.cards}>
          <Text style={[styles.cardTexts, { fontSize: 15 }]}>
            {item.lokasi}
          </Text>
          <Text
            style={[styles.cardTexts, { fontWeight: "bold", fontSize: 22 }]}>
            {item.kode}
          </Text>
          <Text style={[styles.cardTexts]} className="mt-2">
            Diambil : {item.tanggal_pengambilan || "-"}
          </Text>
          <Text style={[styles.cardTexts]}>
            Diterima : {item.tanggal_diterima || "-"}
          </Text>
          <Text style={[styles.cardTexts]}>
            Selesai : {item.tanggal_selesai_uji || "-"}
          </Text>
          <View className="">
            <Text
              className={`text-[12px] text-white font-bold px-2 py-1 rounded-sm mt-2 mb-1 
            ${
              status == 0
                ? "bg-green-400"
                : status == 1
                ? "bg-red-500"
                : status == 2
                ? "bg-red-500"
                : status == 3
                ? "bg-red-500"
                : status == 4
                ? "bg-red-500"
                : status == 5
                ? "bg-red-500"
                : status == 6
                ? "bg-red-500"
                : status == 7
                ? "bg-red-500"
                : status == 8
                ? "bg-red-500"
                : status == 9
                ? "bg-red-500"
                : status == 10
                ? "bg-red-500"
                : status == 11
                ? "bg-red-500"
                : "bg-purple-600"
            }`}>
              {status == 0
                ? "Mengakan Permohonan"
                : status == 1
                ? "Menyerahkan Sampel"
                : status == 2
                ? "Menyerahkan Surat Perintah Pengujian"
                : status == 3
                ? "Menyerahkan sampel untuk Proses Pengujian"
                : status == 4
                ? "Menyerahkan RDPS"
                : status == 5
                ? "Menyerahkan RDPS untuk Pengetikan LHU"
                : status == 6
                ? "Menyerahkan LHU untuk Diverifikasi"
                : status == 7
                ? "Mengesahkan LHU"
                : status == 8
                ? "Pembayaran"
                : status == 9
                ? "Penyerahan LHU"
                : status == 10
                ? "Penyerahan LHU Amandemen (Jika ada)"
                : status == 11
                ? "Selesai"
                : "Menunggu"}
            </Text>
            <Text
              className={`text-[12px] text-white font-bold px-2 py-1 rounded-sm mb-1 
            ${
              status == 0
                ? "bg-green-400"
                : status == 1
                ? "bg-red-500"
                : status == 2
                ? "bg-red-500"
                : status == 3
                ? "bg-red-500"
                : status == 4
                ? "bg-red-500"
                : status == 5
                ? "bg-red-500"
                : status == 6
                ? "bg-red-500"
                : status == 7
                ? "bg-red-500"
                : status == 8
                ? "bg-red-500"
                : status == 9
                ? "bg-red-500"
                : status == 10
                ? "bg-red-500"
                : status == 11
                ? "bg-red-500"
                : "bg-purple-600"
            }`}>
              {status == 0
                ? "Mengakan Permohonan"
                : status == 1
                ? "Menyerahkan Sampel"
                : status == 2
                ? "Menyerahkan Surat Perintah Pengujian"
                : status == 3
                ? "Menyerahkan sampel untuk Proses Pengujian"
                : status == 4
                ? "Menyerahkan RDPS"
                : status == 5
                ? "Menyerahkan RDPS untuk Pengetikan LHU"
                : status == 6
                ? "Menyerahkan LHU untuk Diverifikasi"
                : status == 7
                ? "Mengesahkan LHU"
                : status == 8
                ? "Pembayaran"
                : status == 9
                ? "Penyerahan LHU"
                : status == 10
                ? "Penyerahan LHU Amandemen (Jika ada)"
                : status == 11
                ? "Selesai"
                : "Menunggu"}
            </Text>
            <Text
              className={`text-[12px] text-white font-bold px-2 py-1 rounded-sm mb-1 
            ${
              status == 0
                ? "bg-green-400"
                : status == 1
                ? "bg-red-500"
                : status == 2
                ? "bg-red-500"
                : status == 3
                ? "bg-red-500"
                : status == 4
                ? "bg-red-500"
                : status == 5
                ? "bg-red-500"
                : status == 6
                ? "bg-red-500"
                : status == 7
                ? "bg-red-500"
                : status == 8
                ? "bg-red-500"
                : status == 9
                ? "bg-red-500"
                : status == 10
                ? "bg-red-500"
                : status == 11
                ? "bg-red-500"
                : "bg-purple-600"
            }`}>
              {status == 0
                ? "Mengakan Permohonan"
                : status == 1
                ? "Menyerahkan Sampel"
                : status == 2
                ? "Menyerahkan Surat Perintah Pengujian"
                : status == 3
                ? "Menyerahkan sampel untuk Proses Pengujian"
                : status == 4
                ? "Menyerahkan RDPS"
                : status == 5
                ? "Menyerahkan RDPS untuk Pengetikan LHU"
                : status == 6
                ? "Menyerahkan LHU untuk Diverifikasi"
                : status == 7
                ? "Mengesahkan LHU"
                : status == 8
                ? "Pembayaran"
                : status == 9
                ? "Penyerahan LHU"
                : status == 10
                ? "Penyerahan LHU Amandemen (Jika ada)"
                : status == 11
                ? "Selesai"
                : "Menunggu"}
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
      <Header />
      <View className="bg-[#ececec] w-full h-full">
        {/* <Back /> */}
        {/* {data ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginVertical: rem(1),
            }}>
            <View style={{ flexDirection: "row" }}>
              <Text style={styles.topText}>
                {data[0]?.permohonan?.industri}, Titik Pengujian{" "}
              </Text>
            </View>
          </View>
        ) : (
          <View className="h-full flex justify-center">
            <ActivityIndicator size={"large"} color={"#312e81"} />
          </View>
        )} */}
        <Paginate
          ref={paginateRef}
          payload={{ permohonan_uuid: { uuid } }}
          url="/permohonan/titik"
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
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
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
    fontSize: 15,
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
