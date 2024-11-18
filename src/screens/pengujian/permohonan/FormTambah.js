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
import Toast from "react-native-toast-message";
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

  const queryClient = useQueryClient();
  const { mutate: send, isLoading } = useMutation(
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
      onSuccess: () => {
        setModalVisible(true); // Tampilkan modal dulu
        queryClient.invalidateQueries(["/permohonan"]);

        // Tunggu sebentar sebelum navigasi
        setTimeout(() => {
          setModalVisible(false);
          navigation.navigate("Permohonan");
        }, 2000);
      },

      onError: error => {
        console.error(error.response.data);
        Toast.show({
          type: "error",
          text1: error.response.data.message,
        });
        setSubmitted(false);
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
      <View className="bg-[#ececec] w-full h-full p-3">
        <View className="flex-row  p-3 ">
          <Back
            size={30}
            color={"black"}
            action={() => navigation.goBack()}
            className="mr-5 "
            style={{
              borderWidth: 0.5,
              padding: 4,
              borderColor: "black",
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
                {/* <Text className="text-lg font-poppins-semibold text-center text-black my-2">
                  Kirim Mandiri
                </Text> */}
              </TouchableOpacity>
              <TouchableOpacity
                className="rounded-2xl"
                style={[
                  styles.cardPengambilan,
                  selectedCara === "ambilPetugas" && styles.selectedCard,
                ]}
                onPress={() => handleSelectCara("ambilPetugas")}>
                <MaterialIcons name="truck" size={40} color="black" />
                {/* <Text className="text-lg text-center font-poppins-semibold text-black my-2">
                  Ambil Petugas
                </Text> */}
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
            disabled={isLoading}>
            <Text className="text-white text-center text-base font-bold font-sans">
              SUBMIT
            </Text>
          </Button>
        </View>
      </View>
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
    width: "90%",
    height: "35%",
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
});

export default TambahPermohonan;
