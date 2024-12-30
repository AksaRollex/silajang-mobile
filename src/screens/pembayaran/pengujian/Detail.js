import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
} from "react-native";
import { useState, useEffect, useCallback, useRef } from "react";
import React from "react";
import axios from "@/src/libs/axios";
import moment from "moment";
import { Clipboard } from "react-native";
import { rupiah } from "@/src/libs/utils";
import { useSetting } from "@/src/services";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Colors } from "react-native-ui-lib";
import { API_URL } from "@env";
import RNFS from "react-native-fs";
import Canvas, { Image as CanvasImage } from "react-native-canvas";
import { SafeAreaView } from "react-native-safe-area-context";
import AntDesign from "react-native-vector-icons/AntDesign";
import IonIcons from "react-native-vector-icons/Ionicons";
import BackButton from "../../components/Back";
import QRCode from "react-native-qrcode-svg";

const PengujianDetail = ({ route, navigation }) => {
  const [formData, setFormData] = useState({ payment: { status: "pending" } });
  const [loading, setLoading] = useState(true);
  const [countdownExp, setCountdownExp] = useState("00:00:00:00");
  const { uuid } = route.params;
  const [qrisValue, setQrisValue] = useState(null);
  const [qrCodeBase64, setQrCodeBase64] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalError, setModalError] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewPath, setPreviewPath] = useState("");
  const { data: setting } = useSetting();
  const copyToClipboard = text => {
    Clipboard.setString(text);
  };
  const canvasRef = useRef(null);
  const qrCodeRef = useRef(null);
  const fetchData = useCallback(() => {
    axios
      .get(`/pembayaran/pengujian/${uuid}`)
      .then(res => {
        setFormData(res.data.data);
        setLoading(false);
        console.log("data pemabyaran ", res.data.data);
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

  useEffect(() => {
    axios
      .get(`/pembayaran/pengujian/${uuid}`)
      .then(res => {
        setQrisValue(res.data.data.payment?.qris_value);
        // console.log(res.data.data.payment?.qris_value, "qris value");
      })
      .catch(err => {
        Alert.alert("error", err.response?.data?.data?.message);
      });
  }, [uuid]);

  const handleGenerateQRIS = () => {
    setLoading(true);
    axios
      .post(`${API_URL}/pembayaran/pengujian/${uuid}/qris`)
      .then(() => {
        Alert.alert("Success", "qris berhasil dibuat");
        fetchData();
      })
      .catch(err => {
        setLoading(false);
        Alert.alert("ERROR", "qris gagal dibuat" || "Gagal Memuat");
      });
  };

  const isExpired = formData?.payment?.is_expired;
  /**
   * Download QRIS dan QRIS template ke galeri perangkat
   *
   * @returns {Promise<void>}
   */

  // Konversi QR code ke base64
  // useEffect(() => {
  //   if (qrCodeRef.current && qrisValue) {
  //     qrCodeRef.current.toDataURL(dataURL => {
  //       setQrCodeBase64(dataURL);
  //     });
  //   }
  // }, [qrisValue]);

  // Fungsi untuk menggambar pada canvas
  const handleCanvas = async canvas => {
    try {
      if (!canvas || canvasRef.current) return;

      const getBase64Image = async imageSource => {
        try {
          const image = await Image.resolveAssetSource(imageSource);
          if (!image?.uri) {
            throw new Error("Invalid image source");
          }

          const response = await fetch(image.uri);
          const blob = await response.blob();

          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error("Failed to read image"));
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.error("getBase64Image error:", error);
          throw error;
        }
      };
      canvasRef.current = canvas;
      const width = 350;
      const height = 450;

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, width, height); // Clear canvas first

      // Then overlay the template
      const qrisTemplateBase64 = await getBase64Image(
        require("../../../../assets/images/qris-template.png"),
      );

      const qrisTemplate = new CanvasImage(canvas);
      qrisTemplate.src = qrisTemplateBase64;
      qrisTemplate.addEventListener("load", () => {
        console.log(qrisTemplate, 222);

        ctx.globalCompositeOperation = "destination-over"; // Draw template behind existing content
        ctx.drawImage(qrisTemplate, 0, 0, width, height);
        ctx.globalCompositeOperation = "source-over"; // Reset composite operation
      });

      // Handle QR code first
      if (qrCodeBase64) {
        const qrisImage = new CanvasImage(canvas);
        qrisImage.src = `data:image/png;base64,${qrCodeBase64}`;
        qrisImage.addEventListener("load", () => {
          const imageWidth = 200;
          const imageHeight = 200;
          const x = (width - imageWidth) / 2;
          const y = 120; // Specific Y position for QR code
          ctx.drawImage(qrisImage, x, y, imageWidth, imageHeight);
        });
      }
    } catch (error) {
      console.error("Error dalam proses render:", error);
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

  // useEffect(() => {
  //   if (qrCodeRef.current && canvasRef.current && qrisValue) {
  //     const canvas = canvasRef.current;
  //     const ctx = canvas.getContext("2d");

  //     const qrImage = new Image();
  //     qrImage.onload = () => {
  //       ctx.drawImage(qrImage, 0, 0);
  //     };
  //     qrImage.src = qrCodeBase64;
  //   }
  // }, [qrCodeBase64]);

  const handleQrCodeRef = ref => {
    if (ref) {
      qrCodeRef.current = ref;
      ref.toDataURL(data => {
        setQrCodeBase64(data);
      });
    }
  };

  const downloadQris = async () => {
    try {
      if (!dataKode) {
        setModalError(true);
        setTimeout(() => {
          setModalError(false);
        }, 2000);
        return;
      }

      if (!canvasRef.current) {
        console.error("Canvas reference not found");
        return;
      }

      const timestamp = new Date().getTime();
      const sanitizedKode = dataKode.replace(/[^a-zA-Z0-9-]/g, "");
      const downloadDir = RNFS.PicturesDirectoryPath;
      const downloadDestPath = `${downloadDir}/${sanitizedKode}.png`;

      console.log("Download Directory:", downloadDir);
      console.log("Full Path:", downloadDestPath);

      // Ensure canvas is fully rendered before getting data URL
      await new Promise(resolve => setTimeout(resolve, 500));

      const fullData = await canvasRef.current.toDataURL("image/png");
      const base64Data = fullData.split(",")[1];

      console.log("Base64 Data Length:", base64Data.length);

      await RNFS.writeFile(downloadDestPath, base64Data, "base64");
      console.log("File berhasil disimpan di:", downloadDestPath);

      setModalVisible(true);
      setTimeout(() => {
        setModalVisible(false);
        setPreviewPath(downloadDestPath); // Simpan path file
        setPreviewVisible(true); // Tampilkan preview
      }, 2000);

      try {
        await RNFS.scanFile(downloadDestPath);
        console.log("File successfully scanned into gallery");
      } catch (error) {
        console.error("Gagal scan file:", error);
      }
    } catch (error) {
      console.error("Gagal dalam proses download:", error);
      console.error("Error Details:", JSON.stringify(error));
    }
  };

  const renderHargaDanAtasNama = () => {
    // Only render if there's no payment data
    if (!formData?.payment) {
      return (
        <>
          <View className="flex-col">
            <View className="flex-row justify-between ">
              <Text className="form-label font-poppins-bold text-black  mb-1">
                Harga
              </Text>
              <Text className="text-base font-poppins-regular text-black">
                {rupiah(formData?.harga || 0)}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="form-label font-poppins-bold text-black  mb-1">
                Atas Nama
              </Text>
              <Text className="text-base font-poppins-regular text-black">
                {formData?.permohonan?.user?.nama || "-"}
              </Text>
            </View>
            <View className="flex-row justify-between ">
              <Text className="form-label font-poppins-bold text-black  mb-1">
                Denda
              </Text>
              <Text className="text-base font-poppins-regular text-black">
                {rupiah(formData?.denda || 0)}
              </Text>
            </View>
          </View>
        </>
      );
    }

    return null;
  };

  const renderNoPaymentAlert = () => {
    // console.log("Payment Type:", formData?.payment_type);
    // console.log("Payment Data:", formData?.payment);
    if (!formData?.payment) {
      return (
        <>
          <View className="bg-indigo-100 border border-indigo-400 p-4 rounded-lg justify-center items-center my-4">
            <Text className="text-base font-poppins-semibold mb-2 text-black text-center">
              {formData?.payment_type === "va"
                ? "VA Pembayaran Belum Dibuat"
                : "QRIS Belum Dibuat"}
            </Text>
            <Text className="text-sm text-indigo-600 font-poppins-regular">
              {formData?.payment_type === "va"
                ? "Silahkan klik Tombol Di Bawah untuk Membuat VA Pembayaran"
                : "Silahkan klik Tombol Di Bawah untuk Membuat QRIS"}
            </Text>
          </View>
          <View className="flex items-end my-2">
            {formData?.payment_type === "va" && (
              <TouchableOpacity
                className="bg-indigo-500 p-3 rounded-lg"
                onPress={handleGenerateVA}>
                <Text className="font-poppins-semibold text-white">
                  Buat VA Pembayaran
                </Text>
              </TouchableOpacity>
            )}
            {formData?.payment_type === "qris" && (
              <TouchableOpacity
                className="bg-indigo-500 p-3 rounded-lg"
                onPress={handleGenerateQRIS}>
                <Text className="font-poppins-semibold text-white">
                  Buat QRIS
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </>
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
      <View className="space-y-4 ">
        <View className="rounded-xl shadow-lg overflow-hidden">
          {formData.payment?.status === "success" && (
            <View className="bg-green-500 flex-row items-center  rounded-lg  justify-between p-4 mt-4">
              <MaterialCommunityIcons
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
                  <View className="ml-5">
                    <Text className="text-blue-800 font-poppins-semibold text-base">
                      Segera Selesaikan Pembayaran
                    </Text>
                    <Text className="text-blue-700 font-poppins-regular text-sm mt-1">
                      Lakukan Pembayaran Sebelum :
                    </Text>
                    <Text className="text-blue-700 font-poppins-regular text-sm mt-1">
                      {countdownExp}
                    </Text>
                  </View>
                </View>
              )}

            {formData.payment?.is_expired && (
              <>
                <View className="flex-col mb-4">
                  <View className="flex-row justify-between ">
                    <Text className="form-label font-poppins-bold text-black  mb-1">
                      Harga
                    </Text>
                    <Text className="text-base font-poppins-regular text-black">
                      {rupiah(formData?.harga || 0)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="form-label font-poppins-bold text-black  mb-1">
                      Atas Nama
                    </Text>
                    <Text className="text-base font-poppins-regular text-black">
                      {formData?.permohonan?.user?.nama || "-"}
                    </Text>
                  </View>
                  <View className="flex-row justify-between ">
                    <Text className="form-label font-poppins-bold text-black  mb-1">
                      Denda
                    </Text>
                    <Text className="text-base font-poppins-regular text-black">
                      {rupiah(formData?.denda || 0)}
                    </Text>
                  </View>
                </View>
                <View className="flex-row  justify-between items-center  pb-4 border-b border-gray-100">
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
                      {formData.payment?.type === "va" &&
                        "Virtual Account telah kedaluwarsa"}
                      {formData.payment?.type === "qris" &&
                        "QRIS telah kedaluwarsa"}
                    </Text>
                  </View>
                </View>
                <View className="bg-[#fff] rounded-lg mb-3">
                  {formData?.payment_type === "va" && (
                    <>
                      <Text className=" p-2 my-2 text-base font-poppins-semibold text-center text-black">
                        Silakan Hubungi Admin Kami untuk Melakukan Permintaan
                        Pembuatan VA Pembayaran
                      </Text>
                    </>
                  )}
                  {formData?.payment_type === "qris" && (
                    <>
                      <Text className=" p-2 my-2 text-base font-poppins-semibold text-center text-black">
                        Silakan Hubungi Admin Kami untuk Melakukan Permintaan
                        Pembuatan QRIS Pembayaran
                      </Text>
                    </>
                  )}
                  {setting ? (
                    <View>
                      <View className="flex flex-row items-center justify-center my-3">
                        <MaterialIcons name="email" size={24} color="#000" />
                        <Text className="font-poppins-semibold text-black mx-1 ">
                          Email :
                        </Text>
                        <Text className=" text-black font-bold">
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
                        <Text className="font-poppins-semibold text-black mx-1 ">
                          Telepon :
                        </Text>
                        <Text className=" text-black font-poppins-semibold ">
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
              </>
            )}

            <View className="flex-row items-center mb-4 pb-4 border-b border-gray-100">
              <View className="flex-1">
                <Text className="text-lg font-poppins-semibold text-gray-800">
                  {formData.payment?.type === "va" ? "Virtual Account" : "QRIS"}
                </Text>
                {formData.payment?.type === "va" && (
                  <View
                    className="flex-row items-center"
                    style={{
                      opacity:
                        formData.payment.is_expired ||
                        formData.payment.status === "success"
                          ? 0.5
                          : 1,
                    }}>
                    <View className="bg-white p-2 rounded-lg mr-1">
                      <Image
                        source={require("../../../../assets/images/bank-jatim.png")}
                        className="w-[100px] h-[23px] object-cover"
                      />
                    </View>
                    <Text className="text-blue-600 font-poppins-semibold text-base">
                      {formData.payment.va_number}
                    </Text>
                  </View>
                )}
                {formData.payment?.type === "qris" &&
                  formData.payment?.status === "pending" && (
                    <Text className="text-gray-600 font-poppins-regular mt-2">
                      Gunakan QRIS untuk pembayaran
                    </Text>
                  )}
              </View>
              {formData.payment?.type === "va" && (
                <TouchableOpacity
                  disabled={
                    formData.payment.is_expired ||
                    formData.payment.status === "success"
                  }
                  onPress={() => copyToClipboard(formData.payment.va_number)}
                  className="bottom-4"
                  style={{
                    opacity:
                      formData.payment.is_expired ||
                      formData.payment.status === "success"
                        ? 0.5
                        : 1,
                  }}>
                  <Text
                    className={`font-poppins-semibold ${
                      formData.payment.is_expired ||
                      formData.payment.status === "success"
                        ? "text-gray-400"
                        : "text-green-600"
                    }`}>
                    Salin
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {formData.payment?.type === "qris" && (
              <View className="items-center mb-4 pb-4 border-b border-gray-100">
                <View
                  style={{
                    opacity:
                      formData.payment?.is_expired ||
                      formData.payment?.status === "success"
                        ? 0.5
                        : 1,
                  }}>
                  {/* Tampilkan ActivityIndicator jika qrisValue kosong atau null */}
                  {!qrisValue ? (
                    <View
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                        flex: 1,
                      }}>
                      <ActivityIndicator size="large" color={Colors.brand} />
                    </View>
                  ) : (
                    <>
                      <View
                        className="mx-20 top-20 mt-10"
                        style={{ opacity: 0 }}>
                        <QRCode
                          value={qrisValue}
                          getRef={handleQrCodeRef}
                          size={200}
                        />
                      </View>
                      {Boolean(qrCodeBase64) && (
                        <Canvas
                          ref={handleCanvas}
                          style={{
                            position: "absolute",
                            zIndex: -1,
                          }}
                        />
                      )}
                    </>
                  )}
                </View>

                {formData.payment.status === "pending" && (
                  <View className="mt-56">
                    <TouchableOpacity
                      onPress={downloadQris}
                      disabled={formData.payment.is_expired}
                      className={`flex-row mt-3 px-4 py-2 p-3 rounded-lg ${
                        formData.payment.is_expired
                          ? "bg-gray-200"
                          : "bg-blue-50"
                      }`}
                      style={{
                        opacity: formData.payment.is_expired ? 0.5 : 1, // Mengatur opacity sesuai kondisi
                      }}>
                      <Text
                        className={`font-poppins-semibold ${
                          formData.payment.is_expired
                            ? "text-gray-400"
                            : "text-black"
                        }`}>
                        Unduh QRIS
                      </Text>
                      <MaterialIcons
                        name="qr-code-2"
                        size={24}
                        color={formData.payment.is_expired ? "gray" : "black"}
                        style={{ paddingLeft: 10 }}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            <View className="">
              <Text className="text-lg text-gray-800 font-poppins-semibold mb-1">
                Nominal Pembayaran
              </Text>
              <View
                className="flex-row items-center justify-between"
                style={{
                  opacity:
                    formData.payment?.is_expired ||
                    formData.payment?.status === "success"
                      ? 0.5
                      : 1,
                }}>
                <Text className="font-poppins-semibold text-base text-blue-600 ">
                  {rupiah(formData.payment.jumlah)}
                </Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(formData.payment.jumlah)}
                  disabled={
                    formData.payment.is_expired ||
                    formData.payment.status === "success"
                  }
                  className="bottom-4"
                  // style={{
                  //   opacity:
                  //     formData.payment.is_expired ||
                  //     formData.payment.status !== "success"
                  //       ? 0.5
                  //       : 1,
                  // }}
                >
                  <Text
                    className={`font-poppins-semibold ${
                      formData.payment.is_expired ||
                      formData.payment.status === "success"
                        ? "text-gray-400"
                        : "text-green-600"
                    }`}>
                    Salin
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.brand} />
      </View>
    );
  }
  return (
    <View className="p-3 bg-[#ececec]">
      <View
        className="rounded-3xl bg-[#fff] w-full h-full"
        style={{
          elevation: 5,
          shadowColor: "rgba(0, 0, 0, 0.1)",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 2,
        }}>
        <View className="flex-row px-4 pt-5 mb-2 pb-1  justify-between ">
          <BackButton
            size={24}
            color={"black"}
            action={() => navigation.goBack()}
            className="mr-2 "
          />
          <Text className=" font-poppins-semibold text-black text-lg text-end ">
            {formData?.kode || "Detail Pembayaran"}
          </Text>
        </View>

        <Modal animationType="fade" transparent={true} visible={modalVisible}>
          <View style={styles.overlayView}>
            <View style={styles.successContainer}>
              <View className="w-20 h-20 rounded-full bg-green-50 justify-center items-center mb-4">
                <IonIcons
                  size={50}
                  color="#95bb72"
                  name="checkmark-done-sharp"
                />
              </View>
              <Text style={styles.successTextTitle}>
                File berhasil di download
              </Text>
              <Text style={styles.successText}>
                Silahkan untuk cek file di folder download anda !
              </Text>
            </View>
          </View>
        </Modal>

        {previewVisible && (
          <Modal
            animationType="slide"
            transparent={true}
            visible={previewVisible}>
            <View style={styles.overlayView}>
              <View style={styles.previewContainer}>
                <Image
                  source={{ uri: `file://${previewPath}` }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setPreviewVisible(false)}>
                  <Text style={styles.closeButtonText}>Tutup</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

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
              <Text style={styles.successText}>Gagal mengambil data kode</Text>
            </View>
          </View>
        </Modal>

        <ScrollView>
          <View className="px-4">
            {renderHargaDanAtasNama()}
            {renderNoPaymentAlert()}
            {renderPaymentDetails()}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  previewContainer: {
    width: "90%",
    height: "70%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  previewImage: {
    width: "100%",
    height: "80%",
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: "#f00",
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
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
});

export default PengujianDetail;
