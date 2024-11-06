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
import Ionicons from "react-native-vector-icons/Ionicons";
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

      <View className=" p-4 flex flex-row items-center mt-2">
        {/* <Ionicons name="document-text" size={22} style={{ color: "black" }}/> */}
        <Text className="font-poppins-semibold ml-2 text-black text-lg">Pembayaran</Text>
      </View>
        <View>
          <List.Item
          style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
          title={<Text className="font-poppins-medium text-[15px]">Pembayaran</Text>}
          left={() => (
            <View className="bg-green-600 rounded-full ml-3">
            <Ionicons name="wallet" size={17} color={'white'} style={{padding: 5}}/>
          </View>
          )}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          className='bg-[#ffffff] border-black p-2 ml-3 mr-3'
          onPress={Pengujian}
          />
          <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
        </View>

        <View> 
          <List.Item
            title={<Text className="font-poppins-medium text-[15px]">Pembayaran Non Pengujian</Text>}
            left={() => (
              <View className="bg-green-600 rounded-full ml-3">
              <Ionicons name="card" size={17} color={'white'} style={{padding: 5}}/>
            </View>
            )}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            className='bg-[#ffffff] border-black p-2 ml-3 mr-3'
            onPress={NonPengujian}
            />
            <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
          </View>

          <View>
            <List.Item
            style={{ borderBottomLeftRadius: 10, borderBottomRightRadius: 10 }}
            title={<Text className="font-poppins-medium text-[15px]">Pembayaran Global</Text>}
            left={() => (
              <View className="bg-green-600 rounded-full ml-3">
              <Ionicons name="globe" size={17} color={'white'} style={{padding: 5}}/>
            </View>
            )}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            className='bg-[#ffffff] border-black p-2 ml-3 mr-3'
            onPress={Global}
            />
          <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginHorizontal: 15 }} />
          </View> 
      <TextFooter/>
      </ScrollView>
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
 
  scrollViewContent: {
    flexGrow: 1, // Ensures that ScrollView content is scrollable
    paddingBottom: 100, // Add padding to avoid content being hidden behind the buttons
  },
});

export default Pembayaran;
