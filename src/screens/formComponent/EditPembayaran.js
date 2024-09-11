import * as React from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const EditPembayaran = () => {
  const navigation = useNavigation(); // Deklarasi navigation

  const [text, setText] = React.useState("");
  const [number, setNumber] = React.useState("");

  const handleSubmit = () => {
    Alert.alert("Data Submitted", ` Text: ${text}, Number : ${number}`);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()} // Gunakan navigation yang telah dideklarasikan
      >
        <Text style={styles.backButtonText}>Kembali</Text>
      </TouchableOpacity>
      <TextInput
        label="Lokasi"
        value={text}
        onChangeText={setText}
        mode="outlined"
        style={styles.textInput}
        placeholder="Kota"
      />
      <TextInput
        label="Harga"
        value={number}
        onChangeText={setNumber}
        mode="outlined"
        style={styles.textInput}
        placeholder="Harga"
      />
      <TextInput
        label="Status Pembayaran"
        value={text}
        onChangeText={setText}
        mode="outlined"
        style={styles.textInput}
        placeholder="Status Pembayaran"
      />
      <TextInput
        label="Tanggal"
        value={text}
        onChangeText={setText}
        mode="outlined"
        style={styles.textInput}
        placeholder="??/??/????"
      />
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
    backgroundColor : "rgba(13, 71, 161, 0.2)"

  },
  textInput: {
    marginBottom: 16, 
  },
  backButton: {
    padding: 10,
    backgroundColor: "#6b7fde",
    borderRadius: 5,
    alignItems: "center",
    width: '100%', // Mengatur lebar agar mengisi ruang yang tersedia
    marginBottom: 20,
  },
  backButtonText: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
  },

  submitButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    backgroundColor : '#6b7fde'
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EditPembayaran;
