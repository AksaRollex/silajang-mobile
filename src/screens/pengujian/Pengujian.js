import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import Header from "../components/Header";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "@/src/services";
import FooterText from "../components/FooterText";
import axios from "@/src/libs/axios";
import { Colors } from "react-native-ui-lib";
import { color } from "@rneui/base";
import { useQuery } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

export default function Pengujian() {
  const [refreshing, setRefreshing] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const { data: user } = useUser();
  const [data, setData] = useState([])

  const navigation = useNavigation();
  const window = useWindowDimensions();
  // const [tahun, setTahun] = useState(new Date().getFullYear());

  const currentYear = new Date().getFullYear();

  const fetchUserData = useCallback(() => {
    setLoading(true);
    setRefreshing(true);
    axios
      .post("/dashboard/" + user.role.name, { tahun: currentYear })
      .then(response => {
        setDashboard(response.data);
      })
      .catch(() => {
        console.error("error fetching data dashboard", error);
      })
      .finally(() => {
        setRefreshing(false);
        setLoading(false);
      });
  }, [user.role.name]);

  // const fetchData = useCallback(() => {
  //   setLoading(true);
  //   setRefreshing(true);
  //   axios.get('/dashboard/history')
  //     .then(response => {
  //       setData(response.data.data);
  //       console.log(response.data.data)
  //   }).catch(() => {
  //       console.error("error fetching data dashboard", error);
  //   }).finally(() => {
  //       setRefreshing(false);
  //       setLoading(false);
  //   })
  // })

  useQuery({
    queryKey: ["history"],
    queryFn: async () => await axios.get('/dashboard/history').then((res) => res.data.data),
    onSuccess: data => {
      console.log(data)
      setData(data)
    },
    onError: err => console.error(err),
  })

  
  useEffect(() => {
    fetchUserData();
    // fetchData();
  }, [fetchUserData]);


  // Data dummy untuk statistik
  const stats = [
    {
      label: "Permohonan Baru",
      value: dashboard?.permohonanBaru || "0",
      icon: "assessment",
      color: "#FF9800",
    },
    {
      label: "Permohonan Diproses",
      value: dashboard?.permohonanDiproses || "0",
      icon: "pending",
      color: "#2196F3",
    },
    {
      label: "Permohonan Selesai",
      value: dashboard?.permohonanSelesai || "0",
      icon: "check-circle",
      color: "#4CAF50",
    },
  ];

  const mainMenus = [
    {
      title: "Permohonan Baru",
      icon: "add-circle",
      screen: "Permohonan",
      color: "#4CAF50",
      description: "Buat permohonan pengujian baru",
    },
    {
      title: "Tracking Pengujian",
      icon: "timeline",
      screen: "TrackingPengujian",
      color: "#2196F3",
      description: "Pantau progres pengujian",
    },
  ];

  const recentActivity = [
    { title: "Pengujian #123", status: "Dalam Proses", date: "22 Oct 2024" },
    { title: "Pengujian #122", status: "Selesai", date: "20 Oct 2024" },
  ];

  return (
    <>
      <View style={styles.container}>
        <ScrollView
          className="flex-col"
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[]}>

        <Header
          navigate={() => {
            navigation.navigate("Profile");
          }}
          />
        <View
          className="min-h-[100px] relative shadow-lg z-10 mb-16"
          style={{ backgroundColor: Colors.brand }}>
          {/* Welcome Section */}
          <View style={styles.welcomeCard}>
            <View style={styles.welcomeSection}>
              <Text className="text-center" style={styles.welcomeText}>
                Pengujian
              </Text>
              <Text className="text-center" style={styles.dateText}>
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Statistics Section */}
          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: stat.color },
                  ]}>
                  <MaterialIcons name={stat.icon} size={24} color="white" />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Main Menu Grid */}
          <Text style={styles.sectionTitle}>Menu Utama</Text>
          <View style={styles.menuGrid}>
            {mainMenus.map((menu, index) => (
              <TouchableOpacity
              key={index}
              style={styles.menuCard}
              onPress={() => navigation.navigate(menu.screen)}>
                <View
                  style={[
                    styles.menuIconContainer,
                    { backgroundColor: menu.color },
                  ]}>
                  <MaterialIcons name={menu.icon} size={32} color="white" />
                </View>
                <Text style={styles.menuTitle}>{menu.title}</Text>
                <Text style={styles.menuDescription}>{menu.description}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Recent Activity Section */}
          <Text style={styles.sectionTitle}>Aktivitas Terakhir</Text>
          <View style={styles.activityContainer}>
            {data?.map((activity, index) => (
              <TouchableOpacity key={index} style={styles.activityCard}>
                <View style={styles.activityHeader}>
                  <View className="flex-1 gap-2">
                  <Text style={styles.activityTitle}>{activity.lokasi}</Text>
                  <Text style={styles.activityTitle}>{activity.keterangan}</Text>
                  <Text style={styles.activityTitle}>{activity.tanggal}</Text>
                  <Text style={styles.activityTitle}>{activity.permohonan?.industri}</Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                        activity.status === "Selesai" ? "#E8F5E9" : "#E3F2FD",
                      },
                    ]}>
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                          activity.status === "Selesai"
                          ? "#2E7D32"
                          : "#1565C0",
                        },
                      ]}>
                      {activity.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.activityDate}>{activity.date}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f1f1",
  },
  scrollContent: {
    padding: 16,
  },
  welcomeSection: {
    marginBottom: 20,
  },
  // welcomeText: {
  //   fontSize: 24,
  //   color: "#333",
  //   fontFamily: "Poppins-SemiBold",
  // },
  // dateText: {
  //   fontSize: 14,
  //   color: "#666",
  //   marginTop: 4,
  //   fontFamily: "Poppins-Regular",
  // },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    width: width / 3.5,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Poppins-SemiBold",
    color: "#333",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    fontFamily: "Poppins-Regular",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  menuCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    width: "48%",
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  menuTitle: {
    fontSize: 17,
    color: "#333",
    fontFamily: "Poppins-SemiBold",
    marginBottom: 8,
  },
  menuDescription: {
    fontSize: 13,
    color: "#666",
    lineHeight: 16,
    fontFamily: "Poppins-Regular",
  },
  activityContainer: {
    marginBottom: 24,
  },
  activityCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    fontFamily: "Poppins-SemiBold",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  activityDate: {
    fontSize: 12,
    color: "#666",
  },
  welcomeCard: {
    backgroundColor: "#FFFFFF",
    zIndex: 10,
    borderRadius: 12,
    width: "85%",
    top: 55,
    alignItems: "center",
    marginHorizontal: 31,
    position: "absolute",
    padding: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    elevation: 10,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  welcomeSection: {
    // Hapus marginBottom jika sudah ada
  },
  welcomeText: {
    fontSize: 21,
    color: "#333",
    fontFamily: "Poppins-SemiBold",
  },
  dateText: {
    fontSize: 14,
    color: "#666",
    marginTop: 3,
    fontFamily: "Poppins-Regular",
    alignItems: "center",
  },
});
