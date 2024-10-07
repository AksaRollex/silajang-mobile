import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StyleSheet
} from "react-native";
import RNFS from "react-native-fs";
import Share from "react-native-share";
import Pdf from "react-native-pdf";

export const useDownloadPDF = (callback) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [reportUrl, setreportUrl] = useState("");
  const { onSuccess, onError, onSettled } = callback || {};

  // Function to show modal for previewing PDF
  const showConfirmationModal = (url) => {
    setreportUrl(url);
    setModalVisible(true);
  };

  // Function to hide modal
  const hideConfirmationModal = () => {
    setModalVisible(false);
    setDownloadComplete(false);
  };

  // Function to download the PDF
  const handleConfirm = async () => {
    const fileName = "pembayaran.pdf";
    const fileDir = Platform.select({
      ios: RNFS.DocumentDirectoryPath,
      android: RNFS.DownloadDirectoryPath,
    });
    const filePath = `${fileDir}/${fileName}`;
    
    setIsLoading(true); // Start loading when download begins

    try {
      const options = {
        fromUrl: reportUrl,
        toFile: filePath,
        background: true,
      };

      const response = await RNFS.downloadFile(options).promise;

      if (response.statusCode === 200) {
        setDownloadComplete(true); // Set download complete flag to true
        onSuccess && onSuccess(filePath);
      } else {
        throw new Error("Failed to download file");
      }
    } catch (error) {
      console.error("Download error:", error);
      onError && onError(error);
    } finally {
      setIsLoading(false); // Stop loading after download is complete
      onSettled && onSettled();
    }
  };

  // Function to handle share
  const handleShare = async () => {
      const fileName = "pembayaran.pdf";
      const fileDir = Platform.select({
        ios: RNFS.DocumentDirectoryPath,
        android: RNFS.DownloadDirectoryPath,
      });
      const filePath = `${fileDir}/${fileName}`;
      
      await Share.open({
        url: Platform.OS === "android" ? `file://${filePath}` : filePath,
        type: "application/pdf",
      });
  };

  // Modal to show PDF preview and download option
  const PDFConfirmationModal = () => (
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

          {/* Show loading indicator when downloading */}
          {isLoading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <>
              {!downloadComplete ? (
                <>
                <TouchableOpacity
                  onPress={handleConfirm}
                  className="bg-blue-500 w-full my-48 p-2 m-1 rounded"
                >
                  <Text className="text-white text-center">Download</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    className="bg-red-500 w-full my-48 p-2 m-1 rounded"
                  >
                    <Text className="text-white text-center">Close</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    onPress={handleShare}
                    className="bg-green-500 w-full my-48 p-2 m-1 rounded"
                  >
                    <Text className="text-white text-center">Share</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    className="bg-red-500 w-full my-48 p-2 m-1 rounded"
                  >
                    <Text className="text-white text-center">Close</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
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
