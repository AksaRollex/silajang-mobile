import { useDelete } from '@/src/hooks/useDelete';
import BackButton from "@/src/screens/components/BackButton";
import Paginate from '@/src/screens/components/Paginate';
import HorizontalFilterMenu from '@/src/screens/components/HorizontalFilterMenu';
import { MenuView } from "@react-native-menu/menu";
import React, { useRef, useState, useEffect } from "react";
import { Text, View, Modal, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import { useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_URL } from "@env";
import Pdf from 'react-native-pdf';
import RNFS, { downloadFile } from 'react-native-fs';
import Toast from 'react-native-toast-message';
import axios from '@/src/libs/axios';
import FileViewer from 'react-native-file-viewer';
import { Platform } from "react-native";
import { useHeaderStore } from "@/src/screens/main/Index";
import { TextFooter } from '@/src/screens/components/TextFooter';

const currentYear = new Date().getFullYear();
const generateYears = () => {
  let years = [];
  for (let i = currentYear; i >= 2022; i--) {
    years.push({ id: i, title: String(i) });
  }
  return years;
};

const verifikasiOptions = [
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
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedUuid, setSelectedUuid] = useState(null);
  const { setHeader } = useHeaderStore();
  const [pdfError, setPdfError] = useState(false);
  const [pdfLoaded, setPdfLoaded] = useState(false);

  useEffect(() => {
    if (modalVisible) {
      setPdfLoaded(false);
      setPdfError(false);
    }
  }, [modalVisible]);

  React.useLayoutEffect(() => {
    setHeader(false)

    return () => setHeader(true)
  }, [])

  const confirmationModal = (action, uuid) => {
    setConfirmAction(action);
    setSelectedUuid(uuid);
    setConfirmModalVisible(true);
  };

  const handleConfirm = async () => {
    try {
      if (confirmAction === 'verify') {
        await Verifikasi(selectedUuid);
      } else if (confirmAction === 'reject') {
        await TolakVerifikasi(selectedUuid);
      }
    } catch (error) {
      console.error('Action error:', error);
    } finally {
      setConfirmModalVisible(false);
      setConfirmAction(null);
      setSelectedUuid(null);
    }
  };

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
        // Use FileViewer with more comprehensive error handling
        try {
          await FileViewer.open(downloadPath, {
            showOpenWithDialog: false,
            mimeType: 'application/pdf'
          });
        } catch (openError) {
          console.log('Error opening file with FileViewer:', openError);

          // Fallback for Android using Intents
          if (Platform.OS === 'android') {
            try {
              const intent = new android.content.Intent(
                android.content.Intent.ACTION_VIEW
              );
              intent.setDataAndType(
                android.net.Uri.fromFile(new java.io.File(downloadPath)),
                'application/pdf'
              );
              intent.setFlags(
                android.content.Intent.FLAG_ACTIVITY_CLEAR_TOP |
                android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION
              );

              await ReactNative.startActivity(intent);
            } catch (intentError) {
              console.log('Intent fallback failed:', intentError);

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
      { id: "Verifikasi LHU", title: "Verifikasi LHU", action: (item) => confirmationModal('verify', item.uuid) },
      { id: "Tolak Verifikasi", title: "Tolak Verifikasi", action: (item) => confirmationModal('reject', item.uuid) },
    ];

    const dropdownOptionsTelah = [];
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
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <View>
              <Text className="text-xs font-poppins-regular text-gray-500">Kode</Text>
              <Text className="text-md font-poppins-semibold text-black">{item.kode}</Text>
            </View>

            <View className="flex-row items-center">
              <View className="bg-slate-100 rounded-md px-2 py-1">
                <Text className="text-[11px] text-indigo-600 font-poppins-semibold">
                  {item.text_status}
                </Text>
              </View>

              {/* {dropdownOptionsForItem.length > 0 && (
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
              )} */}
            </View>
          </View>

          <Text className="text-xs font-poppins-regular text-gray-500">Pelanggan</Text>
          <Text className="text-md font-poppins-semibold text-black mb-2">{item.permohonan.user.nama}</Text>
          <Text className="text-xs font-poppins-regular text-gray-500">Titik Uji/Lokasi</Text>
          <Text className="text-md font-poppins-semibold text-black mb-2">{item.lokasi}</Text>
          <Text className="text-xs font-poppins-regular text-gray-500">Peraturan</Text>
          <Text className="ftext-md font-poppins-semibold text-black">{item.peraturan?.nama || '-'}</Text>
        </View>




        <View className="h-[1px] bg-gray-300 my-3" />
        <View className="flex-row justify-end mt-2 space-x-2">
          {/* Verify Button */}
          {item.status <= 7 && (
            <TouchableOpacity
              onPress={() => confirmationModal('verify', item.uuid)}
              className="flex-row items-center bg-green-500 px-2 py-2 rounded-md"
            >
              <Ionicons name="checkmark-done" size={20} color="#fff" />
            </TouchableOpacity>
          )}

          {/* Reject Button */}
          {item.status <= 7 && (
            <TouchableOpacity
              onPress={() => confirmationModal('reject', item.uuid)}
              className="flex-row items-center bg-red-500 px-2 py-2 rounded-md"
            >
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          )}

          {/* Rollback Button */}
          {item.status > 7 && item.status < 9 && (
            <TouchableOpacity
              onPress={() => Rollback(item.uuid)}
              className="flex-row items-center bg-yellow-100 px-2 py-2 rounded-md"
            >
              <Ionicons name="refresh-circle" size={16} color="#eab308" style={{ marginRight: 8 }} />
              <Text className="text-yellow-600 font-poppins-medium text-xs">Rollback</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => PreviewVerifikasi(item)}
            className="flex-row items-center bg-red-100 px-2 py-2 rounded-md"
          >
            <FontAwesome5Icon name="file-pdf" size={16} color="#ef4444" style={{ marginRight: 8 }} />
            <Text className="text-red-500 font-poppins-medium text-xs">Preview LHU</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View className="bg-[#ececec] w-full h-full">
      <View
        className="flex-row items-center justify-between py-3.5 px-4 border-b border-gray-300"
        style={{ backgroundColor: '#fff' }}
      >
        <View className="flex-row items-center">
          <Ionicons
            name="arrow-back-outline"
            onPress={() => navigation.goBack()}
            size={25}
            color="#312e81"
          />
          <Text className="text-[20px] font-poppins-medium text-black ml-4">Verifikasi LHU</Text>
        </View>
        <View className="bg-amber-600 rounded-full">
          <Ionicons
            name="shield-checkmark"
            size={18}
            color={'white'}
            style={{ padding: 5 }}
          />
        </View>
      </View>

      <View className="p-4">
        <View className="flex-row justify-center">
          <View style={{ flex: 1, marginVertical: 8 }}>
            <HorizontalFilterMenu
              items={verifikasiOptions}
              selected={selectedVerifikasi}
              onPress={(item) => setSelectedVerifikasi(item.id)}
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
            <View>
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

      <ScrollView>
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
          className="bottom-2"
        />
        <View className="mt-12 mb-8">
          <TextFooter />
        </View>
      </ScrollView>

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
                className="p-2 rounded flex-row items-center">
                <Feather name="download" size={21} color="black" />
              </TouchableOpacity>
            </View>

            {!pdfLoaded && !pdfError && (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#ececec" }}>
                <ActivityIndicator size="large" color="#312e81" style={{ top: 180 }} />
                <Text className="mt-2 text-black font-poppins-medium" style={{ top: 175 }}>Memuat PDF...</Text>
              </View>
            )}

            {!pdfError && (
              <Pdf
                key={reportUrl}
                source={{ uri: reportUrl, cache: true }}
                style={{
                  flex: 1,
                }}
                trustAllCerts={false}
                onLoadComplete={(numberOfPages) => {
                  setPdfLoaded(true);
                  console.log(`Number Of Page: ${numberOfPages}`);
                }}
                onPageChanged={(page, numberOfPages) => {
                  console.log(`Current page ${page}`);
                }}
                onError={(error) => {
                  setPdfError(true);
                  setPdfLoaded(false);
                  console.log('PDF loading error:', error);
                }}
              />
            )}


            {pdfError && (
              <View className="flex-1 justify-center items-center self-center p-4">
                <Text className="text-md text-black font-poppins-medium">PDF Tidak Ditemukan</Text>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(false);
                    setPdfError(false);
                  }}
                  className="bg-red-100 py-2 px-5 rounded mt-1 self-center">
                  <Text className="text-red-500 font-poppins-medium">Tutup</Text>
                </TouchableOpacity>
              </View>
            )}

            {pdfLoaded && (
              <View className="flex-row justify-between m-4">
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  className="bg-[#dc3546] p-2 rounded flex-1 ml-2">
                  <Text className="text-white font-poppins-semibold text-center">Tutup</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        animationType="fade"
        visible={confirmModalVisible}
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-lg w-[80%] p-4">
            <Text className="text-lg font-poppins-semibold text-black mb-4">
              {confirmAction === 'verify'
                ? 'Konfirmasi Verifikasi LHU'
                : 'Konfirmasi Tolak Verifikasi'}
            </Text>

            <Text className="text-black mb-4 font-poppins-regular">
              {confirmAction === 'verify'
                ? 'Apakah Anda yakin ingin memverifikasi LHU?'
                : 'Apakah Anda yakin ingin menolak verifikasi LHU?'}
            </Text>

            <View className="flex-row justify-end space-x-2">
              <TouchableOpacity
                onPress={() => setConfirmModalVisible(false)}
                className="bg-gray-200 p-2 rounded-md"
              >
                <Text className="text-black font-poppins-regular">Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirm}
                className="bg-indigo-900 p-2 rounded-md"
              >
                <Text className="text-white font-poppins-regular">Ya, Lanjutkan</Text>
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