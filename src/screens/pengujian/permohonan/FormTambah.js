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
import { useNavigation } from "@react-navigation/native";
import { useForm, Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { TextField, Colors, Button } from "react-native-ui-lib";
import { create } from "zustand";
import Toast from "react-native-toast-message";
import DropDownPicker from "react-native-dropdown-picker";
import axios from "@/src/libs/axios";
import Back from "../../components/Back";
import Header from "../../components/Header";

const TambahPermohonan = () => {
  const [jasaPengambilan, setJasaPengambilan] = useState([]);
  const [selectedJasaPengambilan, setSelectedJasaPengambilan] = useState(null);
  const [OpenJasaPengambilan, setOpenJasaPengambilan] = useState(false);

  const [radiusPengambilan, setRadiusPengambilan] = useState([]);
  const [selectedRadiusPengambilan, setSelectedRadiusPengambilan] = useState(null);
  const [OpenRadiusPengambilan, setOpenRadiusPengambilan] = useState(false);

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

  // FETCH RADIUS PENGAMBILAN
  // useEffect(() => {
  //   axios
  //     .get("/master/radius-pengambilan")
  //     .then(response => {
  //       const formattedRadiusPengambilan = response.data.data.map(item => ({
  //         label: item.nama,
  //         value: item.id,
  //       }));
  //       setRadiusPengambilan(formattedRadiusPengambilan);
  //       console.log("response data radius pengambilan", response.data.data);
  //     })
  //     .catch(error => {
  //       console.error("Error fetching data :", error);
  //     });
  // }, []);

  const navigation = useNavigation();
  const {
    handleSubmit,
    control,
    formState: { errors },
    getValues,
    reset,
  } = useForm();

  const useFormStore = create(set => ({
    credential: {
      industri: "",
      alamat: "",
      kegiatan: "",
      keterangan: "",
      is_mandiri: "",
      pembayaran: "",
      jasa_pengambilan_id: "",
      // radius_pengambilan_id: "",
    },
  }));
  const { setPermohonan } = useFormStore();
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
        pembayaran: selectedPembayaran === "transfer" ? "transfer" : "tunai",
        jasa_pengambilan_id: selectedJasaPengambilan,
        // radius_pengambilan_id: selectedRadiusPengambilan,
      };

      return axios.post("/permohonan/store", requestData).then(res => res.data);
    },
    {
      onSuccess: data => {
        Toast.show({
          type: "success",
          text1: "Data Berhasil Di Kirim",
        });
        reset();
        setSelectedCara(null);
        setSelectedPembayaran(null);
        navigation.goBack();
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
        <Back />
        <Controller
          control={control}
          name="industri"
          rules={{ required: "Nama Industri tidak boleh kosong" }}
          render={({ field: { onChange, value } }) => (
            <TextField
              enableErrors
              placeholder="Masukkan Nama Industri"
              onChangeText={onChange}
              className="p-3 mt-5 bg-[#bebcbc] rounded-md"
              value={value}
            />
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
            <TextField
              enableErrors
              className="p-3 bg-[#bebcbc] rounded-md"
              containerStyle={{}}
              onChangeText={onChange}
              placeholder="Masukkan Alamat"
              value={value}
            />
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
            <TextField
              enableErrors
              placeholder="Masukkan Kegiatan Industri"
              containerStyle={{}}
              className="p-3 bg-[#bebcbc] rounded-md"
              onChangeText={onChange}
              value={value}
            />
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
            <TextField
              enableErrors
              containerStyle={{}}
              placeholder="Masukkan Keterangan"
              className="p-3 bg-[#bebcbc] rounded-md"
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.keterangan && (
          <Text style={{ color: "red" }}>{errors.keterangan.message}</Text>
        )}

        <View>
          <Text style={[styles.sectionTitle, { color: "black" }]}>
            Cara Pengambilan
          </Text>
          <View style={styles.cardContainer}>
            <TouchableOpacity
              style={[
                styles.cardPengambilan,
                selectedCara === "kirimMandiri" && styles.selectedCard,
              ]}
              onPress={() => handleSelectCara("kirimMandiri")}>
              <Image
                source={require("@/assets/images/give-money.png")}
                style={styles.icon}
              />
              <Text style={styles.CardTitleText}>Kirim Mandiri</Text>
              <Text style={styles.cardText}>
                Kirim Sampel Uji Anda Ke Laboratorium Dinas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.cardPengambilan,
                selectedCara === "ambilPetugas" && styles.selectedCard,
              ]}
              onPress={() => handleSelectCara("ambilPetugas")}>
              <Image
                source={require("@/assets/images/delivery-truck.png")}
                style={styles.icon}
              />
              <Text style={styles.CardTitleText}>Ambil Petugas</Text>
              <Text style={styles.cardText}>
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
            setItems={setJasaPengambilan}
            placeholder="Pilih Jenis Pengambilan"
          />
        )}
        <View>
          <Text style={[styles.sectionTitle, { color: "black" }]}>
            Opsi Pembayaran
          </Text>
          <TouchableOpacity
            style={[
              styles.cardPembayaran,
              selectedPembayaran === "transfer" && styles.selectedCard,
            ]}
            onPress={() => handleSelectPembayaran("transfer")}>
            <Image
              source={require("@/assets/images/wallets.png")}
              style={styles.icon}
            />
            <Text style={styles.CardTitleText}>Transfer (Non Tunai)</Text>
            <Text style={[styles.cardText]}>
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
    backgroundColor: "#3b5998",
  },
  cardPembayaran: {
    flex: 1,
    paddingVertical: 50,
    paddingHorizontal: 10,
    borderRadius: 7,
    marginBottom: 10,
    alignItems: "center",
    marginHorizontal: 5,
    backgroundColor: "#34A853",
  },
  selectedCard: {
    backgroundColor: "#FF7043",
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
