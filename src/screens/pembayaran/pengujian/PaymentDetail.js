import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import axios from "@/src/libs/axios";
import moment from "moment";
import { Clipboard } from "react-native";
import Back from "../../components/Back";
import { rupiah } from "@/src/libs/utils";
import { useSetting } from "@/src/services";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const PaymentDetail = ({ route, navigation }) => {
  const [formData, setFormData] = useState({});
  const [countdownExp, setCountdownExp] = useState("");
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
        // console.log(res.data.data);
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
    let interval;
    if (formData.payment && !formData.payment.is_expired) {
      interval = setInterval(() => {
        const exp = moment(formData.payment.tanggal_exp);
        const now = moment();
        const diff = exp.diff(now);

        if (diff <= 0) {
          clearInterval(interval);
          setCountdownExp("00:00:00");
          fetchData(); // Refresh data when expired
        } else {
          const duration = moment.duration(diff);
          setCountdownExp(
            `${String(duration.hours()).padStart(2, "0")}:${String(
              duration.minutes(),
            ).padStart(2, "0")}:${String(duration.seconds()).padStart(2, "0")}`,
          );
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [formData?.payment, fetchData]);

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
    <ScrollView className="p-7 bg-[#ececec]">
      {!formData.payment ? (
        <View className="p-3 rounded-lg mt-2 bg-[#fff] ">
          <Back size={24} action={() => navigation.goBack()} className="mr-2" />

          <Text className="text-2xl font-bold text-black text-center rounded-md  border-b border-gray-300 my-2">
            {formData.kode}
          </Text>

          <View
            style={{
              borderColor: "#6366f1",
              borderWidth: 1,
              borderRadius: 10,
              marginVertical: 8,
              padding: 16,
              backgroundColor: "#e0e7ff",
            }}>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text
                style={{ fontWeight: "bold", color: "black", fontSize: 16 }}>
                Atas Nama
              </Text>
              <Text
                style={{ fontWeight: "bold", color: "black", fontSize: 16 }}>
                {formData.permohonan?.user?.nama}
              </Text>
            </View>

            <View className="flex-row justify-between mt-1">
              <Text className="font-bold text-black text-base">Harga</Text>
              <Text className="font-bold text-black text-base">
                {rupiah(formData.harga)}
              </Text>
            </View>
          </View>

          <View className="border  border-indigo-400 rounded-lg my-2 p-4  bg-indigo-100 ">
            <Text className="font-bold text-black text-lg text-justify  ">
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
        <View className="my-5 bg-[#aeacac] rounded-lg p-3">
          {formData.payment.status === "" ? (
            <Text style={styles.successText}>
              Pembayaran berhasil dilakukan
            </Text>
          ) : formData.payment.is_expired === false ? (
            <Text style={styles.warningText}>
              Lakukan pembayaran sebelum: {countdownExp}
            </Text>
          ) : (
            <View className="">
              <View className="bg-slate-700 rounded-lg mb-3">
                <Text style={styles.errorText} className="p-3 m-2">
                  VA Pembayaran telah kedaluwarsa
                </Text>
                <Text className=" p-2 my-2 text-base font-bold text-center text-white">
                  Silakan Hubungi Admin Kami untuk Melakukan Permintaan
                  Pembuatan VA Pembayaran
                </Text>
                {setting ? (
                  <View>
                    <View className="flex flex-row items-center justify-center my-3">
                      <MaterialIcons name="email" size={24} color="#ececec" />
                      <Text className="mx-2 text-white font-bold">
                        {setting?.email || "-"}
                      </Text>
                    </View>
                    <View className="flex flex-row items-center justify-center mb-3">
                      <MaterialIcons
                        name="local-phone"
                        size={24}
                        color="#ececec"
                      />
                      <Text className="mx-2 text-white font-bold">
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
              <Text style={styles.vaNumber}>{formData.payment?.va_number}</Text>
              <TouchableOpacity
                onPress={() => copyToClipboard(formData.payment?.va_number)}>
                <Text style={styles.copyButton}>Salin</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Nominal Pembayaran</Text>
            <View style={styles.cardContent}>
              <Text style={styles.amount}>{rupiah(formData.harga)}</Text>
              <TouchableOpacity
                onPress={() => copyToClipboard(formData.harga.toString())}>
                <Text style={styles.copyButton}>Salin</Text>
              </TouchableOpacity>
            </View>
          </View>

          {formData.payment.status !== "success" &&
            formData.payment.is_expired &&
            !formData.user_has_va && (
              <TouchableOpacity
                className="bg-[#333179] p-5 rounded-lg"
                onPress={handleGenerateVA}>
                <Text style={styles.buttonText}>Buat VA Pembayaran</Text>
              </TouchableOpacity>
            )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ececec",
  },

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
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  vaNumber: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#1976d2",
  },
  amount: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#1976d2",
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

export default PaymentDetail;
