import React from "react";
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  Image,
  onChange,
} from "react-native";
import axios from "@/src/libs/axios";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { useForm, Controller } from "react-hook-form";
import { create } from "zustand";
import { TextField, Colors, Button } from "react-native-ui-lib";
import { useMutation } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { launchImageLibrary } from "react-native-image-picker";
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

  // get data profile untuk di tampilkan di placeholder
  useEffect(() => {
    axios
      .get("/auth")
      .then(response => {
        setUserData(response.data);
      })
      .catch(error => {
        console.error("Error fetching data:", error); // Log error
      });
  }, []);

  //update data nama
  const updateUser = async () => {
    const formData = new FormData();
    formData.append("nama", getValues("nama")); // Menambahkan nama ke FormData

    if (file) {
      // Periksa apakah file.uri adalah string dan valid
      formData.append("photo", {
        uri: file.uri, // Pastikan ini adalah path file yang benar
        type: file.type || "image/jpeg",
        name: file.fileName || "profile_photo.jpg",
      });
    }

    try {
      const response = await axios.post("/user/account", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Setelah update berhasil, ambil URL gambar baru
      const { photo } = response.data.user;
      const updatedImageUrl = `http://192.168.61.240:8000${photo}?t=${new Date().getTime()}`;
      setImageUrl(updatedImageUrl);
      setData(prevData => ({ ...prevData, nama: getValues("nama") }));
    } catch (error) {
      console.error("Update failed:", error.message);
    }
  };

  // UPDATE DATA PENGGUNA V.2
  const {
    mutate: update,
    isLoading,
    isSuccess,
  } = useMutation(updateUser, {
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Data Berhasil Di Kirim",
      });
      navigation.navigate("Profile"); // Navigasi kembali untuk refresh halaman
      reset();
    },
    onError: error => {
      console.error(error.message);
      Toast.show({
        type: "error",
        text1: error.message,
      });
    },
  });

  const handleChoosePhoto = () => {
    launchImageLibrary({ mediaType: "photo" }, response => {
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.errorMessage) {
        console.log("ImagePicker Error: ", response.errorMessage);
      } else {
        console.log("Chosen file:", response.assets[0]);
        setFile(response.assets[0]);
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
                placeholderTextColor="black"
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

          <Controller
            control={control}
            name="photo"
            render={({ field: { value } }) => (
              <View style={styles.textFieldContainer}>
                <View
                  style={[
                    styles.textField,
                    {
                      backgroundColor: file ? "#D4D4D4" : "#fff",
                      padding: 20,
                      marginBottom: 20,
                      borderRadius: 7,
                    },
                  ]}
                  value={value}>
                  {/* Tampilkan tombol "Pilih Gambar" hanya jika tidak ada gambar */}
                  {!file && (
                    <TouchableOpacity onPress={handleChoosePhoto}>
                      <Text style={styles.selectPhotoText}>Pilih Gambar</Text>
                    </TouchableOpacity>
                  )}

                  {/* Tampilkan gambar dan tombol hapus jika ada gambar */}
                  {file && (
                    <View style={styles.imageContainer}>
                      <Image
                        source={{ uri: file.uri }} // Pastikan file.uri adalah path yang benar
                        style={styles.imagePreview}
                      />
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={handleDeletePhoto}>
                        <Text style={styles.deleteButtonText}>
                          Hapus Gambar
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
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
                placeholderTextColor="black"
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
                placeholderTextColor="black"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
        </>
      ) : (
        <Text style={[styles.text, { color: "black", marginVertical: 10 }]}>
          Loading...
        </Text>
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
  },
  textFieldContainer: {},
  imageContainer: {
    alignItems: "center",
  },
});

export default Akun;
