import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import RNFS from "react-native-fs";
import Share from "react-native-share";
import FileViewer from "react-native-file-viewer";

const DownloadPDFModal = ({ visible, onConfirm, onCancel, title, message }) => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={visible}
    onRequestClose={onCancel}>
    <View style={styles.centeredView}>
      <View style={styles.modalView}>
        <Text style={styles.modalTitle}>{title}</Text>
        <Text style={styles.modalText}>{message}</Text>
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

export const useDownloadPDF = callback => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const { onSuccess, onError, onSettled } = callback || {};

  const showConfirmationModal = url => {
    setCurrentUrl(url);
    setModalVisible(true);
  };

  const hideConfirmationModal = () => {
    setModalVisible(false);
  };

  const handleConfirm = async () => {
    const fileName = "pembayaran.pdf";
    const fileDir = Platform.select({
      ios: RNFS.DocumentDirectoryPath,
      android: RNFS.DownloadDirectoryPath,
    });
    const filePath = `${fileDir}/${fileName}`;

    try {
      const options = {
        fromUrl: currentUrl,
        toFile: filePath,
        background: true,
        begin: res => {
          console.log("Download has begun");
        },
        progress: res => {
          const progress = (res.bytesWritten / res.contentLength) * 100;
          console.log(`Download progress: ${progress.toFixed(2)}%`);
          // You can update UI here to show download progress
        },
      };

      const response = await RNFS.downloadFile(options).promise;

      if (response.statusCode === 200) {
        hideConfirmationModal();

        // Try to share the file
        try {
          await Share.open({
            url: Platform.OS === "android" ? `file://${filePath}` : filePath,
            type: "application/pdf",
          });
          onSuccess && onSuccess(filePath);
        } catch (shareError) {
          console.log("User cancelled sharing", shareError);
          // If sharing fails or is cancelled, try to open the file directly
          try {
            await FileViewer.open(filePath, { showOpenWithDialog: true });
            onSuccess && onSuccess(filePath);
          } catch (viewerError) {
            console.error("Error opening file:", viewerError);
            onError && onError(viewerError);
          }
        }
      } else {
        throw new Error("Failed to download file");
      }
    } catch (error) {
      console.error("Download error:", error);
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
      title={
        <Text style={{ color: "black"}}>Apakah anda yakin?</Text>
      }
      message={
        <Text style={{ color: "#6B7280"}}>
          Anda akan mendownload file berformat PDF, Mungkin akan membutuhkan
          waktu beberapa detik
        </Text>
      }
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
  cancelButton: {
    backgroundColor: "red",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    flex: 1,
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: "#312e81",
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    flex: 1,
    marginLeft: 10,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});
