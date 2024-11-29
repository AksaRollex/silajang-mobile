import React, { useState } from "react";
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
import { Colors } from "react-native-ui-lib";
import { useQuery } from "@tanstack/react-query";
import axios from "@/src/libs/axios";
import { rupiah } from "@/src/libs/utils";

const { width } = Dimensions.get("window");

export default function Pembayaran() {
  const navigation = useNavigation();
  const [data, setData] = useState([]);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    refetch();
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, [refetch]);

  const paymentInfo = {
    title: "Informasi Pembayaran",
    features: [
      {
        icon: "verified",
        color: "#4CAF50",
        text: "Pembayaran Aman dan Terverifikasi",
      },
      {
        icon: "speed",
        color: "#2196F3",
        text: "Proses Pembayaran Cepat & Mudah",
      },
      {
        icon: "support-agent",
        color: "#FF9800",
        text: "Dukungan Teknis 24/7",
      },
    ],
  };

  const paymentMenus = [
    {
      title: "Pengujian",
      icon: "science",
      screen: "PengujianPembayaran",
      color: "#2196F3",
      description: "Klik untuk membayar pengujian",
    },
    {
      title: "Multipayment",
      icon: "payments",
      screen: "Multipayment",
      color: "#4CAF50",
      description: "Klik untuk menggunakan multipayment",
    },
  ];

  const paymentGuides = [
    {
      title: "Cara Melakukan Pembayaran",
      steps: [
        {
          icon: "assignment",
          text: "Tunggu data pembayaran di konfirmasi oleh pihak admin",
        },
        {
          icon: "receipt-long",
          text: "Silahkan bayar dengan menggunakan kode VA / QRIS yang telah di sediakan oleh admin",
        },
        {
          icon: "verified-user",
          text: "Jika pembayaran berhasil dilakukan, anda akan mendapatkan invoice",
        },
      ],
    },
  ];

  const { refetch } = useQuery({
    queryKey: ["history"],
    queryFn: async () =>
      await axios
        .get("/dashboard/historyPembayaran")
        .then(res => res.data.data),

    onSuccess: data => {
      console.log(data);
      setData(data);
    },
    onError: err => console.error(err),
  });

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
              height: "70%", // Pastikan gambar menutupi area yang diinginkan
              // borderBottomLeftRadius: 20,
              // borderBottomRightRadius: 20,
            }}
            // imageStyle={{
            //   borderBottomLeftRadius: 20,
            //   borderBottomRightRadius: 20,
            // }}
          >
            <Header
              navigate={() => {
                navigation.navigate("Profile");
              }}
            />
            <View className="min-h-[100px] relative shadow-lg bottom-4 z-10 mb-11">
              <View style={styles.welcomeCard}>
                <View style={styles.headerSection}>
                  <Text className="text-center" style={styles.headerTitle}>
                    Pembayaran
                  </Text>
                  <Text className="text-center" style={styles.headerSubtitle}>
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

          <View style={styles.scrollContent}>
            <Text style={styles.sectionTitle}>Panduan Pembayaran</Text>
            <View style={styles.guideContainer}>
              {paymentGuides[0].steps.map((step, index) => (
                <View key={index} style={styles.guideStep}>
                  <View style={styles.stepNumberContainer}>
                    <Text style={styles.stepNumber}>{index + 1}</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <MaterialIcons
                      name={step.icon}
                      size={24}
                      color={step.color || "#666"}
                    />
                    <Text style={styles.stepText}>{step.text}</Text>
                  </View>
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Metode Pembayaran</Text>
            <View style={styles.menuGrid}>
              {paymentMenus.map((menu, index) => (
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

            {/* Payment Information Cards */}

            {/* <View style={styles.infoSection}>
              {paymentInfo.features.map((feature, index) => (
                <View key={index} style={styles.featureCard}>
                  <View
                    style={[
                      styles.featureIconContainer,
                      { backgroundColor: feature.color },
                    ]}>
                    <MaterialIcons
                      name={feature.icon}
                      size={24}
                      color="white"
                    />
                  </View>
                  <Text style={styles.featureText}>{feature.text}</Text>
                </View>
              ))}
            </View> */}

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
                      {/* <View style={styles.infoRow}>
                        <MaterialIcons
                          name="location-on"
                          size={16}
                          color="#666"
                        />
                        <View style={styles.infoGroup}>
                          <Text style={styles.infoLabel}>Lokasi</Text>
                          <Text style={styles.infoValue} numberOfLines={1}>
                            {activity.lokasi || "Error, Harap Refresh"}
                          </Text>
                        </View>
                      </View> */}
                      <View style={styles.infoRow}>
                        <MaterialIcons name="code" size={16} color="#666" />
                        <View style={styles.infoGroup}>
                          <Text style={styles.infoLabel}>Kode</Text>
                          <Text style={styles.infoValue} numberOfLines={1}>
                            {activity.kode || "Error, Harap Refresh"}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.infoRow}>
                        <MaterialIcons name="done" size={16} color="#666" />
                        <View style={styles.infoGroup}>
                          <Text style={[styles.infoLabel]}>
                            Status Pembayaran
                          </Text>
                          <Text style={[styles.infoValue]}>
                            {activity.payment?.status || "Error, Harap Refresh"}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.infoRow}>
                        <MaterialIcons
                          name="account-balance-wallet"
                          size={16}
                          color="#666"
                        />
                        <View style={styles.infoGroup}>
                          <Text style={styles.infoLabel}>Tipe Pembayaran</Text>
                          <Text style={styles.infoValue}>
                            {activity.payment_type || "Error, Harap Refresh"}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.infoRow}>
                        <MaterialIcons
                          name="attach-money"
                          size={16}
                          color="#666"
                        />
                        <View style={styles.infoGroup}>
                          <Text style={styles.infoLabel}>Total Harga</Text>
                          <Text style={styles.infoValue}>
                            {rupiah(
                              activity.payment?.jumlah ||
                                "Error, Harap Refresh",
                            )}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    padding: 16,
  },
  headerSection: {
    // marginBottom: 14,
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
  headerTitle: {
    fontSize: 21,
    color: "#333",
    fontFamily: "Poppins-Bold",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins-Regular",
  },
  infoSection: {
    marginBottom: 24,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    fontFamily: "Poppins-Medium",
  },
  sectionTitle: {
    fontSize: 20,
    color: "#333",
    fontFamily: "Poppins-SemiBold",
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
    fontFamily: "Poppins-Regular",
    lineHeight: 18,
  },
  guideContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
  },
  guideStep: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  stepNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.brand,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  stepNumber: {
    color: "white",
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
  },
  stepContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  stepText: {
    marginLeft: 12,
    fontSize: 14,
    color: "#333",
    fontFamily: "Poppins-Regular",
    flex: 1,
  },
  offersContainer: {
    paddingBottom: 16,
  },
  offerCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    width: width * 0.75,
    elevation: 2,
  },
  offerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  offerTitle: {
    fontSize: 18,
    color: "#333",
    fontFamily: "Poppins-SemiBold",
    marginBottom: 8,
  },
  offerDescription: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins-Regular",
    marginBottom: 8,
    lineHeight: 20,
  },
  offerValidity: {
    fontSize: 12,
    color: "#999",
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
  infoGroup: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1, // Memberikan ruang yang fleksibel untuk menyesuaikan konten
  },
  infoLabel: {
    width: 120,
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
});
