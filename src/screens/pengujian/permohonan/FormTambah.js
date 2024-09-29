import * as React from "react";
import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  ScrollView,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { TextField, Colors, Button } from "react-native-ui-lib";
import Toast from "react-native-toast-message";
import DropDownPicker from "react-native-dropdown-picker";
import axios from "@/src/libs/axios";
import Back from "../../components/Back";
import Header from "../../components/Header";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import MaterialIcons from "react-native-vector-icons/MaterialCommunityIcons";

const TambahPermohonan = ({ navigation }) => {
  const [jasaPengambilan, setJasaPengambilan] = useState([]);
  const [selectedJasaPengambilan, setSelectedJasaPengambilan] = useState(null);
  const [OpenJasaPengambilan, setOpenJasaPengambilan] = useState(false);

  useEffect(() => {
    axios
      .get("/master/jasa-pengambilan")
      .then(response => {
        const formattedJasaPengambilan = response.data.data.map(item => ({
          label: item.wilayah,
          value: item.id,
        }));
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
        pembayaran: selectedPembayaran === "transfer" ? "transfer" : "Tunai",
        jasa_pengambilan_id: selectedJasaPengambilan,
      };

      return axios.post("/permohonan/store", requestData).then(res => res.data);
    },
    {
      onSuccess: data => {
        Toast.show({
          type: "success",
          text1: "Data Berhasil Di Kirim",
        });
        queryClient.invalidateQueries(["/permohonan"]);
        navigation.navigate("Permohonan");
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

  const [selectedCara, setSelectedCara] = useState(null);
  const [selectedPembayaran, setSelectedPembayaran] = useState(null);

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
      <Header />
      <ScrollView className="bg-[#ececec] w-full h-full p-7 ">
        <View className=" flex-row my-2 justify-between">
          <Back size={24} action={() => navigation.goBack()} className="mr-2" />
          <Text className="font-bold text-black text-lg ">
            Tambah Permohonan
          </Text>
        </View>
        <Controller
          control={control}
          name="industri"
          rules={{ required: "Nama Industri tidak boleh kosong" }}
          render={({ field: { onChange, value } }) => (
            <View className="mt-2">
              <TextField
                enableErrors
                label="Nama Industri"
                placeholder="Masukkan Nama Industri"
                onChangeText={onChange}
                className="p-3  bg-[#fff] rounded-md"
                value={value}
              />
            </View>
          )}
        />
        {errors.industri && (
          <Text style={{ color: "red" }}>{errors.industri.message}</Text>
        )}

        <Controller
          control={control}
          name="alamat"
          rules={{ required: "alamat industri tidak boleh kosong" }}
          render={({ field: { onChange, value } }) => (
            <View>
              <TextField
                label="Alamat Industri"
                enableErrors
                className="p-3 bg-[#fff] rounded-md"
                onChangeText={onChange}
                placeholder="Masukkan Alamat"
                value={value}
              />
            </View>
          )}
        />
        {errors.alamat && (
          <Text style={{ color: "red" }}>{errors.alamat.message}</Text>
        )}

        <Controller
          control={control}
          name="kegiatan"
          rules={{ required: "Kegiatan Industri tidak boleh kosong" }}
          render={({ field: { onChange, value } }) => (
            <View>
              <TextField
                label="Kegiatan Industri"
                enableErrors
                placeholder="Masukkan Kegiatan Industri"
                className="p-3 bg-[#fff] rounded-md"
                onChangeText={onChange}
                value={value}
              />
            </View>
          )}
        />
        {errors.kegiatan && (
          <Text style={{ color: "red" }}>{errors.kegiatan.message}</Text>
        )}

        <Controller
          control={control}
          name="keterangan"
          rules={{ required: "Keterangan tidak boleh kosong" }}
          render={({ field: { onChange, value } }) => (
            <View>
              <TextField
                enableErrors
                label="Keterangan"
                placeholder="Masukkan Keterangan"
                className="p-3 bg-[#fff] rounded-md"
                onChangeText={onChange}
                value={value}
              />
            </View>
          )}
        />
        <View>
          <Text className="text-xl font-bold text-black my-5 text-center">
            Cara Pengambilan
          </Text>

          <View style={styles.cardContainer}>
            <TouchableOpacity
              style={[
                styles.cardPengambilan,
                selectedCara === "kirimMandiri" && styles.selectedCard,
              ]}
              onPress={() => handleSelectCara("kirimMandiri")}>
              <MaterialIcons name="transfer" size={40} color="black" />
              <Text className="font-bold text-lg text-center text-black my-2">
                Kirim Mandiri
              </Text>
              <Text className="text-justify text-black text-sm">
                Kirim Sampel Uji Anda Ke Laboratorium Dinas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.cardPengambilan,
                selectedCara === "ambilPetugas" && styles.selectedCard,
              ]}
              onPress={() => handleSelectCara("ambilPetugas")}>
              <MaterialIcons name="truck" size={40} color="black" />
              <Text className="font-bold text-lg text-center text-black my-2">
                Ambil Petugas
              </Text>
              <Text className="text-justify text-black text-sm">
                Petugas Akan Menghubungi Anda Untuk Konfirmasi Lokasi
                Pengambilan
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Conditionally Render TextField based on selectedCara */}
        {selectedCara === "ambilPetugas" && (
          <DropDownPicker
            open={OpenJasaPengambilan}
            value={selectedJasaPengambilan}
            items={jasaPengambilan}
            name="jasa_pengambilan_id"
            setOpen={setOpenJasaPengambilan}
            setValue={setSelectedJasaPengambilan}
            nestedScrollEnabled={true}
            setItems={setJasaPengambilan}
            placeholder="Pilih Jenis Pengambilan"
            className="p-3 bg-[#fff] mb-5"
          />
        )}
        <View>
          <Text className="text-xl font-bold text-black my-5 text-center">
            Opsi Pembayaran
          </Text>
          <TouchableOpacity
            style={[
              styles.cardPembayaran,
              selectedPembayaran === "transfer" && styles.selectedCard,
            ]}
            onPress={() => handleSelectPembayaran("transfer")}>
            <MaterialIcons name="wallet" size={40} color="black" />

            <Text className="font-bold text-lg text-center text-black my-2">
              Transfer (Non Tunai)
            </Text>
            <Text className="text-justify text-black text-sm">
              Transfer Virtual Account Bank Jatim, Untuk Nomor VA Akan Di
              Informasikan Oleh Bendahara UPT
            </Text>
          </TouchableOpacity>
        </View>
        <Button
          label="Kirim"
          className="mb-32"
          backgroundColor={Colors.brand}
          borderRadius={5}
          onPress={handleSubmit(send)}
          disabled={isLoading}></Button>
      </ScrollView>
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
    paddingVertical: 50,
    paddingHorizontal: 10,
    borderRadius: 7,
    alignItems: "center",
    marginHorizontal: 5,
    backgroundColor: "#fff",
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
});

export default TambahPermohonan;
