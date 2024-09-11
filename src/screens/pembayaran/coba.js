import { View, Text, StyleSheet, Image, ScrollView } from 'react-native'
import React from 'react'
import { Searchbar } from "react-native-paper";
import { Colors, Button } from "react-native-ui-lib";
import Ionicons from "react-native-vector-icons/Ionicons";
import Icon from "react-native-vector-icons/Entypo"
import { black } from 'react-native-paper/lib/typescript/styles/themes/v2/colors';

export default function PengambilanSampel() {
  const [searchQuery, setSearchQuery] = React.useState("");

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
          <Icon
            name={"dots-three-vertical"}
            size={25}
            style={styles.icon}/>
        </View>
        </View>

        <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.row}>
          <View style={[styles.card, { marginTop: 25}]}>
            <View style={styles.cards}>
              <Text style={[styles.cardTexts, { fontSize: 15 }]}>
                10 Agustus 2024{" "}
              </Text>
              <Text style={styles.cardTexts}>20.000</Text>
              <Text style={[styles.cardTexts, { fontSize: 15 }]}>
                10 Agustus 2024{" "}
              </Text>
              <Text style={styles.cardTexts}>20.000</Text>
            </View>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.card}>
            <View style={styles.cards}>
              <Text style={[styles.cardTexts, { fontSize: 15 }]}>
                10 Agustus 2024{" "}
              </Text>
              <Text style={styles.cardTexts}>20.000</Text>
              <Text style={[styles.cardTexts, { fontSize: 15 }]}>
                10 Agustus 2024{" "}
              </Text>
              <Text style={styles.cardTexts}>20.000</Text>
            </View>
          </View>
        </View>
      
      </ScrollView>

    </View>
  )
};

const styles = StyleSheet.create({

  searchRow: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "space-around",
    alignItems: "center",
    width: "92%",
    marginStart: "2%"
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
    flexDirection: "row", // Mengatur elemen dalam satu baris
    alignItems: "center", // Mengatur elemen agar rata secara vertikal
    justifyContent: "space-between", // Mengatur spasi antara elemen jika diperlukan
    paddingHorizontal: 10,
    paddingVertical: 0, 
    backgroundColor: "white",
    borderRadius: 10,
    marginVertical: 10,
    width: "85%",
    marginTop: 20,
    flexDirection: "row",
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
    minWidth: "15%",
  },
  icon: {
    color: "black",
    marginTop: 10.5,
  },

  scrollViewContent: {
    flexGrow: 1, // Ensures that ScrollView content is scrollable
    marginHorizontal: 20,
    marginVertical: 10,
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
  cardTexts: {
    fontSize: 15,
    color: "black",
  },
})