import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import axios from "@/src/libs/axios";
import moment from "moment";
import { Clipboard } from "react-native";
import Back from "../../components/Back";
import { rupiah } from "@/src/libs/utils";
import { useSetting } from "@/src/services";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Colors } from "react-native-ui-lib";
const MultipaymentDetail = ({ route, navigation }) => {
  const [formData, setFormData] = useState({});
  const [countdownExp, setCountdownExp] = useState("00:00:00:00");
  const [dateExp, setDateExp] = useState("06:60:60:60");
  const { uuid } = route.params;
  const { data: setting } = useSetting();
  // console.log(setting);

  const copyToClipboard = text => {
    Clipboard.setString(text);
    Alert.alert("Copied", "Text copied to clipboard");
  };

  const fetchData = useCallback(() => {
    axios
      .get(`/pembayaran/multi-payment/${uuid}`)
      .then(res => {
        setFormData(res.data);
        console.log("text data ", res.data);
      })
      .catch(err => {
        Alert.alert(
          "Error",
          err.response?.data?.message || "An error occurred",
        );
      });
  }, [uuid]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (formData?.payment?.tanggal_exp) {
      const interval = setInterval(() => {
        const now = moment();
        const exp = moment(formData.payment.tanggal_exp); // Ambil tanggal_exp dari formData
        const diff = exp.diff(now);

        if (diff <= 0) {
          clearInterval(interval);
          setCountdownExp("00:00:00:00");
        } else {
          setCountdownExp(calculateCountdown(exp, now));
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [formData]);

  const calculateCountdown = (exp, now) => {
    let days = exp.diff(now, "days");
    days = days < 10 ? `0${days}` : days;

    let hours = exp.diff(now, "hours") % 24;
    hours = hours < 10 ? `0${hours}` : hours;

    let minutes = exp.diff(now, "minutes") % 60;
    minutes = minutes < 10 ? `0${minutes}` : minutes;

    let seconds = exp.diff(now, "seconds") % 60;
    seconds = seconds < 10 ? `0${seconds}` : seconds;

    return `${days}H : ${hours}J : ${minutes}M : ${seconds}D`;
  };

  const handleGenerateVA = () => {
    axios
      .post(`/pembayaran/multi-payment/${uuid}/va`)
      .then(() => {
        Alert.alert("Success", "VA Payment created successfully");
        fetchData();
      })
      .catch(err => {
        Alert.alert(
          "Error",
          err.response?.data?.message || "An error occurred",
        );
      });
  };
  const handleGenerateQris = () => {
    axios
      .post(`/pembayaran/multi-payment/${uuid}/qris`)
      .then(() => {
        Alert.alert("Success", "VA Payment created successfully");
        fetchData();
      })
      .catch(err => {
        Alert.alert(
          "Error",
          err.response?.data?.message || "An error occurred",
        );
      });
  };

  const isExpired = formData?.data?.is_expired;

  const renderPaymentInfo = () => (
    <>
      <View>
        <View
          className="border-gray-300"
          style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontWeight: "bold", color: "black", fontSize: 16 }}>
            Titik Permohonan Dipilih
          </Text>
          <View className="p-1 bg-indigo-100 rounded-sm">
            <Text
              style={{ fontWeight: "bold", color: "black" }}
              className="text-sm font-sans">
              {formData?.data?.multi_payments
                ?.map(payment => payment.titik_permohonan.kode)
                .join(", ") || "Kode Kosong"}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between mt-1 border-gray-300 pb-2 ">
          <Text className="font-bold text-black text-base">Total Harga</Text>
          <Text className="font-bold text-black text-base">
            {rupiah(formData?.data?.jumlah)}
          </Text>
        </View>
        <View
          className="border-gray-300 mb-3"
          style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontWeight: "bold", color: "black", fontSize: 16 }}>
            Atas Nama
          </Text>
          <Text style={{ fontWeight: "bold", color: "black", fontSize: 16 }}>
            {formData?.data?.nama || "-"}
          </Text>
        </View>
      </View>
    </>
  );

  const renderPaymentStatus = () => {
    if (formData?.data?.status === "success") {
      return (
        <Text className="bg-green-500 text-white text-center p-3 rounded-lg mb-4 font-bold">
          Pembayaran berhasil dilakukan : {formData?.data?.tanggal_bayar}
        </Text>
      );
    } else if (formData?.data?.status === "failed") {
      // return (
      //   <Text style={styles.errorText}>
      //     Pembayaran gagal. Silakan coba lagi atau hubungi admin.
      //   </Text>
      // );
      return null;
    } else if (formData?.data?.is_expired) {
      return (
        <View className="bg-[#fff] rounded-lg mb-3">
          <Text style={styles.errorText} className="p-3 m-2">
            VA Pembayaran telah kedaluwarsa
          </Text>
          <Text className="p-2 my-2 text-base font-bold text-center text-black">
            Silakan Hubungi Admin Kami untuk Melakukan Permintaan Pembuatan VA
            Pembayaran
          </Text>
          {/* ... (keep the admin contact information) */}
        </View>
      );
    } else if (!formData?.data?.is_expired) {
      return (
        <Text style={styles.warningText}>
          Lakukan pembayaran sebelum : {countdownExp}
        </Text>
      );
    }
  };

  const renderPaymentButton = () => {
    if (formData?.data?.status === "pending") {
      return null;
    }
    if (formData?.data?.status !== "success" && !formData?.data?.is_expired) {
      if (formData?.data?.type === "va" && !formData?.user_has_va) {
        return (
          <View className="flex items-end my-2">
            <TouchableOpacity
              className="bg-indigo-600 p-3 rounded-lg"
              onPress={handleGenerateVA}>
              <Text style={styles.buttonText}>Buat VA Pembayaran</Text>
            </TouchableOpacity>
          </View>
        );
      } else if (formData?.data?.type === "qris" && !formData?.user_has_qris) {
        return (
          <View className="flex items-end my-2">
            <TouchableOpacity
              className="bg-indigo-600 p-3 rounded-lg"
              onPress={handleGenerateQris}>
              <Text style={styles.buttonText}>Buat QRIS</Text>
            </TouchableOpacity>
          </View>
        );
      }
    }
    return null;
  };

  const renderPaymentCards = () => {
    if (formData?.data?.status === "failed") {
      return null; // Don't render cards if status is failed
    }

    if (formData?.data?.type === "va") {
      return (
        <>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Virtual Account</Text>
            <View style={styles.cardContent}>
              <Image
                source={require("@/assets/images/bank-jatim.png")}
                style={{
                  width: 100,
                  marginLeft: rem(0.8),
                  height: 30,
                  resizeMode: "contain",
                }}
              />
              <Text style={styles.vaNumber} className="text-indigo-600">
                {formData?.data?.va_number || "Tidak Tersedia"}
              </Text>
              <TouchableOpacity
                onPress={() => copyToClipboard(formData?.data?.va_number)}>
                <Text style={styles.copyButton}>Salin</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Total Harga</Text>
            <View style={styles.cardContent}>
              <Text style={styles.vaNumber} className="text-indigo-600">
                {rupiah(formData?.data?.jumlah || 0)}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  copyToClipboard(formData?.data?.jumlah?.toString())
                }>
                <Text style={styles.copyButton}>Salin</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      );
    } else if (formData?.data?.type === "qris") {
      return (
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <View style={[isExpired && styles.disabledCard]}>
              <Image
                source={require("../../../../android/app/src/main/assets/images/qrcode.png")}
                style={styles.qrisImage}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>
      );
    }

    return null;
  };

  const renderSilahkan = () => {
    if (formData?.data?.type === "va" && formData?.data?.status === "failed") {
      return (
        <>
          <View className="border  border-indigo-400 rounded-lg my-2 p-4  bg-indigo-100 ">
            <Text className="font-bold text-black text-lg text-center  ">
              VA Pembayaran Belum Dibuat
            </Text>
            <Text className=" text-sm text-[#333179] text-center">
              Silahkan klik Tombol Di Bawah untuk Membuat VA
            </Text>
          </View>
        </>
      );
    }
    if (
      formData?.data?.type === "qris" &&
      formData?.data?.status === "failed"
    ) {
      return (
        <>
          <View className="border  border-indigo-400 rounded-lg my-2 p-4  bg-indigo-100 ">
            <Text className="font-bold text-black text-lg text-center  ">
              QRIS Pembayaran Belum Dibuat
            </Text>
            <Text className=" text-sm text-[#333179] text-center">
              Silahkan klik Tombol Di Bawah untuk Membuat QRIS
            </Text>
          </View>
        </>
      );
    }
  };

  return (
    <>
      <View className="w-full">
        <View
          className="flex-row mb-4 p-3 justify-between"
          style={{ backgroundColor: Colors.brand }}>
          <Back
            size={24}
            color={"white"}
            action={() => navigation.goBack()}
            className="mr-2 "
          />

          {formData?.data?.kode ? (
            <View>
              <Text className="text-xl font-bold text-white text-center">
                {formData?.data?.kode}
              </Text>
            </View>
          ) : (
            <View className="text-end text-sm items-center justify-center">
              <Text className="text-white font-bold font-sans">
                Kode tidak tersedia
              </Text>
            </View>
          )}
        </View>
      </View>
      <ScrollView className="px-3 py-1 bg-[#ececec]">
        <View className="py-4 px-3 rounded-lg bg-[#f8f8f8]">
          {renderPaymentStatus()}
          {formData?.data && (
            <>
              {renderPaymentInfo()}
              {renderPaymentCards()}
              {renderSilahkan()}
            </>
          )}
          {renderPaymentButton()}
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  infoText: {
    fontSize: 16,
    marginBottom: 10,
  },
  alertText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "red",
  },
  successText: {
    backgroundColor: "#4caf50",
    color: "white",
    padding: 10,
    borderRadius: 5,
    textAlign: "center",
    marginBottom: 20,
  },
  warningText: {
    backgroundColor: "#ff9800",
    color: "white",
    padding: 10,
    borderRadius: 5,
    textAlign: "center",
    marginBottom: 20,
  },
  errorText: {
    backgroundColor: "#f44336",
    color: "white",
    borderRadius: 5,
    textAlign: "center",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "black",
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  vaNumber: {
    fontSize: 17,
    fontWeight: "bold",
  },
  amount: {
    fontSize: 17,
    fontWeight: "bold",
  },
  copyButton: {
    color: "#4caf50",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#1976d2",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 14,
  },
  cardqr: {
    alignItems: "center",
    justifyContent: "center",
  },
  qrisImage: {
    width: 250,
    height: 250,
    backgroundColor: "#e0e0e0",
  },
  disabledCard: {
    backgroundColor: "#e0e0e0",
  },
  disabledText: {
    color: "#a0a0a0",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});

export default MultipaymentDetail;
