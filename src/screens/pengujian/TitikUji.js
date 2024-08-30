import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Colors } from "react-native-ui-lib";
import { useNavigation } from "@react-navigation/native";

export default function TitikUji() {
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedReportOption, setSelectedReportOption] = useState("");
  const navigation = useNavigation();

  const Parameter = () => {
    navigation.navigate("Parameter");
  };

  const EditTitikUji = () => {
    navigation.navigate("EditTitikUji");
  };

  const toggleReportModal = () => {
    setIsReportModalVisible(!isReportModalVisible);
  };

  const toggleDeleteModal = () => {
    setIsDeleteModalVisible(!isDeleteModalVisible);
  };

  const handleSelectReportOption = (value) => {
    setSelectedReportOption(value);
    setIsReportModalVisible(false);
  };

  const handleDelete = () => {
    // Handle delete logic here
    setIsDeleteModalVisible(false);
  };

  return (
    <View style={styles.Container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Kembali</Text>
      </TouchableOpacity>
      <View style={[styles.CardContainer, { backgroundColor: Colors.brand }]}>
        <Text style={styles.judulCard}>Nama Industri</Text>
        <View style={styles.CardContent}>
          <Text style={styles.CardText}>Kode : 1</Text>
          <Text style={styles.CardText}>Titik Uji / Lokasi : </Text>
          <Text style={styles.CardText}>Diambil Pada : </Text>
          <Text style={styles.CardText}>Diterima Pada : </Text>
          <Text style={styles.CardText}>Selesai Pada : </Text>
        </View>
        <View style={styles.action}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.buttonParameter, { backgroundColor: "#CD5C5C" }]}
              onPress={toggleReportModal}>
              <Text style={styles.textButtonParameter}>Report</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.buttonParameter, { backgroundColor: "#6B8E23" }]}
              onPress={Parameter}>
              <Text style={styles.textButtonParameter}>Parameter</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonParameter}
              onPress={EditTitikUji}>
              <Text style={styles.textButtonParameter}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.buttonParameter, { backgroundColor: "#CD5C5C" }]}
              onPress={toggleDeleteModal}>
              <Text style={styles.textButtonParameter}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Modal for Report Selection */}
      <Modal
        visible={isReportModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={toggleReportModal}>
        <TouchableWithoutFeedback onPress={toggleReportModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalReportContent}>
              <Text style={styles.modalReportTitle}>Pilih Report</Text>
              <TouchableOpacity
                style={styles.optionReportButton}
                onPress={() => handleSelectReportOption('report1')}>
                <Text style={styles.optionReportText}>Permohonan Pengujian</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionReportButton}
                onPress={() => handleSelectReportOption('report2')}>
                <Text style={styles.optionReportText}>Berita Acara Pengambilan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal for Delete Confirmation */}
      <Modal
        visible={isDeleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={toggleDeleteModal}>
        <TouchableWithoutFeedback onPress={toggleDeleteModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalDeleteContent}>
              <Text style={styles.modalDeleteTitle}>Konfirmasi Hapus</Text>
              <Text style={styles.modalDeleteMessage}>Apakah Anda yakin ingin menghapus data ini?</Text>
              <View style={styles.deleteButtonContainer}>
                <TouchableOpacity
                  style={styles.confirmDeleteButton}
                  onPress={handleDelete}>
                  <Text style={styles.deleteButtonText}>Ya, Hapus</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelDeleteButton}
                  onPress={toggleDeleteModal}>
                  <Text style={styles.deleteButtonText}>Batal</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(13, 71, 161, 0.2)",
  },
  backButton: {
    padding: 10,
    backgroundColor: "#6b7fde",
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  CardContainer: {
    width: 340,
    borderRadius: 10,
    padding: 20,
    marginVertical: 10,
  },
  judulCard: {
    fontSize: 15,
    color: "white",
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  CardContent: {
    backgroundColor: "#6b7fde",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  CardText: {
    color: "white",
    marginBottom: 5,
  },
  action: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
  },
  buttonParameter: {
    height: 35,
    width: "45%",
    borderRadius: 10,
    backgroundColor: "#4682B4",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 5,
  },
  textButtonParameter: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },

  // Styles for Report Modal
  modalReportContent: {
    backgroundColor: "#f0f0f0",
    padding: 20,
    borderRadius: 10,
    width: 300,
  },
  modalReportTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  optionReportButton: {
    padding: 15,
    backgroundColor: "red",
    borderRadius: 5,
    marginTop: 10,
  },
  optionReportText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },

  // Styles for Delete Modal
  modalDeleteContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: 300,
  },
  modalDeleteTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
  },
  modalDeleteMessage: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginVertical: 20,
  },
  deleteButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  confirmDeleteButton: {
    padding: 15,
    backgroundColor: "#b22222",
    borderRadius: 5,
    width: "45%",
  },
  cancelDeleteButton: {
    padding: 15,
    backgroundColor: "#4682B4",
    borderRadius: 5,
    width: "45%",
  },
  deleteButtonText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
});

