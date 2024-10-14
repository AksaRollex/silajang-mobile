import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Colors } from "react-native-ui-lib";
import axios from "@/src/libs/axios";
import { useUser } from "@/src/services";
import Header from "../components/Header";
import FooterText from "../components/FooterText";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/AntDesign";
import RNPickerSelect from 'react-native-picker-select';
import Entypo from "react-native-vector-icons/Entypo";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

const rem = multiplier => baseRem * multiplier;
const baseRem = 16;

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [tahuns, setTahuns] = useState([]);
  const { data: user } = useUser();
  const navigation = useNavigation();

  const fetchUserData = useCallback(() => {
    setRefreshing(true);
    axios
      .post("/dashboard/" + user.role.name, { tahun: tahun })
      .then(response => {
        setDashboard(response.data);
      })
      .catch(error => {
        console.error("error fetching data dashboard ", error);
      })
      .finally(() => {
        setRefreshing(false);
      });
  }, [tahun, user.role.name]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 2021 }, (_, i) => ({
      id: currentYear - i,
      text: `${currentYear - i}`,
    }));
    setTahuns(years);
  }, []);

  const handleYearChange = useCallback(itemValue => {
    setTahun(itemValue);
  }, []);

  const onRefresh = useCallback(() => {
    fetchUserData();
  }, [fetchUserData]);

  return (
    <View style={styles.container}>
      <Header navigate={() => {navigation.navigate("Profile")}} />
      <View className="p-4 flex items-end">
      <View>
      <RNPickerSelect
        onValueChange={handleYearChange}
        items={tahuns.map(item => ({ label: item.text, value: item.id }))}
        value={tahun}
        style={{
          inputIOS: {
            paddingHorizontal: rem(3.55),
            borderWidth: 3,
            color: "black",
          },
          inputAndroid: {
            paddingHorizontal: rem(3.55),
            borderWidth: 3,
            color: "black",
          },
        }}
        Icon={() => {
          return <MaterialIcons style={{marginTop: 16, marginRight: 12}} name="keyboard-arrow-down" size={24} color="black" />;
        }}
      />
      </View>
    </View>
      <ScrollView
        contentContainerStyle={styles.scrollViewContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.gridContainer}>
          {dashboard ? (
            <>
              <DashboardCard
                style={styles.cardNew}
                number={dashboard.permohonanBaru}
                text="Permohonan Baru"
                numberStyle={styles.card1}
                icon={'users'}
                iconColor={"#FFA500"}
              />
              <DashboardCard
                style={styles.cardProcess}
                number={dashboard.permohonanDiproses}
                text="Permohonan Proses"
                numberStyle={styles.card2}
                icon={'leaf'}
                iconColor={"#6b7fde"}
              />
              <DashboardCard
                style={styles.cardCompleted}
                number={dashboard.permohonanSelesai}
                text="Permohonan Selesai"
                numberStyle={styles.card3}
                icon={'check'}
                iconColor={"#008000"}
              />
              <DashboardCard
                style={styles.cardTotal}
                number={dashboard.permohonanTotal}
                text="Total Permohonan"
                numberStyle={styles.card4}
                icon={'wallet'}
                iconColor={"#321e81"}

              />
            </>
          ) : (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size={"large"} color={"#312e81"} />
            </View>
          )}
        </View>
        <FooterText />
      </ScrollView>
    </View>
  );
};

const DashboardCard = ({ style, number, text, imageSource, numberStyle, icon, iconColor }) => (
  <View style={[styles.cardContainer, style]}>
    <View style={styles.row}>
      <Entypo name={icon} size={30} color={iconColor} />
      <Text style={[styles.cardNumber, numberStyle]}>{number}</Text>
    </View>
    <Text style={[styles.cardInfoValue, styles.cardTextColor]}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ececec",
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
  badge: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 8,
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
    paddingHorizontal: rem(3.55),
    borderWidth: 3,
    color: "black",
    backgroundColor: "white",
  },
  scrollViewContainer: {
    padding: 10,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20
  },
  cardContainer: {
    width: "48%",
    height: 160,
    borderRadius: 7,
    padding: 20,
    flexDirection: "column",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardNew: {
    backgroundColor: "#f8f8f8",
    shadowColor: "#ffffff",
    borderTopColor: "#ffffff",
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
    borderColor: "#312e81",
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
    color: "#312e81",
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
    marginLeft: 8,
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
