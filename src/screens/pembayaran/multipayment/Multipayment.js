import { View, Text, StyleSheet } from "react-native";
import React, { useRef } from "react";
import Header from "../../components/Header";
import { Colors } from "react-native-ui-lib";
import Paginate from "../../components/Paginate";

const rem = multiplier => baseRem * multiplier;
const baseRem = 16;
const Multipayment = () => {
  const paginateRef = useRef(false);

  const dropdownOptions = [
    {
      id: "Edit",
      title: "Edit",
      action: item => console.log(item),
      Icon: "edit",
    },
    {
      id: "Delete",
      title: "Delete",
      action: item => console.log(item),
      Icon: "trash",
    },
  ];

  const cardMultiPayment = ({ item }) => {
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
      <Header />
      <View className="w-full h-full bg-[#ececec]">
        <Paginate
          ref={paginateRef}
          renderItem={cardMultiPayment}
          url="/pembayaran/multi-payment"
          payload={{}}></Paginate>
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

export default Multipayment;
