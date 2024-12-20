import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from "react-native";
import React, { useRef, useState, useEffect } from "react";
import { rupiah } from "@/src/libs/utils";
import Paginate from "../../components/Paginate";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BackButton from "../../components/Back";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import IonIcons from "react-native-vector-icons/Ionicons";
import { MenuView } from "@react-native-menu/menu";
import Entypo from "react-native-vector-icons/Entypo";
import Feather from "react-native-vector-icons/Feather";
import FileViewer from "react-native-file-viewer";
import Pdf from "react-native-pdf";
import RNFS from "react-native-fs";
import { API_URL } from "@env";
import Toast from "react-native-toast-message";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
const rem = multiplier => baseRem * multiplier;
const baseRem = 16;
const Pengujian = ({ navigation }) => {
  const PaginateRef = useRef();
  const [tahun, setTahun] = useState(new Date().getFullYear().toString());
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [SKRDUrl, setSKRDUrl] = useState("");
  const [kwitansiUrl, setKwitansiUrl] = useState("");
  const [modalKwitansi, setModalKwitansi] = useState(false);

  const handleDateSelect = selectedYear => {
    setTahun(selectedYear.toString());
    setRefreshKey(prevKey => prevKey + 1);
    setIsDatePickerVisible(false);
  };

  const handleDatePickerPress = () => {
    setIsDatePickerVisible(true);
  };

  const CardPembayaran = ({ item }) => {
    const isExpired = item.payment?.is_expired;
    const skrd = item.status_tte_skrd === 1;
    const kwitansi = item.payment?.is_lunas === 1;
    const dropdownOptions = [
      skrd && {
        id: "SKRD",
        title: "SKRD",
        action: () => handlePreviewSKRD({ uuid: item.uuid }),
      },
      kwitansi && {
        id: "Kwitansi",
        title: "Kwitansi",
        action: () => handlePreviewKwitansi({ uuid: item.uuid }),
      },
    ].filter(Boolean);

    const getStatusText = item => {
      if (item.payment?.is_expired) {
        return "Kedaluwarsa";
      } else {
        const status = item.payment?.status;
        if (status === "pending") {
          return "Belum Dibayar";
        } else if (status === "success") {
          return "Berhasil";
        } else {
          return "Gagal";
        }
      }
    };

    const getStatusStyle = item => {
      if (item.payment?.is_expired) {
        return " text-red-500";
      } else {
        const status = item.payment?.status;
        if (status === "pending") {
          return " text-blue-400";
        } else if (status === "success") {
          return "text-green-500";
        } else {
          return " text-red-500";
        }
      }
    };

    const statusText = getStatusText(item);
    const statusStyle = getStatusStyle(item);

    return (
      <View style={styles.card}>
        <View style={styles.roundedBackground} className="rounded-br-full" />

        <TouchableOpacity
          onPress={() =>
            navigation.navigate("PengujianDetail", { uuid: item.uuid })
          }
          style={styles.cardWrapper}>
          {/* Left section with rounded background */}
          <View style={styles.leftSection}>
            <View style={styles.cardContent}>
              <Text className="font-poppins-semibold text-slate-600 text-xs uppercase">
                Kode
              </Text>
              <Text className="text-black font-poppins-regular text-base">
                {item.kode}
              </Text>
              <Text className="font-poppins-semibold  text-slate-600 mt-3 text-xs uppercase">
                Lokasi
              </Text>
              <Text className="text-black font-poppins-regular text-base">
                {item.lokasi}
              </Text>
            </View>
          </View>

          {/* Middle section */}

          <View style={styles.cardContents} className="flex flex-end">
            <Text className="font-poppins-semibold text-slate-600 text-xs uppercase">
              Status
            </Text>
            <Text
              style={[styles[statusStyle]]}
              className={` ${getStatusStyle(
                item,
              )} font-poppins-regular text-base`}>
              {statusText}
            </Text>

            <Text className="font-poppins-semibold text-slate-600 mt-3 text-xs uppercase">
              Tipe
            </Text>
            <Text
              style={[styles[statusStyle]]}
              className={`  text-black uppercase font-poppins-regular text-base`}>
              {item.payment_type}
            </Text>

            <Text className="text-slate-600 text-xs mt-3 uppercase font-poppins-semibold">
              Harga
            </Text>
            <Text className="text-black mb-4 font-poppins-regular">
              {rupiah(item.harga)}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={styles.cardActions} className="mb-4  ">
          {(skrd || kwitansi) && dropdownOptions.length > 0 && (
            <MenuView
              title="Menu Title"
              actions={dropdownOptions}
              onPressAction={({ nativeEvent }) => {
                const selectedOption = dropdownOptions.find(
                  option => option.title === nativeEvent.event,
                );
                if (selectedOption) {
                  selectedOption.action(item);
                }
              }}
              shouldOpenOnLongPress={false}>
              <View className=" rounded-lg  mr-2">
                <FontAwesome5 name="file-pdf" size={22} color="#ef4444" />
              </View>
            </MenuView>
          )}
        </View>
      </View>
    );
  };

  const filtah = () => {
    return (
      <>
        <View className=" flex-row justify-center gap-2">
          <TouchableOpacity
            onPress={handleDatePickerPress}
            className="flex-row items-center bg-[#ececec]  rounded-md justify-between p-3">
            <IonIcons name="calendar" size={24} color="black" />
            <View className="flex-col items-center">
              <Text className="text-black font-poppins-regular  mx-2">
                {tahun}
              </Text>
            </View>
            <MaterialIcons name="keyboard-arrow-down" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </>
    );
  };

  const DatePicker = ({ visible, onClose, onSelect, selectedYear }) => {
    const currentYear = new Date().getFullYear();
    const years = Array.from(
      { length: currentYear - 2021 },
      (_, i) => 2022 + i,
    );
    const [tempYear, setTempYear] = useState(selectedYear);

    useEffect(() => {
      if (visible) {
        setTempYear(selectedYear);
      }
    }, [visible]);

    const handleConfirm = () => {
      if (tempYear) {
        onSelect(tempYear);
      }
    };
    const canConfirm = tempYear;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}>
        <View style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Tahun</Text>
              <TouchableOpacity onPress={onClose}>
                <MaterialIcons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <View className=" ">
              <View className="flex-col items-center justify-center">
                <ScrollView className="max-h-64">
                  {years.map(year => (
                    <TouchableOpacity
                      key={year}
                      className={`mt-2 justify-center items-center ${
                        tempYear === year ? "bg-[#ececec] p-3 rounded-md" : ""
                      }`}
                      onPress={() => setTempYear(year)}>
                      <Text className="text-black font-poppins-semibold my-1">
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View className="mt-4 px-4">
              <TouchableOpacity
                className={`py-3 rounded-md ${
                  canConfirm ? "bg-blue-500" : "bg-gray-300"
                }`}
                disabled={!canConfirm}
                onPress={handleConfirm}>
                <Text className="text-white text-center font-poppins-semibold">
                  Terapkan Filter
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const handlePreviewSKRD = async ({ uuid }) => {
    try {
      const authToken = await AsyncStorage.getItem("@auth-token");
      setSKRDUrl(`${API_URL}/report/${uuid}/skrd?token=${authToken}`);
      setModalVisible(true);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Gagal membuka SKRD",
      });
    }
  };

  const handlePreviewKwitansi = async ({ uuid }) => {
    try {
      const authToken = await AsyncStorage.getItem("@auth-token");
      setKwitansiUrl(`${API_URL}/report/${uuid}/kwitansi?token=${authToken}`);
      setModalKwitansi(true);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Gagal membuka kwitansi",
      });
    }
  };

  const handleDownloadSKRD = async () => {
    try {
      const authToken = await AsyncStorage.getItem("@auth-token");
      const fileName = `SKRD_${Date.now()}.pdf`;

      const downloadPath =
        Platform.OS === "ios"
          ? `${RNFS.DocumentDirectoryPath}/${fileName}`
          : `${RNFS.DownloadDirectoryPath}/${fileName}`;

      const options = {
        fromUrl: SKRDUrl,
        toFile: downloadPath,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      };

      const response = await RNFS.downloadFile(options).promise;

      if (response.statusCode === 200) {
        if (Platform.OS === "android") {
          await RNFS.scanFile(downloadPath);
        }

        try {
          await FileViewer.open(downloadPath, {
            showOpenWithDialog: false,
            mimeType: "application/pdf",
          });
        } catch (openError) {
          console.log("Error opening file with FileViewer:", openError);

          if (Platform.OS === "android") {
            try {
              const intent = new android.content.Intent(
                android.content.Intent.ACTION_VIEW,
              );
              intent.setDataAndType(
                android.net.Uri.fromFile(new java.io.File(downloadPath)),
                "application/pdf",
              );
              intent.setFlags(
                android.content.Intent.FLAG_ACTIVITY_CLEAR_TOP |
                  android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION,
              );

              await ReactNative.startActivity(intent);
            } catch (intentError) {
              console.log("Intent fallback failed:", intentError);

              // Last resort: show file location
              Toast.show({
                type: "info",
                text1: "PDF Downloaded",
                text2: `File saved at: ${downloadPath}`,
              });
            }
          } else {
            // Fallback for iOS
            Toast.show({
              type: "info",
              text1: "PDF Downloaded",
              text2: `File saved at: ${downloadPath}`,
            });
          }
        }

        Toast.show({
          type: "success",
          text1: "Success",
          text2: `PDF Berhasil Diunduh. ${
            Platform.OS === "ios"
              ? "You can find it in the Files app."
              : `Saved as ${fileName} in your Downloads folder.`
          }`,
        });
      } else {
        throw new Error("Download failed");
      }
    } catch (error) {
      console.error("Download error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: `PDF gagal diunduh: ${error.message}`,
      });
    }
  };

  const handleDownloadKwitansi = async () => {
    try {
      const authToken = await AsyncStorage.getItem("@auth-token");
      const fileName = `Kwitansi_${Date.now()}.pdf`;

      const downloadPath =
        Platform.OS === "ios"
          ? `${RNFS.DocumentDirectoryPath}/${fileName}`
          : `${RNFS.DownloadDirectoryPath}/${fileName}`;

      const options = {
        fromUrl: kwitansiUrl,
        toFile: downloadPath,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      };

      const response = await RNFS.downloadFile(options).promise;

      if (response.statusCode === 200) {
        if (Platform.OS === "android") {
          await RNFS.scanFile(downloadPath);
        }

        try {
          await FileViewer.open(downloadPath, {
            showOpenWithDialog: false,
            mimeType: "application/pdf",
          });
        } catch (openError) {
          console.log("Error opening file with FileViewer:", openError);

          if (Platform.OS === "android") {
            try {
              const intent = new android.content.Intent(
                android.content.Intent.ACTION_VIEW,
              );
              intent.setDataAndType(
                android.net.Uri.fromFile(new java.io.File(downloadPath)),
                "application/pdf",
              );
              intent.setFlags(
                android.content.Intent.FLAG_ACTIVITY_CLEAR_TOP |
                  android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION,
              );

              await ReactNative.startActivity(intent);
            } catch (intentError) {
              console.log("Intent fallback failed:", intentError);

              // Last resort: show file location
              Toast.show({
                type: "info",
                text1: "PDF Downloaded",
                text2: `File saved at: ${downloadPath}`,
              });
            }
          } else {
            // Fallback for iOS
            Toast.show({
              type: "info",
              text1: "PDF Downloaded",
              text2: `File saved at: ${downloadPath}`,
            });
          }
        }

        Toast.show({
          type: "success",
          text1: "Success",
          text2: `PDF Berhasil Diunduh. ${
            Platform.OS === "ios"
              ? "You can find it in the Files app."
              : `Saved as ${fileName} in your Downloads folder.`
          }`,
        });
      } else {
        throw new Error("Download failed");
      }
    } catch (error) {
      console.error("Download error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: `PDF gagal diunduh: ${error.message}`,
      });
    }
  };

  return (
    <>
      <View className="p-3 bg-[#ececec] w-full h-full">
        <View className="rounded-3xl bg-[#fff] w-full h-full">
          <View className="flex-row  p-3 justify-between">
            <BackButton
              size={24}
              color={"black"}
              action={() => navigation.goBack()}
              className="mr-2 "
            />
            <Text className="font-poppins-semibold text-black text-lg ">
              Pengujian Pembayaran
            </Text>
          </View>
          <View className=" w-full h-full  ">
            <Paginate
              key={refreshKey}
              className="mb-20"
              url="/pembayaran/pengujian"
              Plugin={filtah}
              plugan={false}
              payload={{ tahun: tahun }}
              renderItem={CardPembayaran}
              ref={PaginateRef}></Paginate>
          </View>
        </View>

        <DatePicker
          visible={isDatePickerVisible}
          onClose={() => setIsDatePickerVisible(false)}
          onSelect={handleDateSelect}
          selectedYear={tahun}
        />
        <Modal
          transparent={true}
          animationType="slide"
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <View className="flex-1 justify-center items-center bg-black bg-black/50">
            <View className="bg-white rounded-lg w-full h-full m-5 mt-8">
              <View className="flex-row justify-between items-center p-4">
                <Text className="text-lg font-poppins-semibold text-black">
                  Preview PDF SKRD
                </Text>
                <TouchableOpacity
                  onPress={handleDownloadSKRD}
                  className="p-2 rounded flex-row items-center">
                  <Feather name="download" size={21} color="black" />
                </TouchableOpacity>
              </View>

              {SKRDUrl ? (
                <Pdf
                  source={{ uri: SKRDUrl, cache: true }}
                  style={{ flex: 1 }}
                  trustAllCerts={false}
                />
              ) : (
                <View className="flex-1 justify-center items-center">
                  <Text className="text-xl font-poppins-semibold text-red-500">
                    404 | File not found
                  </Text>
                </View>
              )}

              <View className="flex-row justify-between m-4">
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  className="bg-[#dc3546] p-2 rounded flex-1 ml-2">
                  <Text className="text-white font-poppins-semibold text-center">
                    Tutup
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        <Modal
          transparent={true}
          animationType="slide"
          visible={modalKwitansi}
          onRequestClose={() => setModalKwitansi(false)}>
          <View className="flex-1 justify-center items-center bg-black bg-black/50">
            <View className="bg-white rounded-lg w-full h-full m-5 mt-8">
              <View className="flex-row justify-between items-center p-4">
                <Text className="text-lg font-poppins-semibold text-black">
                  Preview PDF Kwitansi
                </Text>
                <TouchableOpacity
                  onPress={handleDownloadKwitansi}
                  className="p-2 rounded flex-row items-center">
                  <Feather name="download" size={21} color="black" />
                </TouchableOpacity>
              </View>

              {kwitansiUrl ? (
                <Pdf
                  source={{ uri: kwitansiUrl, cache: true }}
                  style={{ flex: 1 }}
                  trustAllCerts={false}
                />
              ) : (
                <View className="flex-1 justify-center items-center">
                  <Text className="text-xl font-poppins-semibold text-red-500">
                    404 | File not found
                  </Text>
                </View>
              )}

              <View className="flex-row justify-between m-4">
                <TouchableOpacity
                  onPress={() => setModalKwitansi(false)}
                  className="bg-[#dc3546] p-2 rounded flex-1 ml-2">
                  <Text className="text-white font-poppins-semibold text-center">
                    Tutup
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#e2e8f0",
    borderRadius: 15,
    marginVertical: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    borderColor: "#e2e8f0",
    borderWidth: 2,
    overflow: "hidden",
    position: "relative", // Added to position the background
  },
  roundedBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%", // Adjust this value to control how much of the card is covered
    backgroundColor: "#f8f8f8", // slate-200 equivalent
  },
  cardWrapper: {
    flexDirection: "row",
    position: "relative",
    zIndex: 1,
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
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
  badge: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 8,
    fontWeight: "bold",
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
  picker: {
    flex: 1,
    color: "black",
    marginHorizontal: 4,
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
export default Pengujian;
