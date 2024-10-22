import { useDelete } from '@/src/hooks/useDelete';
import BackButton from "@/src/screens/components/BackButton";
import Paginate from '@/src/screens/components/Paginate';
import HorizontalScrollMenu from "@nyashanziramasanga/react-native-horizontal-scroll-menu";
import { MenuView } from "@react-native-menu/menu";
import React, { useRef, useState } from "react";
import { Text, View, Modal, TouchableOpacity, Alert } from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";
import Feather from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_URL } from "@env";
import Pdf from 'react-native-pdf';
import RNFS, { downloadFile } from 'react-native-fs';
import Toast from 'react-native-toast-message';
import axios from '@/src/libs/axios';

const currentYear = new Date().getFullYear();
const generateYears = () => {
  let years = [];
  for (let i = currentYear; i >= 2022; i--) {
    years.push({ id: i, title: String(i) });
  }
  return years;
};

const VerifikasiOptions = [
  { id: 7, name: "Menunggu Verifikasi" },
  { id: 8, name: "Telah Diverifikasi/Disahkan" },
];
const VerifikasiLhu = ({ navigation }) => {
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const filterOptions = generateYears();
  const [selectedVerifikasi, setSelectedVerifikasi] = useState(7);
  const paginateRef = useRef();
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [reportUrl, setReportUrl] = useState('');

  const { delete: showConfirmationModal, DeleteConfirmationModal } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries(['verifikasi/kepala-upt']);
      paginateRef.current?.refetch();
    },
    onError: (error) => {
      console.error('Delete error:', error);
    }
  });

  const PreviewVerifikasi = async (item) => {
    const authToken = await AsyncStorage.getItem('@auth-token');
    setReportUrl(`${APP_URL}/api/v1/report/${item.uuid}/preview-lhu?token=${authToken}`);
    setModalVisible(true);
  };

  const BeritaAcara = async (item) => {
    const authToken = await AsyncStorage.getItem('@auth-token');
    setReportUrl(`${APP_URL}/api/v1/report/${item.uuid}/berita-acara?token=${authToken}`);
    setModalVisible(true);
  };

  const DataPengambilan = async (item) => {
    const authToken = await AsyncStorage.getItem('@auth-token');
    setReportUrl(`${APP_URL}/api/v1/report/${item.uuid}/data-pengambilan?token=${authToken}`);
    setModalVisible(true);
  };

  const handleDownloadPDF = async () => {
    try {
      const authToken = await AsyncStorage.getItem('@auth-token');
      const fileName = `LHU_${Date.now()}.pdf`;

      const downloadPath = Platform.OS === 'ios'
        ? `${RNFS.DocumentDirectoryPath}/${fileName}`
        : `${RNFS.DownloadDirectoryPath}/${fileName}`;

      const options = {
        fromUrl: reportUrl,
        toFile: downloadPath,
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      };

      const result = await RNFS.downloadFile(options).promise;

      if (result.statusCode === 200) {
        if (Platform.OS === 'android') {
          await RNFS.scanFile(downloadPath);
        }

        // Show toast message for success
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: `PDF Berhasil Diunduh. ${Platform.OS === 'ios' ? 'You can find it in the Files app.' : `Saved as ${fileName} in your Downloads folder.`}`,
        });

      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);

      // Show toast message for erropr
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `PDF gagal diunduh: ${error.message}`,
      });
    }
  };

  const Rollback = async (uuid) => {
    try {
      const authToken = await AsyncStorage.getItem('@auth-token');
      const response = await axios.post(`/verifikasi/kepala-upt/${uuid}/rollback`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (response.status.success = 'success') {
        queryClient.invalidateQueries(['verifikasi/kepala-upt']);
        paginateRef.current?.refetch();
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'LHU has been rolled back successfully',
        });
      } else {
        throw new Error('Failed to rollback');
      }
    } catch (error) {
      console.error('Rollback error:', error.message);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `Failed to rollback: ${error.message}`,
      });
    }
  };
  const Verifikasi = async (uuid) => {
    try {
      const authToken = await AsyncStorage.getItem('@auth-token');
      const response = await axios.post(`/verifikasi/kepala-upt/${uuid}/verify`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (response.data.status === 'success') { 
        queryClient.invalidateQueries(['verifikasi/kepala-upt']);
        paginateRef.current?.refetch();
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'LHU has been verified successfully',
        });
      } else {
        throw new Error('Failed to Verify');
      }
    } catch (error) {
      console.error('Verify error:', error.message);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `Failed to Verify: ${error.message}`,
      });
    }
  };
  
  const TolakVerifikasi = async (uuid) => {
    try {
      const authToken = await AsyncStorage.getItem('@auth-token');
      const response = await axios.post(`/verifikasi/kepala-upt/${uuid}/rollback-verif`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (response.status.success = 'success') {
        queryClient.invalidateQueries(['verifikasi/kepala-upt']);
        paginateRef.current?.refetch();
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'LHU has been reject back successfully',
        });
      } else {
        throw new Error('Failed to reject');
      }
    } catch (error) {
      console.error('Reject error:', error.message);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `Failed to reject: ${error.message}`,
      });
    }
  };

  


  const renderItem = ({ item }) => { 

    const dropdownOptionsMenunggu = [
      { id: "Preview", title: "Preview", action: (item) => PreviewVerifikasi(item) },
      { id: "Verifikasi LHU", title: "Verifikasi LHU", action: (item) => Verifikasi(item.uuid) },
      { id: "Tolak Verifikasi", title: "Tolak Verifikasi", action: (item) => TolakVerifikasi(item.uuid) },
    ];
    
    const dropdownOptionsTelah = [
      { id: "Preview", title: "Preview", action: (item) => PreviewVerifikasi(item) },
    ];
    if (item.status < 9 && item.status > 7) {
      dropdownOptionsTelah.push({
        id: "Rollback",
        title: "Rollback",
        action: (item) => Rollback(item.uuid),
      });
    }


    const dropdownOptionsForItem = item.status > 7 ? dropdownOptionsTelah : dropdownOptionsMenunggu;
    isConfirmed = item.text_status;
  

    return (
      <View className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5" style={{ elevation: 4 }}>
        <View className="flex-row justify-between items-center p-4 relative">
          <View className="flex-shrink mr-20">
            {isConfirmed ? (
              <>
                <Text className="text-[18px] font-extrabold mb-1">{item.kode}</Text>
                <Text className="text-[15px] font-bold mb-2">{item.permohonan.user.nama}</Text>
              </>
            ) : (
              <Text className="text-[15px] font-bold mb-2">{item.permohonan.user.nama}</Text>
            )}
            <Text className="text-[14px] mb-2">{item.lokasi}</Text>
            <Text className="text-[14px] font-bold mb-2">
              PERATURAN : <Text className="font-normal">{item.peraturan?.nama}</Text>
            </Text>
          </View>
          <View className="absolute right-1 flex-col items-center">
            <View className="bg-slate-100 rounded-md p-2 max-w-[150px] mb-2">
              <Text className="text-[12px] text-indigo-600 font-bold text-right" numberOfLines={2} ellipsizeMode="tail">
                {item.text_status}
              </Text>
            </View>
            <View className="my-2 ml-10">
            <MenuView
              title="dropdownOptions"
              actions={dropdownOptionsForItem}
              onPressAction={({ nativeEvent }) => {
                const selectedOption = dropdownOptionsForItem.find(
                  option => option.title === nativeEvent.event
                );

                if (selectedOption) {
                  selectedOption.action(item);
                }
              }}
              shouldOpenOnLongPress={false}
            >
              <View>
                <Entypo name="dots-three-vertical" size={18} color="#312e81" />
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
      <View className="p-4">
        <View className="flex-row items-center space-x-2">
          <View className="flex-col w-full">
            <View className="flex-row items-center space-x-2 mb-4">
              <BackButton action={() => navigation.goBack()} size={26} />
              <View className="absolute left-0 right-2 items-center">
                <Text className="text-[20px] font-bold">Verifikasi LHU</Text>
              </View>
            </View>

            <View className="flex-row justify-center">
              <View className="mt-3 ml-[-10] mr-2"> 
                <HorizontalScrollMenu
                  items={VerifikasiOptions}
                  selected={selectedVerifikasi}
                  onPress={item => setSelectedVerifikasi(item.id)}
                  itemWidth={170}
                  scrollAreaStyle={{ height: 30, justifyContent: 'flex-start' }}
                  activeBackgroundColor={"#312e81"}
                  buttonStyle={{ marginRight: 10, borderRadius: 20, backgroundColor: "white" }}
                />
              </View>

              <MenuView
                title="filterOptions"
                actions={filterOptions.map(option => ({ id: option.id.toString(), title: option.title }))}
                onPressAction={({ nativeEvent }) => {
                  const selectedOption = filterOptions.find(option => option.title === nativeEvent.event);
                  if (selectedOption) {
                    setSelectedYear(selectedOption.title);
                  }
                }}
                shouldOpenOnLongPress={false}
              >
                <View style={{ marginEnd: 50 }}>
                  <MaterialCommunityIcons
                    name="filter-menu-outline"
                    size={24}
                    color="white"
                    style={{ backgroundColor: "#312e81", padding: 12, borderRadius: 8 }}
                  />
                </View>
              </MenuView>
            </View>
          </View>
        </View>
      </View>

      <Paginate
        ref={paginateRef}
        url="/verifikasi/kepala-upt"
        payload={{
          status: selectedVerifikasi,
          tahun: selectedYear,
          page: 1,
          per: 10,
        }}
        renderItem={renderItem}
        className="mb-14"
      />

      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-black/50">
          <View className="bg-white rounded-lg w-full h-full m-5 mt-8">
            <View className="flex-row justify-between items-center p-4">
              <Text className="text-lg font-bold text-black">Preview Pdf</Text>
              <TouchableOpacity onPress={() => {
                handleDownloadPDF();
                setModalVisible(false);
              }} className="p-2 rounded flex-row items-center">
                <Feather name="download" size={21} color="black" />
              </TouchableOpacity>
            </View>
            <Pdf
              source={{ uri: reportUrl, cache: true }}
              style={{ flex: 1 }}
              trustAllCerts={false}
            />
            <View className="flex-row justify-between m-4">
              <TouchableOpacity onPress={() => setModalVisible(false)} className="bg-[#dc3546] p-2 rounded flex-1 ml-2">
                <Text className="text-white font-bold text-center">Tutup</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <DeleteConfirmationModal />
    </View>
  );
};

export default VerifikasiLhu;
