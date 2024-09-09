import { View, Text, StyleSheet, Image } from 'react-native'
import React from 'react'
import { Searchbar } from "react-native-paper";
import { Colors, Button } from "react-native-ui-lib";

export default function PengambilanSampel() {
  const [searchQuery, setSearchQuery] = React.useState("");

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
    </View>
  )
};

const styles = StyleSheet.create({

  headerText: {
    fontSize: 22,
    color: "white",
    fontWeight: "bold",
    marginLeft: 10, // Beri jarak antara logo dan teks
    alignSelf: "center", // Vertically align the text to the center
  },
  searchIcon: {
    width: 24,
    height: 24,
  },
  logo: {
    width: 40,
    height: 40,
    marginTop: 8,
  },
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(13, 71, 161, 0.2)",
  },
  headerContainer: {
    width: "100%",
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: '#0D47A1',
    flexDirection: "row", // Menyusun elemen secara horizontal
    elevation: 4,
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
})