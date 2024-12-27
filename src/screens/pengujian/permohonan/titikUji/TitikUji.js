import React, { useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import Entypo from "react-native-vector-icons/Entypo";
import { MenuView } from "@react-native-menu/menu";
import { useDelete } from "@/src/hooks/useDelete";
import Icons from "react-native-vector-icons/AntDesign";
import Paginate from "@/src/screens/components/Paginate";
import { usePermohonan } from "@/src/services/usePermohonan";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "@/src/services";
import BackButton from "@/src/screens/components/Back";
import { API_URL } from "@env";
import RNFS from "react-native-fs";
import Feather from "react-native-vector-icons/Feather";
import Pdf from "react-native-pdf";
import Toast from "react-native-toast-message";
import IonIcons from "react-native-vector-icons/Ionicons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

const baseRem = 16;
const rem = multiplier => baseRem * multiplier;

const TitikUji = ({ navigation, route, callback }) => {
  console.log("route", route);
  const { uuid, uuidPermohonan } = route.params || {};
  console.log("uuid permohonan", uuid);
  const [isLoading, setIsLoading] = useState(true);
  // console.log("uuid permohonan", uuidPermohonan);
  const { data: user } = useUser();
  // const data = permohonan || {};
  // console.log("data", data);

  // const pivotData = data.titik_permohonans;
  // console.log("pivotData", pivotData);
  const { onSuccess, onError, onSettled } = callback || {};
  const queryClient = useQueryClient();
  // const titikPermohonans = pivotData;
  const paginateRef = useRef();
  const {
    delete: deleteTitikUji,
    DeleteConfirmationModal,
    SuccessOverlayModal,
    FailedOverlayModal,
  } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries(["/permohonan/titik"]);
      navigation.navigate("TitikUji");
    },
    onError: error => {
      console.log("Delete error : ", error);
    },
  });

  const uuidToUse = uuid || uuidPermohonan;
  const { data: permohonan } = usePermohonan(uuidToUse);
  const titikPermohonans = permohonan?.titik_permohonans;
  // console.log(permohonan, 111);
  // console.log("titikPermohonans", titikPermohonans);

  // useFocusEffect(
  //   useCallback(() => {
  //     refetch();
  //   }, [refetch])
  // );

  const [modalPermohonan, setModalPermohonan] = useState(false);
  const [permohonanUrl, setPermohonanUrl] = useState("");

  const [modalBeritaAcara, setModalBeritaAcara] = useState(false);
  const [beritaAcaraUrl, setBeritaAcaraUrl] = useState("");

  const [modalSertifikatLHU, setModalSertifikatLHU] = useState(false);
  const [sertifikatLHUUrl, setSertifikatLHUUrl] = useState("");

  function getKesimpulanText(kesimpulan_permohonan) {
    if (kesimpulan_permohonan === 1) {
      return "Diterima";
    } else if (kesimpulan_permohonan === 2) {
      return "Ditolak";
    } else {
      return "Menunggu";
    }
  }
  function getPenerimaanText(kesimpulan_sampel) {
    if (kesimpulan_sampel === 1) {
      return "Diterima";
    } else if (kesimpulan_sampel === 2) {
      return "Ditolak";
    } else {
      return "Menunggu";
    }
  }

  const getBackgroundStyle = kesimpulan_sampel => {
    if (kesimpulan_sampel === 1) {
      return "bg-green-50";
    } else if (kesimpulan_sampel === 2) {
      return "bg-red-50";
    } else {
      return "bg-blue-50";
    }
  };
  const getPermohonanText = kesimpulan_permohonan => {
    if (kesimpulan_permohonan === 1) {
      return "bg-green-50";
    } else if (kesimpulan_permohonan === 2) {
      return "bg-red-50";
    } else {
      return "bg-blue-50";
    }
  };

  const CardTitikUji = ({ item }) => {
    // console.log("item: ", item);
    const hasParameters = item?.parameters?.length > 0;
    const permohonanPengujian = item?.status >= 2;
    const mandiri = item?.is_mandiri === 1 && item?.is_lunas === 1;
    const sertifikatLHU =
      (item?.status_tte === 1 && item?.status_pembayaran === 1) ||
      item?.permohonan?.user?.golongan_id === 2;
    // console.log(mandiri, "mandiri");
    const dropdownOptions = [
      {
        id: "Edit",
        title: "Edit",
        action: item =>
          navigation.navigate("FormTitikUji", {
            uuidTitikUji: item.uuid,
            uuid: uuid,
          }),
      },
      ...(item?.status <= 2
        ? [
            {
              id: "Hapus",
              title: "Hapus",
              action: item => deleteTitikUji(`/permohonan/titik/${item.uuid}`),
            },
          ]
        : []),
    ];

    // Fungsi untuk menangani aksi dropdown
    const handleDropdownAction = (option, item) => {
      if (option.subactions) {
        // Return subactions jika ada
        return option.subactions;
      }

      if (option.action) {
        // Jalankan action langsung
        option.action(item);
      }
    };

    // Contoh penggunaan dalam komponen
    const renderDropdownItem = (option, item) => {
      return (
        <TouchableOpacity
          key={option.id}
          onPress={() => handleDropdownAction(option, item)}>
          <Text>{option.title}</Text>
          {option.subactions &&
            option.subactions.map(subaction => (
              <TouchableOpacity
                key={subaction.id}
                onPress={() => subaction.action(item)}>
                <Text>{subaction.title}</Text>
              </TouchableOpacity>
            ))}
        </TouchableOpacity>
      );
    };

    return (
      <View style={styles.card}>
        <View style={styles.roundedBackground} className="rounded-br-full" />
        <TouchableOpacity
          style={styles.cardWrapper}
          onPress={() => {
            if (item.status <= 7) {
              navigation.navigate("Parameter", {
                uuid: item.uuid,
                uuidPermohonan: uuid ? uuid : uuidPermohonan,
              });
            } else {
              // Opsional: Tampilkan pesan jika kondisi tidak terpenuhi
              console.log("Navigasi hanya diperbolehkan untuk status >= 7");
            }
          }}>
          <View style={styles.leftSection}>
            <View style={styles.cardContent}>
              <Text className="font-poppins-regular text-slate-600 text-xs uppercase ">
                Kode
              </Text>
              <Text className="text-black font-poppins-semibold ">
                {item.kode}
              </Text>
              <Text className=" text-slate-600 text-xs uppercase font-poppins-regular mt-3 ">
                Lokasi
              </Text>
              <Text className="text-black font-poppins-semibold ">
                {item.lokasi}
              </Text>

              <View className="flex-col">
                <Text className="font-poppins-regular text-slate-600 text-xs uppercase mt-3">
                  Status pengambilan
                </Text>
              </View>
              <View className="flex-shrink-0 items-start">
                <View
                  className={`${getPermohonanText(
                    item.kesimpulan_permohonan,
                  )} rounded-md px-2 py-1 max-w-[120px]`}>
                  <Text
                    className={`${
                      item.kesimpulan_permohonan == 1
                        ? "text-green-500 text-[10px]"
                        : item.kesimpulan_permohonan == 2
                        ? "text-red-500  text-[10px]"
                        : "text-blue-500 text-[10px]"
                    } font-poppins-semibold `}>
                    {getKesimpulanText(item.kesimpulan_permohonan)}
                  </Text>
                </View>
              </View>
              <Text className="font-poppins-regular text-slate-600 mt-3 text-xs uppercase">
                Status Penerimaan
              </Text>
              <View className="flex-shrink-0 items-start">
                <View
                  className={`${getBackgroundStyle(
                    item.kesimpulan_sampel,
                  )} rounded-md px-2 py-1 max-w-[120px]`}>
                  <Text
                    className={`${
                      item.kesimpulan_sampel === 1
                        ? "text-green-500 text-[10px]"
                        : item.kesimpulan_sampel === 2
                        ? "text-red-500 text-[10px]"
                        : "text-blue-500 text-[10px]"
                    } font-poppins-semibold`}>
                    {getPenerimaanText(item.kesimpulan_sampel)}
                  </Text>
                </View>
              </View>

              <Text className="font-poppins-regular text-slate-600 mt-3 text-xs uppercase">
                Status Pengujian
              </Text>
              <View className="flex-shrink-0 items-start">
                {!hasParameters ? (
                  <View className="bg-yellow-50 rounded-md px-2 py-1">
                    <Text className="text-yellow-600 text-[10px] font-poppins-semibold">
                      Parameter belum diisi
                    </Text>
                  </View>
                ) : (
                  <View className="bg-indigo-50 rounded-md px-2 py-1 max-w-[90px] ">
                    <Text className=" text-[10px] font-poppins-semibold text-indigo-600">
                      {item.text_status || "-"}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <Text className="text-xs text-indigo-500 font-poppins-semibold "></Text>
          </View>

          <View style={styles.cardContents} className="flex flex-end mb-3">
            <Text className="text-slate-600 text-xs  uppercase font-poppins-regular">
              Diterima :
            </Text>
            <Text className="text-black font-poppins-semibold">
              {item.tanggal_diterima || "-"}
            </Text>
            <Text className="text-slate-600 text-xs mt-3 uppercase font-poppins-regular">
              Selesai :
            </Text>
            <Text className="text-black font-poppins-semibold">
              {item.tanggal_selesai_uji || "-"}
            </Text>
            <Text className="text-slate-600 text-xs uppercase mt-3 font-poppins-regular">
              Diambil
            </Text>
            <Text className="text-black font-poppins-semibold">
              {item.tanggal_pengambilan || "-"}
            </Text>
          </View>
        </TouchableOpacity>

        <View
          style={styles.cardActions}
          className="mb-4 flex-end justify-end items-end mr-2 ">
          {(permohonanPengujian || mandiri || sertifikatLHU) && (
            <MenuView
              title="Berita Acara"
              actions={[
                ...(permohonanPengujian
                  ? [
                      {
                        id: "Permohonan Pengujian",
                        title: "Permohonan Pengujian",
                        action: () =>
                          handlePreviewPermohonan({ uuid: item.uuid }),
                      },
                    ]
                  : []),

                ...(mandiri
                  ? [
                      {
                        id: "Berita Acara",
                        title: "Berita Acara",

                        action: () =>
                          handlePreviewBeritaAcara({ uuid: item.uuid }),
                      },
                    ]
                  : []),
                ...(sertifikatLHU
                  ? [
                      {
                        id: "Sertifikat LHU",
                        title: "Sertifikat LHU",

                        action: () =>
                          handlePreviewBeritaAcara({ uuid: item.uuid }),
                      },
                    ]
                  : []),
              ]}
              onPressAction={({ nativeEvent }) => {
                const selectedOption = nativeEvent.event;
                if (selectedOption === "Permohonan Pengujian") {
                  handlePreviewPermohonan({ uuid: item.uuid });
                } else if (selectedOption === "Berita Acara") {
                  handlePreviewBeritaAcara({ uuid: item.uuid });
                } else if (selectedOption === "Sertifikat LHU") {
                  handlePreviewSertifikatLHU({ uuid: item.uuid });
                }
              }}>
              <View className="mr-2">
                <FontAwesome5 name="file-pdf" size={20} color="#ef4444" />
              </View>
            </MenuView>
          )}
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
  };

  const renderHeaderInformationTU = () => {
    // Masalah: Anda menggunakan curly braces {} yang membuat ini menjadi block statement
    // tapi tidak ada return statement
    return titikPermohonans?.length === 0 ? (
      <View className="">
        <View className="flex p-2 top-3 items-center bg-indigo-100 border border-indigo-400 rounded-md">
          <Text className="text-black text-center mb-1 font-poppins-semibold">
            Tambah Lokasi Sampel Pengujian
          </Text>
          <Text className="text-black text-[13px] font-poppins-medium text-center ">
            Anda belum memiliki Titik Lokasi Satupun.
          </Text>
        </View>
      </View>
    ) : null;
  };

  const handlePreviewPermohonan = async ({ uuid }) => {
    try {
      const authToken = await AsyncStorage.getItem("@auth-token");
      setPermohonanUrl(
        `${API_URL}/report/${uuid}/tanda-terima?token=${authToken}`,
      );
      setModalPermohonan(true);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Gagal membuka Permohonan",
      });
    }
  };

  const handleDownloadPermohonan = async () => {
    setModalPermohonan(false);
    try {
      const authToken = await AsyncStorage.getItem("@auth-token");
      const fileName = `Permohonan_Pengujian_${Date.now()}.pdf`;

      const downloadPath =
        Platform.OS === "ios"
          ? `${RNFS.DocumentDirectoryPath}/${fileName}`
          : `${RNFS.DownloadDirectoryPath}/${fileName}`;

      const options = {
        fromUrl: permohonanUrl,
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

  const handlePreviewBeritaAcara = async ({ uuid }) => {
    try {
      const authToken = await AsyncStorage.getItem("@auth-token");
      setBeritaAcaraUrl(
        `${API_URL}/report/${uuid}/berita-acara?token=${authToken}`,
      );
      setModalBeritaAcara(true);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Gagal membuka Permohonan",
      });
    }
  };

  const handleDownloadBeritaAcara = async () => {
    setModalBeritaAcara(false);
    try {
      const authToken = await AsyncStorage.getItem("@auth-token");
      const fileName = `Berita_Acara_${Date.now()}.pdf`;

      const downloadPath =
        Platform.OS === "ios"
          ? `${RNFS.DocumentDirectoryPath}/${fileName}`
          : `${RNFS.DownloadDirectoryPath}/${fileName}`;

      const options = {
        fromUrl: beritaAcaraUrl,
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

  const handlePreviewSertifikatLHU = async ({ uuid }) => {
    try {
      const authToken = await AsyncStorage.getItem("@auth-token");
      setBeritaAcaraUrl(
        `${API_URL}/report/${uuid}/lhu/tte/download?token=${authToken}`,
      );
      setModalSertifikatLHU(true);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Gagal membuka Permohonan",
      });
    }
  };

  const handleDownloadSertifikatLHU = async () => {
    setModalSertifikatLHU(false);
    try {
      const authToken = await AsyncStorage.getItem("@auth-token");
      const fileName = `Berita_Acara_${Date.now()}.pdf`;

      const downloadPath =
        Platform.OS === "ios"
          ? `${RNFS.DocumentDirectoryPath}/${fileName}`
          : `${RNFS.DownloadDirectoryPath}/${fileName}`;

      const options = {
        fromUrl: sertifikatLHUUrl,
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
      <View className="w-full h-full bg-[#ececec] p-3">
        <View className="w-full h-full rounded-3xl bg-[#fff]">
          <View className="w-full">
            <View className="flex-row  justify-between pt-5 px-4 pb-1 ">
              <BackButton
                size={24}
                color={"black"}
                action={() => navigation.goBack()}
                className="mr-2 "
              />
              {permohonan ? (
                <Text className="font-poppins-semibold text-black text-lg text-end">
                  {/* {permohonan?.industri} : */}
                  Titik Pengujian
                </Text>
              ) : (
                <Text className="font-poppins-semibold text-black text-lg text-end">
                  Titik Pengujian
                </Text>
              )}
            </View>
          </View>
          {!titikPermohonans?.data?.length &&
            // !pivotData?.length &&
            user.has_tagihan && (
              <View className="p-4">
                <View className="flex p-2 items-center bg-yellow-100 border border-yellow-400 rounded-md">
                  <Text className="text-black mb-0">
                    Tidak dapat membuat Permohonan Baru
                  </Text>
                  <Text className="text-black text-xs">
                    Harap selesaikan tagihan pembayaran Anda terlebih dahulu.
                  </Text>
                </View>
              </View>
            )}

          {/* {
            !titikPermohonans?.data?.length && (
              // !pivotData?.length &&
              // !user.has_tagihan && (
              <View className="p-4">
                <View className="flex p-2 items-center bg-indigo-100 border border-indigo-400 rounded-md">
                  <Text className="text-black text-center mb-2 font-poppins-semibold">
                    Silahkan Tambah Titik Lokasi Sampel Pengujian
                  </Text>
                  <Text className="text-black text-[13px] font-poppins-medium text-center ">
                    Anda belum memiliki Titik Lokasi Sampel satu pun.
                  </Text>
                </View>
              </View>
            )
            // )
          } */}
          <View className="w-full h-full rounded-b-md">
            <Paginate
              HeaderInformationTU={renderHeaderInformationTU}
              ref={paginateRef}
              payload={{ permohonan_uuid: uuid ? uuid : uuidPermohonan }}
              url="/permohonan/titik"
              className="mb-20"
              renderItem={CardTitikUji}
            />
          </View>

          <Icons
            name="plus"
            size={28}
            color="#fff"
            style={styles.plusIcon}
            onPress={() => navigation.navigate("FormTitikUji", { uuid: uuid })}
          />
        </View>

        <DeleteConfirmationModal />
        <SuccessOverlayModal />
        <FailedOverlayModal />
      </View>

      <Modal
        transparent={true}
        animationType="slide"
        visible={modalPermohonan}
        onRequestClose={() => setModalPermohonan(false)}>
        <View className="flex-1 justify-center items-center bg-black bg-black/50">
          <View className="bg-white rounded-lg w-full h-full m-5 mt-8">
            <View className="flex-row justify-between items-center p-4">
              <Text className="text-lg font-poppins-semibold text-black">
                Preview PDF Permohonan Pengujian
              </Text>
              <TouchableOpacity
                onPress={handleDownloadPermohonan}
                className="p-2 rounded flex-row items-center">
                <Feather name="download" size={21} color="black" />
              </TouchableOpacity>
            </View>

            {permohonanUrl ? (
              <View className="flex-1">
                {isLoading && (
                  <View className="absolute z-10 w-full h-full items-center justify-center">
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text className="mt-2 font-poppins-medium text-gray-600">
                      Memuat PDF...
                    </Text>
                  </View>
                )}
                <Pdf
                  source={{ uri: permohonanUrl, cache: true }}
                  style={{ flex: 1 }}
                  trustAllCerts={false}
                  onLoadComplete={() => setIsLoading(false)}
                  onError={error => {
                    console.log("PDF Error:", error);
                    setIsLoading(false);
                  }}
                />
              </View>
            ) : (
              <View className="flex-1 justify-center items-center">
                <Text className="text-xl font-poppins-semibold text-red-500">
                  404 | File not found
                </Text>
              </View>
            )}

            <View className="flex-row justify-between m-4">
              <TouchableOpacity
                onPress={() => setModalPermohonan(false)}
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
        visible={modalBeritaAcara}
        onRequestClose={() => setModalBeritaAcara(false)}>
        <View className="flex-1 justify-center items-center bg-black bg-black/50">
          <View className="bg-white rounded-lg w-full h-full m-5 mt-8">
            <View className="flex-row justify-between items-center p-4">
              <Text className="text-lg font-poppins-semibold text-black">
                Preview PDF Berita Acara
              </Text>
              <TouchableOpacity
                onPress={handleDownloadBeritaAcara}
                className="p-2 rounded flex-row items-center">
                <Feather name="download" size={21} color="black" />
              </TouchableOpacity>
            </View>

            {beritaAcaraUrl ? (
              <View className="flex-1">
                {isLoading && (
                  <View className="absolute z-10 w-full h-full items-center justify-center">
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text className="mt-2 font-poppins-medium text-gray-600">
                      Memuat PDF...
                    </Text>
                  </View>
                )}
                <Pdf
                  source={{ uri: beritaAcaraUrl, cache: true }}
                  style={{ flex: 1 }}
                  trustAllCerts={false}
                  onLoadComplete={() => setIsLoading(false)}
                  onError={error => {
                    console.log("PDF Error:", error);
                    setIsLoading(false);
                  }}
                />
              </View>
            ) : (
              <View className="flex-1 justify-center items-center">
                <Text className="text-xl font-poppins-semibold text-red-500">
                  404 | File not found
                </Text>
              </View>
            )}

            <View className="flex-row justify-between m-4">
              <TouchableOpacity
                onPress={() => setModalBeritaAcara(false)}
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
        visible={modalSertifikatLHU}
        onRequestClose={() => setModalSertifikatLHU(false)}>
        <View className="flex-1 justify-center items-center bg-black bg-black/50">
          <View className="bg-white rounded-lg w-full h-full m-5 mt-8">
            <View className="flex-row justify-between items-center p-4">
              <Text className="text-lg font-poppins-semibold text-black">
                Preview PDF Berita Acara
              </Text>
              <TouchableOpacity
                onPress={handleDownloadSertifikatLHU}
                className="p-2 rounded flex-row items-center">
                <Feather name="download" size={21} color="black" />
              </TouchableOpacity>
            </View>

            {sertifikatLHUUrl ? (
              <View className="flex-1">
                {isLoading && (
                  <View className="absolute z-10 w-full h-full items-center justify-center">
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text className="mt-2 font-poppins-medium text-gray-600">
                      Memuat PDF...
                    </Text>
                  </View>
                )}
                <Pdf
                  source={{ uri: sertifikatLHUUrl, cache: true }}
                  style={{ flex: 1 }}
                  trustAllCerts={false}
                  onLoadComplete={() => setIsLoading(false)}
                  onError={error => {
                    console.log("PDF Error:", error);
                    setIsLoading(false);
                  }}
                />
              </View>
            ) : (
              <View className="flex-1 justify-center items-center">
                <Text className="text-xl font-poppins-semibold text-red-500">
                  404 | File not found
                </Text>
              </View>
            )}

            <View className="flex-row justify-between m-4">
              <TouchableOpacity
                onPress={() => setModalSertifikatLHU(false)}
                className="bg-[#dc3546] p-2 rounded flex-1 ml-2">
                <Text className="text-white font-poppins-semibold text-center">
                  Tutup
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: "#e2e8f0",
    borderColor: "#e2e8f0",
    borderWidth: 2,
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
    right: -20,
    height: "120%", // Adjust this value to control how much of the card is covered
    backgroundColor: "#f8f8f8", // slate-200 equivalent
  },
  cardWrapper: {
    flexDirection: "row",
    position: "relative",
    zIndex: 1,
  },
  leftSection: {
    width: "70%",
    position: "relative",
  },
  cardContent: {
    padding: 12,
  },
  cardContents: {
    width: "30%",
    paddingTop: 12,
  },
  cardActions: { flexDirection: "row", alignItems: "flex-end" },
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
