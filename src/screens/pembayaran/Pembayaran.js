import React, { useState, useRef, useEffect } from "react";
import axios from "@/src/libs/axios";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Image,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Colors, Button } from "react-native-ui-lib";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import SignatureScreen from "react-native-signature-canvas";
import { Searchbar } from "react-native-paper";

const Pembayaran = () => {
  const navigation = useNavigation();
  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [pembayaranData, setPembayaranData] = useState([]);

  // SEARCH BAR
  const [searchQuery, setSearchQuery] = React.useState("");
  // PREVIOUS
  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  // NEXT
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  useEffect(() => {
    axios
      .get("/pembayaran/pengujian")
      .then(response => {
        console.log("Response Data:", response.data);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const filteredCards = pembayaranData.filter(cardItem => {
    const matchesSearch = cardItem.lokasi
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesYear = selectedYear
      ? cardItem.tanggal.startsWith(selectedYear)
      : true;
    const matchesMonth = selectedMonth
      ? cardItem.tanggal.split("-")[1] === selectedMonth
      : true;
    return matchesSearch && matchesYear && matchesMonth;
  });

  const totalPages = Math.ceil(filteredCards.length / itemsPerPage);
  const paginatedCards = filteredCards.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const ButtonDetail = () => {
    navigation.navigate("Detail");
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
        />
        <Text style={styles.headerText}>SI - LAJANG</Text>
      </View>
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
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}>
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
                style={[
                  styles.cardTexts,
                  { fontWeight: "bold", fontSize: 22 },
                ]}>
                C2342344003
              </Text>
              <Text style={[styles.cardTexts, { marginTop: 15 }]}>
                Surabaya. Jawa Barat
              </Text>
              <Text style={styles.cardTexts}>20.000</Text>
            </View>
            <View style={styles.cards2}>
              <View>
                <View style={styles.pending}>
                  <Text style={styles.pendingText}>Pending</Text>
                </View>
                <TouchableOpacity
                  style={styles.ButtonDetail}
                  onPress={ButtonDetail}>
                  <Text style={styles.TextButton}>Pembayaran</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          {/* ))} */}
        </View>
        {/* <View style={styles.paginationContainer}>
          <TouchableOpacity
            onPress={handlePreviousPage}
            disabled={currentPage === 1}>
            <Text
              style={[
                styles.paginationButton,
                currentPage === 1 && styles.disabledButton,
              ]}>
              Previous
            </Text>
          </TouchableOpacity>
          <Text style={styles.paginationText}>
            Halaman {currentPage} Dari {totalPages}
          </Text>
          <TouchableOpacity
            onPress={handleNextPage}
            disabled={currentPage === totalPages}>
            <Text
              style={[
                styles.paginationButton,
                currentPage === totalPages && styles.disabledButton,
              ]}>
              Next
            </Text>
          </TouchableOpacity>
        </View> */}
      
      </ScrollView>
      <View
          style={[
            styles.paginationNumber,
            { width: 30, height: 30, backgroundColor: "#6b7fde" },
          ]}>
          <Text style={{ fontSize: 15, color: "white" }}>1</Text>
        </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(13, 71, 161, 0.2)",
  },
  headerContainer: {
    width: "100%",
    paddingVertical: 10,
    backgroundColor: Colors.brand, // Ganti dengan warna yang sesuai
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row", // Menyusun elemen secara horizontal
    elevation: 4,
  },
  logo: {
    width: 40,
    height: 40,
    marginTop: 8,
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
  headerText: {
    fontSize: 22,
    color: "white",
    fontWeight: "bold",
    marginLeft: 10, // Beri jarak antara logo dan teks
    alignSelf: "center", // Vertically align the text to the center
  },

  scrollViewContent: {
    flexGrow: 1, // Ensures that ScrollView content is scrollable
    marginHorizontal: 20,
    marginVertical: 10,
  },
  judul: {
    fontSize: 17,
    color: "black",
    alignSelf: "center",
    fontWeight: "bold",
    marginBottom: 10,
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

  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center", // Menengahkan secara vertikal
    marginTop: 20,
    marginBottom: 40,
  },
  paginationButton: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
    paddingVertical: 10,
    width: 100,
    backgroundColor: "#6b7fde",
    borderRadius: 10,
    marginHorizontal: 10, // Memberikan jarak antar tombol
    textAlign: "center", // Menengahkan teks pada tombol
  },
  paginationText: {
    fontSize: 16,
    color: "black",
    fontWeight: "bold",
    marginHorizontal: 10, // Memberikan jarak dengan tombol
  },

  ButtonDetail: {
    paddingHorizontal: 14,
    borderRadius: 5,
    marginVertical: 5,
    backgroundColor: "#4682B4", // Warna untuk tombol Detail
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row", // Menyusun elemen secara horizontal
  },
  TextButton: {
    color: "white",
    fontSize: 12,
    paddingVertical: 7,
    fontWeight: "bold",
  },
  pending: {
    color: "white",
    backgroundColor: "green",
    paddingVertical: 5,
    borderRadius: 5,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  pendingText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: "white", // Warna gambar diselaraskan dengan teks
  },
  disabledButton: {
    color: "#ccc",
  },
  paginationNumber: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    marginBottom : 80,
  },
});

export default Pembayaran;
