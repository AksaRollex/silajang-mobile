import { useDelete } from "@/src/hooks/useDelete";
import BackButton from "@/src/screens/components/BackButton";
import Paginate from "@/src/screens/components/Paginate";
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
const analisOptions = [
  { id: 3, name: "Menunggu Pengujian" },
  { id: 4, name: "Telah diuji" },
];

const Analis = ({ navigation }) => {
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const filterOptions = generateYears();
  const [selectedAnalis, setSelectedAnalis] = useState(3);
  const paginateRef = useRef();
  const [modalVisible, setModalVisible] = useState(false);
  const [reportUrl, setReportUrl] = useState("");
  const isConfirmed = Analis === 4; // Telah Diambil

  const { delete: showConfirmationModal, DeleteConfirmationModal } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries(["analis"]);
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
        navigation.navigate("DetailAnalis", {
          uuid: item.uuid,
          status: item.status,
        }),
    },
  ];

  const dropdownOptions = [
    {
      id: "Hasil Uji",
      title: "Hasil Uji",
      action: item =>
        navigation.navigate("DetailAnalis", {
          uuid: item.uuid,
          status: item.status,
        }),
    },
    {
      id: "SPP",
      title: "SPP",
      action: item => handlePreviewSPP({ uuid: item.uuid }),
    },
  ];

  const BeritaAcara = async item => {
    const authToken = await AsyncStorage.getItem("@auth-token");
    setReportUrl(
      `${APP_URL}/api/v1/report/${item.uuid}/berita-acara?token=${authToken}`,
    );
    setModalVisible(true);
  };
  const handlePreviewSPP = async item => {
    const authToken = await AsyncStorage.getItem("@auth-token");
    setReportUrl(
      `${APP_URL}/api/v1/report/${item.uuid}/spp?token=${authToken}`,
    );
    setModalVisible(true);
  };
  const DataPengambilan = async item => {
    const authToken = await AsyncStorage.getItem("@auth-token");
    setReportUrl(
      `${APP_URL}/api/v1/report/${item.uuid}/data-pengambilan?token=${authToken}`,
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
            <Text className="text-[18px] font-extrabold mb-5">{item.kode}</Text>
            <Text className="text-[14px] mb-3">{item.lokasi}</Text>
            <Text className="text-[14px] mb-3">
              Diterima pada:{" "}
              <Text className="font-bold ">{item.tanggal_diterima}</Text>
            </Text>
          </View>
          <View className="flex-shrink-0 items-end">
            <View className="bg-slate-100 rounded-md p-2 max-w-[150px] mb-2">
              <Text
                className="text-[12px] text-indigo-600 font-bold text-right"
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
      <View className=" p-4">
        <View className="flex-row items-center space-x-2">
          <View className="flex-col w-full">
            <View className="flex-row items-center space-x-2 mb-4">
              <BackButton action={() => navigation.goBack()} size={26} />
              <View className="absolute left-0 right-2 items-center">
                <Text className="text-[20px] font-bold ">Analis</Text>
              </View>
            </View>

            <View className="flex-row justify-center">
              <View className="mt-3 ml-[-10] mr-2">
                <HorizontalScrollMenu
                  items={analisOptions}
                  selected={selectedAnalis}
                  onPress={item => setSelectedAnalis(item.id)}
                  itemWidth={170}
                  scrollAreaStyle={{ height: 30, justifyContent: "flex-start" }}
                  activeBackgroundColor={"#312e81"}
                  buttonStyle={{
                    marginRight: 10,
                    borderRadius: 20,
                    backgroundColor: "white",
                  }}
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
                <View style={{ marginEnd: 60 }}>
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
        url="/verifikasi/analis"
        payload={{
          status: selectedAnalis,
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
              <Text className="text-lg font-bold text-black">Preview Pdf</Text>
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
                <Text className="text-white font-bold text-center">Tutup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Analis;
