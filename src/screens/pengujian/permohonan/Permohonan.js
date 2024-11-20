import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Modal,
  TouchableOpacity,
} from "react-native";
import React, { useRef, useState, useCallback, useEffect } from "react";
import { MenuView } from "@react-native-menu/menu";
import Paginate from "../../components/Paginate";
import { useQueryClient } from "@tanstack/react-query";
import Icons from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";
import { useDelete } from "@/src/hooks/useDelete";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import IonIcons from "react-native-vector-icons/Ionicons";
import { useUser } from "@/src/services";
import Back from "../../components/Back";

const rem = multiplier => baseRem * multiplier;
const baseRem = 16;

const Permohonan = ({ navigation }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: user } = useUser();
  const [tahun, setTahun] = useState(2024);
  const [isYearPickerVisible, setIsYearPickerVisible] = useState(false);
  const [shouldRefresh, setShouldRefresh] = useState(false);

  const handleFilterPress = () => {
    setIsYearPickerVisible(true);
  };

  const handleYearChange = useCallback(
    selectedYear => {
      if (selectedYear !== tahun) {
        setTahun(selectedYear);
        setShouldRefresh(true); // Set flag untuk refresh
      }
      setIsYearPickerVisible(false);
    },
    [tahun],
  );

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
      navigation.navigate("Permohonan");
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
        <View className="flex-row justify-end ">
          <TouchableOpacity
            onPress={handleFilterPress} // Gunakan handler terpisah
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderRadius: 4,
              backgroundColor: "#ececec",
            }}
            className="px-2 py-3">
            <IonIcons name="calendar" size={24} color="black" />
            <Text className="text-black font-poppins-regular mx-2">
              {tahun}
            </Text>
            <MaterialIcons name="keyboard-arrow-down" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <YearPicker
          visible={isYearPickerVisible}
          onClose={() => setIsYearPickerVisible(false)}
          onSelect={handleYearChange}
          selectedYear={tahun}
        />
      </>
    );
  };

  const YearPicker = ({ visible, onClose, onSelect, selectedYear }) => {
    const currentYear = new Date().getFullYear();
    const years = Array.from(
      { length: currentYear - 2021 },
      (_, i) => 2022 + i,
    );

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={onClose}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Tahun</Text>
              <TouchableOpacity onPress={onClose}>
                <MaterialIcons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <View style={styles.yearList}>
              {years.map(year => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.yearItem,
                    selectedYear === year && styles.selectedYear,
                  ]}
                  onPress={() => {
                    onSelect(year);
                    onClose();
                  }}>
                  <Text
                    style={[
                      styles.yearText,
                      selectedYear === year && styles.selectedYearText,
                    ]}>
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <>
      <View className="p-3 bg-[#ececec]">
        <View
          className="rounded-3xl bg-[#fff] w-full h-full"
          style={{
            elevation: 5,
            shadowColor: "rgba(0, 0, 0, 0.1)",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 2,
          }}>
          <View className="flex-row p-3  justify-between ">
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
          <View className="w-full h-full rounded-b-md ">
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
        </View>

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
    borderRadius: 50,
  },
  badge: {
    alignSelf: "flex-start",
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 4,
    marginBottom: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: Dimensions.get("window").height * 0.7,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    fontFamily: "Poppins-SemiBold",
  },
  yearList: {
    paddingVertical: 8,
  },
  yearItem: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 4,
  },
  selectedYear: {
    backgroundColor: "#f8f8f8",
    fontFamily: "Poppins-Regular",
  },
  yearText: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#000",
    textAlign: "center",
  },
  selectedYearText: {
    color: "#000",
    fontFamily: "Poppins-Regular",
  },
});
export default Permohonan;
