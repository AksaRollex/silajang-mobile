import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator,
  Modal,
  ScrollView,
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
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import IonIcons from "react-native-vector-icons/Ionicons";

const Akun = () => {
  const [file, setFile] = React.useState(null);
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation();
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const queryClient = useQueryClient();
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  const { mutate: update, isLoading } = useMutation(updateUser, {
    onSuccess: () => {
      setModalVisible(true);
      queryClient.invalidateQueries("/auth");
      setTimeout(() => {
        // setModalVisible(false);
        fetchUserData();

        navigation.navigate("IndexProfile");
      }, 2000);
    },
    onError: error => {
      setErrorMessage(
        error.response?.data?.message || "Gagal memperbarui data",
      );
      setErrorModalVisible(true);
      setTimeout(() => {
        setErrorModalVisible(false);
      }, 2000);
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
      <View className="bg-[#ececec] p-3 w-full h-full ">
        <View
          className="bg-[#fff] rounded-3xl px-4 h-full"
          style={{
            elevation: 5,
            shadowColor: "rgba(0, 0, 0, 0.1)",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 2,
          }}>
          <View className="flex-row items-center justify-between py-5  ">
            <Back
              size={25}
              color={"black"}
              action={() => navigation.goBack()}
              className="mr-5 "
              style={{
                padding: 4,
              }}
            />
            <Text className="font-poppins-semibold text-black text-lg text-end  ">
              Informasi Personal
            </Text>
          </View>

          <ScrollView className="w-full h-full ">
            {userData ? (
              <View  className="w-full h-full ">
                <Controller
                  control={control}
                  name="photo"
                  render={({ field: { value } }) => (
                    <View className="mt-3">
                      <Text
                        className="font-poppins-semibold mb-2 text-md text-black"
                        style={{ fontSize: 15 }}>
                        Foto Profil
                      </Text>
                      <View className="rounded-2xl">
                        {currentPhotoUrl || file ? (
                          // State setelah upload foto
                          <View className="border-2 border-dashed border-indigo-600/30 bg-indigo-50/30 rounded-2xl p-4">
                            <View className="items-center">
                              <View className="relative">
                                <Image
                                  source={{
                                    uri: file ? file.uri : currentPhotoUrl,
                                  }}
                                  className="w-48 h-48 rounded-lg"
                                  onError={e =>
                                    console.log(
                                      "Error loading image:",
                                      e.nativeEvent.error,
                                    )
                                  }
                                />

                                <View className="absolute inset-0 rounded-full bg-black/5" />
                                <TouchableOpacity
                                  className="absolute -top-2 -right-2 bg-white rounded-full w-8 h-8 items-center justify-center shadow-lg border border-red-100"
                                  onPress={handleDeletePhoto}>
                                  <Icons
                                    name="close"
                                    size={18}
                                    color="#dc2626"
                                  />
                                </TouchableOpacity>
                                <TouchableOpacity
                                  className="absolute bottom-0 right-0 bg-indigo-600 rounded-full w-10 h-10 items-center justify-center shadow-lg"
                                  onPress={handleChoosePhoto}>
                                  <Icons
                                    name="camera"
                                    size={20}
                                    color="white"
                                  />
                                </TouchableOpacity>
                              </View>

                              <Text className="font-poppins-medium text-sm text-gray-600 mt-3">
                                Ketuk ikon kamera untuk mengubah foto
                              </Text>
                            </View>
                          </View>
                        ) : (
                          <TouchableOpacity
                            className="border-2 border-dashed border-indigo-600/30 bg-indigo-50/20 rounded-2xl p-8"
                            onPress={handleChoosePhoto}>
                            <View className="items-center space-y-4">
                              <View className="bg-indigo-100 rounded-full p-5">
                                <SimpleLineIcons
                                  name="cloud-upload"
                                  size={40}
                                  color="#4f46e5"
                                />
                              </View>

                              <View className="items-center">
                                <Text className="font-poppins-semibold text-lg text-indigo-600 mb-1">
                                  Unggah Foto Profil
                                </Text>
                                <Text className="font-poppins-regular text-sm text-gray-500 text-center">
                                  Klik atau sentuh area ini untuk memilih foto
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  )}
                />
                <Controller
                  control={control}
                  name="nama"
                  defaultValue={userData.user.nama}
                  rules={{ required: "Nama Tidak Boleh Kosong" }}
                  render={({ field: { onChange, value } }) => (
                    <View className="mt-4">
                      <Text className="font-poppins-semibold mb-1 text-black ">
                        Nama
                      </Text>
                      <TextField
                        value={value}
                        placeholderTextColor="black"
                        className="p-3 bg-[#fff] rounded-2xl border-stone-300 border font-poppins-regular"
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
                  name="email"
                  render={({ field: { onChange, value } }) => (
                    <View className="bottom-2">
                      <Text className="font-poppins-semibold mb-1 text-black">
                        Email
                      </Text>
                      <TextField
                        placeholder={userData.user.email}
                        editable={false}
                        enableErrors
                        className="p-3 bg-[#fff] rounded-2xl border-stone-300 border font-poppins-regular"
                        placeholderTextColor="grey"
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
                    <View className="bottom-4">
                      <Text className="font-poppins-semibold mb-1 text-black">
                        Nomor Telepon
                      </Text>
                      <TextField
                        placeholder={userData.user.phone}
                        enableErrors
                        editable={false}
                        className="p-3 bg-[#fff] rounded-2xl border-stone-300 border font-poppins-regular"
                        placeholderTextColor="grey"
                        onChangeText={onChange}
                        value={value}
                      />
                    </View>
                  )}
                />
                <View className="justify-end ">
                  <Button
                    className="p-3 rounded-3xl mb-4 items-end"
                    backgroundColor={Colors.brand}
                    borderRadius={5}
                    onPress={handleSubmit(update)}
                    disabled={isLoading}>
                    <Text className="text-white text-center text-base font-poppins-semibold">
                      PERBARUI
                    </Text>
                  </Button>
                </View>
              </View>
            ) : (
              <View className="flex-1 justify-center items-center my-4">
                <ActivityIndicator size="large" color="#312e81" />
              </View>
            )}
          </ScrollView>
        </View>
        <Modal animationType="fade" transparent={true} visible={modalVisible}>
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="w-80 bg-white rounded-2xl p-6 items-center shadow-2xl">
              <View className="w-20 h-20 rounded-full bg-green-50 justify-center items-center mb-4">
                <IonIcons
                  size={40}
                  color="#95bb72"
                  name="checkmark-done-sharp"
                />
              </View>
              <Text className="text-xl font-poppins-semibold text-black mb-3">
                Data Berhasil Dirubah !
              </Text>

              <View className="w-full h-px bg-gray-200 mb-4" />

              <Text className="text-md text-center text-gray-600  capitalize font-poppins-regular">
                Pastikan Data personal kamu sudah benar / sesuai !
              </Text>
            </View>
          </View>
        </Modal>
        <Modal
          animationType="fade"
          transparent={true}
          visible={errorModalVisible}>
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="w-80 bg-white rounded-2xl p-6 items-center shadow-2xl">
              <View className="w-20 h-20 rounded-full bg-red-50 justify-center items-center mb-4">
                <IonIcons
                  size={40}
                  color="#95bb72"
                  name="checkmark-done-sharp"
                />
              </View>
              <Text className="text-xl font-poppins-semibold text-black mb-3">
                Data Gagal Dirubah !
              </Text>

              <View className="w-full h-px bg-gray-200 mb-4" />

              <Text className="text-md text-center text-gray-600  capitalize font-poppins-regular">
                {errorMessage ||
                  "Pastikan Data personal kamu sudah benar / sesuai !"}
              </Text>
            </View>
          </View>
        </Modal>
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
  successContainer: {
    alignItems: "center",
    padding: 20,
    width: "90%",
    paddingVertical: 30,
    borderRadius: 10,
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
    borderRadius: 10,
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
    height: 200,
    resizeMode: "contain",
    borderRadius: 20,
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
    top: 0,
    right: 0,
    borderRadius: 15,
    backgroundColor: "#c30010",
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
    backgroundColor: "#EBF0FF",
    padding: 20,
    borderWidth: 2,
    borderColor: "#5C85FF",
    borderStyle: "dashed",
    borderRadius: 8,
  },
  addSignatureText: {
    marginLeft: 10,
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
  },
  overlayView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.88)",
  },
  lottie: {
    width: 200,
    height: 200,
  },
  successTextTitle: {
    textAlign: "center",
    color: "black",
    fontSize: rem(1.5),
    marginBottom: rem(0.5),
    marginTop: rem(1),
    color: "#77DD77",
    fontFamily: "Poppins-SemiBold",
  },
  successText: {
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Poppins-Regular",
    color: "#fff",
  },

  errortitle: {
    color: "#FF4B4B",
  },
  errorText: {
    color: "#fff",
  },
});

export default Akun;
