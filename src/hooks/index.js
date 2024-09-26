import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import axios from '../libs/axios';

const DownloadPDFModal = ({ visible, onConfirm, onCancel, title, message }) => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={visible}
    onRequestClose={onCancel}
  >
    <View style={styles.centeredView}>
      <View style={styles.modalView}>
        <Text style={styles.modalTitle}>{title}</Text>
        <Text style={styles.modalText}>{message}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.textStyle}>Batalkan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.confirmButton} onPress={onConfirm} className="bg-yellow-500">
            <Text style={styles.textStyle}>Ya, Download</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

export const useDownloadPDF = (callback) => {
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
      const response = await axios.get(currentUrl);
      hideConfirmationModal();
      showToast("Data Berhasil Didownload")
      onSuccess && onSuccess(response);
    } catch (error) {
      showToast("Data Gagal Didownload")
      onError && onError(error);
    } finally {
      onSettled && onSettled();
    }
  };

  const PDFConfirmationModal = () => (
    <DownloadPDFModal
      visible={modalVisible}
      onConfirm={handleConfirm}
      onCancel={hideConfirmationModal}
      title="Apakah anda yakin?"
      message="Mungkin akan membutuhkan waktu beberapa detik/menit untuk Download PDF"
    />
  );

  return {
    download: showConfirmationModal,
    PDFConfirmationModal,
  };
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
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
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmButton: {
    borderRadius: 5,
    padding: 10,
    elevation: 2,
    flex: 1,
    marginLeft: 5,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    borderRadius: 5,
    padding: 10,
    elevation: 2,
    flex: 1,
    marginRight: 5,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});