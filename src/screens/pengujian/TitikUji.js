import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  TouchableWithoutFeedback,
} from "react-native";
import { Colors, Button } from "react-native-ui-lib";
import { useNavigation } from "@react-navigation/native";
import { Searchbar } from "react-native-paper";

export default function TitikUji() {
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedReportOption, setSelectedReportOption] = useState("");
  const navigation = useNavigation();

  // SEARCH BAR
  const [search, setSearch] = useState("");

  const [searchQuery, setSearchQuery] = React.useState("");

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

  const handleSelectReportOption = value => {
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
        style={[styles.backButton,{ backgroundColor : Colors.brand}]}
        onPress={() => navigation.goBack()}>
        <Image
          source={require("../../../assets/images/backss.png")}
          style={{ height: 20, width: 20, tintColor: "white" }}></Image>
      </TouchableOpacity>
      <View
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
        <View style={styles.search}>
          <Searchbar
            placeholder="Search"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
          />

          <Button style={styles.buttonSearch}>
            <Image
              source={require("../../../assets/images/search.png")}
              style={styles.searchIcon}
            />
          </Button>
        </View>
      </View>

      <View style={styles.row}>
        {/* {paginatedCards.map((cardItem) => ( */}
        <View
          // key={cardItem.id}
          style={styles.card}>
          <View style={styles.cards}>
            <Text style={[styles.cardTexts, { fontSize: 15 }]}>
              Lasvegas, Surabaya, Indonesia
            </Text>
            <Text
              style={[styles.cardTexts, { fontWeight: "bold", fontSize: 22 }]}>
              SSD0743
            </Text>
            <Text style={[styles.cardTexts, { marginTop: 15 }]}>
              Diambil : 20-20-20
            </Text>
            <Text style={[styles.cardTexts]}>Diterima : 29-19-19</Text>
            <Text style={[styles.cardTexts]}>Selesai : 10-10-10</Text>
          </View>
          <View style={styles.cards2}>
            <View>
              <Button
                style={[styles.button, { backgroundColor: "#CD5C5C" }]}
                onPress={toggleReportModal}>
                <Text style={styles.buttonText}>Report</Text>
              </Button>
              <Button
                style={[styles.button, { backgroundColor: "#6B8E23" }]}
                onPress={Parameter}>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "bold",
                    color: "white",
                  }}>
                  Parameter
                </Text>
              </Button>
              <Button
                style={[styles.button, { backgroundColor: "#4682B4" }]}
                onPress={EditTitikUji}>
                <Text style={styles.buttonText}>Edit</Text>
              </Button>
              <Button
                style={[styles.button, { backgroundColor: "#CD5C5C" }]}
                onPress={toggleDeleteModal}>
                <Text style={styles.buttonText}>Delete</Text>
              </Button>
              {/* <TouchableOpacity
                  style={styles.ButtonDetail}
                  onPress={ButtonDetail}>
                  <Text style={styles.TextButton}>Pembayaran</Text>
                </TouchableOpacity> */}
            </View>
          </View>
        </View>
        {/* ))} */}
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
                onPress={() => handleSelectReportOption("report1")}>
                <Text style={styles.optionReportText}>
                  Permohonan Pengujian
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionReportButton}
                onPress={() => handleSelectReportOption("report2")}>
                <Text style={styles.optionReportText}>
                  Berita Acara Pengambilan
                </Text>
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
              <Text style={styles.modalDeleteMessage}>
                Apakah Anda yakin ingin menghapus data ini?
              </Text>
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
      <View style={{ display : 'flex', alignItems : "center", justifyContent : 'center' }}>

      <View
        style={[
          styles.paginationNumber,
          { width: 30, height: 30, backgroundColor: "#6b7fde" },
        ]}>
        <Text style={{ fontSize: 15, color: "white" }}>1</Text>
      </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    padding : 20,
    display: "flex",
    backgroundColor: "rgba(13, 71, 161, 0.2)",
  },
  backButton: {
    padding: 4,
    backgroundColor: "#6b7fde",
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
    width: "10%",
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  search: {
    flexDirection: "row", // Mengatur elemen dalam satu baris
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "white",
    borderRadius: 10,
    width: "90%",
  },
  searchbar: {
    flex: 1, // Searchbar akan menempati ruang yang tersisa
    backgroundColor: "white",
    borderRadius: 10,
    marginRight: 10, // Memberikan jarak antara Searchbar dan Button
  },
  buttonSearch: {
    backgroundColor: "#0D47A1", // Contoh warna
    padding: 10,
    borderRadius: 10,
  },
  searchIcon: {
    width: 24,
    height: 24,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },

  card: {
    width: 360,
    marginVertical: 10,
    borderRadius: 15,
    padding: 20,
    backgroundColor: "#fff",
    flexDirection: "row",
    borderTopColor: Colors.brand,
    borderTopWidth: 7,
  },
  cards: {
    borderRadius: 10,
    width: "70%",
    marginBottom: 4,
  },
  cards2: {
    borderRadius: 10,
    width: "30%",
    marginBottom: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  cardTexts: {
    fontSize: 15,
    color: "black",
  },
  button: {
    color: "white",
    backgroundColor: "green",
    paddingVertical: 5,
    borderRadius: 5,
    display: "flex",
    alignItems: "center",
    padding: 10,
    marginVertical: 3,
    justifyContent: "center",
  },
 
  buttonText: {
    color: "white",
    fontSize: 13,
    fontWeight: "bold",
  },
  action: {
    flexDirection: "row",
    justifyContent: "center",
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
  paginationNumber: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    marginTop : 325
  },
});
