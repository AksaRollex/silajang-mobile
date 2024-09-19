import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { Searchbar } from "react-native-paper";
import { Button, Colors } from "react-native-ui-lib";
import Icon from "react-native-vector-icons/Entypo";
import MonthYearPicker from 'react-native-simple-month-year-picker';

export default function PengambilanSampel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isShow, setIsShow] = useState(false);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
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

        <View>
          <TouchableOpacity onPress={toggleDropdown}>
            <Icon
              name={"dots-three-vertical"}
              size={25}
              style={styles.icon}
            />
          </TouchableOpacity>

          {/* Tampilkan dropdown jika state dropdownVisible bernilai true */}
          {dropdownVisible && (
            <View style={styles.dropdown}>
              <TouchableOpacity style={styles.dropdownItem}>
                <Text style={styles.dropdownText}>Menunnggu Konfirmasi</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem}>
                <Text style={styles.dropdownText}>Telah diterima</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      <View>
        <Button style={styles.yearpick} title="Show Picker" onPress={() => setIsShow(true)} />
        <MonthYearPicker
          isShow={isShow}
          close={() => setIsShow(false)} // setState isShow to false
          onChangeYear={(year) =>  console.log(year)}
          onChangeMonth={(month) => {
        console.log(month)
    }}
        />
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.row}>
          <View style={[styles.card, { marginTop: 10}]}>
            <View style={styles.cards}>
              <View>
              <Text style={[styles.cardTexts, { fontSize: 15 }]}>
                .{" "}
              </Text>
              <Text style={styles.cardTexts}>.</Text>
              <Text style={[styles.cardTexts, { fontSize: 15 }]}>
                .{" "}
              </Text>
              <Text style={styles.cardTexts}>.</Text>
              <Text style={[styles.cardTexts, { fontSize: 15 }]}>
                .{" "}
              </Text>
              <Text style={styles.cardTexts}>.</Text>
              </View>

              <Button
              style={[styles.eye, {}]}>
              <Icon 
                name={"eye"}
                size={20}
                style={[ {color: "#fff"}]}
              />
              </Button>
            </View>
          </View>
          <View style={[styles.card, { marginTop: 25}]}>
            <View style={styles.cards}>
              <View>
              <Text style={[styles.cardTexts, { fontSize: 15 }]}>
                .{" "}
              </Text>
              <Text style={styles.cardTexts}>.</Text>
              <Text style={[styles.cardTexts, { fontSize: 15 }]}>
                .{" "}
              </Text>
              <Text style={styles.cardTexts}>.</Text>
              <Text style={[styles.cardTexts, { fontSize: 15 }]}>
                .{" "}
              </Text>
              <Text style={styles.cardTexts}>.</Text>
              </View>

              <Button
              style={[styles.eye, {}]}>
              <Icon 
                name={"eye"}
                size={20}
                style={[ {color: "#fff"}]}
              />
              
              </Button>
              
            </View>
          </View>
        </View>
      
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "space-around",
    alignItems: "center",
    width: "92%",
    marginStart: "2%",
  },
  searchIcon: {
    width: 24,
    height: 24,
  },
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(13, 71, 161, 0.2)",
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 0, 
    backgroundColor: "white",
    borderRadius: 10,
    marginVertical: 10,
    width: "86%",
    marginTop: 20,
  },
  searchbar: {
    flex: 1, 
    backgroundColor: "white",
    borderRadius: 10,
    marginRight: 10,
  },
  buttonSearch: {
    backgroundColor: "#0D47A1", 
    padding: 10,
    borderRadius: 10,
    minWidth: "15%",
  },
  icon: {
    color: "black",
    marginTop: 10.5,
  },
  dropdown: {
    position: "absolute",
    top: 60,
    right: 5,
    backgroundColor: "white",
    borderRadius: 8,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: "700%",
    zIndex: 10,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  dropdownText: {
    fontSize: 14,
    color: "black",
  },
  scrollViewContent: {
    flexGrow: 1, 
    marginHorizontal: 20,
    marginVertical: 10,
  },
  card: {
    width: 360,
    marginVertical: 1,
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
    flexDirection: "row",
  },
  cardTexts: {
    fontSize: 15,
    color: "black",
  },

  eye: {
    backgroundColor: "#0D47A1",
    marginTop: 40,
    height: 40,
    borderRadius: 10,
    minWidth: 10,
    marginStart: 250,
    position: "absolute",
  },
  yearpick: {
    marginTop: 25,
    // marginStart: 270,/
    backgroundColor: "white",
    height: 31,
    borderRadius: 5,
  }
});
