import * as React from "react";
import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  Modal,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { TextField, Colors, Button, TextArea } from "react-native-ui-lib";
import Toast, { BaseToast } from "react-native-toast-message";
import axios from "@/src/libs/axios";
import Back from "../../components/Back";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import MaterialIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Select2 from "../../components/Select2";
import LottieView from "lottie-react-native";

const TambahPermohonan = ({ navigation }) => {
  const [jasaPengambilan, setJasaPengambilan] = useState([]);
  const [selectedJasaPengambilan, setSelectedJasaPengambilan] = useState(null);
  const [OpenJasaPengambilan, setOpenJasaPengambilan] = useState(false);
  const [selectedCara, setSelectedCara] = useState(null);
  const [selectedPembayaran, setSelectedPembayaran] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [percuy, setPercuy] = useState(null);
  const [modalPercuy, setModalPercuy] = useState(false);

  console.log("percuy", percuy);

  useEffect(() => {
    axios
      .get("/master/jasa-pengambilan")
      .then(response => {
        const formattedJasaPengambilan = response.data.data.map(item => ({
          title: item.wilayah,
          value: item.id,
        }));
        console.log(formattedJasaPengambilan);
        setJasaPengambilan(formattedJasaPengambilan);
      })
      .catch(error => {
        console.error("Error fetching data :", error);
      });
  }, []);

  const {
    handleSubmit,
    control,
    formState: { errors },
    getValues,
  } = useForm();

  const toastConfig = {
    success: () => (
      <>
        <View className="relative">
          <View className="bg-[#dddddd] mx-6 p-4 rounded-xl min-h-16 shadow-md">
            <View className="flex-1 pr-8">
              <Text className="text-green-500 text-sm font-poppins-semibold mb-1">
                Data Berhasil Disimpan !
              </Text>
              <Text className="text-gray-600 text-xs font-poppins-regular">
                Silahkan Untuk Menambahkan Parameter Lainnya Di Dalam Halaman
                Titik Uji Dan Parameter !
              </Text>
            </View>
          </View>
          <View className="absolute right-1 top-1/4 -translate-y-1/2">
            <MaterialIcons name="check-circle" size={50} color="#22C55E" />
          </View>
        </View>
      </>
    ),

    error: ({ text2 }) => (
      <View className="bg-white mx-4 mt-2 p-4 rounded-xl min-h-16 flex-row items-center justify-between shadow-md">
        <View className="flex-1 mr-3">
          <Text className="text-red-500 text-sm font-semibold mb-1">Error</Text>
          <Text className="text-gray-600 text-xs">{text2}</Text>
        </View>
        <View className="w-6 h-6 justify-center items-center">
          <MaterialIcons name="close-circle" size={24} color="#EF4444" />
        </View>
      </View>
    ),
  };

  const queryClient = useQueryClient();
  const {
    mutate: send,
    isLoading,
    isSuccess,
  } = useMutation(
    () => {
      const requestData = {
        industri: getValues("industri"),
        alamat: getValues("alamat"),
        kegiatan: getValues("kegiatan"),
        keterangan: getValues("keterangan"),
        is_mandiri: selectedCara === "kirimMandiri" ? 1 : 0,
        pembayaran: "transfer",
        jasa_pengambilan_id: selectedJasaPengambilan,
      };

      return axios.post("/permohonan/store", requestData).then(res => res.data);
    },
    {
      onSuccess: data => {
        setPercuy(data);
        setModalPercuy(true);
        queryClient.invalidateQueries(["/permohonan"]);
        Toast.show({
          type: "success",
          position: "top",
          visibilityTime: 3000,
          autoHide: true,
          topOffset: 40,
        });
        // setTimeout(() => {
        //   navigation.navigate("FormTitikUji", {
        //     uuid: data.uuid,
        //     tipePengambilan: {
        //       is_mandiri: selectedCara === "kirimMandiri" ? 1 : 0,
        //     },
        //   });
        //   console.log(data);
        // }, 4000);
      },
      onError: error => {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.response?.data?.message || "Terjadi kesalahan",
          position: "top",
          visibilityTime: 3000,
          autoHide: true,
          topOffset: 40,
        });
      },
    },
  );

  const onSubmit = data => {
    if (!selectedCara) {
      Toast.show({
        type: "error",
        text1: "Silakan pilih cara pengambilan",
      });
      return;
    }

    if (selectedCara === "ambilPetugas" && !selectedJasaPengambilan) {
      Toast.show({
        type: "error",
        text1: "Silakan pilih jasa pengambilan",
      });
      return;
    }

    send(data);
  };

  const handleSelectCara = cara => {
    setSelectedCara(cara);
  };

  const handleSelectPembayaran = pembayaran => {
    setSelectedPembayaran(pembayaran);
  };

  const handleSubmitData = data => {
    setSubmitted(true);
    send(data);
  };

  return (
    <>
      <View className="bg-[#ececec] w-full h-full  p-3">
        <View className="bg-[#f8f8f8] w-full h-full rounded-3xl">
          <View className="flex-row  p-3 ">
            <Back
              size={30}
              color={"black"}
              action={() => navigation.goBack()}
              className="mr-5 "
              style={{
                borderWidth: 0.5,
                padding: 4,
                borderColor: "#f8f8f8",
                borderRadius: 8,
              }}
            />
            <Text className="font-poppins-semibold text-black text-2xl mt-1 ">
              Tambah Permohonan
            </Text>
          </View>
          <View className=" py-4 px-3">
            <Controller
              control={control}
              name="industri"
              rules={{ required: "Nama Industri tidak boleh kosong" }}
              render={({ field: { onChange, value } }) => (
                <View>
                  <Text className="font-poppins-semibold mb-1 text-black ">
                    Nama Industri
                  </Text>
                  <TextField
                    enableErrors
                    placeholder="CV. PT. "
                    onChangeText={onChange}
                    placeholderTextColor="grey"
                    className="p-3 bg-[#fff] rounded-2xl text-black border-stone-300 border font-poppins-regular"
                    value={value}
                  />
                  {errors.industri && (
                    <Text
                      style={{ color: "red" }}
                      className="-mt-5 mb-2 lowercase font-poppins-regular">
                      {errors.industri.message}
                    </Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="alamat"
              rules={{ required: "alamat industri tidak boleh kosong" }}
              render={({ field: { onChange, value } }) => (
                <View>
                  <Text className="font-poppins-semibold mb-1 text-black ">
                    Alamat Industri
                  </Text>
                  <TextField
                    enableErrors
                    placeholderTextColor="grey"
                    className="p-3 bg-[#fff] rounded-2xl border-stone-300 border font-poppins-regular"
                    onChangeText={onChange}
                    placeholder="Masukkan Alamat Industri"
                    value={value}
                  />
                </View>
              )}
            />
            {errors.alamat && (
              <Text
                style={{ color: "red" }}
                className="-mt-5 mb-2 lowercase font-poppins-regular">
                {errors.alamat.message}
              </Text>
            )}

            <Controller
              control={control}
              name="kegiatan"
              rules={{ required: "Kegiatan Industri tidak boleh kosong" }}
              render={({ field: { onChange, value } }) => (
                <View>
                  <Text className="font-poppins-semibold mb-1 text-black ">
                    Kegiatan Industri
                  </Text>
                  <TextField
                    enableErrors
                    placeholderTextColor="grey"
                    placeholder="Masukkan Kegiatan Industri"
                    className="p-3 bg-[#fff] rounded-2xl  border-stone-300 border font-poppins-regular"
                    onChangeText={onChange}
                    value={value}
                  />
                </View>
              )}
            />
            {errors.kegiatan && (
              <Text
                style={{ color: "red" }}
                className="-mt-5 mb-2 lowercase font-poppins-regular">
                {errors.kegiatan.message}
              </Text>
            )}

            {/* <Controller
              control={control}
              name="keterangan"
              rules={{ required: "Keterangan tidak boleh kosong" }}
              render={({ field: { onChange, value } }) => (
                <View>
                  <Text className="font-poppins-semibold mb-2 text-black ">
                    Keterangan
                  </Text>
                  <View className="border border-stone-300 bg-[#fff]">
                    <TextArea
                      placeholder="Ketikkan Keterangan"
                      placeholderTextColor="black"
                      className="px-2 py-4 bg-[#fff] rounded-md font-poppins-regular"
                      value={value}
                      onChangeText={onChange}
                    />
                  </View>
                </View>
              )}
            /> */}
            <View>
              <Text className="text-xl text-black mb-4 font-poppins-semibold text-center">
                Cara Pengambilan
              </Text>

              <View style={styles.cardContainer}>
                <TouchableOpacity
                  className="rounded-2xl"
                  style={[
                    styles.cardPengambilan,
                    selectedCara === "kirimMandiri" && styles.selectedCard,
                  ]}
                  onPress={() => handleSelectCara("kirimMandiri")}>
                  <MaterialIcons name="transfer" size={40} color="black" />
                </TouchableOpacity>
                <TouchableOpacity
                  className="rounded-2xl"
                  style={[
                    styles.cardPengambilan,
                    selectedCara === "ambilPetugas" && styles.selectedCard,
                  ]}
                  onPress={() => handleSelectCara("ambilPetugas")}>
                  <MaterialIcons name="truck" size={40} color="black" />
                </TouchableOpacity>
              </View>
            </View>
            {selectedCara === "ambilPetugas" && (
              <View className=" mb-4">
                <Select2
                  onSelect={value => {
                    setSelectedJasaPengambilan(value);
                  }}
                  data={jasaPengambilan}
                  placeholder="Pilih Jasa Pengambilan"
                />
              </View>
            )}
            <Button
              backgroundColor={Colors.brand}
              className="p-3 mt-2 rounded-3xl "
              onPress={handleSubmit(send)}
              disabled={isLoading || isSuccess}>
              <Text className="text-white text-center text-base font-bold font-sans">
                SUBMIT
              </Text>
            </Button>
          </View>
        </View>
      </View>
      <Modal animationType="fade" transparent={true} visible={modalPercuy}>
        <View style={styles.overlayView}>
          <View style={styles.successContainer}>
            <LottieView
              source={require("../../../../assets/lottiefiles/success-animation.json")}
              autoPlay
              loop={false}
              style={styles.lottie}
            />
            <Text style={styles.successTextTitle}>Data berhasil di kirim</Text>
            <Text style={styles.successText}>
              Silahkan untuk melanjutkan dengan mengisi titik pengujian
            </Text>
            <View className="flex-row justify-between mt-3">
              <TouchableOpacity
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  backgroundColor: "#dedede",
                  borderRadius: 5,
                  marginRight: 10,
                }}>
                <Text
                  style={styles.successText}
                  onPress={() => {
                    setModalPercuy(false);
                    navigation.goBack();
                  }}>
                  Tutup
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  backgroundColor: "#dedede",
                  borderRadius: 5,
                  marginRight: 10,
                }}>
                <Text
                  style={styles.successText}
                  onPress={() => {
                    setModalPercuy(false);
                    if (percuy) {
                      navigation.navigate("TitikUji", {
                        uuid: percuy?.permohonan.uuid,
                        tipePengambilan: {
                          is_mandiri: selectedCara === "kirimMandiri" ? 1 : 0,
                        },
                      });
                    }
                  }}>
                  Lanjutkan {percuy?.uuid}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View style={styles.overlayView}>
          <View style={styles.successContainer}>
            <LottieView
              source={require("../../../../assets/lottiefiles/success-animation.json")}
              autoPlay
              loop={false}
              style={styles.lottie}
            />
            <Text style={styles.successTextTitle}>Data berhasil di kirim</Text>
            <Text style={styles.successText}>
              Silahkan untuk melanjutkan dengan mengisi titik pengujian lalu
              parameter !
            </Text>
          </View>
        </View>
      </Modal>
      <Toast config={toastConfig} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ececec",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    alignSelf: "center",
    marginVertical: 10,
  },
  cardContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  cardPengambilan: {
    flex: 1,
    paddingVertical: 30,
    paddingHorizontal: 10,
    alignItems: "center",
    marginHorizontal: 5,
    backgroundColor: "#fff",
    borderWidth: 0.5,
    borderColor: "#D6D3D1",
  },
  cardPembayaran: {
    flex: 1,
    paddingVertical: 50,
    paddingHorizontal: 10,
    borderRadius: 7,
    marginBottom: 10,
    alignItems: "center",
    marginHorizontal: 5,
    backgroundColor: "#fff",
  },
  selectedCard: {
    backgroundColor: "#C5CAE9",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#5C6BC0",
  },
  CardTitleText: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#fff",
  },
  cardText: {
    color: "white",
    textAlign: "justify",
  },
  icon: {
    width: 40,
    height: 40,
    marginBottom: 10,
    tintColor: "white",
  },
  submitButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 90,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
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
    borderRadius: 10,
  },
  lottie: {
    width: 170,
    height: 170,
  },

  successTextTitle: {
    textAlign: "center",
    color: "black",
    fontSize: rem(1.5),
    fontWeight: "bold",
    marginBottom: rem(1.5),
    marginTop: rem(1),
    fontFamily: "Poppins-SemiBold",
  },
  successText: {
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Poppins-Regular",
    color: "black",
  },
  toastContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    minHeight: 64,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4CAF50",
    marginBottom: 4,
    fontFamily: "Poppins-SemiBold",
  },
  message: {
    fontSize: 12,
    color: "#666666",
    fontFamily: "Poppins-Regular",
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    borderLeftColor: "#FF4444",
  },
  errorTitle: {
    color: "#FF4444",
  },
  errorMessage: {
    color: "#666666",
  },
});

export default TambahPermohonan;
