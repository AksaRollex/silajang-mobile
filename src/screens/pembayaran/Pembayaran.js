import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import Header from "../components/Header";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

export default function Pembayaran() {
  const navigation = useNavigation();

  // Data dummy untuk statistik pembayaran
  const stats = [
    {
      label: "Total Tagihan",
      value: "Rp 2.4M",
      icon: "account-balance-wallet",
      color: "#FF9800",
    },
    {
      label: "Belum Bayar",
      value: "Rp 800K",
      icon: "warning",
      color: "#f44336",
    },
    { label: "Sudah Bayar", value: "Rp 1.6M", icon: "paid", color: "#4CAF50" },
  ];

  const paymentMenus = [
    {
      title: "Pengujian",
      icon: "science",
      screen: "PengujianPembayaran",
      color: "#2196F3",
      description: "Pembayaran untuk layanan pengujian",
    },
    {
      title: "Multi Payment",
      icon: "payments",
      screen: "Multipayment",
      color: "#4CAF50",
      description: "Pembayaran multiple tagihan sekaligus",
    },
  ];

  const paymentInfo = {
    title: "Informasi Pembayaran",
    // description: "Silakan pilih metode pembayaran yang tersedia:",
    features: [
      {
        icon: "verified",
        color: "#4CAF50",
        text: "Pembayaran Aman dan Terpercaya",
      },
      {
        icon: "speed",
        color: "#2196F3",
        text: "Proses Cepat & Real-time",
      },
      {
        icon: "support-agent",
        color: "#FF9800",
        text: "Dukungan 24/7",
      },
    ],
  };

  const recentPayments = [
    {
      title: "Pengujian #123",
      amount: "Rp 450.000",
      status: "Berhasil",
      date: "22 Oct 2024",
      method: "QRIS",
    },
    {
      title: "Pengujian #122",
      amount: "Rp 350.000",
      status: "Pending",
      date: "20 Oct 2024",
      method: "Bank Transfer",
    },
  ];

  return (
    <>
      <Header
        navigate={() => {
          navigation.navigate("Profile");
        }}
      />
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Pembayaran</Text>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>

          {/* Statistics Section */}
          <View style={styles.infoSection}>
            <View style={styles.infoHeader}>
              <Text style={styles.infoTitle}>{paymentInfo.title}</Text>
            </View>

            <View style={styles.featuresContainer}>
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
            </View>
          </View>

          {/* Payment Methods Grid */}
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

          {/* Recent Payments Section */}
          <Text style={styles.sectionTitle}>Riwayat Pembayaran</Text>
          <View style={styles.activityContainer}>
            {recentPayments.map((payment, index) => (
              <TouchableOpacity key={index} style={styles.activityCard}>
                <View style={styles.activityHeader}>
                  <Text style={styles.activityTitle}>{payment.title}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          payment.status === "Berhasil" ? "#E8F5E9" : "#FFF3E0",
                      },
                    ]}>
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            payment.status === "Berhasil"
                              ? "#2E7D32"
                              : "#E65100",
                        },
                      ]}>
                      {payment.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.paymentDetails}>
                  <Text style={styles.amountText}>{payment.amount}</Text>
                  <Text style={styles.methodText}>{payment.method}</Text>
                </View>
                <Text style={styles.activityDate}>{payment.date}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  // Tambahkan styles baru
  infoSection: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  infoHeader: {
    // marginBottom: 8,
  },
  infoTitle: {
    fontSize: 20,
    color: "#333",
    fontFamily: "Poppins-SemiBold",
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins-Regular",
    lineHeight: 20,
  },
  featuresContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 16,
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 12,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    fontFamily: "Poppins-Medium",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    padding: 16,
  },
  welcomeSection: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    color: "#333",
    fontFamily: "Poppins-SemiBold",
  },
  dateText: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    fontFamily: "Poppins-Regular",
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
    elevation: 2,
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
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
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
  paymentDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  amountText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2196F3",
  },
  methodText: {
    fontSize: 14,
    color: "#666",
  },
  activityDate: {
    fontSize: 12,
    color: "#666",
  },
});
