import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import axios from "../libs/axios";
import LottieView from "lottie-react-native";
import Toast from "react-native-toast-message";
import IonIcons from "react-native-vector-icons/Ionicons";

const rem = multiplier => baseRem * multiplier;
const baseRem = 16;
const ConfirmationModal = ({
  visible,
  onConfirm,
  onCancel,
  title,
  message,
}) => (
  <Modal
    animationType="fade"
    transparent={true}
    visible={visible}
    onRequestClose={onCancel}>
    <View className="flex-1 justify-center items-center bg-black/50">
      <View className="w-80 bg-white rounded-2xl p-6 items-center shadow-2xl">
        <View className="w-20 h-20 rounded-full bg-red-50 justify-center items-center mb-4">
          <IonIcons size={40} color="#f43f5e" name="trash-outline" />
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
            className="flex-1 mr-3 bg-gray-100 py-3 rounded-xl items-center"
            onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Batalkan</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 ml-3 bg-red-500 py-3 rounded-xl items-center"
            onPress={onConfirm}>
            <Text style={styles.confirmButtonText}>Ya, Hapus</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const SuccessOverlay = ({ visible, message }) => (
  <Modal animationType="fade" transparent={true} visible={visible}>
    <View className="flex-1 justify-center items-center bg-black/50">
      <View className="w-80 bg-white rounded-2xl p-6 items-center shadow-2xl">
        <View className="w-20 h-20 rounded-full bg-green-50 justify-center items-center mb-4">
          <IonIcons size={40} color="#95bb72" name="checkmark-done-sharp" />
        </View>
        <Text className="text-xl font-poppins-semibold text-black mb-3">
          Berhasil Di Hapus !
        </Text>

        <View className="w-full h-px bg-gray-200 mb-4" />

        <Text className="text-md text-center text-gray-600  font-poppins-regular">
          Data yang telah dihapus tidak dapat dikembalikan !
        </Text>
      </View>
    </View>
  </Modal>
);
const FailedOverlay = ({ visible, message }) => (
  <Modal animationType="fade" transparent={true} visible={visible}>
    <View className="flex-1 justify-center items-center bg-black/50">
      <View className="w-80 bg-white rounded-2xl p-6 items-center shadow-2xl">
        <View className="w-20 h-20 rounded-full bg-red-50 justify-center items-center mb-4">
          <IonIcons size={40} color="#f43f5e" name="close-sharp" />
        </View>
        <Text className="text-xl font-poppins-semibold text-black mb-3">
          Berhasil Gagal Dihapus !
        </Text>

        <View className="w-full h-px bg-gray-200 mb-4" />

        <Text className="text-md text-center text-gray-600 font-poppins-regular">
          Coba untuk menghapus kembali !
        </Text>
      </View>
    </View>
  </Modal>
);

export const useDelete = callback => {
  const [modalVisible, setModalVisible] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const [isSuccess, setIsSuccess] = useState(true);
  const { onSuccess, onError, onSettled } = callback || {};

  const showConfirmationModal = url => {
    setCurrentUrl(url);
    setModalVisible(true);
  };

  const hideConfirmationModal = () => {
    setModalVisible(false);
  };

  const handleConfirm = async () => {
    try {
      const response = await axios.delete(currentUrl);
      setIsSuccess(true); // Set success ke true jika berhasil
      hideConfirmationModal();
      setOverlayVisible(true);
      setTimeout(() => setOverlayVisible(false), 2000); // Hide after 2 seconds
      onSuccess && onSuccess(response);
    } catch (error) {
      setIsSuccess(false); // Set success ke false jika gagal
      setOverlayVisible(true);
      hideConfirmationModal();
      setTimeout(() => setOverlayVisible(false), 2000);
      console.log("Error response:", error.response); // Tambahkan ini untuk melihat pesan error
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
      title="Apakah anda yakin?"
      message="Data yang telah dihapus tidak dapat dikembalikan!"
    />
  );

  const SuccessOverlayModal = () => (
    <SuccessOverlay
      visible={overlayVisible && isSuccess}
      message="Data Berhasil Dihapus"
    />
  );

  const FailedOverlayModal = () => (
    <FailedOverlay
      visible={overlayVisible && !isSuccess}
      message="Data Gagal Dihapus"
    />
  );

  return {
    delete: showConfirmationModal,
    DeleteConfirmationModal,
    SuccessOverlayModal,
    FailedOverlayModal,
  };
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    // alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  logo: {
    width: 110,
    height: 110,
    marginBottom: 20,
    tintColor: "red",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: "center",
    fontFamily: "Poppins-SemiBold",
    color: "#ff0000",
    fontSize: 18,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontFamily: "Poppins-Regular",
    color: "#fff",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center ",
    alignItems: "center ",
  },
  confirmButton: {
    backgroundColor: "#ffcbd1",
    borderRadius: 5,
    paddingVertical: 10,
    elevation: 2,
    paddingHorizontal: 15,
    marginLeft: 5,
  },

  confirmButtonText: {
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
  },
  cancelButton: {
    backgroundColor: "#ececec",
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 10,
    elevation: 2,
    marginRight: 5,
  },
  cancelButtonText: {
    color: "#4f4f4f",
    fontFamily: "Poppins-SemiBold",
    textAlign: "center",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  overlayView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  successContainer: {
    alignItems: "center",
    padding: 20,
    width: "90%",
    borderRadius: 10,
  },
  lottie: {
    width: 170,
    height: 170,
  },

  successTextTitle: {
    textAlign: "center",
    color: "#77DD77",
    fontSize: rem(1.5),
    marginBottom: rem(1.5),
    marginTop: rem(1),
    fontFamily: "Poppins-SemiBold",
  },
  successText: {
    fontSize: 16,
    textAlign: "center",
    fontFamily: "Poppins-Regular",
    color: "#fff",
  },
  failedTextTitle: {
    textAlign: "center",
    color: "#FF4B4B",
    fontSize: rem(1.5),
    fontFamily: "Poppins-SemiBold",

    marginBottom: rem(1.5),
    marginTop: rem(1),
  },
  failedText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    textAlign: "center",
    color: "#fff",
  },
});
