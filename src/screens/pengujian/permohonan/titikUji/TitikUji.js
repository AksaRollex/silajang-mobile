import React, { useCallback, useRef, useState } from "react";
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
import BackButton from "@/src/screens/components/Back";
import { API_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Pdf from "react-native-pdf";
import RNFS from "react-native-fs";
import Share from "react-native-share";
import { FA5Style } from "react-native-vector-icons/FontAwesome5";

const baseRem = 16;
const rem = multiplier => baseRem * multiplier;

const TitikUji = ({ navigation, route, status, callback }) => {
  const { uuid } = route.params || {};
  const { data: permohonan } = usePermohonan(uuid);
  const data = permohonan || {};
  console.log("data: ", data);
  const { onSuccess, onError, onSettled } = callback || {};

  const queryClient = useQueryClient();
  const paginateRef = useRef();
  const [modalVisible, setModalVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      action: item => navigation.navigate("FormTitikUji", { uuid: item.uuid }),
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
              className={`text-xs text-indigo-600  mt-2
            ${
              status == 0
                ? "bg-green-400"
                : status == 1
                ? "bg-slate-100"
                : status == 2
                ? "bg-slate-100"
                : status == 3
                ? "bg-slate-100"
                : status == 4
                ? "bg-slate-100"
                : status == 5
                ? "bg-slate-100"
                : status == 6
                ? "bg-slate-100"
                : status == 7
                ? "bg-slate-100"
                : status == 8
                ? "bg-slate-100"
                : status == 9
                ? "bg-slate-100"
                : status == 10
                ? "bg-slate-100"
                : status == 11
                ? "bg-slate-100"
                : "bg-slate-100"
            }`}>
              Pengambilan :
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
              style={styles.badge}
              className={`text-xs text-indigo-600
            ${
              status == 0
                ? "bg-green-400"
                : status == 1
                ? "bg-slate-100"
                : status == 2
                ? "bg-slate-100"
                : status == 3
                ? "bg-slate-100"
                : status == 4
                ? "bg-slate-100"
                : status == 5
                ? "bg-slate-100"
                : status == 6
                ? "bg-slate-100"
                : status == 7
                ? "bg-slate-100"
                : status == 8
                ? "bg-slate-100"
                : status == 9
                ? "bg-slate-100"
                : status == 10
                ? "bg-slate-100"
                : status == 11
                ? "bg-slate-100"
                : "bg-slate-100 && text-red-500"
            }`}>
              Penerimaan :
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
              style={styles.badge}
              className="text-xs text-indigo-600  bg-slate-100 ">
              Pengujian : {item.text_status || "-"}
            </Text>
          </View>
        </View>
        <View style={styles.cards2}>
          <MenuView
            title="Menu Title"
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
            <View>
              <Entypo name="dots-three-vertical" size={16} color="#312e81" />
            </View>
          </MenuView>
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
