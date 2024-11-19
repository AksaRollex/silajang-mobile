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
import LottieView from "lottie-react-native";
import Icons from "react-native-vector-icons/AntDesign";

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
      setModalVisible(true);
      queryClient.invalidateQueries("/auth");
      setTimeout(() => {
        setModalVisible(false);
        fetchUserData();

        navigation.navigate("IndexProfile");
      }, 2000);
    },
    onError: error => {
      setErrorMessage(error.response?.data?.message || "Gagal memperbarui data");
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
      <View className="bg-[#ececec] px-5 w-full h-full ">
          <View className="flex-row  py-5 ">
            <Back
              size={30}
              color={"black"}
              action={() => navigation.goBack()}
              className="mr-5 "
              style={{
                padding: 4,
              }}
            />
            <Text className="font-poppins-semibold text-black text-xl mt-1 ">
              Informasi Personal
            </Text>
          </View>

          {userData ? (
            <View className="flex">
              <Controller
                control={control}
                name="photo"
                render={({ field: { value } }) => (
                  <View className="mt-2">
                    <Text className="font-poppins-semibold mb-1 text-md text-black " style={{ fontSize: 15 }}>
                      Foto Profil
                    </Text>
                    <View className="p-[5px] bg-[#fff] rounded-2xl border-stone-300 border font-poppins-regular">
                      <View className="bg-zinc-800 rounded-2xl p-2">
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
              <Button
                className="p-3 rounded-3xl mt-3"
                backgroundColor={Colors.brand}
                borderRadius={5}
                onPress={handleSubmit(update)}
                disabled={isLoading}>
                <Text className="text-white text-center text-base font-poppins-semibold">
                  PERBARUI
                </Text>
              </Button>
            </View>
          ) : (
            <View className="flex-1 justify-center items-center my-4">
              <ActivityIndicator size="large" color="#312e81" />
            </View>
          )}
      </View>
      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View style={styles.overlayView}>
          <View style={styles.successContainer}>
              <Image
                source={require("@/assets/images/cek.png")}
                style={styles.lottie}
              />
            {/* <LottieView
              source={require("../../../../assets/lottiefiles/success-animation.json")}
              autoPlay
              loop={false}
              style={styles.lottie}
            /> */}
            <Text style={styles.successTextTitle}>
              Informasi personal kamu berhasil di rubah
            </Text>
            <Text style={styles.successText}>
              Pastikan informasi personal yang kamu gunakan saat ini sudah benar
              !
            </Text>
          </View>
        </View>
      </Modal>

      <Modal animationType="fade" transparent={true} visible={errorModalVisible}>
        <View style={styles.overlayView}>
          <View style={[styles.successContainer, styles.errorContainer]}>
            <Image 
              source={require("@/assets/images/error.png")}
              style={styles.lottie}
              />
              <Text style={[styles.successTextTitle, styles.errortitle]}>
                Gagal memperbarui data
              </Text>
              <Text style={[styles.successText, styles.errorText]}>
                {errorMessage}
              </Text>
              {/* <TouchableOpacity 
                style={styles.errorButton}
                onPress={() => setErrorModalVisible(false)}>
                  <Text style={styles.errorButtonText}>Tutup</Text>
              </TouchableOpacity> */}
          </View>
        </View>
      </Modal>
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
    width: 150,
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
    fontFamily: "Poppins-SemiBold",
  },
  overlayView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  successContainer: {
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
    width: "90%",
    paddingVertical: 30,
    borderRadius: 10,
  },
  lottie: {
    width: 170,
    height: 170,
  },

  successTextTitle: {
    textAlign: "center",
    color: "black",
    fontSize: rem(1.5),
    marginBottom: rem(1.5),
    marginTop: rem(1),
    fontFamily: "Poppins-SemiBold",
  },
  successText: {
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Poppins-Regular",
    color: "black",
  },
  errortitle: {
    color: '#FF4B4B',
  },
  errorText: {
    color: '#666',
  },
});

export default Akun;
