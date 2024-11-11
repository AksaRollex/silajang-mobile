import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
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
    <View style={styles.centeredView}>
      <View style={[styles.modalView]}>
        <View style={{ height: "100%" }}>
          <View style={{ justifyContent: "center", flex: 1 }}>
            <IonIcons name="save" size={90} color="#4169e1" />
          </View>
        </View>
        <View
          style={{
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            alignItems: "center",
            marginLeft: rem(1.5),
          }}>
          <View style={{ alignItems: "center" }}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Text style={styles.modalText}>{message}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                <Text style={styles.cancelButtonText}>Batalkan</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={onConfirm}>
                <Text style={styles.confirmButtonText}>Ya, Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  </Modal>
);

const SuccessOverlay = ({ visible, message }) => (
  <Modal animationType="fade" transparent={true} visible={visible}>
    <View style={styles.overlayView}>
      <View style={styles.successContainer}>
        <LottieView
          source={require("../../assets/lottiefiles/success-animation.json")}
          autoPlay
          loop={false}
          style={styles.lottie}
        />
        <Text style={styles.successTextTitle}>{message}</Text>
        <Text style={styles.successText}>
          Data yang telah di simpan dan di kirim sudah tidak dapat di kirim
          ulang !
        </Text>
      </View>
    </View>
  </Modal>
);
const FailedOverlay = ({ visible, message }) => (
  <Modal animationType="fade" transparent={true} visible={visible}>
    <View style={styles.overlayView}>
      <View style={styles.successContainer}>
        <LottieView
          source={require("../../assets/lottiefiles/failed-animation.json")}
          autoPlay
          loop={false}
          style={styles.lottie}
        />
        <Text style={styles.failedTextTitle}>{message}</Text>
        <Text style={styles.failedText}>
          Terjadi kesalahan, silahkan coba lagi untuk menyimpan data !
        </Text>
      </View>
    </View>
  </Modal>
);

export const useSendParameter = callback => {
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
      const response = await axios.post(currentUrl);
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

  const SaveConfirmationModal = () => (
    <ConfirmationModal
      visible={modalVisible}
      onConfirm={handleConfirm}
      onCancel={hideConfirmationModal}
      title="Apakah anda yakin?"
      message="Setelah menyimpan data, anda tidak dapat mengubah parameter !"
    />
  );

  const SuccessOverlayModal = () => (
    <SuccessOverlay
      visible={overlayVisible && isSuccess}
      message="Data Berhasil Disimpan"
    />
  );

  const FailedOverlayModal = () => (
    <FailedOverlay
      visible={overlayVisible && !isSuccess}
      message="Data Gagal DiSimpan"
    />
  );

  return {
    Save: showConfirmationModal,
    SaveConfirmationModal,
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
    color: "#333",
    fontSize: 18,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontFamily: "Poppins-Regular",
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
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
    color: "#de0a26",
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
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  successContainer: {
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
    width: "90%",
    height: "35%",
    borderRadius: 10,
  },
  lottie: {
    width: 170,
    height: 170,
  },

  successTextTitle: {
    textAlign: "center",
    color: "black",
    fontSize: rem(1.5),
    fontWeight: "bold",
    marginBottom: rem(1.5),
    marginTop: rem(1),
    fontFamily: "Poppins-SemiBold",
  },
  successText: {
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Poppins-Regular",

    color: "black",
  },
  failedTextTitle: {
    textAlign: "center",
    color: "black",
    fontSize: rem(1.5),
    fontFamily: "Poppins-SemiBold",

    marginBottom: rem(1.5),
    marginTop: rem(1),
  },
  failedText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",

    textAlign: "center",
    color: "black",
  },
});
