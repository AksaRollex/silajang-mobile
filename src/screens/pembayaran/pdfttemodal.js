import React, { useState } from 'react';
import { View, Modal, Text, TouchableOpacity, TextInput, Platform } from 'react-native';
import { MenuView } from "@react-native-menu/menu";
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';
import axios from '@/src/libs/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialIcons, FontAwesome5 } from 'react-native-vector-icons';
import Toast from 'react-native-toast-message';

// Separate PDF handler component
const PDFHandler = ({ item, onPreviewSKRD }) => {
  return (
    <MenuView
      title="PDF"
      actions={[
        { id: 'skrd', title: 'SKRD' },
        ...(item.is_lunas ? [{ id: 'kwitansi', title: 'Kwitansi' }] : [])
      ]}
      onPressAction={({ nativeEvent }) => {
        if (nativeEvent.event === 'skrd') {
          onPreviewSKRD(item.uuid);
        }
      }}
    >
      <TouchableOpacity className="bg-red-100 px-3 py-2 rounded-md flex-row items-center">
        <FontAwesome5 name="file-pdf" size={13} color="#ef4444" />
        <Text className="text-red-500 text-xs ml-1 font-poppins-medium">
          PDF
        </Text>
        <MaterialIcons name="arrow-drop-down" size={16} color="#ef4444" />
      </TouchableOpacity>
    </MenuView>
  );
};

// Separate TTE handler component
const TTEHandler = ({ item, onTTESubmit }) => {
  const [tteModalVisible, setTteModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    tanda_tangan_id: '',
    passphrase: '',
    tipe: 'system'
  });

  const handleSubmit = async () => {
    await onTTESubmit(formData);
    setTteModalVisible(false);
  };

  return (
    <>
      <MenuView
        title="TTE SKRD"
        actions={[
          { id: 'apply', title: 'Ajukan TTE' },
          ...(item.tte_skrd ? [{ id: 'download', title: 'Download TTE' }] : [])
        ]}
        onPressAction={({ nativeEvent }) => {
          if (nativeEvent.event === 'apply') {
            setTteModalVisible(true);
          }
        }}
      >
        <TouchableOpacity className="bg-indigo-700 px-3 py-2 rounded-md flex-row items-center">
          <FontAwesome5 name="file-signature" size={13} color="white" />
          <Text className="text-white text-xs ml-1 font-poppins-medium">
            TTE SKRD
          </Text>
          <MaterialIcons name="arrow-drop-down" size={16} color="white" />
        </TouchableOpacity>
      </MenuView>

      <Modal
        visible={tteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setTteModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-lg w-[90%] p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-poppins-semibold">Ajukan TTE SKRD</Text>
              <TouchableOpacity onPress={() => setTteModalVisible(false)}>
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-poppins-bold mb-2">
                Passphrase<Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="border border-gray-300 rounded-md p-3"
                secureTextEntry
                value={formData.passphrase}
                onChangeText={(text) => setFormData(prev => ({ ...prev, passphrase: text }))}
                placeholder="Enter passphrase"
              />
            </View>

            <View className="flex-row justify-end space-x-2">
              <TouchableOpacity
                onPress={handleSubmit}
                className="bg-indigo-600 px-4 py-2 rounded-md"
              >
                <Text className="text-white font-poppins-semibold">Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

// Main component that combines both handlers
const PDFAndTTEHandler = ({ item }) => {
  const [reportUrl, setReportUrl] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const handlePreviewSKRDPDF = async (uuid) => {
    try {
      const authToken = await AsyncStorage.getItem('@auth-token');
      setReportUrl(`${APP_URL}/api/v1/report/${uuid}/skrd?multi_payment=1&token=${authToken}`);
      setModalVisible(true);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to preview SKRD',
      });
    }
  };

  const handleTTESubmit = async (formData) => {
    try {
      const queryParams = new URLSearchParams({
        tanda_tangan_id: formData.tanda_tangan_id,
        passphrase: btoa(formData.passphrase),
        tipe: formData.tipe
      }).toString();

      const response = await axios.get(`/report/${item.uuid}/skrd/tte?${queryParams}`);

      if (response.data?.success) {
        const authToken = await AsyncStorage.getItem('@auth-token');
        setReportUrl(`${APP_URL}/api/v1/report/${item.uuid}/skrd/tte?multi_payment=1&token=${authToken}&tanda_tangan_id=${formData.tanda_tangan_id}&passphrase=${btoa(formData.passphrase)}`);
        setModalVisible(true);

        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'TTE request submitted successfully',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.response?.data?.message || 'Failed to submit TTE request',
      });
    }
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

      const response = await RNFS.downloadFile(options).promise;

      if (response.statusCode === 200) {
        if (Platform.OS === 'android') {
          await RNFS.scanFile(downloadPath);
        }

        try {
          await FileViewer.open(downloadPath, {
            showOpenWithDialog: true,
            mimeType: 'application/pdf'
          });

          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: `PDF Downloaded Successfully`,
          });
        } catch (error) {
          console.error('Error opening file:', error);
          Toast.show({
            type: 'info',
            text1: 'PDF Downloaded',
            text2: `File saved at: ${downloadPath}`,
          });
        }
      }
    } catch (error) {
      console.error('Download error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to download PDF',
      });
    }
  };

  return (
    <View className="flex-row space-x-2">
      <TTEHandler item={item} onTTESubmit={handleTTESubmit} />
      <PDFHandler item={item} onPreviewSKRD={handlePreviewSKRDPDF} />

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-lg w-[90%] p-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-poppins-semibold">PDF Preview</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-end space-x-2">
              <TouchableOpacity
                onPress={handleDownloadPDF}
                className="bg-indigo-600 px-4 py-2 rounded-md"
              >
                <Text className="text-white font-poppins-semibold">Download</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PDFAndTTEHandler;