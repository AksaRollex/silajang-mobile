import { useDelete } from "@/src/hooks/useDelete";
import BackButton from "@/src/screens/components/BackButton";
import Paginate from "@/src/screens/components/Paginate";
import HorizontalFilterMenu from "@/src/screens/components/HorizontalFilterMenu";
import HorizontalScrollMenu from "@nyashanziramasanga/react-native-horizontal-scroll-menu";
import { MenuView } from "@react-native-menu/menu";
import React, { useRef, useState, useEffect } from "react";
import { Text, View, Modal, TouchableOpacity, Alert } from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Feather from "react-native-vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { APP_URL } from "@env";
import Pdf from "react-native-pdf";
import RNFS, { downloadFile } from "react-native-fs";
import Toast from "react-native-toast-message";

const currentYear = new Date().getFullYear();
const generateYears = () => {
  let years = [];
  for (let i = currentYear; i >= 2022; i--) {
    years.push({ id: i, title: String(i) });
  }
  return years;
};
const kortekOptions = [
  { id: 5, name: "Menunggu Konfirmasi" },
  { id: 6, name: "Telah Dikonfirmasi" },
];

const Kortek = ({ navigation }) => {
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const filterOptions = generateYears();
  const [selectedKortek, setSelectedKortek] = useState(5);
  const paginateRef = useRef();
  const [modalVisible, setModalVisible] = useState(false);
  const [reportUrl, setReportUrl] = useState("");
  const isConfirmed = Kortek === 9; // Telah Diambil

  const { delete: showConfirmationModal, DeleteConfirmationModal } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries(["kortek"]);
      paginateRef.current?.refetch();
    },
    onError: error => {
      console.error("Delete error:", error);
    },
  });

  const dropdownOptions1 = [
    {
      id: "Hasil Uji",
      title: "Hasil Uji",
      action: item =>
        navigation.navigate("HasilUjis", {
          uuid: item.uuid,
          status: item.status,
        }),
    },
  ];

  const dropdownOptions = [
    // {
    //   id: "Edit",
    //   title: "Edit",
    //   action: item => navigation.navigate("FormMetode", { uuid: item.uuid }),
    // },
    // { id: "Hapus", title: "Hapus", action: item => deleteMetode(`/master/acuan-metode/${item.uuid}`) },
    {
      id: "Hasil Uji",
      title: "Hasil Uji",
      action: item =>
        navigation.navigate("HasilUjis", {
          uuid: item.uuid,
          status: item.status,
        }),
    },
    {
      id: "RDPS",
      title: "RDPS",
      action: item => handlePreviewRDPS({ uuid: item.uuid }),
    },
    {
      id: "Preview LHU",
      title: "Preview LHU",
      action: item => handlePreviewLhu({ uuid: item.uuid }),
    },
  ];

  const handlePreviewLhu = async item => {
    const authToken = await AsyncStorage.getItem("@auth-token");
    setReportUrl(
      `${APP_URL}/api/v1/report/${item.uuid}/preview-lhu?token=${authToken}`,
    );
    setModalVisible(true);
  };
  const handlePreviewRDPS = async item => {
    const authToken = await AsyncStorage.getItem("@auth-token");
    setReportUrl(
      `${APP_URL}/api/v1/report/${item.uuid}/rdps?token=${authToken}`,
    );
    setModalVisible(true);
  };

  const handleDownloadPDF = async () => {
    try {
      const authToken = await AsyncStorage.getItem("@auth-token");
      const fileName = `LHU_${Date.now()}.pdf`;

      const downloadPath =
        Platform.OS === "ios"
          ? `${RNFS.DocumentDirectoryPath}/${fileName}`
          : `${RNFS.DownloadDirectoryPath}/${fileName}`;

      const options = {
        fromUrl: reportUrl,
        toFile: downloadPath,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      };

      const result = await RNFS.downloadFile(options).promise;

      if (result.statusCode === 200) {
        if (Platform.OS === "android") {
          await RNFS.scanFile(downloadPath);
        }

        // Show toast message for success
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

      // Show toast message for error
      Toast.show({
        type: "error",
        text1: "Error",
        text2: `PDF gagal diunduh: ${error.message}`,
      });
    }
  };

  const renderItem = ({ item }) => {
    const isDiterima = item.text_status;
    const dropdownOptionsForItem = isDiterima
      ? dropdownOptions
      : dropdownOptions1;

    return (
      <View
        className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
        style={{
          elevation: 4,
        }}>
        <View className="flex-row justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-[16px] text-black font-poppins-semibold mb-3">{item.kode}</Text>
            <Text className="text-[15px] text-black font-poppins-semibold mb-2">
              {item.permohonan.user.nama}
            </Text>
            <Text className="text-[14px]  font-poppins-semibold text-black mb-3">{item.lokasi}</Text>
            <Text className="text-[14px]  font-poppins-semibold text-black mb-3">
              Peraturan:{" "}
              <Text className="font-poppins-semibold ">{item.peraturan?.nama}</Text>
            </Text>
          </View>
          <View className="flex-shrink-0 items-end">
            <View className="bg-slate-100 rounded-md p-2 max-w-[150px] mb-2">
              <Text
                className="text-[12px] text-indigo-600 font-poppins-semibold text-right"
                numberOfLines={2}
                ellipsizeMode="tail">
                {item.text_status}
              </Text>
            </View>
            <View className="my-2 ml-10">
              <MenuView
                title="dropdownOptions"
                actions={dropdownOptionsForItem.map(option => ({
                  ...option,
                }))}
                onPressAction={({ nativeEvent }) => {
                  const selectedOption = dropdownOptionsForItem.find(
                    option => option.title === nativeEvent.event,
                  );
                  const sub = dropdownOptionsForItem.find(
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
                  <Entypo
                    name="dots-three-vertical"
                    size={18}
                    color="#312e81"
                  />
                </View>
              </MenuView>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="bg-[#ececec] w-full h-full">
      <View className=" p-3">
        <View className="flex-row items-center space-x-2">
          <View className="flex-col w-full">
            <View className="flex-row items-center space-x-2 mb-5">
              <BackButton action={() => navigation.goBack()} size={26} />
              <View className="absolute left-0 right-2 items-center">
                <Text className="text-[20px] font-poppins-semibold text-black">
                  Koordinator Teknis
                </Text>
              </View>
            </View>

            <View className="flex-row justify-center">
              <View style={{ flex: 1, marginVertical: 8 }}>
                <HorizontalFilterMenu
                  items={kortekOptions}
                  selected={selectedKortek}
                  onPress={(item) => setSelectedKortek(item.id)}
                />
              </View>

              <MenuView
                title="filterOptions"
                actions={filterOptions.map(option => ({
                  id: option.id.toString(),
                  title: option.title,
                }))}
                onPressAction={({ nativeEvent }) => {
                  const selectedOption = filterOptions.find(
                    option => option.title === nativeEvent.event,
                  );
                  if (selectedOption) {
                    setSelectedYear(selectedOption.title);
                    // console.log(selectedOption.title)
                  }
                }}
                shouldOpenOnLongPress={false}>
                <View style={{ marginEnd: 5 }}>
                  <MaterialCommunityIcons
                    name="filter-menu-outline"
                    size={24}
                    color="white"
                    style={{
                      backgroundColor: "#312e81",
                      padding: 12,
                      borderRadius: 8,
                    }}
                  />
                </View>
              </MenuView>
            </View>
          </View>
        </View>
      </View>

      <Paginate
        ref={paginateRef}
        url="/verifikasi/koordinator-teknis"
        payload={{
          status: selectedKortek,
          tahun: selectedYear,
          page: 1,
          per: 10,
        }}
        renderItem={renderItem}
        className="mb-12"
      />

      {/* <AntDesign
        name="plus"
        size={28}
        color="white"
        style={{ position: "absolute", bottom: 90, right: 30, backgroundColor: "#312e81", padding: 10, borderRadius: 50 }}
      onPress={() => navigation.navigate("FormMetode")}
      /> */}
      <DeleteConfirmationModal />
      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 justify-center items-center bg-black bg-black/50">
          <View className="bg-white rounded-lg w-full h-full m-5 mt-8">
            <View className="flex-row justify-between items-center p-4">
              <Text className="text-lg font-poppins-semibold text-black">Preview Pdf</Text>
              <TouchableOpacity
                onPress={() => {
                  handleDownloadPDF();
                  setModalVisible(false);
                }}
                className=" p-2 rounded flex-row items-center">
                <Feather name="download" size={21} color="black" />
              </TouchableOpacity>
            </View>
            <Pdf
              source={{ uri: reportUrl, cache: true }}
              style={{ flex: 1 }}
              trustAllCerts={false}
            />
            <View className="flex-row justify-between m-4">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="bg-[#dc3546] p-2 rounded flex-1 ml-2">
                <Text className="text-white font-poppins-semibold text-center">Tutup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Kortek;