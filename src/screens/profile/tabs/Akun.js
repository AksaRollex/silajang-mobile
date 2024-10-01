import React from "react";
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator,
  onChange,
  Modal,
} from "react-native";
import axios from "@/src/libs/axios";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { useForm, Controller } from "react-hook-form";  
import { TextField, Colors, Button } from "react-native-ui-lib";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { launchImageLibrary } from "react-native-image-picker";
import { API_URL } from "@env";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BackButton from "../../components/Back";
import Ionicons from "react-native-vector-icons/Ionicons";

const Akun = () => {
  const [file, setFile] = React.useState(null);
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation();
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(null);

  const {
    handleSubmit,
    control,
    formState: { errors },
    getValues,
    reset,
  } = useForm();

  // FETCH DATA USER
  useEffect(() => {
    axios
      .get("/auth")
      .then(response => {
        setUserData(response.data);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
      });
  }, []);
  
  // FETCH PHOTO USER 
  useEffect(() => {
    axios
      .get("/auth")
      .then(response => {
        setUserData(response.data);
        if (response.data.user && response.data.user.photo) {
          const photoUrl = `${API_URL}${response.data.user.photo}`;
          setCurrentPhotoUrl(photoUrl);
          console.log({API_URL})
        }
      })
      .catch(error => {
        console.error("Error fetching data:", error);
      });
  }, []);

  // UPDATE DATA USER
  const updateUser = async () => {
    const formData = new FormData();
    formData.append("nama", getValues("nama"));

    if (file) {
      formData.append("photo", {
        uri: file.uri,
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

      const { photo } = response.data.user;
      const updatedImageUrl = `${API_URL}${photo}?t=${new Date().getTime()}`;
      setImageUrl(updatedImageUrl);
      setData(prevData => ({ ...prevData, nama: getValues("nama") }));
    } catch (error) {
      console.error("Update failed:", error.message);
    }
  };

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
      navigation.navigate("Profile");
      reset();
      setFile(null);
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
    setCurrentPhotoUrl(null);
  };
  

  return (
    <View style={styles.container}>
      {userData ? (
        <View style={styles.card}>
          <View className="flex-row justify-between mx-2 mb-4 ">
            <BackButton action={() => navigation.goBack()} size={26} />
              <View className="flex-row gap-2 items-center">
                <Ionicons name="person" size={24} color="black"/>
                <Text className="text-xl font-extrabold me-10">Akun</Text>
              </View>
          </View>
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
                value={value}
              />
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
              <View style={styles.signatureContainer}>
                <View style={styles.signatureField}>
                  {currentPhotoUrl || file ? (
                    <View style={styles.imageContainer}>
                      <Image
                        source={{ uri: file ? file.uri : currentPhotoUrl }}
                        style={styles.signaturePreview}
                        onError={e => console.log("Error loading image:", e.nativeEvent.error)}
                      />
                      <TouchableOpacity
                        style={styles.changeButton}
                        onPress={handleChoosePhoto}>
                        <Text style={styles.buttonText}>Ubah</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={handleDeletePhoto}>
                        <Text style={styles.deleteButtonText}>X</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.addSignatureButton}
                      onPress={handleChoosePhoto}>
                      <Text style={styles.addSignatureText}>
                        Tambah Foto
                      </Text>
                    </TouchableOpacity>
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
                editable={false}
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
          <Button
        label="Perbarui"
        style={{ marginBottom: 10 }}
        backgroundColor={Colors.brand}
        borderRadius={5}
        onPress={handleSubmit(update)}
        disabled={isLoading}
      />
        </View>
      ) : (
        <View className="h-full flex justify-center">
        <ActivityIndicator size={"large"} color={"#312e81"} />
      </View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ececec",
  },
  card: {
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    backgroundColor: "#fff",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 20,
    marginTop: 20,
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
  deleteButton: {
    position: "absolute",
    right: 10,
    top: 10,
    backgroundColor: "red",
    borderRadius: 50,
    padding: 5,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  selectPhotoText: {
    color: "black",
  },
  textFieldContainer: {},
  imageContainer: {
    alignItems: "center",
  },
  signatureContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  signatureField: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  imageContainer: {
    alignItems: "center",
    position: "relative",
  },
  signaturePreview: {
    width: 200,
    height: 100,
    resizeMode: "contain",
    marginBottom: 10,
  },
  changeButton: {
    backgroundColor: "#4682B4",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  deleteButton: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: "red",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  addSignatureButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    borderWidth: 2,
    borderColor: "#4682B4",
    borderStyle: "dashed",
    borderRadius: 8,
  },
  addSignatureText: {
    marginLeft: 10,
    color: "#4682B4",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Akun;
