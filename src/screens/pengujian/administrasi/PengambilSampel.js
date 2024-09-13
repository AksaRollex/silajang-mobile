import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Searchbar } from "react-native-paper";
import { Button, Colors } from "react-native-ui-lib";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import axios from "@/src/libs/axios";
import DropDownPicker from 'react-native-dropdown-picker';
import { MenuView } from '@react-native-menu/menu';
import BackButton from "@/src/screens/components/BackButton";
import { useNavigation } from "@react-navigation/native";

export default function PengambilSampel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Menunggu Konfirmasi"); 
  const [selectedYear, setSelectedYear] = useState(2024);
  const [pengambil, setPengambil] = useState([]); 
  const [open, setOpen] = useState(false);
  const navigation = useNavigation();
  
 const fetchData = () => {
  const payload = {
    status: selectedFilter === "Menunggu Konfirmasi" ? 0 : 1,
    tahun: selectedYear,
  };

  axios
    .post("/administrasi/pengambil-sample", payload)
    .then(response => {
      setPengambil(response.data.data);
      console.log(response.data.data);
    })
    .catch(error => {
      console.error("Error fetching data: ", error);
    });
};

useEffect(() => {
  fetchData();
}, [selectedFilter, selectedYear]);

const generateYears = () => {
  const currentYear = new Date().getFullYear();
  let years = [];
  for (let i = 2020; i <= currentYear; i++) {
    years.push({ label: String(i), value: i });
  }
  return years;
};
  

  return (
    <View style={styles.container} className="bg-[#ececec]">
      <View style={styles.searchRow}>

        <View style={styles.backButton}>
          <BackButton action={() => navigation.goBack()} size={24} />
        </View>

        <View style={styles.search}>
          <Searchbar
            placeholder="Search"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            iconColor="#6e6e6e"
          />
        </View>

      </View>
        

      <View className="flex-row mt-7 mr-4">
      {/* DropDownPicker Container */}
      <View className="flex-1">
        <DropDownPicker
          open={open}
          value={selectedYear}
          items={generateYears()}
          setOpen={setOpen}
          setValue={setSelectedYear}
          placeholder="Pilih Tahun"
          style={styles.dropdownPicker}
          textStyle={styles.dropdownText}
          containerStyle={styles.dropdownContainer}
        />
      </View>

      {/* MenuView */}
      <View className="mt-2">
        <MenuView 
          className="ml-2"
          onPressAction={({ nativeEvent }) => {
            if (nativeEvent.event === "0") {
              setSelectedFilter("Menunggu Konfirmasi");
            } else if (nativeEvent.event === "1") {
              setSelectedFilter("Telah diterima");
            }
          }}
          actions={[
            { id: '0', title: 'Menunggu Konfirmasi', titleColor: 'black' },
            { id: '1', title: 'Sudah Konfirmasi', titleColor: 'black' }
          ]}
          >
          <Icon name="dots-vertical" size={30} color="black"/>
        </MenuView>
      </View>

      </View>

      {/* Bagian Switch Ternary Berdasarkan Filter */}
      <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
        {selectedFilter === "Menunggu Konfirmasi" ? (
          <View style={[styles.card, { marginTop: 10 }]} className="bg-[#f8f8f8]">
            <View style={styles.cards}>
              {pengambil ? (
                <>
                
              <View>
                <Text style={[styles.cardTexts, { fontSize: 14 }]}>{ pengambil.industri }</Text>
                <Text style={[styles.cardTexts, { fontSize: 14 }]}>{ pengambil.industri }</Text>
                <Text style={[styles.cardTexts, { fontSize: 14 }]}>{ pengambil.industri }</Text>
                <Text style={[styles.cardTexts, { fontSize: 14 }]}>{ pengambil.industri }</Text>
                <Text style={[styles.cardTexts, { fontSize: 14 }]}>{ pengambil.industri }</Text>
              </View>
              <Button style={styles.eye}>
                <Icon name={"eye"} size={14} style={[{ color: "#fff" }]} />
              </Button>
              <View>
              </View>
              </>
              ) : (
                <Text style={styles.text}>Loading...</Text>
              )}
            </View>
          </View>
        ) : (
          <View style={[styles.card, { marginTop: 10 }]} className="bg-[#f8f8f8]">
            <View style={styles.cards}>
              <View>
                <Text style={[styles.cardTexts, { fontSize: 14 }]}></Text>
                <Text style={[styles.cardTexts, { fontSize: 14 }]}></Text>
                <Text style={[styles.cardTexts, { fontSize: 14 }]}></Text>
                <Text style={[styles.cardTexts, { fontSize: 14 }]}></Text>
                <Text style={[styles.cardTexts, { fontSize: 14 }]}></Text>
              </View>
              <Button style={styles.eye}>
                <Icon name={"eye"} size={15} style={[{ color: "#fff" }]} />
              </Button>
              <View>
              <View className="mt-20 ml-80 relative">
                  <MenuView 
                    className="ml-2"
                    onPressAction={({ nativeEvent }) => {
                      console.warn(JSON.stringify(nativeEvent));
                    }}
                    actions={[
                      { id: '0', title: 'Cetak Sampling', titleColor: 'black' },
                      { id: '1', title: 'Berita Acara', titleColor: 'black',
                        subactions: [
                          {
                            id: '2', title: 'Berita Acara Pengambilan', titleColor: 'black'
                          },
                          {
                            id: '3', title: 'Data Pengambilan', titleColor: 'black'
                          }
                        ]
                       }
                    ]}
                    >
                    <Icon name="dots-vertical" size={30} color="black" className="fixed"/>
                  </MenuView>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  searchIcon: {
    width: 24,
    height: 24,
  },
  backButton: {
    marginTop: "4%",
    marginEnd: "3%"
  },

  pickerContainer: {
    width: "25%",
    marginStart: 250,
  },
  pickerLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  dropdownPicker: {
    backgroundColor: 'white',
    borderRadius: 5,
    borderColor: '#d1d1d1',
    borderWidth: 1,
  },
  dropdownContainer: {
    height: 40,
    width: "25%",
    marginStart: "71%"
  },
  dropdownText: {
    fontSize: 16,
    
  },
  headerContainer: {
    marginTop: 20,
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  searchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "93%",
    marginStart: "2%",
    marginTop: 20
  },
  container: {
    flex: 1,
    alignItems: "center",
  },
  search: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderRadius: 10,
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 100,
    marginRight: 10
  },
  searchbar: {
    backgroundColor: 'white',
    borderRadius: 100,
  },
  filterButton: {
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollViewContent: {
    flexGrow: 1,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  card: {
    width: 380,
    borderRadius: 15,
    padding: 20,
    backgroundColor: "#fff",
    flexDirection: "row",
    borderTopColor: Colors.brand,
    borderTopWidth: 7,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 3,
  },
  cards: {
    borderRadius: 10,
    marginBottom: 4,
    flexDirection: "row",
  },
  cardTexts: {
    fontSize: 15,
    color: "black",
  },
  eye: {
    marginTop: 10,
    height: 33,
    borderRadius: 10,
    minWidth: 0,
    marginStart: 280,
    position: "absolute",
  },
  IconFilter: {
    color: "black",
    marginTop: 50,
    height: 40,
    minWidth: 10,
    marginStart: 315,
    position: "absolute",
  },
  dropdown: {
    backgroundColor: "white",
    borderRadius: 8,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginStart: 200,
    marginTop: "33%",
    position: "absolute"
  },
  dropdownItem: {
    paddingVertical: 5,
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
});
