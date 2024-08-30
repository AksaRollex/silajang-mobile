import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import { Colors } from "react-native-ui-lib";
import React, { useState, useEffect } from "react";
import axios from "@/src/libs/axios";
import { Modal } from "react-native-ui-lib";
import { useNavigation } from "@react-navigation/native";

export default function Permohonan() {
  const [permohonanData, setPermohonanData] = useState([]); // Inisialisasi dengan array kosong
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const navigation = useNavigation();

  const ButtonTitikUji = () => {
    navigation.navigate("TitikUji");
  };

  const ButtonEditPermohonan = () => {
    navigation.navigate("EditPermohonan");
  };

  const ButtonTambahPermohonan = () => {
    navigation.navigate("TambahPermohonan");
  };

  const toggleDeleteModal = () => {
    setIsDeleteModalVisible(!isDeleteModalVisible);
  };

  const handleDelete = () => {
    // Logika untuk menghapus item di sini
    setIsDeleteModalVisible(false);
    console.log("Item telah dihapus");
  };

  useEffect(() => {
    axios
      .get("/permohonan/get")
      .then((response) => {
        console.log("Response Data Permohonan:", response.data.data);
        setPermohonanData(response.data.data || []); // Menyimpan data yang didapat ke state, default ke array kosong jika data null
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  return (
    <View style={styles.Container}>
      <Text style={styles.title}>Halaman Permohonan</Text>
      <TouchableOpacity style={styles.buttonAdd} onPress={ButtonTambahPermohonan}>
        <Text style={styles.buttonAddText}>Tambah Permohonan +</Text>
      </TouchableOpacity>
      {permohonanData.length > 0 ? (
        permohonanData.map((permohonan, index) => (
          <View key={index} style={[styles.CardContainer, { backgroundColor: Colors.brand }]}>
            <View style={styles.CardContent}>
              <Text style={styles.CardText}>No : {index + 1}</Text>
              <Text style={styles.CardText}>Nama Industri : {permohonan.nama_industri}</Text>
              <Text style={styles.CardText}>Alamat : {permohonan.alamat}</Text>
              <Text style={styles.CardText}>Pembayaran : {permohonan.pembayaran}</Text>
              <Text style={styles.CardText}>Cara Pengambilan : {permohonan.cara_pengambilan}</Text>
              <Text style={styles.CardText}>Tanggal : {permohonan.tanggal}</Text>
            </View>
            <View style={styles.action}>
              <TouchableOpacity style={[styles.button, { backgroundColor: "#6B8E23" }]} onPress={ButtonTitikUji}>
                <Text style={styles.textbutton}>Titik Uji</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={ButtonEditPermohonan}>
                <Text style={styles.textbutton}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, { backgroundColor: "#CD5C5C" }]} onPress={toggleDeleteModal}>
                <Text style={styles.textbutton}>Hapus</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <Text style={{fontSize : 15, fontWeight : 'bold', marginVertical : 10, textAlign : 'center'}}>Tidak Ada Data Yang Tersedia</Text>
      )}

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
                <TouchableOpacity style={styles.confirmDeleteButton} onPress={handleDelete}>
                  <Text style={styles.deleteButtonText}>Ya, Hapus</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelDeleteButton} onPress={toggleDeleteModal}>
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
    padding : 20,
  },
  title : {
    fontSize : 20,
    fontWeight : 'bold',
    color : 'black',
    marginVertical : 10,
  },
  buttonAdd: {
    width: 300,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#6b7fde",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonAddText: {
    fontSize: 17,
    fontWeight: "bold",
    color: "white",
  },
  CardContainer: {
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
  button: {
    height: 35,
    width: 90,
    margin: 6,
    borderRadius: 10,
    backgroundColor: "#4682B4",
    justifyContent: "center",
    alignItems: "center",
  },
  textbutton: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  action: {
    flexDirection: "row",
    justifyContent: "center",
  },
  deleteActionContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 5,
  },
  optionButton: {
    paddingHorizontal: 25,
    paddingVertical : 10,
    borderRadius: 5,
  },
  optionText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    fontWeight : 'bold'
  },
  // Styles for Delete Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  
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
