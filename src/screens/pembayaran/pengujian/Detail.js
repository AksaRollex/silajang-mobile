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
const PengujianDetail = ({ route, navigation }) => {
  const [formData, setFormData] = useState({});
  const [countdownExp, setCountdownExp] = useState("00:00:00:00");
  const [dateExp, setDateExp] = useState("06:60:60:60");
  const { uuid } = route.params;
  const { data: setting } = useSetting();
  console.log(setting);

  const copyToClipboard = text => {
    Clipboard.setString(text);
    Alert.alert("Copied", "Text copied to clipboard");
  };

  const fetchData = useCallback(() => {
    axios
      .get(`/pembayaran/pengujian/${uuid}`)
      .then(res => {
        setFormData(res.data.data);
        console.log("text", res.data.data);
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
    const interval = setInterval(() => {
      const now = moment();
      const exp = moment(dateExp);
      const diff = exp.diff(now);

      if (diff <= 0) {
        clearInterval(interval);
        setCountdownExp("00:00:00:00");
        fetchData(); // Refresh data when expired
      } else {
        setCountdownExp(calculateCountdown(exp, now));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [dateExp]);

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
      .post(`/pembayaran/pengujian/${uuid}`)
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

          {formData?.kode ? (
            <View>
              <Text className="text-2xl font-bold text-white text-center">
                {formData?.kode}
              </Text>
            </View>
          ) : (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#312e81" />
            </View>
          )}
        </View>
      </View>
      <ScrollView className="px-3 py-1 bg-[#ececec]">
        {!formData?.payment ? (
          <View className="py-4 px-3 rounded-md  bg-[#f8f8f8] ">
            <View className="flex-row items-center justify-between  border-gray-300">
              <View className="w-1/6 items-start"></View>
              <View className="flex-1"></View>
              <View className="w-1/6 flex-shrink-0" />
            </View>

            <View
              className="  border-gray-300"
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}>
              <Text
                style={{ fontWeight: "bold", color: "black", fontSize: 16 }}>
                Atas Nama
              </Text>
              <Text
                style={{ fontWeight: "bold", color: "black", fontSize: 16 }}>
                {formData?.permohonan?.user?.nama || "-"}
              </Text>
            </View>

            <View className="flex-row justify-between mt-1 border-b border-gray-300 pb-2 mb-3">
              <Text className="font-bold text-black text-base">Harga</Text>
              <Text className="font-bold text-black text-base">
                {rupiah(formData?.harga)}
              </Text>
            </View>

            <View className="border  border-indigo-400 rounded-lg my-2 p-4  bg-indigo-100 ">
              <Text className="font-bold text-black text-lg text-center  ">
                VA Pembayaran Belum Dibuat
              </Text>
              <Text className=" text-sm text-[#333179] text-justify">
                Silahkan klik Tombol Di Bawah untuk Membuat VA Pembayaran
              </Text>
            </View>
            <View className="flex items-end my-2">
              <TouchableOpacity
                className="bg-indigo-600 p-3 rounded-lg"
                onPress={handleGenerateVA}>
                <Text style={styles.buttonText}>Buat VA Pembayaran</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View className="py-4 px-3 rounded-lg  bg-[#f8f8f8] ">
            <View className="flex-row items-center justify-between   border-gray-300">
              <View className="w-1/6 flex-shrink-0" />
            </View>
            {formData?.payment.status === "success" ? (
              <Text className="bg-green-500 text-white text-center p-3 rounded-lg mb-4 font-bold ">
                Pembayaran berhasil dilakukan
              </Text>
            ) : formData?.payment?.is_expired === false ? (
              <Text style={styles.warningText}>
                Lakukan pembayaran sebelum: {countdownExp}
              </Text>
            ) : (
              <View className="">
                <View className="bg-[#fff] rounded-lg mb-3">
                  <Text style={styles.errorText} className="p-3 m-2">
                    VA Pembayaran telah kedaluwarsa
                  </Text>
                  <Text className=" p-2 my-2 text-base font-bold text-center text-black">
                    Silakan Hubungi Admin Kami untuk Melakukan Permintaan
                    Pembuatan VA Pembayaran
                  </Text>
                  {setting ? (
                    <View>
                      <View className="flex flex-row items-center justify-center my-3">
                        <MaterialIcons name="email" size={24} color="#000" />
                        <Text className="mx-2 text-black font-bold">
                          {setting?.email || "-"}
                        </Text>
                      </View>
                      <View className="flex flex-row items-center justify-center mb-3">
                        <MaterialIcons
                          name="local-phone"
                          size={24}
                          color="#000"
                        />
                        <Text className="mx-2 text-black font-bold">
                          {setting?.telepon || "-"}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View>
                      <Text>Data Kosong</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Virtual Account</Text>
              <View style={styles.cardContent}>
                <Image
                  source={require("@/assets/images/bank-jatim.png")}
                  style={{
                    width: 100,
                    marginLeft : rem(0.8),
                    height: 30,
                    resizeMode: "contain",
                  }}></Image>
                <Text style={styles.vaNumber} className="text-indigo-600">
                  {formData?.payment?.va_number}
                </Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(formData?.payment?.va_number)}>
                  <Text style={styles.copyButton}>Salin</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Nominal Pembayaran</Text>
              <View style={styles.cardContent}>
                <Text style={styles.amount} className="text-indigo-600">
                  {rupiah(formData?.harga)}
                </Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(formData?.harga.toString())}>
                  <Text style={styles.copyButton}>Salin</Text>
                </TouchableOpacity>
              </View>
            </View>

            {formData?.payment?.status !== "success" &&
              formData?.payment?.is_expired &&
              !formData?.user_has_va && (
                <View className="flex items-end my-2">
                  <TouchableOpacity
                    className="bg-indigo-600 p-3 rounded-lg"
                    onPress={handleGenerateVA}>
                    <Text style={styles.buttonText}>Buat VA Pembayaran</Text>
                  </TouchableOpacity>
                </View>
              )}
          </View>
        )}
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
    alignItems: "center",
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
});

export default PengujianDetail;
