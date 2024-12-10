import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Clipboard,
  Alert,
  Modal ,
  StyleSheet
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AntDesign from "react-native-vector-icons/AntDesign";
import QRCode from "react-native-qrcode-svg";
import moment from "moment";
import axios from "@/src/libs/axios";
import RNFS from "react-native-fs";
import Canvas, { Image as CanvasImage } from "react-native-canvas";
import Toast from "react-native-toast-message";import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const formatCurrency = amount => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const Detail = ({ route, navigation }) => {
  const { uuid } = route.params || {};
  const [formData, setFormData] = useState(null);
  const [qrisImage, setQrisImage] = useState(null);
  const [countdown, setCountdown] = useState("00:00:00:00");
  const [modalVisible, setModalVisible] = useState(false);
  const [ modalError, setModalError ] = useState(false) 

  const canvasRef = useRef(null);
  // useEffect(() => {
  //   let intervalId;
  //   if (formData?.payment?.tanggal_exp) {
  //     intervalId = setInterval(calculateCountdown, 1000);
  //     return () => clearInterval(intervalId);
  //   }
  // }, [formData]);

  const fetchPaymentDetails = async () => {
    try {
      const response = await axios.get(`/pembayaran/pengujian/${uuid}`);
      const data = response.data.data;
      setFormData(data);
      console.log(data);

      // Generate QRIS if needed
      // if (data.payment?.type === "qris" && data.payment?.qris_value) {
      //   QRCode.toDataURL(data.payment.qris_value)
      //     .then(url => setQrisImage(url))
      //     .catch(err => console.error(err));
      // }
    } catch (error) {
      console.error(
        "Error fetching payment details:",
        error.response?.data?.message,
      );
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to fetch details",
      );
    }
  };

  useEffect(() => {
    fetchPaymentDetails();
  }, [uuid]);

  useEffect(() => {
    if (formData?.payment?.tanggal_exp) {
      const interval = setInterval(() => {
        const now = moment();
        const exp = moment(formData.payment.tanggal_exp); // Ambil tanggal_exp dari formData
        const diff = exp.diff(now);

        if (diff <= 0) {
          clearInterval(interval);
          setCountdown("00:00:00:00");
        } else {
          setCountdown(calculateCountdown(exp, now));
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [formData]);


  /**
   * Download QRIS dan QRIS template ke galeri perangkat
   *
   * @returns {Promise<void>}
   */

  const handleCanvas = async canvas => {
    try {
      // Fungsi untuk mengambil gambar sebagai base64
      const getBase64Image = async imageSource => {
        const photo = Image.resolveAssetSource(imageSource);
        const photoUri = photo?.uri;

        if (!photoUri) {
          throw new Error(`Image not found`);
        }

        const response = await fetch(photoUri);
        const blob = await response.blob();

        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result.split(",")[1] || reader.result;
            resolve(`data:image/png;base64,${base64String}`);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      };

      // Ambil base64 untuk QRIS dan template QRIS
      const qrisBase64 = await getBase64Image(
        require("../../../assets/images/qris.png"),
      );
      const qrisTemplateBase64 = await getBase64Image(
        require("../../../assets/images/qris-template.png"),
      );

      if (!canvas || canvasRef.current) return;

      canvasRef.current = canvas;
      const width = 350;
      const height = 450;

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");

      const qrisTemplate = new CanvasImage(canvas);
      qrisTemplate.src = qrisTemplateBase64;
      qrisTemplate.addEventListener("load", () => {
        // Gambar template terlebih dahulu
        ctx.drawImage(qrisTemplate, 0, 0, width, height);
      });

      const qrisImage = new CanvasImage(canvas);
      qrisImage.src = qrisBase64;
      qrisImage.addEventListener("load", () => {
        // Gambar QRIS di tengah template
        const imageWidth = 200;
        const imageHeight = 200;
        const x = (width - imageWidth) / 2;
        const y = (height - imageHeight) / 2;

        // Gambar QRIS di atas template
        ctx.drawImage(qrisImage, x, y, imageWidth, imageHeight);
      });
    } catch (error) {
      console.error("Error dalam proses download:", error);
      throw error;
    }
  };

  const [dataKode, setDataKode] = useState(null);

  useEffect(() => {
    axios
      .get(`/pembayaran/pengujian/${uuid}`)
      .then(res => {
        setDataKode(res.data.data?.kode);
        console.log(res.data.data?.kode, 1111);
      })
      .catch(err => {
        Alert.alert("error", err.response?.data?.data?.kode.message);
      });
  }, [uuid]);

 const downloadQris = () => {
    if (!dataKode) {
      setModalError(true);
      setTimeout(() => {
        setModalError(false);
      }, 2000);
      return;
    }

    const sanitizedKode = dataKode.replace(/[^a-zA-Z0-9-]/g, "");
    const downloadDir = RNFS.PicturesDirectoryPath;
    const downloadDestPath = `${downloadDir}/${sanitizedKode}.png`;

    console.log("Download Directory:", downloadDir);
    console.log("Full Path:", downloadDestPath);

    canvasRef.current
      .toDataURL("image/png")
      .then(fullData => {
        const base64Data = fullData.split(",")[1];

        console.log("Base64 Data Length:", base64Data.length);

        RNFS.writeFile(downloadDestPath, base64Data, "base64")
          .then(() => {
            console.log("File berhasil disimpan di:", downloadDestPath);
            setModalVisible(true);
            setTimeout(() => {
              setModalVisible(false);
            }, 2000);

            // Coba scan file ke gallery
            RNFS.scanFile(downloadDestPath)
              .then(() => {
                console.log("File successfully scanned into gallery");
              })
              .catch(error => {
                console.error("Gagal scan file:", error);
              });
          })
          .catch(error => {
            console.error("Gagal menyimpan file:", error);
            // Log detail error
            console.error("Error Details:", JSON.stringify(error));
          });
      })
      .catch(error => {
        console.error("Gagal mengambil data URL:", error);
      });
  };

  

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

  const copyToClipboard = text => {
    Clipboard.setString(text.toString());
  };

  const renderHargaDanAtasNama = () => {
    // Only render if there's no payment data
    if (!formData?.payment) {
      return (
        <View className="flex-row">
          <View className="flex-1 mr-2">
            <Text className="form-label font-poppins-bold text-dark text-sm mb-1">
              Harga
            </Text>
            <Text className="text-base font-poppins-semibold">
              {formatCurrency(formData?.harga || 0)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="form-label font-poppins-bold text-dark text-sm mb-1">
              Atas Nama
            </Text>
            <Text className="text-base font-poppins-semibold">
              {formData?.permohonan?.user?.nama || "-"}
            </Text>
          </View>
        </View>
      );
    }

    return null;
  };

  const renderNoPaymentAlert = () => {
    if (!formData?.payment) {
      return (
        <View className="bg-blue-100 p-4 rounded-lg items-center">
          <Text className="text-base font-poppins-semibold mb-2">
            {formData?.payment_type === "va"
              ? "VA Pembayaran Belum Dibuat"
              : "QRIS Belum Dibuat"}
          </Text>
          <Text className="text-sm text-gray-700 text-center">
            {formData?.payment_type === "va"
              ? "Silahkan klik Tombol Di Bawah untuk Membuat VA Pembayaran"
              : "Silahkan klik Tombol Di Bawah untuk Membuat QRIS"}
          </Text>
        </View>
      );
    }
    return null;
  };

  const renderPaymentDetails = () => {
    // If no payment data exists, return null
    if (!formData?.payment) {
      return null;
    }

    return (
      <View className="space-y-4 mb-20">
        <View className="rounded-xl shadow-lg overflow-hidden">
          {formData.payment?.status === "success" && (
            <View className="bg-green-500 flex-row items-center p-4">
              <MaterialIcons
                name="check-decagram"
                size={28}
                color="white"
                className="mr-4"
              />
              <View>
                <Text className="text-white font-poppins-semibold text-base ml-3">
                  Pembayaran Berhasil
                </Text>
                <Text className="text-green-100 font-poppins-regular text-sm mt-1 ml-3">
                  Dilakukan pada:{" "}
                  {moment(formData.payment.tanggal_bayar).format("DD-MM-YYYY")}
                </Text>
              </View>
            </View>
          )}

          <View className="bg-white p-5">
            {formData.payment?.is_expired === false &&
              formData.payment?.status !== "success" && (
                <View className="flex-row items-center mb-4 pb-4 border-b border-gray-100">
                  <AntDesign name="clockcircle" size={28} color="#3B82F6" />
                  <View className="ml-3">
                    <Text className="text-blue-800 font-poppins-semibold text-base">
                      Segera Selesaikan Pembayaran
                    </Text>
                    <Text className="text-blue-700 font-poppins-regular text-sm mt-1">
                      Lakukan Pembayaran Sebelum :
                    </Text>
                    <Text className="text-blue-700 font-poppins-regular text-sm mt-1">
                    {countdown}
                    </Text>
                  </View>
                </View>
              )}

            {formData.payment?.is_expired && (
              <View className="flex-row items-center mb-4 pb-4 border-b border-gray-100">
                <AntDesign
                  name="exclamationcircle"
                  size={28}
                  color="#EF4444"
                  className="mr-4"
                />
                <View>
                  <Text className="text-red-800 font-poppins-semibold text-base">
                    Pembayaran Kedaluwarsa
                  </Text>
                  <Text className="text-red-700 font-poppins-regular text-sm mt-1">
                    {formData.payment?.type === "va"
                      ? "Virtual Account telah kedaluwarsa"
                      : "QRIS telah kedaluwarsa"}
                  </Text>
                </View>
              </View>
            )}

            <View className="flex-row items-center mb-4 pb-4 border-b border-gray-100">
              <View className="flex-1">
                <Text className="text-lg font-poppins-semibold text-gray-800">
                  {formData.payment?.type === "va" ? "Virtual Account" : "QRIS"}
                </Text>
                {formData.payment?.type === "va" ? (
                  <View className="flex-row items-center">
                    <View className="bg-white p-2 rounded-lg mr-1">
                      <Image
                        source={require("../../../assets/images/bank-jatim.png")}
                        className="w-[100px] h-[23px] object-cover"
                      />
                    </View>
                    <Text className="text-blue-600 font-poppins-medium text-base">
                      {formData.payment.va_number}
                    </Text>
                  </View>
                ) : (
                  <Text className="text-gray-600 font-poppins-regular mt-2">
                    Gunakan QRIS untuk pembayaran
                  </Text>
                )}
              </View>
              {formData.payment?.type === "va" && (
                <TouchableOpacity
                  onPress={() => copyToClipboard(formData.payment.va_number)}
                  disabled={formData.payment?.is_expired}
                  className="bottom-4">
                  <Text className="text-green-600 font-poppins-semibold">
                    Salin
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {formData.payment?.type === "qris" && (
              <View className="items-center mb-4 pb-4 border-b border-gray-100">
                <View style={{ height: 450 }}>
                      <Canvas ref={handleCanvas} />
                    </View>
                {formData.payment?.status === "pending" && (
                  <TouchableOpacity
                    onPress={downloadQris}
                    disabled={formData.payment?.is_expired}
                    className="flex-row mt-3 bg-blue-50 px-4 py-2 p-3 rounded-lg">
                    <Text className="text-blue-600 font-poppins-semibold">
                      Unduh QRIS
                    </Text>
                    <MaterialIcons
                      name="qr-code-2"
                      size={24}
                      color="black"
                      paddingLeft={10}
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}

            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm text-gray-600 font-poppins-regular mb-1">
                  Nominal Pembayaran
                </Text>
                <Text className="text-xl text-blue-600 font-poppins-semibold">
                  {formatCurrency(formData.payment.jumlah)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => copyToClipboard(formData.payment.jumlah)}
                disabled={formData.payment?.is_expired}
                className="top-3">
                <Text className="text-green-600 font-poppins-semibold">
                  Salin
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View
        className="flex-row mx-4 my-3 rounded-xl py-4 px-3 bg-white shadow-sm"
        style={{
          elevation: 6,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 4,
          shadowOffset: 10,
        }}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Pengujian")}
          className="mr-3 px-4 py-3 bg-red-500 rounded-xl ml-2">
          <AntDesign name="arrowleft" size={20} color="white" />
        </TouchableOpacity>
        <Text className="top-2 text-xl ml-2 font-poppins-semibold text-black">
          {formData?.kode || "Detail Pembayaran"}
        </Text>
      </View>

      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View style={styles.overlayView}>
          <View style={styles.successContainer}>
            <Image
              source={require("@/assets/images/check-mark.png")}
              style={styles.lottie}
            />

            <Text style={styles.successTextTitle}>
              File berhasil di download
            </Text>
            <Text style={styles.successText}>
              Silahkan untuk cek file di folder download anda !
            </Text>
          </View>
        </View>
      </Modal>
      <Modal animationType="fade" transparent={true} visible={modalError}>
        <View style={styles.overlayView}>
          <View style={styles.successContainer}>
            <Image
              source={require("@/assets/images/check-mark.png")}
              style={styles.lottie}
            />

            <Text style={styles.successTextTitle}>
              File gagal di download
            </Text>
            <Text style={styles.successText}>
            Gagal mengambil data kode
            </Text>
          </View>
        </View>
      </Modal>

      <ScrollView>
        <View className="p-4">
          {renderHargaDanAtasNama()}
          {renderNoPaymentAlert()}
          {renderPaymentDetails()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
 card: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    marginTop: 10,
    elevation: 3,
  },
  overlayView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  successContainer: {
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
    width: "90%",
    paddingVertical: 30,
    borderRadius: 10,
  },
  lottie: {
    width: 170,
    height: 170,
  },

  successTextTitle: {
    textAlign: "center",
    color: "black",

    fontFamily: "Poppins-SemiBold",
  },
  successText: {
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Poppins-Regular",
    color: "black",
  },
  errortitle: {
    color: "#FF4B4B",
  },
  errorText: {
    color: "#666",
  },
})
export default Detail;

