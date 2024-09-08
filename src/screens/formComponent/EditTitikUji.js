// menggunakan edit dan add, jadi terdapat 1 form yang akan digunakan untuk tambah dan editimport * as React from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  ScrollView,
  PermissionsAndroid,
  Platform
} from "react-native";
import { TextInput } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import axios from "@/src/libs/axios";
import DropDownPicker from "react-native-dropdown-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import Geolocation from "react-native-geolocation-service";

const TitikPengujian = () => {
  const navigation = useNavigation(); // Deklarasi navigation

  const [text, setText] = React.useState("");

  const [sampelData, setSampelData] = useState([]);
  const [selectedSampel, setSelectedSampel] = useState(null);
  const [openSampel, setOpenSampel] = useState(false);

  const [jenisWadah, setJenisWadah] = useState([]);
  const [selectedJenisWadah, setSelectedJenisWadah] = useState(null);
  const [openJenisWadah, setOpenJenisWadah] = useState(false);

  const [metode, setMetode] = useState([]);
  const [selectedMetode, setSelectedMetode] = useState(null);
  const [openMetode, setOpenMetode] = useState(false);

  // DATETIME PICKER
  const [tanggalJam, setTanggalJam] = useState(new Date());
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);

  const handleDateTimeChange = (event, selectedDate) => {
    if (event.type === "dismissed") {
      setShowDateTimePicker(false);
      return;
    }

    const currentDate = selectedDate || tanggalJam;
    setShowDateTimePicker(false); // Close the DateTimePicker on selection
    setTanggalJam(currentDate);
  };

