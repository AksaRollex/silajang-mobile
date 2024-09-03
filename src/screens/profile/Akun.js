import React from "react";
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  Image,
} from "react-native";
import axios from "@/src/libs/axios";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { useForm, Controller } from "react-hook-form";
import { create } from "zustand";
import { TextField, Colors, Button } from "react-native-ui-lib";
import { useMutation } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { launchImageLibrary } from "react-native-image-picker"; // Perbaikan Import

const Akun = () => {
  const [file, setFile] = React.useState(null);
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation();

  // put process
  const {
    handleSubmit,
    control,
    formState: { errors },
    getValues,
    reset,
  } = useForm();

  const useFormPut = create(set => ({
    credential: {
      nama: "",
      photo: "",
    },
  }));

  const [photo, setPhoto] = useState({
    photo: "",
  });

  const { setAkun } = useFormPut();

  // get data profile
  useEffect(() => {
    axios
      .get("/auth")
      .then(response => {
        console.log("Response Data user akun:", response.data.user); // Log data response
        setUserData(response.data);
      })
      .catch(error => {
        console.error("Error fetching data:", error); // Log error
      });
  }, []);

  // Update data pengguna
  const {
    mutate: update,
    isLoading,
    isSuccess,
  } = useMutation(
    () => {
      const formData = new FormData();
  
      // Tambahkan nama ke dalam FormData
      formData.append("nama", getValues("nama"));
  
      // Tambahkan gambar ke dalam FormData jika ada
      if (file) {
        formData.append("photo", {
          uri: file,
          type: file.type || 'image/jpeg', // Pastikan tipe file sesuai
          name: file.fileName || 'profile_photo.jpg', // Nama file yang akan di-upload
        });
      }
  
      return axios.put("/user/updateAkun", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }).then(res => res.data);
    },
    {
      onSuccess: () => {
        Toast.show({
          type: "success",
          text1: "Data Berhasil Di Kirim",
        });
        navigation.navigate("Profile"); // Navigasi kembali untuk refresh halaman
        reset();
        setFile(null); // Hapus file setelah pengiriman berhasil
      },
      onError: error => {
        console.error(error.response.data);
        Toast.show({
          type: "error",
          text1: error.response.data.message,
        });
      },
    },
  );
  

  const handleChoosePhoto = () => {
    launchImageLibrary({ mediaType: "photo" }, response => {
      if (response.assets && response.assets.length > 0) {
        const selectedImage = response.assets[0].uri;
        setFile(selectedImage);
      }
    });
  };

  const handleDeletePhoto = () => {
    setFile(null);
  };

  return (
    <View style={styles.container}>
      {userData ? (
        <>
          <Text style={{ color: "black" }}>Nama</Text>
          <Controller
            control={control}
            name="nama"
            rules={{ required: "Nama Tidak Boleh Kosong" }}
            render={({ field: { onChange, value } }) => (
              <TextField
                placeholder={userData.user.nama}
                enableErrors
                fieldStyle={styles.textField}
                onChangeText={onChange}
                value={value}></TextField>
            )}
          />
          {errors.nama && (
            <Text style={{ color: "red" }}>{errors.nama.message}</Text>
          )}
          <Text style={{ color: "black" }}>Foto Profil</Text>
          <TouchableOpacity onPress={handleChoosePhoto}>
            <Text style={styles.selectPhotoText}>Pilih Gambar</Text>
          </TouchableOpacity>

          <Controller
            control={control}
            name="photo"
            render={({ field: { onChange, value } }) => (
              <View style={styles.textFieldContainer}>
                <TextField
                  enableErrors
                  fieldStyle={styles.textField}
                  onChangeText={onChange}
                  value={value || photo}
                  editable="false"
                />
                {file && (
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: file }} style={styles.imagePreview} />
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={handleDeletePhoto}>
                      <Text style={styles.deleteButtonText}>Hapus Gambar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          />
          <Text style={{ color: "black" }}>Email</Text>

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <TextField
                placeholder={userData.user.email}
                editable={false} // Disables the TextInput
                enableErrors
                fieldStyle={styles.textField}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          <Text style={{ color: "black" }}>Nomor Telepon</Text>
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <TextField
                placeholder={userData.user.phone}
                enableErrors
                editable={false}
                fieldStyle={styles.textField}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
        </>
      ) : (
        <Text style={[styles.text, { color :  'black', marginVertical : 10}]}>Loading...</Text>
      )}

      <Button
        label="Perbarui"
        style={{ marginBottom: 40 }}
        backgroundColor={Colors.brand}
        borderRadius={5}
        onPress={handleSubmit(update)}
        disabled={isLoading || isSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  textInput: {
    marginBottom: 16,
  },
  submitButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4682B4",
    marginVertical: 7,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 50,
    fontWeight: "bold",
  },
  text: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  textField: {
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    color: "black",
    borderColor: "#ccc",
    borderWidth: 1,
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginBottom: 16,
    borderRadius: 10,
  },
  deleteButton: {},
  deleteButtonText: {
    color: "red",
    marginBottom: 15,
  },
  selectPhotoText: {
    color: "black",
    marginVertical: 5,
  },
  textFieldContainer: {},
  imageContainer: {
    alignItems: "center",
    marginTop: 10,
  },
});

export default Akun;
