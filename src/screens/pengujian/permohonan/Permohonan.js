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

  const {
    delete: deletePermohonan,
    DeleteConfirmationModal,
    SuccessOverlayModal,
    FailedOverlayModal,
  } = useDelete({
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
        <View style={styles.roundedBackground} className="rounded-br-full" />

        <View style={styles.cardWrapper}>
          {/* Left section with rounded background */}
          <View style={styles.leftSection}>
            <View style={styles.cardContent}>
              <Text className=" text-slate-600 text-xs uppercase font-poppins-semibold">
                Industri
              </Text>
              <Text className="text-black  text-base font-poppins-regular">
                {item.industri}
              </Text>
              <Text className=" text-slate-600 mt-3 text-xs uppercase font-poppins-semibold">
                Alamat
              </Text>
              <Text className="text-black  text-base  font-poppins-regular">
                {item.alamat}
              </Text>
              <Text className="text-slate-600 text-xs mt-3 uppercase  font-poppins-semibold">
                Cara Pengambilan
              </Text>
              <Text className="text-black  font-poppins-regular">
                {item.is_mandiri ? "Kirim Mandiri" : "Ambil Petugas"}
              </Text>
            </View>
          </View>

          {/* Middle section */}
          <View
            style={styles.cardContents}
            className="flex flex-end   font-poppins-semibold">
            <Text className=" uppercase text-base text-right text-slate-600  font-poppins-semibold">
              {item.tanggal}
            </Text>
          </View>

          {/* Right section (dots menu) */}
          <View style={styles.cardActions} className="mb-4">
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
                <Entypo name="dots-three-vertical" size={20} color="#312e81" />
              </View>
            </MenuView>
          </View>
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
      <View className="p-2 bg-[#ececec]">
        <View className="flex-row p-3 bg-[#f8f8f8] justify-between rounded-t-md">
          <Back
            size={24}
            color={"black"}
            action={() => navigation.goBack()}
            className="mr-2 "
          />
          <Text className=" text-black text-lg font-poppins-semibold">
            Permohonan
          </Text>
        </View>
        <View className="bg-[#f8f8f8] w-full h-full rounded-b-md">
          {user.has_tagihan ? (
            <View className="p-2">
              <View className="flex items-center bg-yellow-100 w-full p-3 border border-yellow-400 rounded-md ">
                <Text className="text-black mb-0 text-sm font-poppins-semibold">
                  Tidak dapat membuat Permohonan Baru
                </Text>
                <Text className="text-black text-xs font-poppins-semibold">
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
        </View>
        <Icons
          name="plus"
          size={28}
          color="#fff"
          style={styles.plusIcon}
          onPress={() => navigation.navigate("TambahPermohonan")}
        />

        <DeleteConfirmationModal />
        <SuccessOverlayModal />
        <FailedOverlayModal />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f8f8f8",
    borderRadius: 15,
    marginVertical: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    overflow: "hidden",
    position: "relative", // Added to position the background
  },
  roundedBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%", // Adjust this value to control how much of the card is covered
    backgroundColor: "#e2e8f0", // slate-200 equivalent
  },
  cardWrapper: {
    flexDirection: "row",
    position: "relative",
    zIndex: 2,
  },
  leftSection: {
    width: "45%",
    position: "relative",
  },
  cardContent: {
    padding: 12,
  },
  cardContents: {
    width: "45%",
    paddingTop: 12,
  },
  cardActions: {
    width: "10%",
    alignItems: "center",
    justifyContent: "flex-end",
    zIndex: 4,
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
  },
});
export default Permohonan;
