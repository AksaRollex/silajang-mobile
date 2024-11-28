import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Button,
  TouchableOpacity,
} from "react-native";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { APP_URL } from "@env";
import Pdf from "react-native-pdf";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from "react-native-popup-menu";
import Icon from "react-native-vector-icons/FontAwesome";
import { useUser } from "@/src/services";
import BackButton from "@/src/screens/components/Back";
import { API_URL } from "@env";
import RNFS from "react-native-fs";
import Share from "react-native-share";
import { FA5Style } from "react-native-vector-icons/FontAwesome5";

const baseRem = 16;
const rem = multiplier => baseRem * multiplier;

const TitikUji = ({ navigation, route, status, callback }) => {
  const { uuid } = route.params || {};
  const { data: permohonan } = usePermohonan(uuid);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [reportUrl, setReportUrl] = useState("");
  const { data: user } = useUser();
  const openModal = () => {
    setIsModalVisible(true);
  };
  // console.log("data permohonan", permohonan);
  const data = permohonan || {};
  const pivotData = data.titik_permohonans;
  // console.log("data: ", data);
  const { onSuccess, onError, onSettled } = callback || {};

  useEffect(() => {
    console.log("DATA ANJAY", uuid);
  }, [uuid]);

  const closeModal = () => {
    setIsModalVisible(false);
  };
  const queryClient = useQueryClient();
  const titikPermohonans = queryClient.getQueryData([
    "permohonan",
    uuid,
    "titik",
  ]);

  const paginateRef = useRef();
  const [modalVisible, setModalVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { delete: deleteTitikUji, DeleteConfirmationModal, SuccessOverlayModal, FailedOverlayModal } = useDelete({
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
      subactions: [
        {
          id: "Permohonan Pengujian",
          title: "Permohonan Pengujian",
          action: async item => {
            if (item.status >= 2) {
              // Kondisi untuk status >= 2
              try {
                const token = await AsyncStorage.getItem("@auth-token");
                if (token) {
                  const reportUrl = `${API_URL}/report/${item.uuid}/tanda-terima?token=${token}`;
                  setPreviewUrl(reportUrl); // Set URL untuk preview
                  setModalVisible(true);
                  setDownloadComplete(false);
                } else {
                  console.error("Token not found");
                }
              } catch (error) {
                console.error("Error mendapatkan token:", error);
              }
            }
          },
        },
        {
          id: "Berita Acara Pengambilan",
          title: "Berita Acara Pengambilan",
          action: async item => {
            if (data.is_mandiri === 1) {
              // Kondisi untuk is_mandiri === 1
              try {
                const token = await AsyncStorage.getItem("@auth-token");
                if (token) {
                  const reportUrl = `${API_URL}/report/${item.uuid}/berita-acara?token=${token}`;
                  setPreviewUrl(reportUrl); // Set URL untuk preview
                  setModalVisible(true);
                  setDownloadComplete(false);
                } else {
                  console.error("Token not found");
                }
              } catch (error) {
                console.error("Error mendapatkan token:", error);
              }
            }
          },
        },
      ],
    },
    // {
    //   id: "Parameter",
    //   title: "Parameter",
    //   action: item => navigation.navigate("Parameter", { uuid: item.uuid }),
    // },
    {
      id: "Edit",
      title: "Edit",
      action: item =>
        navigation.navigate("FormTitikUji", {
          uuid: item.uuid,
          permohonan: permohonan,
        }),
    },
    {
      id: "Hapus",
      title: "Hapus",
      action: item => deleteTitikUji(`/permohonan/titik/${item.uuid}`),
    },
  ];

  // Function to download the PDF
  const handleConfirm = async () => {
    const fileName = "pembayaran.pdf";
    const fileDir = Platform.select({
      ios: RNFS.DocumentDirectoryPath,
      android: RNFS.DownloadDirectoryPath,
    });
    const filePath = `${fileDir}/${fileName}`;

    setIsLoading(true); // Start loading when download begins

    try {
      const options = {
        fromUrl: previewUrl,
        toFile: filePath,
        background: true,
      };

      const response = await RNFS.downloadFile(options).promise;

      if (response.statusCode === 200) {
        setDownloadComplete(true); // Set download complete flag to true
        onSuccess && onSuccess(filePath);
      } else {
        throw new Error("Failed to download file");
      }
    } catch (error) {
      console.error("Download error:", error);
      onError && onError(error);
    } finally {
      setIsLoading(false); // Stop loading after download is complete
      onSettled && onSettled();
    }
  };

  const showConfirmationModal = url => {
    setreportUrl(url);
    setModalVisible(true);
  };
  // Function to handle share
  const handleShare = async () => {
    const fileName = "pembayaran.pdf";
    const fileDir = Platform.select({
      ios: RNFS.DocumentDirectoryPath,
      android: RNFS.DownloadDirectoryPath,
    });
    const filePath = `${fileDir}/${fileName}`;

    await Share.open({
      url: Platform.OS === "android" ? `file://${filePath}` : filePath,
      type: "application/pdf",
    });
  };

  // Fungsi untuk mendapatkan class berdasarkan data.kesimpulan_permohonan
  function getKesimpulanClass(kesimpulan_permohonan) {
    if (kesimpulan_permohonan === 1) {
      return "text-indigo-600 bg-light-success"; // Diterima
    } else if (kesimpulan_permohonan === 2) {
      return "text-indigo-600 bg-light-danger"; // Ditolak
    } else {
      return "text-indigo-600 bg-light-info"; // Menunggu
    }
  }

  // Fungsi untuk mendapatkan teks berdasarkan data.kesimpulan_permohonan
  function getKesimpulanText(kesimpulan_permohonan) {
    if (kesimpulan_permohonan === 1) {
      return "Diterima";
    } else if (kesimpulan_permohonan === 2) {
      return "Ditolak";
    } else {
      return "Menunggu";
    }
  }
  function getPenerimaanClass(kesimpulan_sampel) {
    if (kesimpulan_sampel === 1) {
      return "text-indigo-600 bg-light-success"; // Diterima
    } else if (kesimpulan_sampel === 2) {
      return "text-indigo-600 bg-light-danger"; // Ditolak
    } else {
      return "text-indigo-600 bg-light-info"; // Menunggu
    }
  }

  // Fungsi untuk mendapatkan teks berdasarkan data.kesimpulan_sampel
  function getPenerimaanText(kesimpulan_sampel) {
    if (kesimpulan_sampel === 1) {
      return "Diterima";
    } else if (kesimpulan_sampel === 2) {
      return "Ditolak";
    } else {
      return "Menunggu";
    }
  }

  const CardTitikUji = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.roundedBackground} className="rounded-br-full" />

      <TouchableOpacity style={styles.cardWrapper} onPress={() => navigation.navigate("Parameter", { uuid: item.uuid })}>
        {/* Left section with rounded background */}
        <View style={styles.leftSection}>
          <View style={styles.cardContent}>
            <Text className="font-bold text-slate-600 text-xs uppercase font-poppins-semibold">
              Lokasi
            </Text>
            <Text className="text-black font-poppins-regular text-base">
              {item.lokasi}
            </Text>

            <Text className="font-poppins-semibold text-slate-600 mt-3 text-xs uppercase">
              status PENGAMBILAN
            </Text>
            <Text
              className={`${
                item.kesimpulan_permohonan == 1
                  ? "text-green-600 text-xs" // Diterima
                  : item.kesimpulan_permohonan == 2
                  ? "text-red-600  text-xs" // Ditolak
                  : "text-blue-600 text-xs" // Menunggu
              } font-poppins-regular`}>
              {getKesimpulanText(item.kesimpulan_permohonan)}
            </Text>
            <Text className="font-poppins-semibold text-slate-600 mt-3 text-xs uppercase">
              status Penerimaan
            </Text>
            <Text
              className={`${
                item.kesimpulan_sampel == 1
                  ? "text-green-600 text-xs" // Diterima
                  : item.kesimpulan_sampel == 2
                  ? "text-red-600 text-xs" // Ditolak
                  : "text-blue-600  text-xs" // Menunggu
              } font-poppins-regular `}>
              {getPenerimaanText(item.kesimpulan_sampel)}
            </Text>
            <Text className="font-poppins-semibold text-slate-600 mt-3 text-xs uppercase">
              status Pengujian
            </Text>
            <Text className="text-xs text-indigo-600 font-poppins-regular ">
              {item.text_status || "-"}
            </Text>
          </View>
        </View>

        {/* Middle section */}
        <View style={styles.cardContents} className="flex flex-end mb-3">
          <Text className="font-poppins-semibold text-slate-600 text-xs uppercase">
            Kode
          </Text>
          <Text className="text-black font-poppins-regular text-base">
            {item.kode}
          </Text>
          <Text className="text-slate-600 text-xs uppercase mt-3 font-poppins-semibold">
            Diambil
          </Text>
          <Text className="text-black font-poppins-regular">
            {item.tanggal_pengambilan || "-"}
          </Text>
          <Text className="text-slate-600 text-xs mt-3 uppercase font-poppins-semibold">
            Diterima :
          </Text>
          <Text className="text-black font-poppins-regular">
            {item.tanggal_diterima || "-"}
          </Text>
          <Text className="text-slate-600 text-xs mt-3 uppercase font-poppins-semibold">
            Selesai :
          </Text>
          <Text className="text-black font-poppins-regular">
            {item.tanggal_selesai_uji || "-"}
          </Text>
        </View>

      </TouchableOpacity>
        {/* Right section (dots menu) */}
        <View style={styles.cardActions} className="mb-4 flex-end jusitfy-end items-end ml-80">
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
  );

  return (
    <>
      <View className="w-full h-full bg-[#ececec] p-3">
        <View className="w-full h-full rounded-3xl bg-[#fff]">
          <View className="w-full">
            <View className="flex-row p-3  justify-between rounded-t-md">
              <BackButton
                size={24}
                color={"black"}
                action={() => navigation.goBack()}
                className="mr-2 "
              />
              {permohonan ? (
                <Text className="font-poppins-semibold text-black   ">
                  {permohonan?.industri} : Titik Pengujian
                </Text>
              ) : (
                <Text></Text>
              )}
            </View>
          </View>
          <View className=" w-full h-full rounded-b-md">
            {!titikPermohonans?.data?.length && !pivotData?.length && (
              <View className=" pt-5 px-5">
                <View className="flex p-2 items-center bg-indigo-100 border border-indigo-400 rounded-md">
                  <Text className="text-black text-xs mb-2 font-poppins-medium">
                    Silahkan Tambah Titik Lokasi Sampel Pengujian
                  </Text>
                  <Text className="text-black text-xs  font-poppins-regular">
                    Anda belum memiliki Titik Lokasi Sampel satu pun.
                  </Text>
                </View>
              </View>
            )}
            {user.has_tagihan ? (
              <View className="p-2">
                <View className="flex items-center w-full p-3 bg-yellow-100 border border-yellow-400 rounded-md">
                  <Text className="text-black mb-0">
                    Tidak dapat membuat Permohonan Baru
                  </Text>
                  <Text className="text-black text-xs">
                    Harap selesaikan tagihan pembayaran Anda terlebih dahulu.
                  </Text>
                </View>
              </View>
            ) : (
              <>
                <Paginate
                  ref={paginateRef}
                  payload={{ permohonan_uuid: { uuid } }}
                  url="/permohonan/titik"
                  className="mb-20"
                  renderItem={CardTitikUji}></Paginate>
              </>
            )}
          </View>
          <Icons
            name="plus"
            size={28}
            color="#fff"
            style={styles.plusIcon}
            onPress={() => navigation.navigate("FormTitikUji", { permohonan })}
          />
        </View>
        <DeleteConfirmationModal />
        <SuccessOverlayModal/>
        <FailedOverlayModal/>
      </View>
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
    width: "10%",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  cardTexts: {
    fontSize: 13,
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
});

export default TitikUji;
