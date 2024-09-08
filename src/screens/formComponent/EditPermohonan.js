import * as React from 'react';
import { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import axios from '@/src/libs/axios';
import DropDownPicker from "react-native-dropdown-picker";
import DateTimePicker from "@react-native-community/datetimepicker";

const EditPermohonan = () => {
  const navigation = useNavigation();
  const [jasaPengambilan, setJasaPengambilan] = useState([]);
  const [selectedJasaPengambilan, setSelectedJasaPengambilan] = useState(null);
  const [openJasaPengambilan, setOpenJasaPengambilan] = useState(false);
  const [text, setText] = useState("");
  const [tanggal, setTanggal] = useState("");

  const handleConfirmDate = (date) => {
    setTanggal(date.toLocaleDateString("en-GB")); // Format: DD/MM/YYYY
    setDatePickerVisibility(false);
  };

  const handleSubmit = () => {
    Alert.alert("Data Submitted", `Text: ${text}\nTanggal: ${tanggal}`);
  };

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
 
  useEffect(() => {
    axios
      .get("master/jasa-pengambilan")
      .then((response) => {
        const formattedJasaPengambilan = response.data.data.map(item => ({
          label: item.wilayah,
          value: item.id,
        }));
        setJasaPengambilan(formattedJasaPengambilan);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Kembali</Text>
      </TouchableOpacity>
      <Text style={{ color : 'black' }}>Nama Indsutri</Text>
      <TextInput
        label="Nama Industri"
        value={text}
        onChangeText={setText}
        mode="outlined"
        style={styles.textInput}
        placeholder="CV. MCFLYON"
      />
      <Text style={{ color : 'black' }}>Alamat</Text>
      <TextInput
        label="Alamat"
        value={text}
        onChangeText={setText}
        mode="outlined"
        style={styles.textInput}
        placeholder="Alamat"
      />
      <Text style={{ color : 'black' }}>Pembayaran</Text>
      <TextInput
        label="Pembayaran"
        value={text}
        onChangeText={setText}
        mode="outlined"
        style={styles.textInput}
        placeholder="Pembayaran"
      />
      <Text style={{ color : 'black' }}>Jasa Pengambilan</Text>
      <DropDownPicker
        open={openJasaPengambilan}
        value={selectedJasaPengambilan}
        items={jasaPengambilan}
        setOpen={setOpenJasaPengambilan}
        setValue={setSelectedJasaPengambilan}
        setItems={setJasaPengambilan}
        placeholder="Pilih Jenis Pengambilan"
        style={styles.dropdown}
      />
      <Text style={{ color : 'black' }}>Tanggal / Jam Pengiriman</Text>
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
            style={styles.dropdown}
          />
        )}
     
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Simpan Perubahan</Text>
      </TouchableOpacity>
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
    marginBottom: 16,
  },
  backButton: {
    padding: 10,
    backgroundColor: "#6b7fde",
    borderRadius: 5,
    alignItems: "center",
    width: '100%',
    marginBottom: 20,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  datePickerButton: {
    padding: 10,
    backgroundColor: "#6b7fde",
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 16,
  },
  datePickerText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  submitButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    backgroundColor: '#2196F3',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EditPermohonan;
