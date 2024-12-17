import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import axios from '../libs/axios';
import IonIcons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';

const ConfirmationModal = ({ visible, onConfirm, onCancel, title, message, iconName = "trash-outline" }) => (
  <Modal
    transparent={true}
    visible={visible}
    animationType="fade"
    onRequestClose={onCancel}
  >
    <View className="flex-1 justify-center items-center bg-black/50">
      <View className="w-80 bg-white rounded-2xl p-6 items-center shadow-2xl">
        <View className="w-20 h-20 rounded-full bg-red-50 justify-center items-center mb-4">
          <IonIcons size={40} color="#f43f5e" name={iconName} />
        </View>

        <Text className="text-xl font-poppins-semibold text-black mb-3">
          {title}
        </Text>

        <View className="w-full h-px bg-gray-200 mb-4" />

        <Text className="text-md text-center text-gray-600 mb-6 font-poppins-regular">
          {message}
        </Text>

        <View className="flex-row w-full justify-between">
          <TouchableOpacity
            onPress={onCancel}
            className="flex-1 mr-3 bg-gray-100 py-3 rounded-xl items-center"
          >
            <Text className="text-gray-700 font-poppins-medium">Batal</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onConfirm}
            className="flex-1 ml-3 bg-red-500 py-3 rounded-xl items-center"
          >
            <Text className="text-white font-poppins-medium">Ya, Hapus</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

export const useDelete = (callback) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const { onSuccess, onError, onSettled } = callback || {};

  const showConfirmationModal = (url) => {
    setCurrentUrl(url);
    setModalVisible(true);
  };

  const hideConfirmationModal = () => {
    setModalVisible(false);
  };

  const handleConfirm = async () => {
    try {
      const response = await axios.delete(currentUrl);
      hideConfirmationModal();
      onSuccess && onSuccess(response);
      Toast.show({
        type: "success",
        text1: "Berhasil!",
        text1: "Data berhasil dihapus",
      })
    } catch (error) {
      onError && onError(error);
    } finally {
      onSettled && onSettled();
    }
  };

  const DeleteConfirmationModal = () => (
    <ConfirmationModal
      visible={modalVisible}
      onConfirm={handleConfirm}
      onCancel={hideConfirmationModal}
      title="Konfirmasi Hapus"
      message="Data yang dihapus tidak dapat dikembalikan!"
      iconName="trash-outline"
    />
  );

  return {
    delete: showConfirmationModal,
    DeleteConfirmationModal,
  };
};

export default ConfirmationModal;