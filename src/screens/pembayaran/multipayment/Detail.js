import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
} from "react-native";
import axios from "@/src/libs/axios";
import moment from "moment";
import { Clipboard } from "react-native";
import Back from "../../components/Back";
import { rupiah } from "@/src/libs/utils";
import { useSetting } from "@/src/services";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { QueryClient } from "@tanstack/react-query";
import RNFS from "react-native-fs";
import Canvas, { Image as CanvasImage } from "react-native-canvas";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AntDesign from "react-native-vector-icons/AntDesign";
const MultipaymentDetail = ({ route, navigation }) => {
  const [formData, setFormData] = useState({});
  const [countdownExp, setCountdownExp] = useState("00:00:00:00");
  const [dateExp, setDateExp] = useState("06:60:60:60");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalError, setModalError] = useState(false);
  const { uuid } = route.params;
  const canvasRef = useRef(null);
  console.log(route);
  const { data: setting } = useSetting();

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

      const qrisBase64 = await getBase64Image(
        require("../../../../assets/images/qrcodes.png"),
      );
      const qrisTemplateBase64 = await getBase64Image(
        require("../../../../assets/images/qris-template.png"),
      );

      if (!canvas || canvasRef.current) return;

      canvasRef.current = canvas;
      const width = 340;
      const height = 440;

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
        const imageWidth = 180;
        const imageHeight = 180;
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
        QueryClient.invalidateQueries(`/pembayaran/multi-payment/${uuid}`);
      });
  };

  const isExpired = formData?.data?.is_expired;

  const renderPaymentInfo = () => (
    <>
      <View className=" p-4">
        <View className="border-gray-300  flex-col ">
          <Text
            className="text-gray-800 text-lg"
            style={{
              fontFamily: "Poppins-SemiBold",
            }}>
            Titik Permohonan
          </Text>
          <Text className=" font-poppins-regular text-gray-600 ">
            {formData?.data?.multi_payments
              ?.map(payment => payment.titik_permohonan.kode)
              .join(", ") || "Kode Kosong"}
          </Text>
        </View>

        <View className="flex-col  border-gray-300 mt-2">
          <Text className="font-poppins-semibold  text-gray-800  text-lg">
            Total Harga
          </Text>
          <Text className="font-poppins-regular text-gray-600 ">
            {rupiah(formData?.data?.jumlah)}
          </Text>
        </View>
        <View className="border-gray-300 mb-1 flex-col mt-2">
          <Text
            className="text-gray-800 text-lg"
            style={{
              fontFamily: "Poppins-SemiBold",
            }}>
            Atas Nama
          </Text>
          <Text
            className="text-gray-600 "
            style={{
              fontFamily: "Poppins-Regular",
            }}>
            {formData?.data?.nama || "-"}
          </Text>
        </View>
        <View className="mt-2 flex-col ">
          <Text
            className="text-gray-800 text-lg"
            style={{
              fontFamily: "Poppins-SemiBold",
            }}>
            Tipe Pembayaran
          </Text>
          <Text className=" font-poppins-regular text-gray-600">
            {formData.data?.type === "va" ? "Virtual Account" : "QRIS"}
          </Text>

          {formData.data?.type === "qris" &&
            formData.data?.status === "pending" && (
              <Text className="text-gray-600 font-poppins-regular ">
                Gunakan QRIS untuk pembayaran
              </Text>
            )}
        </View>
      </View>
    </>
  );

  const renderPaymentStatus = () => {
    if (formData?.data?.status === "success") {
      return (
        <View className="bg-green-500 flex-row justify-between items-center p-4 rounded-t-xl">
          <MaterialCommunityIcons
            name="check-decagram"
            size={28}
            color="white"
            className="mr-4"
          />
          <View class="">
            <Text className="text-white font-poppins-semibold text-base ml-3">
              Pembayaran Berhasil
            </Text>
            <Text className="text-green-100 font-poppins-regular text-sm mt-1 ml-3">
              Dilakukan pada:{" "}
              {moment(formData.data?.tanggal_bayar).format("DD-MM-YYYY")}
            </Text>
          </View>
        </View>
      );
    } else if (formData?.data?.status === "failed") {
      return (
        <View>
          {/* <Text className="bg-red-500 text-white text-center p-3 rounded-lg mb-4 font-poppins-semibold">
          Pembayaran gagal. Silakan coba lagi.
        </Text> */}
        </View>
      );
    } else if (formData?.data?.is_expired && formData?.data?.type === "va") {
      return (
        <View className=" rounded-lg mb-3 relative ">
          {formData?.data?.type === "va" && (
            <>
              <Text className=" p-2 my-2 text-base font-poppins-semibold text-center text-black">
                Silakan Hubungi Admin Kami untuk Melakukan Permintaan Pembuatan
                VA Pembayaran
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
      );
    } else if (formData?.data?.is_expired && formData?.data?.type === "qris") {
      return (
        <View>
          <View className="flex-row  justify-between items-center  p-2 border-b border-gray-100">
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
                {formData.data?.type === "va" &&
                  "Virtual Account telah kedaluwarsa"}
                {formData.data?.type === "qris" && "QRIS telah kedaluwarsa"}
              </Text>
            </View>
          </View>

          <View className=" rounded-lg mb-3">
            {formData?.data?.type === "qris" && (
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
        </View>
      );
    } else if (formData?.data?.is_expired) {
      return (
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
      );
    }
  };

  const renderPaymentButton = () => {
    if (formData?.data?.status === "pending") {
      return null;
    }
    if (formData?.data?.status !== "success" && !formData?.data?.is_expired) {
      if (formData?.data?.type === "va" && !formData?.data?.user_has_va) {
        return (
          <View className="flex items-end my-2">
            <TouchableOpacity
              className="bg-indigo-600 p-3 rounded-lg"
              onPress={handleGenerateVA}>
              <Text className="font-poppins-semibold text-white">
                Buat VA Pembayaran
              </Text>
            </TouchableOpacity>
          </View>
        );
      } else if (formData?.data?.type === "qris" && !formData?.user_has_qris) {
        return (
          <View className="flex items-end my-2">
            <TouchableOpacity
              className="bg-indigo-500 p-3 rounded-lg"
              onPress={handleGenerateQris}>
              <Text className="font-poppins-semibold text-white">
                Buat QRIS
              </Text>
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
            <Text className="font-poppins-semibold text-lg text-gray-800">
              Virtual Account
            </Text>
            <View
              className="flex-row justify-between"
              style={{
                opacity:
                  formData.data?.is_expired ||
                  formData.data?.status === "success"
                    ? 0.5
                    : 1,
              }}>
              {formData.data?.type === "va" && (
                <>
                  <View className="flex-row items-center">
                    <View className="bg-white p-2 rounded-lg mr-1">
                      <Image
                        source={require("../../../../assets/images/bank-jatim.png")}
                        className="w-[100px] h-[23px] object-cover"
                      />
                    </View>
                    <Text className="text-blue-600 font-poppins-semibold text-base">
                      {formData.data?.va_number}
                    </Text>
                  </View>
                  <TouchableOpacity
                    disabled={formData.data?.is_expired}
                    onPress={() => copyToClipboard(formData.data?.va_number)}
                    className="bottom-4"
                    // style={{
                    //   opacity:
                    //     formData.data?.is_expired ||
                    //     formData?.data?.status === "success"
                    //       ? 0.5
                    //       : 1,
                    // }}
                  >
                    <Text
                      className={`font-poppins-semibold ${
                        formData.data?.is_expired ||
                        formData?.data?.status === "success"
                          ? "text-gray-400"
                          : "text-green-600"
                      }`}>
                      Salin
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
          <View style={styles.card}>
            <View>
              <Text className="text-lg text-black font-poppins-bold mb-1">
                Total Harga
              </Text>
            </View>
            <View
              className="flex-row items-center justify-between"
              style={{
                opacity:
                  formData.data?.is_expired ||
                  formData.data?.status === "success"
                    ? 0.5
                    : 1,
              }}>
              <Text className="font-poppins-semibold text-base text-blue-600 ">
                {rupiah(formData.data?.jumlah)}
              </Text>
              <TouchableOpacity
                onPress={() => copyToClipboard(formData.data?.jumlah)}
                disabled={
                  formData.data?.is_expired ||
                  formData.data?.status === "success"
                }
                className="bottom-4"
                // style={{
                //   opacity:
                //     formData.data?.is_expired ||
                //     formData.data?.status === "success"
                //       ? 0.5
                //       : 1,
                // }}
              >
                <Text
                  className={`font-poppins-semibold 
                    ${
                      formData.data?.is_expired ||
                      formData.data?.status === "success"
                        ? "text-gray-400"
                        : "text-green-600"
                    }
                  `}>
                  Salin
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      );
    } else if (formData?.data?.type === "qris") {
      return (
        <View>
          <View className="items-center  justify-center">
            <View
              style={{
                opacity:
                  formData.data?.is_expired ||
                  formData.data?.status === "success"
                    ? 0.5
                    : 1,
              }}>
              <Canvas ref={handleCanvas} />
            </View>
          </View>
          <View className="px-4 my-4  justify-center items-center">
            {formData.data.status === "pending" && (
              <TouchableOpacity
                onPress={downloadQris}
                disabled={formData.data.is_expired}
                className={`flex-row p-3 rounded-lg ${
                  formData.data.is_expired ? "bg-gray-200" : "bg-blue-50"
                }`}
                style={{
                  opacity: formData.data.is_expired ? 0.5 : 1, // Mengatur opacity sesuai kondisi
                }}>
                <Text
                  className={`font-poppins-semibold ${
                    formData.data.is_expired ? "text-gray-400" : "text-black"
                  }`}>
                  Unduh QRIS
                </Text>
                <MaterialIcons
                  name="qr-code-2"
                  size={24}
                  color={formData.data.is_expired ? "gray" : "black"}
                  style={{ paddingLeft: 10 }}
                />
              </TouchableOpacity>
            )}
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
          <View className="border  border-indigo-400 rounded-lg my-2 p-4  bg-indigo-100  justify-center items-center ">
            <Text className="text-base font-poppins-semibold mb-2 text-black text-center">
              VA Pembayaran Belum Dibuat
            </Text>
            <Text className="text-sm text-indigo-600 font-poppins-regular ">
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
          <View className="border justify-center items-center  border-indigo-400 rounded-lg my-2 p-4  bg-indigo-100 ">
            <Text className="text-base font-poppins-semibold mb-2 text-black">
              QRIS Pembayaran Belum Dibuat
            </Text>
            <Text className="text-sm text-indigo-600 font-poppins-regular ">
              Silahkan klik Tombol Di Bawah untuk Membuat QRIS
            </Text>
          </View>
        </>
      );
    }
  };

  return (
    <>
      <View className="p-3 w-full h-full bg-[#ececec]">
        <View className="h-full w-full bg-[#f8f8f8] rounded-3xl">
          <View className="flex-row px-4 pt-5 pb-1  justify-between ">
            <Back
              size={24}
              color={"black"}
              action={() => navigation.goBack()}
              className="mr-2 "
            />

            {formData?.data?.kode ? (
              <View>
                <Text className="font-poppins-semibold text-black text-lg text-end">
                  {formData?.data?.kode}
                </Text>
              </View>
            ) : (
              <View className="text-end text-sm items-center justify-center">
                <Text className="text-white font-poppins-regular">
                  Kode tidak tersedia
                </Text>
              </View>
            )}
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
          <ScrollView className="px-3 py-1 rounded-b-md">
            <View className="py-4 px-3 rounded-lg ">
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
        </View>
      </View>
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
  },
  vaNumber: {
    fontSize: 17,
  },
  amount: {
    fontSize: 17,
  },
  copyButton: {
    color: "#4caf50",
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

export default MultipaymentDetail;
