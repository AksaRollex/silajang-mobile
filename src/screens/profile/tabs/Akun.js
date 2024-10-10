import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator,
} from "react-native";
import axios from "@/src/libs/axios";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import { useForm, Controller } from "react-hook-form";
import { TextField, Colors, Button } from "react-native-ui-lib";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { launchImageLibrary } from "react-native-image-picker";
import { APP_URL } from "@env";
import Back from "../../components/Back";
import Icons from "react-native-vector-icons/AntDesign";

const Akun = () => {
  const [file, setFile] = React.useState(null);
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation();
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(null);
  const queryClient = useQueryClient();

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
        if (response.data.user.photo) {
          const photoUrl = `${APP_URL}${response.data.user.photo}`;
          setCurrentPhotoUrl(photoUrl);
        }
      })
      .catch(error => {
        console.error("Error fetching data:", error);
      });
  }, []);

  // console.log(userData)

  // UPDATE DATA USER
  const updateUser = async () => {
    const formData = new FormData();
    formData.append("nama", getValues("nama"));

    if (file) {
      const fileSizeInKB = file.fileSize / 1024;
      if (fileSizeInKB > 2048) {
        Toast.show({
          type: "error",
          text1: "File terlalu besar",
          text2: "Ukuran file tidak boleh melebihi 2048 KB (2 MB)",
        });
        return; // Exit the function early if the file is too large
      }
    }
    if (file) {
      formData.append("photo", {
        uri: file.uri,
        type: file.type || "image/jpeg",
        name: file.fileName || "profile_photo.jpg",
      });
    }

    try {
      const response = await axios.post("/user/accountSecure", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Set photo langsung dari file yang di-upload jika tidak ada di respons
      const updatedImageUrl = file
        ? file.uri
        : `${APP_URL}${response.data.photo}`;
      setCurrentPhotoUrl(updatedImageUrl);
      setUserData(prevData => ({ ...prevData, nama: getValues("nama") }));

      console.log("Update successful:", response.data); // Log response
    } catch (error) {
      console.error("Update failed:", error.message);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await axios.get("/auth");
      setUserData(response.data);
      if (response.data.user.photo) {
        const photoUrl = `${APP_URL}${response.data.user.photo}`;
        setCurrentPhotoUrl(photoUrl);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
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
        text1: "Data Berhasil Di Perbarui",
      });
      queryClient.invalidateQueries("/auth");
      navigation.navigate("IndexProfile");
      setFile(null);
      fetchUserData();
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
      if (response.errorMessage) {
        console.log("Image Error : ", response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const file = response.assets[0];
        const fileSizeInBytes = file.fileSize;
        const fileSizeInKB = fileSizeInBytes / 1024;

        if (fileSizeInKB > 2048) {
          Toast.show({
            type: "error",
            text1: "Ukuran file terlalu besar",
            text2: "Ukuran file tidak boleh melebihi 2048 KB (2 MB)",
          });
        } else {
          console.log("Chosen file:", file);
          setFile(file);
        }
      }
    });
  };

  const handleDeletePhoto = () => {
    setFile(null);
    setCurrentPhotoUrl(null);
  };

  return (
    <>
      <View className="w-full">
        <View
          className="flex-row mb-4 p-3 justify-between"
          style={{ backgroundColor: Colors.brand }}>
          <Back
            size={24}
            color={"white"}
            action={() => navigation.goBack()}
            className="mr-2 "
          />
          <Text className="font-bold text-white text-lg ">
            Informasi Personal
          </Text>
        </View>
      </View>
      <View className="bg-[#ececec] w-full h-full px-3 py-1 ">
        <View className="bg-[#f8f8f8] py-4 px-3 rounded-md mb-6">
          {userData ? (
            <View>
              <Controller
                control={control}
                name="nama"
                defaultValue={userData.user.nama}
                rules={{ required: "Nama Tidak Boleh Kosong" }}
                render={({ field: { onChange, value } }) => (
                  <View className="">
                    <Text className="font-sans font-bold mb-2 text-black ">
                      Nama
                    </Text>

                    <TextField
                      value={value}
                      placeholderTextColor="black"
                      className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-sans"
                      enableErrors
                      onChangeText={onChange}
                    />
                  </View>
                )}
              />
              {errors.nama && (
                <Text style={{ color: "red" }} className="mb-4 -mt-5">
                  {errors.nama.message}
                </Text>
              )}
              <Controller
                control={control}
                name="photo"
                render={({ field: { value } }) => (
                  <View className=" mb-4">
                    <Text className="font-sans font-bold mb-2 text-black ">
                      Foto Profil
                    </Text>
                    <View className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-sans">
                      <View className="bg-zinc-800 rounded-sm p-2">
                        {currentPhotoUrl || file ? (
                          <View style={styles.imageContainer}>
                            <Image
                              source={{
                                uri: file ? file.uri : currentPhotoUrl,
                              }}
                              style={styles.signaturePreview}
                              onError={e =>
                                console.log(
                                  "Error loading image:",
                                  e.nativeEvent.error,
                                )
                              }
                            />
                            {/* <TouchableOpacity
                              style={{ backgroundColor: Colors.brand }}
                              className="px-5 py-2 rounded-sm items-center justify-center"
                              onPress={handleChoosePhoto}>
                              <Text className="font-sans font-bold  text-white">
                                Ubah Gambar
                              </Text>
                            </TouchableOpacity> */}
                            <TouchableOpacity
                              style={styles.deleteButton}
                              className="absolute bg-red-600 rounded-full items-center justify-center  top-3 w-8 h-8 right-3  m-3"
                              onPress={handleDeletePhoto}>
                              <Icons
                                name="close"
                                size={18}
                                color={"white"}></Icons>
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
                  </View>
                )}
              />

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <View>
                    <Text className="font-sans font-bold mb-2 text-black">
                      Email
                    </Text>
                    <TextField
                      placeholder={userData.user.email}
                      editable={false}
                      enableErrors
                      className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-sans"
                      placeholderTextColor="black"
                      onChangeText={onChange}
                      value={value}
                    />
                  </View>
                )}
              />
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, value } }) => (
                  <View>
                    <Text className="font-sans font-bold mb-2 text-black">
                      Nomor Telepon
                    </Text>
                    <TextField
                      placeholder={userData.user.phone}
                      enableErrors
                      editable={false}
                      className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-sans"
                      placeholderTextColor="black"
                      onChangeText={onChange}
                      value={value}
                    />
                  </View>
                )}
              />

              <Button
                className="p-2 rounded-sm "
                backgroundColor={Colors.brand}
                borderRadius={5}
                onPress={handleSubmit(update)}
                disabled={isLoading}>
                <Text className="text-white text-center text-base font-bold font-sans">
                  PERBARUI
                </Text>
              </Button>
            </View>
          ) : (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#312e81" />
            </View>
          )}
        </View>
      </View>
    </>
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
    shadowOffset: { width: 0, height: 2 },
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
    borderColor: "#fff",
    borderStyle: "dashed",
    borderRadius: 8,
  },
  addSignatureText: {
    marginLeft: 10,
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Akun;
