import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Colors } from "react-native-ui-lib";
import React from "react";
import axios from "@/src/libs/axios";
import { useQuery } from "@tanstack/react-query";
import Header from "../../components/Header";
import { rupiah } from "@/src/libs/utils";
import { MenuView } from "@react-native-menu/menu";
import Entypo from "react-native-vector-icons/Entypo";
import Back from "../../components/Back";

const rem = multiplier => baseRem * multiplier;
const baseRem = 16;
const Pengujian = ({ navigation }) => {
  const fetchPembayaran = async () => {
    const response = await axios.post("/pembayaran/pengujian", {
      page: 1,
      per: 10,
      tahun : 2023,
    });
    return response.data.data;
  };

  const { data, isLoading, error } = useQuery(["pembayaran"], fetchPembayaran);

  if (isLoading || error) {
    return (
      <View className="h-full flex justify-center">
        {isLoading ? (
          <ActivityIndicator size={"large"} color={"#312e81"} />
        ) : (
          <Text style={{ color: "red", fontSize: 16 }}>
            Error: {error.message}
          </Text>
        )}
      </View>
    );
  }

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  const dropdownOptions = [
    {
      id: "Pembayaran",
      title: "Pembayaran",
      action: item => navigation.navigate("PaymentDetail", { uuid: item.uuid }),
    },
    {
      id: "Tagihan",
      title: "Tagihan",
      action: item => navigation.navigate("Detail", { uuid: item.uuid }),
    },
  ];

  const CardPembayaran = ({ item }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cards}>
          <View className="p-1 my-2 bg-slate-200 rounded-md">
            <Text className="text-indigo-700 text-xs">
              {item.text_status_pembayaran}
            </Text>
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
      <View className="p-7 bg-[#ececec] mb-16/">
        <Back />
        <FlatList
          data={data}
          renderItem={({ item }) => <CardPembayaran item={item} />}
          keyExtractor={item => item.id.toString()}
        />
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
