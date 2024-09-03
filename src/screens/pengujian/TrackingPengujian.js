import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Button } from "react-native-ui-lib";
import { Colors } from "react-native-ui-lib";
import { useNavigation } from "@react-navigation/native";
import axios from "@/src/libs/axios";
import { Searchbar } from "react-native-paper";

export default function TrackingPengujian() {
  const [trackingData, setTrackingData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [yearFilter, setYearFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const navigation = useNavigation();

  // SEARCH BAR
  const [searchQuery, setSearchQuery] = React.useState("");

  const targetId = "C2342344003";

  // useEffect(() => {
  //   axios
  //     .get("/tracking/get")
  //     .then(response => {
  //       const data = response.data.data;
  //       const filtered = data.filter(item => item.id === targetId); // Hanya ambil data dengan ID tertentu
  //       setTrackingData(filtered);
  //       setFilteredData(filtered);
  //     })
  //     .catch(error => console.error("Error fetching data:", error));
  // }, []);

  useEffect(() => {
    axios
      .get("/tracking/get")
      .then((response) => {
        console.log(response.data); // Cek struktur data yang diterima
        if (response.data && response.data.data) {
          const data = response.data.data;
          const filtered = data.filter(item => item.id === targetId); // Hanya ambil data dengan ID tertentu
          setTrackingData(filtered);
          setFilteredData(filtered);
        } else {
          console.error("Data tidak ditemukan atau struktur tidak sesuai");
        }
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = pageNum => {
    setCurrentPage(pageNum);
  };

  const renderCard = ({ item }) => (
    <View style={[styles.CardContainer, { backgroundColor: "white" }]}>
      <View style={styles.CardContent}>
        <View style={styles.status}>
          <Text style={{ color: "black", fontWeight: "bold", fontSize: 17 }}>
            Belum Selesai {item.status}
          </Text>
        </View>
        <Text style={[styles.CardText, { fontSize: 20, fontWeight: "bold" }]}>
          CD234BB
        </Text>
        <Text style={styles.CardText}>
          Tanggal Dibuat : {item.tanggal_dibuat}
        </Text>
        <Text style={styles.CardText}>
          Tanggal Diterima : {item.tanggal_diterima}
        </Text>
        <Text style={styles.CardText}>
          Tanggal Selesai : {item.tanggal_selesai}
        </Text>
        <Text style={styles.CardText}>
          Surabaya, Jawa Timur {item.lokasi}
        </Text>
      </View>
      <View style={styles.action}>
        <TouchableOpacity
          style={[
            styles.buttonTracking,
            { backgroundColor: Colors.yellow10 },
          ]}
          onPress={() => handleTrackingPress(item.id)}
        >
          <Text style={styles.textButtonTracking}>Tracking</Text>
          <Image
            source={require("@/assets/images/double-right.png")}
            style={styles.iconStyle}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPaginationNumbers = () => {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginationButtons = [];

    for (let i = 1; i <= totalPages; i++) {
      paginationButtons.push(
        <TouchableOpacity
          key={i}
          onPress={() => handlePageChange(i)}
          style={[
            styles.paginationNumber,
            {
              backgroundColor: i === currentPage ? "#6b7fde" : "#ccc",
            },
          ]}>
          <Text
            style={[
              styles.pageNumber,
              { color: i === currentPage ? "white" : "black" },
            ]}>
            {i}
          </Text>
        </TouchableOpacity>,
      );
    }

    return paginationButtons;
  };

  return (
    <View style={styles.Container}>
      {/* Search Bar */}
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
      <View style={[styles.CardContainer, { backgroundColor: "white" }]}>
        <View style={styles.CardContent}>
          <View style={styles.status}>
            <Text style={{ color: "red", fontWeight: "bold", fontSize: 17 }}>
              Belum Selesai
            </Text>
          </View>
          <Text style={[styles.CardText, { fontSize: 20, fontWeight: "bold" }]}>
            CD234BB
          </Text>
          <Text style={[styles.CardText, { marginTop: 15 }]}>
            Tanggal Dibuat :
          </Text>
          <Text style={styles.CardText}>Tanggal Diterima :</Text>
          <Text style={styles.CardText}>Tanggal Selesai :</Text>
          <Text style={[styles.CardText, { marginTop: 5 }]}>
            Surabaya, Jawa Timur
          </Text>
        </View>
        <View style={styles.action}>
          <TouchableOpacity
            style={[
              styles.buttonTracking,
              { backgroundColor: Colors.yellow10 },
            ]}
            onPress={() => handleTrackingPress(item.id)}>
            <Text style={styles.textButtonTracking}>Tracking</Text>
            <Image
              source={require("@/assets/images/double-right.png")}
              style={styles.iconStyle}
            />
          </TouchableOpacity>
        </View>
      </View>
      {/* Card List */}
      <FlatList
        data={currentData}
        renderItem={renderCard}
        keyExtractor={(item, index) =>
          item.id ? item.id.toString() : index.toString()
        }
      />

      {/* Pagination Controls */}
      <View style={styles.pagination}>{renderPaginationNumbers()}</View>
    </View>
  );
}
const styles = StyleSheet.create({
  Container: {
    flex: 1,
    alignItems: "center",
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
    width: 360,
    marginVertical: 10,
    borderRadius: 15,
    padding: 10,
    backgroundColor: "#fff",
    flexDirection: "row",
    borderTopColor: Colors.brand,
    flexDirection: "row",
    borderTopWidth: 7,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  CardContent: {
    borderRadius: 10,
    padding: 10,
    width: "70%",
    marginBottom: 10,
  },
  CardText: {
    color: "black",
    marginBottom: 5,
  },
  status: {},
  buttonTracking: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 5,
    backgroundColor: "#4682B4", // Warna untuk tombol Detail
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row", // Menyusun elemen secara horizontal
  },
  textButtonTracking: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 5,
  },
  iconStyle: {
    tintColor: "white",
    width: 20,
    height: 20,
    marginLeft: 5,
  },
  action: {
    width: "30%",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 50,
  },
  pageButton: {
    fontSize: 16,
    color: Colors.brand,
    fontWeight: "bold",
    marginHorizontal: 10,
  },
  pageNumber: {
    fontSize: 16,
    fontWeight: "bold",
  },

  paginationNumber: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    marginBottom: 80,
  },
});
