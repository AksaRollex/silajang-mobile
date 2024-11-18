import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import Header from "../components/Header";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { Colors } from "react-native-ui-lib";

const { width } = Dimensions.get("window");

export default function Pembayaran() {
  const navigation = useNavigation();

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
      title: "Multi Payment",
      icon: "payments",
      screen: "Multipayment",
      color: "#4CAF50",
      description: "Klik untuk membayar multipayment",
    },
  ];

  // Konten baru: Panduan pembayaran
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
        // {
        //   icon: "receipt-long",
        //   color: "purple", // Tambahkan warna hijau
        //   text: "Isi detail pembayaran dengan teliti",
        // },
        // {
        //   icon: "verified-user",
        //   color: "orange", // Tambahkan warna oranye
        //   text: "Konfirmasi dan verifikasi pembayaran",
        // },
        // {
        //   icon: "check-circle",
        //   color: "green", // Tambahkan warna ungu
        //   text: "Tunggu konfirmasi pembayaran berhasil",
        // },
        // {
        //   icon: "check-circle",
        //   text: "Tunggu konfirmasi pembayaran berhasil",
        // },
      ],
    },
  ];

  // Konten baru: Promo dan penawaran khusus
  const specialOffers = [
    {
      title: "Promo Pembayaran",
      icon: "local-offer",
      color: "#9C27B0",
      description: "Dapatkan cashback 5% untuk pembayaran QRIS",
      validUntil: "31 Des 2024",
    },
    {
      title: "Diskon Khusus",
      icon: "card-giftcard",
      color: "#E91E63",
      description: "Potongan 10% untuk pembayaran pertama",
      validUntil: "31 Des 2024",
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
        <ScrollView
          className="flex-col"
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[]}>
          {/* Header Section with Gradient */}
          <View
            className="min-h-[100px] relative shadow-lg z-10 mb-16"
            style={{ backgroundColor: Colors.brand }}>
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

        <ScrollView contentContainerStyle={styles.scrollContent}>
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

            <View style={styles.infoSection}>
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

            {/* Payment Methods */}

            {/* Payment Guide Section */}

            {/* Special Offers Section */}
            {/* <Text style={styles.sectionTitle}>Promo Spesial</Text>
          <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.offersContainer}>
          {specialOffers.map((offer, index) => (
            <View key={index} style={styles.offerCard}>
            <View style={[styles.offerIconContainer, { backgroundColor: offer.color }]}>
            <MaterialIcons name={offer.icon} size={32} color="white" />
            </View>
            <Text style={styles.offerTitle}>{offer.title}</Text>
            <Text style={styles.offerDescription}>{offer.description}</Text>
            <Text style={styles.offerValidity}>Berlaku sampai: {offer.validUntil}</Text>
            </View>
            ))}
            </ScrollView> */}
        </ScrollView>
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
    marginBottom: 14,
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
});
