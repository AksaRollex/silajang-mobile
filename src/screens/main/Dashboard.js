import axios from "@/src/libs/axios";
import { rupiah } from "@/src/libs/utils";
import { useUser } from "@/src/services";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Fontisto from "react-native-vector-icons/Fontisto";
import IonIcons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { TextFooter } from "../components/TextFooter";

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
    user.role.name == 'customer' ? 
    axios
      .post("/dashboard/" + 'customer', { tahun: tahun })
      .then(response => {
        setDashboard(response.data);
      })
      .catch(error => {
        console.error("error fetching data dashboard ", error);
      })
      :
      axios
      .post("/dashboard/" + 'admin', { tahun: tahun })
      .then(response => {
        setDashboard(response.data);
      })
      .catch(error => {
        console.error("error fetching data dashboard ", error);
      })
  }, []);

  return (
      <ScrollView
        contentContainerStyle={styles.scrollViewContainer}
        showsVerticalScrollIndicator={false}>
        {dashboard ? (
          <>
            {user.role.name === 'customer' ? (
              <>
                <View style={[styles.cardContainer, styles.cardNew]}>
                  <View style={styles.row}>
                    <MaterialIcons name="people-alt" size={34} color={"#828cff"} />
                    <Text style={[styles.cardNumber, styles.card1]}>
                      {dashboard.permohonanBaru}
                    </Text>
                  </View>
                  <Text style={[styles.cardInfoValue, styles.cardTextColor]}>
                    Permohonan Baru
                  </Text>
                </View>

                <View style={[styles.cardContainer, styles.cardCompleted]}>
                  <View style={styles.row}>
                    <FontAwesome5 name="leaf" size={30} color={"#ffc300"} />
                    <Text style={[styles.cardNumber, styles.card3]}>
                      {dashboard.permohonanDiproses}
                    </Text>
                  </View>
                  <Text style={[styles.cardInfoValue, styles.cardTextColor]}>
                    Permohonan Diproses
                  </Text>
                </View>

                <View style={[styles.cardContainer, styles.cardTotal]}>
                  <View style={styles.row}>
                    <FontAwesome5 name="book-open" size={32} color={"#50cc88"} />
                    <Text style={[styles.cardNumber, styles.card4]}>
                      {dashboard.permohonanSelesai}
                    </Text>
                  </View>
                  <Text style={[styles.cardInfoValue, styles.cardTextColor]}>
                    Permohonan Selesai
                  </Text>
                </View>

                <View style={[styles.cardContainer, styles.cardProcess]}>
                  <View style={styles.row}>
                    <FontAwesome5 name="wallet" size={32} color={"#5a3dff"} />
                    <Text style={[styles.cardNumber, styles.card2]}>
                      {dashboard.permohonanTotal}
                    </Text>
                  </View>
                  <Text style={[styles.cardInfoValue, styles.cardTextColor]}>
                    Total Permohonan
                  </Text>
                </View>
          <TextFooter />

              </> 
            ) : (
              <>
                {['admin', 'kepala-upt'].includes(user.role.name) && (
                <View className="w-[45%] h-36 my-2 rounded-lg p-5 flex flex-col shadow-lg bg-white border-t-[6px] border-[#828cff]">
                  <View className="flex-row items-center">
                    <MaterialIcons name="people-alt" size={34} color={"#828cff"} />
                    <Text className="text-[35px] font-extrabold mx-3 text-[#828cff]">
                      {dashboard.customers}
                    </Text>
                  </View>
                  <Text className="text-[16px] font-medium text-black text-left">
                    Customers
                  </Text>
                </View> 
                )}

                {['admin', 'kepala-upt', 'koordinator-administrasi'].includes(user.role.name) && ( 
                <View className="w-[45%] h-36 my-2 rounded-lg p-5 flex flex-col shadow-lg bg-white border-t-[6px] border-[#5a3dff]">
                  <View className="flex-row items-center">
                    <FontAwesome5 name="file-contract" size={30} color={"#5a3dff"} />
                    <Text className="text-[35px] font-extrabold mx-3 text-[#5a3dff]">
                      {dashboard.allSampels}
                    </Text>
                  </View>
                  <Text className="text-[16px] font-medium text-black text-left">
                    Total Permohonan
                  </Text>
                </View> 
                )}

                {['admin', 'kepala-upt', 'koordinator-administrasi'].includes(user.role.name) && (
                <View className="w-[45%] h-36 my-2 rounded-lg p-5 flex flex-col shadow-lg bg-white border-t-[6px] border-[#ffc300]">
                  <View className="flex-row items-center">
                    <FontAwesome5 name="check-circle" size={30} color={"#ffc300"} />
                    <Text className="text-[35px] font-extrabold mx-3 text-[#ffc300]">
                      {dashboard.newSampels}
                    </Text>
                  </View>
                  <Text className="text-[16px] font-medium text-black text-left">
                    Persetujuan Permohonan
                  </Text>
                </View>
                )}

                {['admin', 'kepala-upt', 'koordinator-administrasi'].includes(user.role.name) && (
                <View className="w-[45%] h-36 my-2 rounded-lg p-5 flex flex-col shadow-lg bg-white border-t-[6px] border-[#f2416e]">
                  <View className="flex-row items-center">
                    <Fontisto name="laboratory" size={30} color={"#f2416e"} />
                    <Text className="text-[35px] font-extrabold mx-3 text-[#f2416e]">
                      {dashboard.undoneSampels}
                    </Text>
                  </View>
                  <Text className="text-[16px] font-medium text-black text-left">
                    Sampel Belum Dianalisa
                  </Text>
                </View>
                )}

                {['admin', 'kepala-upt', 'koordinator-administrasi'].includes(user.role.name) && (
                <View className="w-[45%] h-36 my-2 rounded-lg p-5 flex flex-col shadow-lg bg-white border-t-[6px] border-[#f2416e]">
                  <View className="flex-row items-center">
                    <IonIcons name="document-text" size={30} color={"#f2416e"} />
                    <Text className="text-[35px] font-extrabold mx-3 text-[#f2416e]">
                      {dashboard.unverifSampels}
                    </Text>
                  </View>
                  <Text className="text-[16px] font-medium text-black text-left">
                    Dokumen Belum Diverifikasi
                  </Text>
                </View>
                )}

                {['admin', 'kepala-upt', 'koordinator-teknis', 'koordinator-administrasi'].includes(user.role.name) && (
                <View className="w-[45%] h-36 my-2 rounded-lg p-5 flex flex-col shadow-lg bg-white border-t-[6px] border-[#0fd194]">
                  <View>
                    <FontAwesome5 name="coins" size={30} color={"#0fd194"} />
                    <Text className="text-[18px] font-extrabold text-[#0fd194]" >
                      {rupiah(dashboard.revenue)}
                    </Text>
                  </View>
                  <Text className="text-[16px] font-medium text-black text-left">
                    Pendapatan
                  </Text>
                </View>
                )}

                <View className="w-[45%] h-36 my-2 rounded-lg p-5 flex flex-col shadow-lg bg-white border-t-[6px] border-[#0090a6]">
                  <View className="flex flex-row">
                    <FontAwesome5 name="medal" size={30} color={"#0090a6"} />
                    <Text className="text-3xl font-extrabold mx-3 text-[#0090a6]" >
                      {dashboard.total?.toFixed(2)}
                    </Text>
                  </View>
                  <Text className="text-[16px] font-medium text-black text-left">
                    IKM Unit Pelayanan
                  </Text>
                </View>

                <View className="w-[45%] h-36 my-2 rounded-lg p-5 flex flex-col shadow-lg bg-white border-t-[6px] border-[#0090a6]">
                  <View className="flex flex-row">
                    <IonIcons name="clipboard" size={30} color={"#0090a6"} />
                    <Text className="text-3xl font-extrabold mx-3 text-[#0090a6]" >
                      {dashboard.jumlah}
                    </Text>
                  </View>
                  <Text className="text-[16px] font-medium text-black text-left">
                    Jumlah Responden
                  </Text>
                </View>
              </>
            )}
  
          </>
        ) : (
          <View className="h-full justify-center"><ActivityIndicator size={"large"} color={"#312e81"} /></View>
        )}

      </ScrollView>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d47a133",
  },
  headerContainer: {
    width: "100%",
    paddingVertical: 10,
    backgroundColor: "#312e81",
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
    height: 140,
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
    borderColor: "#ffc300",
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
    borderColor: "#50cc88",
    borderTopWidth: 6,
  },
  cardTotals: {
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
    borderColor: "#0fd194",
    borderTopWidth: 6,
  },
  cardLast: {
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
    borderColor: "#0090a6",
    borderTopWidth: 6,
  },
  cardNumber: {
    fontSize: 35,
    fontWeight: "800",
    marginHorizontal: 12,
  },
  cardCurrency: {
    fontSize: 18,
    fontWeight: "800",
    marginHorizontal: 6,
  },
  cardTextColor: {
    color: "black",
  },
  cardInfoValue: {
    fontSize: 16,
    fontWeight: "500",
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
    color: "#ffc300",
  },
  card4: {
    color: "#50cc88",
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
