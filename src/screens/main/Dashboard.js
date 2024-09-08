import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  RefreshControl,
} from "react-native";
import { Colors } from "react-native-ui-lib";
import { Picker } from "@react-native-picker/picker";
import { LineChart } from "react-native-chart-kit";
import axios from "@/src/libs/axios";
import { useUser } from "@/src/services";

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // refresh
  useEffect(() => {
    fetchUserData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setRefreshing(false);
    fetchUserData();
  };

  const requestTypes = [
    { label: "Permohonan Baru", value: "new" },
    { label: "Permohonan Proses", value: "process" },
    { label: "Permohonan Selesai", value: "completed" },
    { label: "Total Permohonan", value: "total" },
  ];

  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [tahuns, setTahuns] = useState([]);
  const { data: user } = useUser();

  useEffect(() => {
    const years = [];
    for (let i = tahun; i >= 2022; i--) {
      years.push({ id: i, text: i });
    }
    setTahuns(years);
  }, [tahun]);

  const fetchUserData = () => {
    axios
      .post("/dashboard/" + user.role.name, { tahun: tahun })
      .then(response => {
        console.log("response data dashboard : ", response.data);
        setDashboard(response.data);
      })
      .catch(error => {
        console.error("error fetching data dashboard ", error);
      }, []);
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
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollViewContainer} // Updated styles
        showsVerticalScrollIndicator={false}>
        <View style={styles.gridContainer}>
          {dashboard ? (
            <>
              <View style={[styles.cardContainer, styles.cardNew]}>
                <View style={styles.row}>
                  <Image
                    source={require("@/assets/images/folder.png")}
                    style={styles.logoFiles}
                  />
                  <Text style={[styles.cardNumber, styles.card1]}>
                    {dashboard.permohonanBaru}
                  </Text>
                </View>
                <Text style={[styles.cardInfoValue, styles.cardTextColor]}>
                  Permohonan Baru
                </Text>
              </View>
              <View style={[styles.cardContainer, styles.cardProcess]}>
                <View style={styles.row}>
                  <Image
                    source={require("@/assets/images/process.png")}
                    style={styles.logoProcess}
                  />
                  <Text style={[styles.cardNumber, styles.card2]}>
                    {dashboard.permohonanDiproses}
                  </Text>
                </View>
                <Text style={[styles.cardInfoValue, styles.cardTextColor]}>
                  Permohonan Proses
                </Text>
              </View>
              <View style={[styles.cardContainer, styles.cardCompleted]}>
                <View style={styles.row}>
                  <Image
                    source={require("@/assets/images/checked.png")}
                    style={styles.logoChecked}
                  />
                  <Text style={[styles.cardNumber, styles.card3]}>
                    {dashboard.permohonanSelesai}
                  </Text>
                </View>
                <Text style={[styles.cardInfoValue, styles.cardTextColor]}>
                  Permohonan Selesai
                </Text>
              </View>
              <View style={[styles.cardContainer, styles.cardTotal]}>
                <View style={styles.row}>
                  <Image
                    source={require("@/assets/images/select-all.png")}
                    style={styles.logoSelectAll}
                  />
                  <Text style={[styles.cardNumber, styles.card4]}>
                    {dashboard.permohonanTotal}
                  </Text>
                </View>
                <Text style={[styles.cardInfoValue, styles.cardTextColor]}>
                  Total Permohonan
                </Text>
              </View>
            </>
          ) : (
            <Text style={{ color: "black", fontSize: 15, textAlign: "center" }}>
              Loading...
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(13, 71, 161, 0.2)",
  },
  headerContainer: {
    width: "100%",
    paddingVertical: 10,
    backgroundColor: Colors.brand,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    elevation: 4,
  },
  logo: {
    width: 40,
    height: 40,
    marginTop: 8,
  },
  logoFiles: {
    width: 55,
    height: 55,
  },
  logoProcess: {
    width: 55,
    height: 55,
  },
  logoChecked: {
    width: 55,
    height: 55,
  },
  logoSelectAll: {
    width: 55,
    height: 55,
  },
  headerText: {
    fontSize: 22,
    color: "white",
    fontWeight: "bold",
    marginLeft: 10,
    alignSelf: "center",
  },
  searchFilterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "white",
  },
  picker: {
    width: 90,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    color: "black",
    backgroundColor: "white",
  },
  scrollViewContainer: {
padding : 10    
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between", // Adjust space between items
  },
  cardContainer: {
    width: "48%", // Adjust to ensure it fits in a 2x2 grid
    height: 160,
    marginVertical: 10,
    borderRadius: 7,
    padding: 20,
    flexDirection: "column",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardNew: {
    backgroundColor: "white",
    shadowColor: "white",
    borderTopColor: "white",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
    borderColor: "#FFA500",
    borderTopWidth: 6,
  },
  cardProcess: {
    backgroundColor: "white",
    shadowColor: "white",
    borderTopColor: "white",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
    borderColor: "#6b7fde",
    borderTopWidth: 6,
  },
  cardCompleted: {
    backgroundColor: "white",
    shadowColor: "white",
    borderTopColor: "white",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
    borderColor: "#008000",
    borderTopWidth: 6,
  },
  cardTotal: {
    backgroundColor: "white",
    shadowColor: "white",
    borderTopColor: "white",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
    borderColor: "black",
    borderTopWidth: 6,
  },
  cardNumber: {
    fontSize: 55,
    letterSpacing: 4,
    marginHorizontal: 20,
  },
  cardTextColor: {
    color: "black",
  },
  cardInfoValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
    textAlign: "left",
  },
  card1: {
    color: "#FFA500",
  },
  card2: {
    color: "#6b7fde",
  },
  card3: {
    color: "#008000",
  },
  card4: {
    color: "black",
  },
  chartContainer: {
    marginVertical: 20,
  },
  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 5,
    backgroundColor: "rgba(100,100,100,0.2)",
  },
  chartHeaderText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
    marginLeft: 8, // memberikan jarak antara gambar dan teks
  },
  chartStyle: {
    marginTop: 8,
    marginBottom: 40,
    borderRadius: 10,
  },
  logoFiles: {
    width: 24,
    height: 24,
  },
  logoProcess: {
    width: 24,
    height: 24,
  },
  logoChecked: {
    width: 24,
    height: 24,
  },
  logoSelectAll: {
    width: 24,
    height: 24,
  },
  footer: {
    padding: 10,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    textAlign: "center",
    color: "gray",
  },
});

export default Dashboard;
