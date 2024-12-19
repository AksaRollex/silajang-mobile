import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Button,
} from "react-native";
import { useState, useEffect, useCallback, useRef } from "react";
import React from "react";
import axios from "@/src/libs/axios";
import moment from "moment";
import { Clipboard } from "react-native";
import Back from "../../components/Back";
import { rupiah } from "@/src/libs/utils";
import { useSetting } from "@/src/services";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Colors } from "react-native-ui-lib";
import { API_URL } from "@env";
import RNFS from "react-native-fs";
import PhotoManipulator from "react-native-photo-manipulator";
const PengujianDetail = ({ route, navigation }) => {
  const [formData, setFormData] = useState({ payment: { status: "pending" } });
  const [loading, setLoading] = useState(true);
  const [countdownExp, setCountdownExp] = useState("00:00:00:00");
  const { uuid } = route.params;
  const { data: setting } = useSetting();
  const copyToClipboard = text => {
    Clipboard.setString(text);
  };

  const fetchData = useCallback(() => {
    axios
      .get(`/pembayaran/pengujian/${uuid}`)
      .then(res => {
        setFormData(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        Alert.alert("Error", err.response?.data?.message || "Gagal Memuat");
        setLoading(false);
      });
  }, [uuid]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (formData?.payment?.tanggal_exp) {
      const interval = setInterval(() => {
        const now = moment();
        const exp = moment(formData.payment.tanggal_exp);
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
    setLoading(true);
    axios
      .post(`${API_URL}/pembayaran/pengujian/${uuid}`)
      .then(() => {
        Alert.alert("Success", "kode pembayaran berhasil dibuat");
        fetchData();
      })
      .catch(err => {
        setLoading(false);
        Alert.alert("ERROR", "Kode Pembayaran gagal dibuat" || "Gagal Memuat");
      });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.brand} />
      </View>
    );
  }

  const isExpired = formData?.payment?.is_expired;

  /**
   * Download QRIS dan QRIS template ke galeri perangkat
   *
   * @returns {Promise<void>}
   */

  const downloadQris = async () => {
    try {
      const timestamp = Date.now();

      // Resolve asset sources
      const qrisImage = Image.resolveAssetSource(
        require("../../../../assets/images/qris.png"),
      );
      const qrisTemplateImage = Image.resolveAssetSource(
        require("../../../../assets/images/qris-template.png"),
      );

      // Fetch image URIs
      const qrisUri = qrisImage.uri;
      const qrisTemplateUri = qrisTemplateImage.uri;

      // Download kedua gambar
      const qrisPath = `${RNFS.TemporaryDirectoryPath}/qris_${timestamp}.png`;
      const qrisTemplatePath = `${RNFS.TemporaryDirectoryPath}/qris_template_${timestamp}.png`;

      await RNFS.downloadFile({
        fromUrl: qrisUri,
        toFile: qrisPath,
      }).promise;

      await RNFS.downloadFile({
        fromUrl: qrisTemplateUri,
        toFile: qrisTemplatePath,
      }).promise;

      // Simpan kombinasi gambar
      const downloadDestPath = `${RNFS.PicturesDirectoryPath}/qris_combined_${timestamp}.png`;

      // Anda mungkin memerlukan library tambahan untuk menggabungkan gambar
      // Contoh: react-native-image-resizer atau react-native-image-manipulator

      // Untuk sementara, salin salah satu gambar
      await RNFS.copyFile(qrisPath, downloadDestPath);

      // Scan file agar terlihat di galeri
      await RNFS.scanFile(downloadDestPath);

      // Tampilkan alert sukses
      Alert.alert(
        "Berhasil",
        `Gambar berhasil disimpan di: ${downloadDestPath}`,
        [{ text: "OK" }],
      );
    } catch (error) {
      console.error("Error downloading combined QRIS:", error);
      Alert.alert(
        "Error",
        `Terjadi kesalahan saat mengunduh gambar: ${error.message}`,
      );
    }
  };

  return (
    <>
      <View className="p-3 w-full h-full bg-[#ececec]">
        <View className="w-full h-full bg-[#f8f8f8] rounded-3xl">
          <View className=" p-2 ">
            <View className="flex-row  p-3 justify-between">
              <Back
                size={24}
                color={"black"}
                action={() => navigation.goBack()}
                className="mr-2 "
              />

              {formData?.kode ? (
                <View>
                  <Text className="text-lg font-poppins-semibold text-black text-center">
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
          <ScrollView className="px-3 py-1 ">
            {!formData?.payment ? (
              <View className=" rounded-t-md px-3 rounded-md  bg-[#f8f8f8] ">
                <View
                  className="  border-gray-300"
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}>
                  <Text
                    style={{
                      color: "black",
                      fontSize: 16,
                      fontFamily: "Poppins-SemiBold",
                    }}>
                    Atas Nama
                  </Text>
                  <Text
                    style={{
                      color: "black",
                      fontSize: 16,
                      fontFamily: "Poppins-SemiBold",
                    }}>
                    {formData?.permohonan?.user?.nama || "-"}
                  </Text>
                </View>

                <View className="flex-row justify-between mt-1 border-b border-gray-300 pb-2 mb-3">
                  <Text className="font-poppins-semibold text-black text-base">
                    Harga
                  </Text>
                  <Text className="font-poppins-semibold text-black text-base">
                    {rupiah(formData?.harga)}
                  </Text>
                </View>
                {formData?.payment_type === "va" && (
                  <>
                    <View className="border  border-indigo-400 rounded-lg my-2 p-4  bg-indigo-100 ">
                      <Text className="font-poppins-semibold text-black text-lg text-center  ">
                        VA Pembayaran Belum Dibuat
                      </Text>
                      <Text className=" text-sm text-[#333179] font-poppins-regular text-justify">
                        Silahkan klik Tombol Di Bawah untuk Membuat VA
                        Pembayaran
                      </Text>
                    </View>
                    <View className="flex items-end my-2">
                      <TouchableOpacity
                        className="bg-indigo-600 p-3 rounded-lg"
                        onPress={handleGenerateVA}>
                        <Text
                          style={styles.buttonText}
                          className="font-poppins-semibold">
                          Buat VA Pembayaran
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                {formData?.payment_type === "qris" && (
                  <>
                    <View className="border  border-indigo-400 rounded-lg my-2 p-4  bg-indigo-100 ">
                      <Text className="font-bold text-black text-lg text-center  ">
                        QRIS Pembayaran Belum Dibuat
                      </Text>
                      <Text className=" text-sm  font-poppins-regular text-[#333179] text-justify">
                        Silahkan klik Tombol Di Bawah untuk Membuat QRIS
                        Pembayaran
                      </Text>
                    </View>
                    <View className="flex items-end my-2">
                      <TouchableOpacity
                        className="bg-indigo-600 p-3 rounded-lg"
                        onPress={handleGenerateVA}>
                        <Text style={styles.buttonText}>
                          Buat QRIS Pembayaran
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            ) : (
              <View className="py-4 px-3 rounded-lg  bg-[#f8f8f8] ">
                <View className="flex-row items-center justify-between   border-gray-300">
                  <View className="w-1/6 flex-shrink-0" />
                </View>
                {formData?.payment.status === "success" ? (
                  <>
                    <View className="bg-green-500 rounded-lg mb-4 font-bold shadow-lg p-3">
                      <Text className="text-white text-center text-sm font-poppins-semibold">
                        Pembayaran Berhasil Dilakukan :{" "}
                        {formData?.payment.tanggal_bayar || "Belum bayar"}
                      </Text>
                    </View>
                  </>
                ) : formData?.payment?.is_expired === false ? (
                  <Text
                    style={styles.warningText}
                    className="font-poppins-semibold">
                    Lakukan pembayaran sebelum: {countdownExp}
                  </Text>
                ) : (
                  <View className="">
                    <View className="bg-[#fff] rounded-lg mb-3">
                      {formData?.payment_type === "va" && (
                        <>
                          <Text style={styles.errorText} className="p-3 m-2">
                            VA Pembayaran telah kedaluwarsa
                          </Text>
                          <Text className=" p-2 my-2 text-base font-bold text-center text-black">
                            Silakan Hubungi Admin Kami untuk Melakukan
                            Permintaan Pembuatan VA Pembayaran
                          </Text>
                        </>
                      )}
                      {formData?.payment_type === "qris" && (
                        <>
                          <Text style={styles.errorText} className="p-3 m-2">
                            QRIS Pembayaran telah kedaluwarsa
                          </Text>
                          <Text className=" p-2 my-2 text-base font-bold text-center text-black">
                            Silakan Hubungi Admin Kami untuk Melakukan
                            Permintaan Pembuatan QRIS Pembayaran
                          </Text>
                        </>
                      )}
                      {setting ? (
                        <View>
                          <View className="flex flex-row items-center justify-center my-3">
                            <MaterialIcons
                              name="email"
                              size={24}
                              color="#000"
                            />
                            <Text className="mx-2 text-black font-bold">
                              {setting?.email || "-"}
                            </Text>
                          </View>
                          <View className="flex flex-row items-center justify-center mb-3 ">
                            <MaterialIcons
                              name="local-phone"
                              size={19}
                              color="#000"
                              style={{}}
                            />
                            <Text className="mx-1 text-black font-bold ">
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

                {formData.payment_type === "va" && (
                  <View style={[styles.card, isExpired && styles.disabledCard]}>
                    <View className="flex-row justify-between">
                      <Text
                        style={styles.cardTitle}
                        className="font-poppins-semibold">
                        Virtual Account
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          !isExpired &&
                          copyToClipboard(formData?.payment?.va_number)
                        }>
                        <Text
                          style={[
                            styles.copyButton,
                            isExpired && styles.disabledText,
                          ]}
                          className="font-poppins-semibold">
                          Salin
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <Text className="text-base font-poppins-semibold text-indigo-600">
                      {formData?.payment?.va_number ||
                        "Nomor VA Tidak Tersedia"}
                    </Text>
                  </View>
                )}

                {formData.payment_type === "va" && (
                  <View style={[styles.card, isExpired && styles.disabledCard]}>
                    <View className="flex-row justify-between">
                      <Text
                        style={styles.cardTitle}
                        className="font-poppins-semibold">
                        Nominal Pembayaran
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          !isExpired &&
                          copyToClipboard(formData?.payment?.nominal)
                        }>
                        <Text
                          style={[
                            styles.copyButton,
                            isExpired && styles.disabledText,
                          ]}
                          className="font-poppins-semibold">
                          Salin
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <Text className="text-base font-bold text-indigo-600">
                      {rupiah(formData?.harga)}
                    </Text>
                  </View>
                )}

                {formData.payment_type === "qris" && (
                  <View style={[styles.card, isExpired && styles.disabledCard]}>
                    {/* Template QR */}
                    <Image
                      source={require("../../../../assets/images/qris-template.png")}
                      style={{
                        width: 350,
                        maxWidth: "100%",
                        height: 450,
                      }}
                    />
                    {/* QRIS */}
                    <Image
                      source={require("../../../../assets/images/qris.png")} // Ganti "qris" dengan path gambar yang sesuai
                      style={{
                        width: "65%",
                        position: "absolute",
                        left: "39%",
                        top: "23%",
                        alignItems: "center",
                        transform: [{ translateX: -50 }, { translateY: -50 }],
                        resizeMode: "contain",
                      }}
                    />
                    {/* Icon Check */}
                    {formData.payment?.status === "success" && (
                      <Image
                        source={require("../../../../assets/images/checked.png")}
                        style={{
                          position: "absolute",
                          width: "20%",
                          height: "20%",
                          left: "95%",
                          top: "80%",
                          transform: [{ translateX: -50 }, { translateY: -50 }],
                          resizeMode: "contain",
                        }}
                      />
                    )}
                  </View>
                )}

                <View style={[styles.card, isExpired && styles.disabledCard]}>
                  <Text className="text-black font-poppins-semibold text-center">
                    Nominal Pembayaran : {rupiah(formData?.payment?.jumlah)}
                  </Text>
                </View>
                {formData.payment?.status === "pending" && (
                  <TouchableOpacity
                    onPress={downloadQris}
                    className="flex-row items-center justify-center p-4 rounded-lg "
                    style={[styles.card, isExpired && styles.disabledCard]}>
                    <Text className="text-black font-poppins-semibold items-center justify-center ">
                      Download QRIS
                    </Text>
                    <MaterialIcons
                      name="qr-code-2"
                      size={24}
                      color="black"
                      paddingLeft={10}
                    />
                  </TouchableOpacity>
                )}

                {formData?.payment?.status !== "success" &&
                  formData?.payment?.is_expired &&
                  !formData?.user_has_va && (
                    <>
                      {formData?.payment_type === "va" && (
                        <View className="flex items-end my-2">
                          <View style={{ marginBottom: 70 }}>
                            <TouchableOpacity
                              className="bg-indigo-600 p-3 rounded-lg"
                              onPress={handleGenerateVA}>
                              <Text style={styles.buttonText}>
                                Buat VA Pembayaran
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                    </>
                  )}
                {formData?.payment?.status !== "success" &&
                  formData?.payment?.is_expired &&
                  !formData?.user_has_va && (
                    <>
                      {formData?.payment_type === "qris" && (
                        <View className="flex items-end my-2">
                          <View style={{}}>
                            <TouchableOpacity
                              className="bg-indigo-600 p-3 rounded-lg"
                              onPress={handleGenerateVA}>
                              <Text style={styles.buttonText}>
                                Buat QRIS Pembayaran
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                    </>
                  )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  cardqr: {
    alignItems: "center",
    justifyContent: "center",
  },
  qrisImage: {
    width: 250, // Sesuaikan ukuran gambar sesuai kebutuhan
    height: 250, // Sesuaikan ukuran gambar sesuai kebutuhan
    backgroundColor: "#e0e0e0",
  },
  disabledCard: {
    backgroundColor: "#e0e0e0", // Warna lebih gelap untuk card yang dinonaktifkan
  },
  disabledText: {
    color: "#a0a0a0", // Warna teks lebih gelap untuk tampilan yang dinonaktifkan
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff", // Warna latar belakang saat loading
  },
  infoText: {
    fontSize: 16,
    marginBottom: 10,
  },
  alertText: {
    fontSize: 18,

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
  },
  amount: {
    fontSize: 17,
  },
  copyButton: {
    color: "#4caf50",

    marginTop: 4,
  },
  button: {
    backgroundColor: "#1976d2",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",

    textAlign: "center",
    fontSize: 14,
  },
});

export default PengujianDetail;
