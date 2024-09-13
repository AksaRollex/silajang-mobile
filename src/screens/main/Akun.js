import React from "react";
import {
  View,
  StyleSheet,
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

const Akun = ({ onCancel }) => {
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
      const requestData = {
        nama: getValues("nama"),
        photo: userData?.photo, // Jika Anda menyertakan foto dalam update
      };
      return axios.put("/user/updateAkun", requestData).then(res => res.data);
    },
    {
      onSuccess: () => {
        Toast.show({
          type: "success",
          text1: "Data Berhasil Di Kirim",
        });
        navigation.navigate("Profile"); // Navigasi kembali untuk refresh halaman
        reset();
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
                  value={value}
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
        <Text style={styles.text}>Loading...</Text>
      )}

      <View style={styles.buttonContainer}>
        <Button
          label="Batal"
          backgroundColor="#fca5a5"
          borderRadius={5}
          style={styles.button}
          onPress={onCancel}
        />
        <Button
          label="Perbarui"
          backgroundColor={Colors.brand}
          borderRadius={5}
          style={styles.button}
          onPress={handleSubmit(update)}
          disabled={isLoading || isSuccess}
        />
      </View>
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
  text: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  textField: {
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginBottom: 16,
    borderRadius: 10,
  },
  deleteButton: {
    marginTop: 5,
  },
  deleteButtonText: {
    color: "red",
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
  buttonContainer: {
    marginTop: 5,
  },
  button: {
    width: "100%",
    marginBottom: 10,
  },
});

export default Akun;
