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
import { List } from "react-native-paper";
import Pengujian from "./Pengujian";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import FontAwesome6Icon from "react-native-vector-icons/FontAwesome6";
import { TextFooter } from "../components/TextFooter";

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
  const PengambilanSampel = () => {
    navigation.navigate("PengambilanSampel");
  };

const Pengujian = () => {
  navigation.navigate("Pengujian");
};

const NonPengujian = () => {
  navigation.navigate("NonPengujian");
};

const Global = () => {
  navigation.navigate("Global");
};

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <List.Item
          title={<Text className="font-poppins-semibold">Pembayaran</Text>}
          left={props => <FontAwesome5Icon {...props} name="wallet" size={22} />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          className='bg-[#ffffff] border-black p-2'
          onPress={Pengujian}
          />
          
          <List.Item
            title={<Text className="font-poppins-semibold">Pembayaran Non Pengujian</Text>}
            left={props => <FontAwesome5Icon {...props} name="credit-card" size={22}/>}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            className='bg-[#ffffff] border-black p-2'
            onPress={NonPengujian}
            />

            <List.Item
            title={<Text className="font-poppins-semibold">Pembayaran Global</Text>}
            left={props => <FontAwesome6Icon {...props} name="building-columns" size={22}/>}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            className='bg-[#ffffff] border-black p-2'
            onPress={Global}
            />

          {/* ))} */}
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
      <TextFooter/>
      </ScrollView>
      {/* <View
          style={[
            styles.paginationNumber,
            { width: 30, height: 30, backgroundColor: "#6b7fde" },
          ]}>
          <Text style={{ fontSize: 15, color: "white" }}>1</Text>
        </View> */}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: "center",
    backgroundColor: "#ececec",
    justifyContent: "flex-start", // Ensure content starts from the top
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
    // marginHorizontal: 20,
    // marginVertical: 10,
    paddingBottom: 100, // Add padding to avoid content being hidden behind the buttons
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
