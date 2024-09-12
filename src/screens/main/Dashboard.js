import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Button, Colors } from "react-native-ui-lib";
import { Picker } from "@react-native-picker/picker";
import { LineChart } from "react-native-chart-kit";
import axios from "@/src/libs/axios";
import { useUser } from "@/src/services";
import { rupiah } from "@/src/libs/utils";
import { useNavigation } from "@react-navigation/native";

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const requestTypes = [
    { label: "Permohonan Baru", value: "new" },
    { label: "Permohonan Proses", value: "process" },
    { label: "Permohonan Selesai", value: "completed" },
    { label: "Total Permohonan", value: "total" },
  ];
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [tahuns, setTahuns] = useState([]);
  const { data: user } = useUser();
  const navigation = useNavigation();

  const Penerima = () => {
    navigation.navigate("Penerima");
  };

  const handlePress = () => {
    const uuid = '7cd62078-6101-4ef3-ad6f-28afe23d81b9';
    navigation.navigate("Penerima", { uuid });
  }

  useEffect(() => {
    const years = [];
    for (let i = tahun; i >= 2022; i--) {
      years.push({ id: i, text: i });
    }
    setTahuns(years);
  }, [tahun]);
  // axios.get("/dashboard/get", {
  //   params: {
  //     tahun: 2024, // Misalnya, tahun 2024
  //   },
  // })

  useEffect(() => {
    axios
      .post("/dashboard/" + user.role.name, { tahun: tahun })
      .then(response => {
        setDashboard(response.data);
      })
      .catch(error => {
        console.error("error fetching data dashboard ", error);
      });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
        />
        <Text style={styles.headerText}>SI - LAJANG</Text>
      </View>
      {/* <View
        style={[
          styles.searchFilterContainer,
          { backgroundColor: Colors.brand },
        ]}>
        <Picker
          selectedValue={selectedRequestType}
          style={styles.picker}
          onValueChange={itemValue => setSelectedRequestType(itemValue)}>
          <Picker.Item label="Pilih Jenis Permohonan" value="" />
          {requestTypes.map(type => (
            <Picker.Item
              key={type.value}
              label={type.label}
              value={type.value}
            />
          ))}
        </Picker>
        <Picker
          selectedValue={selectedYear}
          style={styles.picker}
          onValueChange={itemValue => setSelectedYear(itemValue)}>
          <Picker.Item label="Tahun" value="" />
          {years.map(year => (
            <Picker.Item key={year} label={year} value={year} />
          ))}
        </Picker>
        <Picker
          selectedValue={selectedMonth}
          style={styles.picker}
          onValueChange={itemValue => setSelectedMonth(itemValue)}>
          <Picker.Item label="Bulan" value="" />
          {months.map(month => (
            <Picker.Item
              key={month.value}
              label={month.label}
              value={month.value}
            />
          ))}
        </Picker>
      </View> */}
      <ScrollView
        contentContainerStyle={styles.scrollViewContainer}
        showsVerticalScrollIndicator={false}>
        {dashboard ? (
          <>
            <View style={[styles.cardContainer, styles.cardNew]}>
              <View style={styles.row}>
                <Image
                  source={require("@/assets/images/folder.png")}
                  style={styles.logoFiles}
                />
                <Text style={[styles.cardNumber, styles.card1]}>
                  {dashboard.customers}
                </Text>
              </View>
              <Text style={[styles.cardInfoValue, styles.cardTextColor]}>
                Customers
              </Text>
            </View>
            <View style={[styles.cardContainer, styles.cardProcess]}>
              <View style={styles.row}>
                <Image
                  source={require("@/assets/images/process.png")}
                  style={styles.logoProcess}
                />
                <Text style={[styles.cardNumber, styles.card2]}>
                  {dashboard.allSampels}
                </Text>
              </View>
              <Text style={[styles.cardInfoValue, styles.cardTextColor]}>
                Total Permohonan
              </Text>
            </View>
            <View style={[styles.cardContainer, styles.cardCompleted]}>
              <View style={styles.row}>
                <Image
                  source={require("@/assets/images/checked.png")}
                  style={styles.logoChecked}
                />
                <Text style={[styles.cardNumber, styles.card3]}>
                  {dashboard.newSampels}
                </Text>
              </View>
              <Text style={[styles.cardInfoValue, styles.cardTextColor]}>
                Persetujuan Permohonan
              </Text>
            </View>
            <View style={[styles.cardContainer, styles.cardTotal]}>
              <View style={styles.row}>
                <Image
                  source={require("@/assets/images/select-all.png")}
                  style={styles.logoSelectAll}
                />
                <Text style={[styles.cardNumber, styles.card4]}>
                  {dashboard.undoneSampels}
                </Text>
              </View>
              <Text style={[styles.cardInfoValue, styles.cardTextColor]}>
                Sampel Belum Dianalisa
              </Text>
            </View>
            <View style={[styles.cardContainer, styles.cardTotal]}>
              <View style={styles.row}>
                <Image
                  source={require("@/assets/images/select-all.png")}
                  style={styles.logoSelectAll}
                />
                <Text style={[styles.cardNumber, styles.card4]}>
                  {dashboard.unverifSampels}
                </Text>
              </View>
              <Text style={[styles.cardInfoValue, styles.cardTextColor]}>
                Dokumen Belum DIverifikasi
              </Text>
            </View>
            <View style={[styles.cardContainer, styles.cardTotal]}>
              <View>
                <Image
                  source={require("@/assets/images/select-all.png")}
                  style={styles.logoSelectAll}
                />
                <Text style={[styles.cardCurrency, styles.card4]}>
                  {rupiah(dashboard.revenue)}
                </Text>
              </View>
              <Text style={[styles.cardInfoValue, styles.cardTextColor]}>
                Pendapatan
              </Text>
            </View>
          </>
        ) : (
          <Text style={styles.text}>Loading...</Text>
        )}
        <Button 
        onPress={handlePress}>
          <Text>Penerima</Text>
        </Button>
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {
              "2024 ©SI-LAJANG v.3 \nSistem Informasi Laboratorium Lingkungan Jombang"
            }
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
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
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingVertical: 10,
  },
  cardContainer: {
    width: "45%",
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
    borderColor: "#828cff",
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
    borderColor: "#5a3dff",
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
    borderColor: "#f2416e",
    borderTopWidth: 6,
  },
  cardNumber: {
    fontSize: 35,
    fontWeight: "800",
    marginHorizontal: 12,
  },
  cardCurrency: {
    fontSize: 17,
    fontWeight: "800",
    marginHorizontal: 12,
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
    color: "#828cff",
  },
  card2: {
    color: "#5a3dff",
  },
  card3: {
    color: "#008000",
  },
  card4: {
    color: "#f2416e",
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
