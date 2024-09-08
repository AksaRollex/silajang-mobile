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

const TambahPermohonan = () => {
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
    },
  }));
  const { setPermohonan } = useFormStore();
  const {
    mutate: send,
    isLoading,
    isSuccess,
  } = useMutation(
    () => {
      // Tentukan nilai sesuai pilihan pengguna
      const requestData = {
        industri: getValues("industri"),
        alamat: getValues("alamat"),
        kegiatan: getValues("kegiatan"),
        keterangan: getValues("keterangan"),
        is_mandiri: selectedCara === "kirimMandiri" ? 1 : 0,
        pembayaran: selectedPembayaran === "transfer" ? "transfer" : "tunai",
        jasa_pengambilan_id: selectedJasaPengambilan, // Correct this line
      };

      // Kirim data ke backend
      return axios.post("/permohonan/store", requestData).then(res => res.data);
    },
    {
      onSuccess: data => {
        Toast.show({
          type: "success",
          text1: "Data Berhasil Di Kirim",
        });
        reset(); // Reset form setelah sukses
        setSelectedCara(null); // Reset pilihan cara pengambilan
        setSelectedPembayaran(null); // Reset pilihan opsi pembayaran
        navigation.goBack();
      },
      onError: error => {
        console.error(error.response.data);
        Toast.show({
          type: "error",
          text1: error.response.data.message,
        });
        setSubmitted(false); // Reset meskipun ada error
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
    <ScrollView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Kembali</Text>
      </TouchableOpacity>

      <View marginB-20>
        <Text marginB-5 style={{ color : 'black' }}>Nama Industri</Text>
        <Controller
          control={control}
          name="industri"
          rules={{ required: "Nama Industri tidak boleh kosong" }}
          render={({ field: { onChange, value } }) => (
            <TextField
              placeholder={"Nama Industri"}
              enableErrors
              fieldStyle={{
                paddingVertical: 8,
                paddingHorizontal: 15,
                borderWidth: 1,
              }}
              containerStyle={{}}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.industri && (
          <Text style={{ color: "red" }}>{errors.industri.message}</Text>
        )}
      </View>
      <View marginB-20>
        <Text marginB-5 style={{ color : 'black' }}>Alamat</Text>
        <Controller
          control={control}
          name="alamat"
          rules={{ required: "alamat industri tidak boleh kosong" }}
          render={({ field: { onChange, value } }) => (
            <TextField
              placeholder={"Alamat Industri"}
              enableErrors
              fieldStyle={{
                paddingVertical: 8,
                paddingHorizontal: 15,
                borderWidth: 1,
              }}
              containerStyle={{}}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.alamat && (
          <Text style={{ color: "red" }}>{errors.alamat.message}</Text>
        )}
      </View>
      <View marginB-20>
        <Text marginB-5 style={{ color : 'black' }}>Kegiatan Industri</Text>
        <Controller
          control={control}
          name="kegiatan"
          rules={{ required: "Kegiatan Industri tidak boleh kosong" }}
          render={({ field: { onChange, value } }) => (
            <TextField
              placeholder={"Kegiatan Industri"}
              enableErrors
              fieldStyle={{
                paddingVertical: 8,
                paddingHorizontal: 15,
                borderWidth: 1,
              }}
              containerStyle={{}}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.kegiatan && (
          <Text style={{ color: "red" }}>{errors.kegiatan.message}</Text>
        )}
      </View>

      <View marginB-20>
        <Text marginB-5 style={{ color : 'black' }}>Keterangan</Text>
        <Controller
          control={control}
          name="keterangan"
          rules={{ required: "Keterangan tidak boleh kosong" }}
          render={({ field: { onChange, value } }) => (
            <TextField
              placeholder={"Keterangan"}
              enableErrors
              fieldStyle={{
                paddingVertical: 8,
                paddingHorizontal: 15,
                borderWidth: 1,
              }}
              containerStyle={{}}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.keterangan && (
          <Text style={{ color: "red" }}>{errors.keterangan.message}</Text>
        )}
      </View>

      <View>
        <Text style={[styles.sectionTitle, { color : "black"}] }>Cara Pengambilan</Text>
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
              Petugas Akan Menghubungi Anda Untuk Konfirmasi Lokasi Pengambilan
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
          style={styles.dropdown}
        />
      )}
      <View>
        <Text style={[styles.sectionTitle, { color : "black"}]}>Opsi Pembayaran</Text>
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
        style={{ marginBottom: 80 }}
        backgroundColor={Colors.brand}
        borderRadius={5}
        onPress={handleSubmit(send)}
        disabled={isLoading}></Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "rgba(13, 71, 161, 0.2)",
  },
  textInput: {
    marginBottom: 16,
  },
  textInputKeterangan: {
    marginVertical: 10,
    paddingVertical: 10,
  },
  backButton: {
    padding: 10,
    backgroundColor: "#6b7fde",
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
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
    borderWidth: 1,
    borderColor: "#000",
    alignItems: "center",
    marginHorizontal: 5,
    backgroundColor: "#3b5998",
  },
  cardPembayaran: {
    flex: 1,
    paddingVertical: 50,
    paddingHorizontal: 10,
    borderRadius: 7,
    borderWidth: 1,
    marginBottom : 10,
    borderColor: "#000",
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

    backgroundColor: "#2196F3",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default TambahPermohonan;
