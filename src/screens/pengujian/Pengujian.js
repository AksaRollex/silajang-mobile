import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ImageBackground,
  RefreshControl,
} from "react-native";
import Header from "../components/Header";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "@/src/services";
import axios from "@/src/libs/axios";
import { useQuery } from "@tanstack/react-query";
const { width } = Dimensions.get("window");

export default function Pengujian() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const { data: user } = useUser();
  const [data, setData] = useState([]);
  
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchUserData();
    refetch();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, [fetchUserData, refetch]);

  const navigation = useNavigation();

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

  const { refetch } = useQuery({
    queryKey: ["historiPengujian"],
    queryFn: async () =>
      await axios.get("/dashboard/history").then(res => res.data.data),

    onSuccess: data => {
      console.log(data);
      setData(data);
    },
    onError: err => console.error(err),
  });

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

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

  return (
    <>
      <View style={styles.container}>
        <ScrollView
          className="flex-col"
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <ImageBackground
            source={require("../../../assets/images/background.png")}
            style={{
              flex: 1,
              height: "70%",
            }}>
            <Header
              navigate={() => {
                navigation.navigate("Profile");
              }}
            />
            <View className="min-h-[100px] relative shadow-lg bottom-4 z-10 mb-11">
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
          </ImageBackground>

          <ScrollView contentContainerStyle={styles.scrollContent}>
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

            <Text style={styles.sectionTitle}>Aktivitas Terakhir</Text>
            <View style={styles.activityContainer}>
              {data?.map((activity, index) => (
                <View key={index} style={styles.activityCard}>
                  <View style={styles.activityBadge}>
                    <MaterialIcons name="assignment" size={20} color="#FFF" />
                  </View>

                  <View style={styles.activityContent}>
                    <View style={styles.activityHeader}>
                      <View style={styles.locationContainer}>
                        <MaterialIcons
                          name="location-on"
                          size={16}
                          color="#4CAF50"
                        />
                        <Text style={styles.locationText} numberOfLines={1}>
                          {activity.lokasi}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoSection}>
                      <View style={styles.infoRow}>
                        <MaterialIcons name="business" size={16} color="#666" />
                        <Text style={styles.infoLabel}>Permohonan:</Text>
                        <Text style={styles.infoValue} numberOfLines={1}>
                          {activity.permohonan?.industri}
                        </Text>
                      </View>

                      <View style={styles.infoRow}>
                        <MaterialIcons name="event" size={16} color="#666" />
                        <Text style={styles.infoLabel}>Tanggal:</Text>
                        <Text style={styles.infoValue}>{activity.tanggal}</Text>
                      </View>
                    </View>
                  </View>
                </View>
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
    color: "#333",
    fontFamily: "Poppins-SemiBold",
    marginBottom: 16,
    paddingHorizontal: 16,
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
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    position: "relative",
  },
  activityBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#2196F3",
    padding: 8,
    borderBottomLeftRadius: 16,
    zIndex: 1,
  },
  activityContent: {
    padding: 16,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  locationText: {
    fontSize: 16,
    color: "#333",
    fontFamily: "Poppins-SemiBold",
    marginLeft: 4,
    flex: 1,
  },
  statusBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#4CAF50",
    fontSize: 12,
    fontFamily: "Poppins-Medium",
  },
  divider: {
    height: 3,
    backgroundColor: "#F0F0F0",
    marginVertical: 12,
  },
  infoSection: {
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins-Regular",
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    fontFamily: "Poppins-Medium",
  },
  footerSection: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressContainer: {
    flex: 1,
    marginRight: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#F0F0F0",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: "#666",
    fontFamily: "Poppins-Regular",
    marginTop: 4,
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
    fontFamily: "Poppins-Bold",
  },
  dateText: {
    fontSize: 14,
    color: "#666",
    marginTop: 3,
    fontFamily: "Poppins-Regular",
    alignItems: "center",
  },
});
