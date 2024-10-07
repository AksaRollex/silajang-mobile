import axios from "@/src/libs/axios";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { FlatList, Text, View, ActivityIndicator, Modal, TouchableOpacity, Alert } from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";
import FontIcon from "react-native-vector-icons/FontAwesome5";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { MenuView } from "@react-native-menu/menu";
import { useQuery } from "@tanstack/react-query";
import BackButton from "@/src/screens/components/BackButton";
import Paginate from '@/src/screens/components/Paginate';
import HorizontalScrollMenu from "@nyashanziramasanga/react-native-horizontal-scroll-menu";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_URL } from "@env";
import Pdf from 'react-native-pdf';
import DocumentPicker from 'react-native-document-picker';
import RNFS, { downloadFile } from 'react-native-fs';  

const currentYear = new Date().getFullYear();
const generateYears = () => {
  let years = [];
  for (let i = currentYear; i >= 2022; i--) {
    years.push({ id: i, title: String(i) });
  }
  return years;
};

const cetakOptions = [
  { id: 0, name: "Belum Cetak/Revisi" },
  { id: 1, name: "Sudah Dicetak" },
];

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const CetakLHU = ({ navigation }) => {
  const [searchInput, setSearchInput] = useState("");
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const debouncedSearchQuery = useDebounce(searchInput, 300);
  const filterOptions = generateYears();
  const [selectedCetak, setSelectedCetak] = useState(1);
  const paginateRef = useRef();
  const [modalVisible, setModalVisible] = useState(false);
  const [reportUrl, setReportUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const dropdownOptions = [
  ];

  const handlePreviewLHU = async (item) => {
    const authToken = await AsyncStorage.getItem('@auth-token');
    setReportUrl(`${APP_URL}/api/v1/report/${item.uuid}/preview-lhu?token=${authToken}`);
    setModalVisible(true);
  };

  const handleFilePicker = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
      });
      setSelectedFile(res[0]);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        console.error('Error picking document:', err);
        Alert.alert('Error', 'Failed to pick document');
      }
    }
  };

  const handleUploadPDF = async (item) => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a PDF file first');
      return;
    }

    try {
      const authToken = await AsyncStorage.getItem('@auth-token');
      const fileContent = await RNFS.readFile(selectedFile.uri, 'base64');

      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        type: selectedFile.type,
        name: selectedFile.name,
      });
      formData.append('uuid', item.uuid);

      const response = await axios.post('/api/v1/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.data.success) {
        Alert.alert('Success', 'PDF uploaded successfully');
        setSelectedFile(null);
        // You might want to refresh the list or update the item status here
      } else {
        Alert.alert('Error', 'Failed to upload PDF');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload PDF');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const authToken = await AsyncStorage.getItem('@auth-token');
      const fileName = `LHU_${Date.now()}.pdf`;
      
      // Tentukan direktori unduhan berdasarkan platform
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
          // Untuk Android, kita perlu memberi tahu sistem bahwa file baru telah ditambahkan
          await RNFS.scanFile(downloadPath);
        }
        Alert.alert('Success', `PDF downloaded successfully. ${Platform.OS === 'ios' ? 'You can find it in the Files app.' : `Saved as ${fileName} in your Downloads folder.`}`);
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', `Failed to download PDF: ${error.message}`);
    }
  };

    
  const fetchCetak = async ({ queryKey }) => {
    const [_, search, year] = queryKey;
    const response = await axios.post('/administrasi/cetak-lhu', {
      search,
      tahun: year,
      status: 5,
      page: 1,
      per: 10
    });
    return response.data.data;
  };

  const renderItem = ({ item }) => {
    return (
      <View className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5">
        <View className="flex-row justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-[18px] font-extrabold mb-2">{item.permohonan.user.nama}</Text>
            <Text className="text-[18px] font-extrabold mb-2">{item.kode}</Text>
            <Text className="text-[15px] mb-2">
              Titik Uji/Lokasi: <Text className="font-bold">{item.lokasi}</Text>
            </Text>
            <Text className="text-[15px] mb-2">
              Tanggal Diterima: <Text className="font-bold">{item.tanggal_diterima}</Text>
            </Text>
          </View>
          <View className="flex-shrink-0 items-end">
            <View className="bg-slate-100 rounded-md p-2 max-w-[120px] mb-2">
              <Text className="text-[12px] text-indigo-600 font-bold text-right">
                {item.text_status}
              </Text>
            </View>
            <View className="my-2">
              <TouchableOpacity onPress={() => handlePreviewLHU(item)} className="mb-2">
                <FontIcon name="file-pdf" size={18} color="white" style={{ backgroundColor: "red", padding: 12, borderRadius: 8 }} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleFilePicker()} className="mb-2">
                <FontIcon name="file-upload" size={18} color="white" style={{ backgroundColor: "blue", padding: 12, borderRadius: 8 }} />
              </TouchableOpacity>
              {selectedFile && (
                <TouchableOpacity onPress={() => handleUploadPDF(item)}>
                  <FontIcon name="upload" size={18} color="white" style={{ backgroundColor: "green", padding: 12, borderRadius: 8 }} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
        {selectedFile && (
          <Text className="text-[12px] mt-2">Selected: {selectedFile.name}</Text>
        )}
      </View>
    );
  };

  const payload = useMemo(() => {
    return {
      status: selectedCetak === 0 ? [-1, 5] : 5, 
      tahun: selectedYear,
      ...(selectedCetak === 0 && {can_upload: 1})
    }
  }, [selectedCetak, selectedYear])

  return (
    <View className="bg-[#ececec] w-full h-full">
      <View className="bg-white p-4">
        <View className="flex-row items-center space-x-2">
          <View className="flex-col w-full">
            <View className="flex-row items-center space-x-2 mb-4">
              <BackButton action={() => navigation.goBack()} size={26} />
              <View className="absolute left-0 right-2 items-center">
                <Text className="text-[20px] font-bold">Cetak LHU</Text>
              </View>
            </View>

            <View className="flex-row justify-content-center">
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
                  }
                }}
                shouldOpenOnLongPress={false}
              >
                <View>
                  <MaterialCommunityIcons name="filter-menu-outline" size={24} color="white" style={{ backgroundColor: "#312e81", padding: 12, borderRadius: 8 }} />
                </View>
              </MenuView>
            </View>

            <View className="flex-row items-start space-x-2 mt-4">
              <HorizontalScrollMenu
                items={cetakOptions}
                selected={selectedCetak}
                onPress={item => setSelectedCetak(item.id)} 
                itemWidth={185}
                scrollAreaStyle={{ height: 30, justifyContent: 'flex-start' }}
                activeBackgroundColor={"#312e81"}
                buttonStyle={{ marginRight: 10, borderRadius: 20, justifyContent: 'flex-start' }}
              />
            </View>
          </View>
        </View>
      </View>

      <Paginate
        ref={paginateRef}
        url="/administrasi/cetak-lhu"
        payload={payload}
        renderItem={renderItem}
        className="mb-14"
      />

        <Modal
        transparent={true}
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-black/50">
          <View className="bg-white rounded-lg w-full h-full m-5">
            <Text className="text-lg font-bold m-4">Preview LHU</Text>
            <Pdf
              source={{ uri: reportUrl, cache: true }}
              style={{ flex: 1 }}
              trustAllCerts={false}
            />
            <View className="flex-row justify-between m-4">
              <TouchableOpacity onPress={handleDownloadPDF} className="bg-green-500 p-2 rounded flex-1 mr-2">
                <Text className="text-white text-center">Download PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)} className="bg-red-500 p-2 rounded flex-1 ml-2">
                <Text className="text-white text-center">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal> 
    </View>
  );
};

export default CetakLHU;