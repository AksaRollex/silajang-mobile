import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  RefreshControl,
  ScrollView,
} from "react-native";
import { Button, Colors } from "react-native-ui-lib";
import React, { useState, useEffect } from "react";
import axios from "@/src/libs/axios";
import { Modal } from "react-native-ui-lib";
import { useNavigation } from "@react-navigation/native";
import { Searchbar } from "react-native-paper";
import { useUser } from "@/src/services";
import RNPickerSelect from "react-native-picker-select";

export default function Permohonan() {
  const [permohonanData, setPermohonanData] = useState([]);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const { data: user } = useUser();
  const [selectedYear, setSelectedYear] = useState("2024");

  // REFRESH
  useEffect(() => {
    fetchUserData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserData();
    setRefreshing(false);
  };

  // SEARCH BAR
  const [search, setSearch] = useState("");

  const [searchQuery, setSearchQuery] = React.useState("");

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
    setIsDeleteModalVisible(false);
    console.log("Item telah dihapus");
  };
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [tahuns, setTahuns] = useState([]);

  useEffect(() => {
    const years = [];
    for (let i = tahun; i >= 2022; i--) {
      years.push({ id: i, text: i });
    }
    setTahuns(years);
  }, [tahun]);

  // FETCHING PERMOHONAN ANEH V.2
  const fetchUserData = () => {
    axios
      .get("/permohonan/" + user.role.name, { tahun: tahun })
      .then(response => {
        console.log("Response Data Permohonan:", response.data.data);
        setPermohonanData(response.data.data);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
      });
  };

  // FETCHING PERMOHONAN ANEH
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const token = await AsyncStorage.getItem("@auth-token");

  //       if (!token) {
  //         console.error("No auth token found");
  //         return;
  //       }

  //       const response = await axios.get("/permohonan/get", {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });

  //       console.log("Response Data Permohonan:", response.data.data);
  //       setPermohonanData(response.data.data || []);
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //     }
  //   };

  //   fetchData();
  // }, []);

  return (
    <View style={styles.Container}>
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
      <View style={styles.pickerContainer}>
        <RNPickerSelect
          onValueChange={value => setSelectedYear(value)}
          items={[
            { label: "2024", value: "2024" },
            { label: "2023", value: "2023" },
            { label: "2022", value: "2022" },
          ]}
          value={selectedYear}
          placeholder={{ label: "", value: null }} // Placeholder to add the blank area
          style={pickerSelectStyles}
          useNativeAndroidPickerStyle={false} // Use custom styling on Android
          Icon={() => {
            return (
              <View style={styles.iconContainer}>
                <Text style={{ color: "black" }}>▼</Text>
              </View>
            );
          }}
        />
      </View>

      {/* {permohonanData.length > 0 ? ( */}
      {/* permohonanData.map((permohonan, index) => ( */}
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }></ScrollView>
      <View style={styles.row}>
        {/* {paginatedCards.map((cardItem) => ( */}
        <View
          // key={cardItem.id}
          style={styles.card}>
          <View style={styles.cards}>
            <Text style={[styles.cardTexts, { fontSize: 15 }]}>
              10 Agustus 2024{" "}
            </Text>
            <Text
              style={[styles.cardTexts, { fontWeight: "bold", fontSize: 22 }]}>
              CV. UNDERRATED
            </Text>
            <Text style={[styles.cardTexts, { marginTop: 15 }]}>
              Transfer - Mandiri
            </Text>
            <Text style={[styles.cardTexts]}>Jl. Lasvegas Indehoy Asiek</Text>
          </View>
          <View style={styles.cards2}>
            <View>
              <Button
                style={[styles.button, { backgroundColor: "#6B8E23" }]}
                onPress={ButtonTitikUji}>
                <Text style={styles.buttonText}>Titik Uji</Text>
              </Button>
              <Button style={styles.button} onPress={ButtonEditPermohonan}>
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
      {/* ))
      ) : (
        <Text style={{ fontSize: 15, fontWeight: 'bold', marginVertical: 10, textAlign: 'center' }}>Tidak Ada Data Yang Tersedia</Text>
      )} */}

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

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={ButtonTambahPermohonan}>
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>
      <View
        style={[
          styles.paginationNumber,
          { width: 30, height: 30, backgroundColor: "#6b7fde" },
        ]}>
        <Text style={{ fontSize: 15, color: "white" }}>1</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    alignItems: "center",
    // backgroundColor : "black",
  },
  pickerContainer: {
    flex: 1,
    justifyContent: "flex-end", // Align the picker to the end of the container
    alignItems: "flex-end", // Align the picker to the end of the container
    padding: 10, // Optional: Adjust padding as needed
    width: "100%", // Ensure it takes the full width of the parent
  },

  iconContainer: {
    padding: 5,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
    marginVertical: 10,
  },
  search: {
    flexDirection: "row", // Mengatur elemen dalam satu baris
    alignItems: "center", // Mengatur elemen agar rata secara vertikal
    justifyContent: "space-between", // Mengatur spasi antara elemen jika diperlukan
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "white",
    borderRadius: 10,
    marginVertical: 10,
    width: "85%",
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
  CardContainer: {
    borderRadius: 10,
    padding: 20,
    marginVertical: 10,
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
  // Floating Button Styles
  floatingButton: {
    position: "absolute", // Posisikan secara absolut
    bottom: 80, // Pastikan ada jarak dengan pagination number
    right: 20,
    backgroundColor: "#6b7fde",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  floatingButtonText: {
    fontSize: 30,
    color: "white",
    fontWeight: "bold",
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
  paginationNumber: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 4,
    color: "black",
    paddingRight: 30, // To ensure the text is not covered by the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    marginHorizontal : 25,
    borderColor: "gray",
    borderRadius: 8,
    color: "black",
    paddingRight: 30, // To ensure the text is not covered by the icon
  },
  placeholder: {
    color: "gray",
    fontSize: 16,
  },
});
