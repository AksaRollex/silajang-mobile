// menggunakan edit dan add, jadi terdapat 1 form yang akan digunakan untuk tambah dan editimport * as React from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  ScrollView,
} from "react-native";
import { TextField } from "react-native-ui-lib";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import axios from "@/src/libs/axios";
import DropDownPicker from "react-native-dropdown-picker";
import Back from "../components/Back";

const FormsTitikUjiCadangan = () => {
  const navigation = useNavigation(); // Deklarasi navigation

  const [text, setText] = React.useState("");

  const [sampelData, setSampelData] = useState([]);
  const [selectedSampel, setSelectedSampel] = useState(null);
  const [openSampel, setOpenSampel] = useState(false);

  const [jenisWadah, setJenisWadah] = useState([]);
  const [selectedJenisWadah, setSelectedJenisWadah] = useState(null);
  const [openJenisWadah, setOpenJenisWadah] = useState(false);

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
        setJenisWadah(formattedJenisWadah);
      })
      .catch(error => {
        console.error("Error fetching data : ", error);
      });
  }, []);

  return (
    <View style={styles.container}>
      <Back />

      <Text>Tambah / Edit Titik Pengujian</Text>

      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Nama Lokasi / Titik Uji</Text>
        <TextField
          label="Nama Lokasi / Titik Uji"
          value={text}
          onChangeText={setText}
          mode="outlined"
          style={styles.TextField}
          placeholder=""></TextField>
        <Text>Jenis Sampel</Text>
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
        <Text>Jenis Wadah</Text>

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
        <Text>Keterangan</Text>
        <TextField
          label="Keterangan"
          value={text}
          onChangeText={setText}
          mode="outlined"
          style={styles.TextField}
          placeholder=""></TextField>
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
    padding: 20,
    backgroundColor: "#ececec",
  },
  TextField: {
    marginVertical: 5,
  },
  scrollViewContent: {
    flexGrow: 1,
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

export default FormsTitikUjiCadangan;
