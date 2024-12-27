import React from "react";
import { View, Text, Modal, TouchableOpacity, ActivityIndicator } from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";

const RollbackModal = ({ visible, onClose, onRollback, isLoading }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        activeOpacity={1} 
        onPress={onClose}
        className="flex-1 justify-center items-center bg-black/50"
      >
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={(e) => e.stopPropagation()}
          className="w-80 bg-white rounded-2xl p-6 items-center shadow-2xl"
        >
          <View className="w-20 h-20 rounded-full bg-yellow-100 justify-center items-center mb-4">
            <AntDesign name="sync" size={40} color="#facc15" />
          </View>
          <Text className="text-xl font-poppins-semibold text-black mb-3">
            Konfirmasi Rollback
          </Text>
          <View className="w-full h-px bg-gray-200 mb-4" />
          <Text className="text-md text-center text-gray-600 mb-6 font-poppins-regular">
            Apakah Anda yakin ingin melakukan rollback data tersebut?
          </Text>
          <View className="flex-row w-full justify-between">
            <TouchableOpacity
              onPress={onRollback}
              disabled={isLoading}
              className="flex-1 mr-2 bg-yellow-400 py-3 rounded-xl items-center"
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-poppins-medium">Ya, Rollback</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 ml-3 bg-gray-100 py-3 rounded-xl items-center"
            >
              <Text className="text-gray-700 font-poppins-medium">Batal</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default RollbackModal;