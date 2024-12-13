
import { useDelete } from "@/src/hooks/useDelete";
import BackButton from "@/src/screens/components/BackButton";
import Paginate from "@/src/screens/components/Paginate";
import HorizontalFilterMenu from '@/src/screens/components/HorizontalFilterMenu';
import HorizontalScrollMenu from "@nyashanziramasanga/react-native-horizontal-scroll-menu";
import { MenuView } from "@react-native-menu/menu";
import React, { useRef, useState, useEffect } from "react";
import { Text, View, Modal, TouchableOpacity, Alert } from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Feather from "react-native-vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { APP_URL } from "@env";
import Pdf from "react-native-pdf";
import RNFS, { downloadFile } from "react-native-fs";
import Toast from "react-native-toast-message";
import Ionicons from "react-native-vector-icons/Ionicons"
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import FontAwesome6Icon from "react-native-vector-icons/FontAwesome6";

const currentYear = new Date().getFullYear();
const generateYears = () => {
  let years = [];
  for (let i = currentYear; i >= 2022; i--) {
    years.push({ id: i, title: String(i) });
  }
  return years;
};

const analisOptions = [
  { id: 3, name: "Menunggu Pengujian", index: 0 },
  { id: 4, name: "Telah diuji", index: 1 },
];

const Analis = ({ navigation }) => {
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const filterOptions = generateYears();
  const [selectedAnalis, setSelectedAnalis] = useState(3);
  const paginateRef = useRef();
  const [modalVisible, setModalVisible] = useState(false);
  const [reportUrl, setReportUrl] = useState("");

  const [initialRender, setInitialRender] = useState(true);

  const { delete: showConfirmationModal, DeleteConfirmationModal } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries(["analis"]);
      paginateRef.current?.refetch();
    },
    onError: error => {
      console.error("Delete error:", error);
    },
  });

  const handlePreviewSPP = async item => {
    const authToken = await AsyncStorage.getItem("@auth-token");
    setReportUrl(
      `${APP_URL}/api/v1/report/${item.uuid}/spp?token=${authToken}`,
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

  useEffect(() => {
    if (!initialRender && paginateRef.current) {
      paginateRef.current.refetch();
    }
  }, [selectedAnalis]);

  useEffect(() => {
    setInitialRender(false);
  }, []);

  const renderItem = ({ item }) => {
    return (
      <View
        className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
        style={{
          elevation: 4,
        }}>
        <View className="flex-row justify-between">
          <View className="flex-1 pr-4">
              
            {item.check_param && (
              <View className="mt-2">
                <MaterialIcons name="verified" size={20} color="green" style={{ marginBottom: 4 }}/>
              </View>
            )}

            <Text className="text-xs font-poppins-regular text-gray-500">Kode</Text>
            <Text className="text-md font-poppins-semibold text-black mb-2">
              {item.kode}
            </Text>
  
            <Text className="text-xs font-poppins-regular text-gray-500">Titik Uji/Lokasi</Text>
  
            <Text className="text-md font-poppins-semibold text-black mb-2">
              {item.lokasi}
            </Text>
            
            <Text className="text-xs font-poppins-regular text-gray-500">
              Diterima pada
            </Text>
  
            {item.tanggal_diterima && (
              <Text >
                <Text className="text-md font-poppins-semibold text-black mb-2">
                  {item.tanggal_diterima}
                </Text>
              </Text>
            )}
          </View>
          
          <View className="flex-shrink-0 items-end">
            <View className="bg-slate-100 rounded-md px-2 py-1 max-w-[150px] mb-2">
              <Text
                className="text-[11px] text-indigo-600 font-bold text-right"
                numberOfLines={2}
                ellipsizeMode="tail">
                {item.text_status}
              </Text>
            </View>
          </View>
        </View>
        
        <View className="h-[1px] bg-gray-300 my-3"/>
  
        <View className="flex-row justify-end mt-1 space-x-2">
          <TouchableOpacity
            onPress={() => navigation.navigate("DetailAnalis", {
              uuid: item.uuid,
              status: item.status,
            })}
            className="bg-indigo-500 px-3 py-2 rounded-md flex-row items-center">
            <FontAwesome6Icon name="vial" size={13} color="white" />
            <Text className="text-white text-xs ml-1 font-poppins-medium">
              Hasil Uji
            </Text>
          </TouchableOpacity>
                
          <TouchableOpacity
            onPress={() => handlePreviewSPP({ uuid: item.uuid })}
            className="bg-red-500 px-3 py-2 rounded-md flex-row items-center">
            <FontAwesome5Icon name="file-pdf" size={16} color="white" />
            <Text className="text-white text-xs ml-1 font-poppins-medium">
              SPP
            </Text>
          </TouchableOpacity>
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
                <Text className="text-[20px] font-poppins-semibold text-black ">Analis</Text>
              </View>
            </View>

            <View className="flex-row justify-center">
              <View style={{ flex: 1, marginVertical: 8 }}>
                <HorizontalFilterMenu
                  items={analisOptions}
                  selected={selectedAnalis}
                  onPress={(item) => setSelectedAnalis(item.id)}
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
                <View>
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
