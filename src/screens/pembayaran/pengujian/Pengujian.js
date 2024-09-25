import { View, Text, StyleSheet } from "react-native";
import { Colors } from "react-native-ui-lib";
import React, { useRef } from "react";
import Header from "../../components/Header";
import { rupiah } from "@/src/libs/utils";
import { MenuView } from "@react-native-menu/menu";
import Entypo from "react-native-vector-icons/Entypo";
import Paginate from "../../components/Paginate";

const rem = multiplier => baseRem * multiplier;
const baseRem = 16;
const Pengujian = ({ navigation }) => {
  const PaginateRef = useRef();

  const CardPembayaran = ({ item }) => {
    const isExpired = item.payment?.is_expired;
    // const status = item.payment?.status;
    // const statusStyle = isExpired
    //   ? "bg-red-500 text-white"
    //   : status === "pending"
    //   ? "bg-blue-500 text-white"
    //   : status === "success"
    //   ? "bg-green-500 text-white"
    //   : "bg-gray-500 text-white";

    const shouldShowTagihan =
      !!item.payment?.id && item.payment?.status !== "success";
    const dropdownOptions = [
      {
        id: "Pembayaran",
        title: "Pembayaran",
        action: item =>
          navigation.navigate("PaymentDetail", { uuid: item.uuid }),
      },
      shouldShowTagihan && {
        id: "Tagihan",
        title: "Tagihan",
        action: item => navigation.navigate("Detail", { uuid: item.uuid }),
      },
    ].filter(Boolean); 

    const statusText = isExpired ? "Kedaluwarsa" : item.text_status_pembayaran;

    return (
      <View style={styles.card}>
        <View style={styles.cards}>
          <View className="p-1 my-2 flex-start bg-slate-200 rounded-md">
            <Text className="text-xs">{statusText}</Text>
          </View>
          <Text style={[styles.cardTexts, { fontSize: 15 }]}>
            {item.lokasi}
          </Text>
          <Text
            style={[styles.cardTexts, { fontWeight: "bold", fontSize: 22 }]}>
            {item.kode}
          </Text>
          <Text style={[styles.cardTexts]}>{rupiah(item.harga)}</Text>
        </View>
        <View style={styles.cards2}>
          <View>
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
  };

  return (
    <>
      <Header />
      <View className=" w-full h-full bg-[#ececec] ">
        <Paginate
          url="/pembayaran/pengujian"
          payload={{ tahun: 2023 }}
          renderItem={CardPembayaran}
          ref={PaginateRef}></Paginate>
      </View>
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

  cardTexts: {
    fontSize: rem(0.9),
    color: "black",
  },
  pending: {
    color: "white",
    backgroundColor: "green",
    paddingVertical: 5,
    borderRadius: 5,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  pendingText: {
    color: "white",
    fontSize: 13,
    fontWeight: "bold",
  },
});
export default Pengujian;