// LOCATION STATE
const [location, setLocation] = useState({
  latitude: "",
  longitude: "",
});

  const handleSubmit = () => {
    Alert.alert("Data Submitted", ` Text: ${text}`);
  };

  useEffect(() => {
    axios
      .get("/master/jenis-sampel")
      .then(response => {
        const formattedSampelData = response.data.data.map(item => ({
          label: item.nama,
          value: item.id,
        }));
        setSampelData(formattedSampelData);
      })
      .catch(error => {
        console.error("Error fetching data :", error);
      });
  }, []);

  useEffect(() => {
    axios
      .get("master/jenis-wadah")
      .then(response => {
        const formattedJenisWadah = response.data.data.map(item => ({
          label: item.nama,
          value: item.id,
        }));
        setJenisWadah(formattedJenisWadah); // Gunakan formattedJenisWadah di sini
      })
      .catch(error => {
        console.error("Error fetching data : ", error);
      });
  }, []);

  useEffect(() => {
    axios
      .get("master/acuan-metode")
      .then(response => {
        const formattedMetode = response.data.data.map(item => ({
          label: item.nama,
          value: item.id,
        }));
        setMetode(formattedMetode);
      })
      .catch(error => {
        console.error("Error fetching data : ", error);
      });
  }, []);

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location Permission",
          message: "We need to access your location",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        getLocation();
      } else {
        console.log("Location permission denied");
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const getLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
        });
        Alert.alert(
          "Lokasi Ditemukan",
          `Latitude: ${position.coords.latitude}, Longitude: ${position.coords.longitude}`
        );
      },
      (error) => {
        console.log(error.code, error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handleLocationPress = () => {
    if (Platform.OS === "android") {
      requestLocationPermission();
    } else {
      getLocation();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()} // Gunakan navigation yang telah dideklarasikan
      >
        <Text style={styles.backButtonText}>Kembali</Text>
      </TouchableOpacity>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}>
        <TextInput
          label="Nama Lokasi / Titik Uji"
          value={text}
          onChangeText={setText}
          mode="outlined"
          style={styles.textInput}
          placeholder=""></TextInput>
        <DropDownPicker
          open={openSampel}
          value={selectedSampel}
          items={sampelData}
          setOpen={setOpenSampel}
          setValue={setSelectedSampel}
          setItems={setSampelData}
          placeholder="Pilih Jenis Sampel"
          style={styles.dropdown}
        />
        <DropDownPicker
          open={openJenisWadah}
          value={selectedJenisWadah}
          items={jenisWadah}
          setOpen={setOpenJenisWadah}
          setValue={setSelectedJenisWadah}
          setItems={setJenisWadah}
          placeholder="Pilih Jenis Wadah"
          style={styles.dropdown}
        />
        <TextInput
          label="Keterangan"
          value={text}
          onChangeText={setText}
          mode="outlined"
          style={styles.textInput}
          placeholder=""></TextInput>
        <Text style={[styles.titleText, {color : 'black'}]}>Detail Pengiriman</Text>
        <TextInput
          label="Nama Pengirim"
          value={text}
          onChangeText={setText}
          mode="outlined"
          style={styles.textInput}
          placeholder=""></TextInput>
        <TouchableOpacity onPress={() => setShowDateTimePicker(true)}>
          <TextInput
            label="Tanggal / Jam Pengirim"
            value={tanggalJam.toLocaleString()}
            mode="outlined"
            style={styles.textInput}
            placeholder=""
            editable={false}
          />
        </TouchableOpacity>
        {showDateTimePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={tanggalJam}
            mode="datetime"
            is24Hour={true}
            display={Platform.OS === "ios" ? "spinner" : "default"} // Ensuring proper display on iOS and Android
            onChange={handleDateTimeChange}
          />
        )}

        <DropDownPicker
          open={openMetode}
          value={selectedMetode}
          items={metode}
          setOpen={setOpenMetode}
          setValue={setSelectedMetode}
          setItems={setMetode}
          placeholder="Pilih Jenis Metode"
          style={styles.dropdown}
        />

        <Text style={[styles.titleText, { color : 'black'}]}>Detail Lokasi</Text>
        <TextInput
          label="South"
          value={location.latitude}
          onChangeText={setText}
          mode="outlined"
          style={styles.textInput}
          placeholder=""></TextInput>
        <TextInput
          label="East"
          value={location.longitude}
          onChangeText={setText}
          mode="outlined"
          style={styles.textInput}
          placeholder=""></TextInput>
        <TouchableOpacity style={styles.buttonLokasi} onPress={handleLocationPress}>
          <Text style={styles.buttonLokasiText}>Gunakan Lokasi Saat Ini</Text>
        </TouchableOpacity>
        <Text style={[styles.titleText, { color : 'black'}]}>Hasil Pengukuran Lapangan</Text>
        <TextInput
          label="Suhu Air (t°C)"
          value={text}
          onChangeText={setText}
          mode="outlined"
          style={styles.textInput}
          placeholder=""></TextInput>
        <TextInput
          label="pH"
          value={text}
          onChangeText={setText}
          mode="outlined"
          style={styles.textInput}
          placeholder=""></TextInput>
        <TextInput
          label="DHL (µS/cm)"
          value={text}
          onChangeText={setText}
          mode="outlined"
          style={styles.textInput}
          placeholder=""></TextInput>
        <TextInput
          label="
Salinitas (‰)"
          value={text}
          onChangeText={setText}
          mode="outlined"
          style={styles.textInput}
          placeholder=""></TextInput>
        <TextInput
          label="DO (mg/L)"
          value={text}
          onChangeText={setText}
          mode="outlined"
          style={styles.textInput}
          placeholder=""></TextInput>
        <TextInput
          label="Kekeruhan"
          value={text}
          onChangeText={setText}
          mode="outlined"
          style={styles.textInput}
          placeholder=""></TextInput>
        <TextInput
          label="Klorin Bebas"
          value={text}
          onChangeText={setText}
          mode="outlined"
          style={styles.textInput}
          placeholder=""></TextInput>
        <Text style={[styles.titleText, { color : 'black'}]}>Kondisi Lingkungan</Text>
        <TextInput
          label="Suhu Udara (t°C)"
          value={text}
          onChangeText={setText}
          mode="outlined"
          style={styles.textInput}
          placeholder=""></TextInput>
        <TextInput
          label="Cuaca"
          value={text}
          onChangeText={setText}
          mode="outlined"
          style={styles.textInput}
          placeholder=""></TextInput>
        <TextInput
          label="Arah Angin"
          value={text}
          onChangeText={setText}
          mode="outlined"
          style={styles.textInput}
          placeholder=""></TextInput>
        <TextInput
          label="Kelembapan (%RH)"
          value={text}
          onChangeText={setText}
          mode="outlined"
          style={styles.textInput}
          placeholder=""></TextInput>
        <TextInput
          label="Kecepatan Angin"
          value={text}
          onChangeText={setText}
          mode="outlined"
          style={styles.textInput}
          placeholder=""></TextInput>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Simpan</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "rgba(13, 71, 161, 0.2)",
  },
  textInput: {
    marginVertical: 2,
  },
  backButton: {
    padding: 10,
    backgroundColor: "#6b7fde",
    borderRadius: 5,
    alignItems: "center",
    width: "100%", // Mengatur lebar agar mengisi ruang yang tersedia
    marginBottom: 20,
  },
  buttonLokasi: {
    width: "100%",
    height: 50,
    marginVertical: 7,
    fontWeight: "bold",
    backgroundColor: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  titleText: {
    fontSize: 17,
    alignSelf: "center",
    fontWeight: "bold",
    marginVertical: 10,
  },
  buttonLokasi: {
    backgroundColor: "#5D9C59",
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonLokasiText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  scrollViewContent: {
    flexGrow: 1, // Ensures that ScrollView content is scrollable
    marginHorizontal: 20,
    marginVertical: 10,
  },
  submitButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    marginTop: 10,
    marginBottom: 70,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2196F3",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default TitikPengujian;
