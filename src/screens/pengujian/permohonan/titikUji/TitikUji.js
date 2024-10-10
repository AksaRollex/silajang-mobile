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
  console.log("data: ", data);
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
    {
      id: "Parameter",
      title: "Parameter",
      action: item => navigation.navigate("Parameter", { uuid: item.uuid }),
    },
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
            <View>
              <Text
                style={styles.badge}
                className={`${
                  item.kesimpulan_permohonan == 1
                    ? "text-green-600 bg-green-50" // Diterima
                    : item.kesimpulan_permohonan == 2
                    ? "text-red-600 bg-red-50" // Ditolak
                    : "text-blue-600 bg-blue-50" // Menunggu
                }`}>
                Pengambilan: {getKesimpulanText(item.kesimpulan_permohonan)}
              </Text>
            </View>
            <View>
              <Text
                style={styles.badge}
                className={`${
                  item.kesimpulan_sampel == 1
                    ? "text-green-600 bg-green-50" // Diterima
                    : item.kesimpulan_sampel == 2
                    ? "text-red-600 bg-red-50" // Ditolak
                    : "text-blue-600 bg-blue-50" // Menunggu
                }`}>
                Penerimaan:
                {getPenerimaanText(item.kesimpulan_sampel)}
              </Text>
            </View>
            <Text
              style={styles.badge}
              className="text-xs text-indigo-600  bg-slate-100 ">
              Pengujian : {item.text_status || "-"}
            </Text>
          </View>
        </View>
        <View style={styles.cards2}>
          <MenuView
            title="Menu Report"
            actions={dropdownOptions.map(option => ({
              ...option,
              subactions: option.subactions
                ? option.subactions.filter(subaction => {
                    // Filter subactions berdasarkan kondisi
                    if (subaction.id === "Permohonan Pengujian") {
                      return item.status >= 2; // Tampilkan jika status >= 2
                    } else if (subaction.id === "Berita Acara Pengambilan") {
                      return data.is_mandiri === 1; // Tampilkan jika is_mandiri === 1
                    }
                    return true;
                  })
                : null,
            }))}
            onPressAction={({ nativeEvent }) => {
              const selectedOption = dropdownOptions.find(
                option => option.title === nativeEvent.event,
              );
              const sub = dropdownOptions.find(
                option =>
                  option.subactions &&
                  option.subactions.some(
                    suboption => suboption.title === nativeEvent.event,
                  ),
              );
              if (selectedOption) {
                selectedOption.action(item);
              }
              if (sub) {
                const selectedSub = sub.subactions.find(
                  sub => sub.title === nativeEvent.event,
                );
                if (selectedSub) {
                  selectedSub.action(item);
                }
              }
            }}
            shouldOpenOnLongPress={false}>
            {/* <TouchableOpacity
        className="flex-row justify-center bg-red-600 p-2 rounded-xl absolute bottom-8 right-1 items-end"
        onPress={openModal}>
        <Icons name="plus" size={24} color="#fff" />
        <Text className="text-white font-bold"></Text>
      </TouchableOpacity>

      {/* Modal to display the empty card */}
            {/* <Modal
        visible={isModalVisible}
        animationType="fade"
        onRequestClose={closeModal}
        transparent={true}>
        <View className="flex-1 justify-center items-center bg-black bg-black/50">
          <View className="bg-white rounded-xl w-5/6 p-6 shadow-lg">
            <Text className="text-black text-xl font-bold mb-4">Empty Card</Text>

            {/* Empty card content */}
            {/* <View className="w-full h-40 bg-gray-200 rounded-lg mb-4"></View> */}

            {/* <TouchableOpacity
              className="self-end bg-red-600 py-2 px-4 rounded-md"
              onPress={closeModal}>
              <Text className="text-white font-bold">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal> */}

            <View>
              <Entypo name="dots-three-vertical" size={16} color="#312e81" />
            </View>
          </MenuView>
          {/* <ActionColumn item={item} /> */}
        </View>

        {/* Modal untuk Preview */}
        <Modal
          transparent={true}
          animationType="fade"
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <View className="flex-1 justify-center items-center bg-black bg-black/50">
            <View className="bg-white rounded-lg w-full h-full m-5">
              <Text className="text-lg font-bold m-4">Preview LHU</Text>
              <Pdf
                source={{ uri: previewUrl, cache: true }}
                style={{ flex: 1 }}
                trustAllCerts={false}
              />
              {/* Show loading indicator when downloading */}
              {isLoading ? (
                <ActivityIndicator size="large" color="#0000ff" />
              ) : (
                <>
                  {!downloadComplete ? (
                    <>
                      <TouchableOpacity
                        onPress={handleConfirm}
                        className="bg-blue-500 w-full my-48 p-2 m-1 rounded">
                        <Text className="text-white text-center">Download</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setModalVisible(false)}
                        className="bg-red-500 w-full my-48 p-2 m-1 rounded">
                        <Text className="text-white text-center">Close</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity
                        onPress={handleShare}
                        className="bg-green-500 w-full my-48 p-2 m-1 rounded">
                        <Text className="text-white text-center">Share</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setModalVisible(false)}
                        className="bg-red-500 w-full my-48 p-2 m-1 rounded">
                        <Text className="text-white text-center">Close</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </>
              )}
            </View>
          </View>
        </Modal>
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
       
        {/* {user && user?.has_tagihan ? (
          <View>
            <Text>anjay</Text>
          </View>
        ) : (
          <View></View>
        )} */}
        {/* <Text>
          {titikPermohonans?.data?.length}
        </Text> */}
        {!titikPermohonans?.data?.length && (
          <View className="p-5">
            <View className="flex items-center w-full p-3 bg-indigo-100 border border-indigo-400 rounded-md">
              <Text className="text-black mb-0">
                Silahkan Tambah Titik Lokasi Sampel Pengujian
              </Text>
              <Text className="text-black text-xs">
                Anda belum memiliki Titik Lokasi Sampel satu pun.
              </Text>
            </View>
          </View>
        )}
        { user.has_tagihan ? (
          <View className="p-2">
          <View className="flex items-center w-full p-3 bg-yellow-100 border border-yellow-400 rounded-md">
            <Text className="text-black mb-0">Tidak dapat membuat Permohonan Baru</Text>
            <Text className="text-black text-xs">Harap selesaikan tagihan pembayaran Anda terlebih dahulu.</Text>
          </View>
          </View>
        ) : (
        <>
        <Icons
          name="plus"
          size={28}
          color="#fff"
          style={styles.plusIcon}
          onPress={() => navigation.navigate("FormTitikUji", { permohonan })}
          />
        </>
      )}
        <Paginate
          ref={paginateRef}
          payload={{ permohonan_uuid: { uuid } }}
          url="/permohonan/titik"
          className="mb-40"
          renderItem={CardTitikUji}></Paginate>
      </View>

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
    bottom: 65,
    right: 20,
    backgroundColor: "#312e81",
    padding: 10,
    marginBottom: rem(4),
    borderRadius: 50,
  },
});

export default TitikUji;
