import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import axios from "../libs/axios";
import Toast from "react-native-toast-message";

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
      <View style={styles.modalView}>
        <Text style={[styles.modalTitle, { color: 'black' }]}>{title}</Text>
        <Text style={[styles.modalText, { color: '#6B7280' }]}>{message}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.textStyle}>Batalkan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
            <Text style={styles.textStyle}>Ya, Download</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

export const useDownloadPDF = ({ onSuccess, onError, onSettled } = {}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");

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
      hideConfirmationModal();
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (error) {
      if (onError) {
        onError(error);
      }
    } finally {
      if (onSettled) {
        onSettled();
      }
    }
  };

  const SaveConfirmationModal = () => (
    <ConfirmationModal
      visible={modalVisible}
      onConfirm={handleConfirm}
      onCancel={hideConfirmationModal}
      title="Apakah anda yakin?"
      message="Anda akan mendownload report berformat excel, mungkin membutuhkan waktu beberapa detik!"
    />
  );

  return {
    Save: showConfirmationModal,
    SaveConfirmationModal,
  };
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  confirmButton: {
    backgroundColor: "#4682B4",
    borderRadius: 5,
    padding: 10,
    elevation: 2,
    flex: 1,
    marginLeft: 5,
  },
  cancelButton: {
    backgroundColor: "#6c757d",
    borderRadius: 5,
    padding: 10,
    elevation: 2,
    flex: 1,
    marginRight: 5,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});
