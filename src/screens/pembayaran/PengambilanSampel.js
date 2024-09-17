import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { Searchbar } from "react-native-paper";
import { Button, Colors } from "react-native-ui-lib";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import MonthYearPicker from 'react-native-simple-month-year-picker';
import { useNavigation } from '@react-navigation/native';

export default function PengambilanSampel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isShow, setIsShow] = useState(false);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Pengambilan Sampel</Text>
      </View>

      {/* Search and Filter Section */}
      <View style={styles.searchRow}>
        <View style={styles.search}>
          <Searchbar 
            placeholder="Search"
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            iconColor="#6e6e6e"
          />
        </View>

        <TouchableOpacity style={styles.filterButton} onPress={toggleDropdown}>
          <Icon name="filter-menu-outline" size={25} color="white" />
        </TouchableOpacity>
      </View>

      {/* Dropdown */}
      {dropdownVisible && (
        <View style={styles.dropdown}>
          <TouchableOpacity style={styles.dropdownItem}>
            <Text style={styles.dropdownText}>Menunggu Konfirmasi</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dropdownItem}>
            <Text style={styles.dropdownText}>Telah diterima</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Year Picker Section */}
      <View style={styles.yearPickerContainer}>
        <Button
          style={styles.yearpick}
          title="Pilih Tahun"
          onPress={() => setIsShow(true)}
        />
        <MonthYearPicker
          isShow={isShow}
          close={() => setIsShow(false)}
          onChangeYear={(year) => console.log(year)}
          onChangeMonth={(month) => console.log(month)}
        />
      </View>

      {/* Content Section */}
      <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <Text style={styles.cardText}>Sample Text 1</Text>
            <Text style={styles.cardText}>Sample Text 2</Text>
            <Text style={styles.cardText}>Sample Text 3</Text>

            <View style={styles.cardIcons}>
              <Button style={styles.eye}>
                <Icon name="eye" size={20} color="white" />
              </Button>
              <TouchableOpacity>
                <Icon name="dots-vertical" size={25} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: "#f0f0f0",
  },
  headerContainer: {
    marginTop: 40,
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
    marginBottom: 20,
  },
  search: {
    flex: 1,
    marginRight: 10,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  searchbar: {
    backgroundColor: 'white',
    borderRadius: 10,
  },
  filterButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  dropdown: {
    backgroundColor: "white",
    borderRadius: 8,
    marginTop: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  dropdownItem: {
    paddingVertical: 10,
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
  yearPickerContainer: {
    marginBottom: 20,
    alignItems: "flex-end",
  },
  yearpick: {
    backgroundColor: "#007BFF",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    color: "white",
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardText: {
    fontSize: 16,
    color: "#333",
  },
  cardIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  eye: {
    backgroundColor: "#007BFF",
    borderRadius: 5,
    padding: 8,
    marginRight: 10,
  },
});
