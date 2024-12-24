import * as React from "react";
import "moment/locale/id";
import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  Image,
  ScrollView,
} from "react-native";
import moment from "moment";
import { useForm, Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { TextField, Colors, Button, TextArea } from "react-native-ui-lib";
import Toast from "react-native-toast-message";
import axios from "@/src/libs/axios";
import Back from "../../components/Back";
import { useQueryClient } from "@tanstack/react-query";
import MaterialIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Select2 from "../../components/Select2";
import DateTimePicker from "@react-native-community/datetimepicker";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import { launchImageLibrary } from "react-native-image-picker";
import Icons from "react-native-vector-icons/AntDesign";
import DocumentPicker from "react-native-document-picker";
import AntDesign from "react-native-vector-icons/AntDesign";
import FontIcon from "react-native-vector-icons/FontAwesome5";
import IonIcons from "react-native-vector-icons/Ionicons";

const TambahPermohonan = ({ navigation }) => {
  const [jasaPengambilan, setJasaPengambilan] = useState([]);
  const [selectedJasaPengambilan, setSelectedJasaPengambilan] = useState(null);
  const [selectedCara, setSelectedCara] = useState(null);
  const [selectedPembayaran, setSelectedPembayaran] = useState(null);
  const [percuy, setPercuy] = useState(null);
  const [modalPercuy, setModalPercuy] = useState(false);
  const [date, setDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(null);
  const [file, setFile] = React.useState(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  const paginateRef = React.useRef;

  const handleDateChange = (event, selectedDate) => {
    if (event.type === "set") {
      const currentDate = selectedDate || date;
      if (currentDate instanceof Date && !isNaN(currentDate)) {
        setDate(currentDate);
        setShowDatePicker(false);
        setIsDateSelected(true);
      } else {
        console.error("Invalid date selected");
      }
    } else {
      setShowDatePicker(false);
    }
  };

  useEffect(() => {
    axios
      .get("/master/jasa-pengambilan")
      .then(response => {
        const formattedJasaPengambilan = response.data.data.map(item => ({
          title: item.wilayah,
          value: item.id,
        }));
        console.log(formattedJasaPengambilan);
        setJasaPengambilan(formattedJasaPengambilan);
      })
      .catch(error => {
        console.error("Error fetching data :", error);
      });
  }, []);

  const {
    handleSubmit,
    control,
    formState: { errors },
    getValues,
  } = useForm();

  const toastConfig = {
    success: () => (
      <>
        <View className="relative">
          <View className="bg-[#dddddd] mx-6 p-4 rounded-xl min-h-16 shadow-md">
            <View className="flex-1 pr-8">
              <Text className="text-green-500 text-sm font-poppins-semibold mb-1">
                Data Berhasil Disimpan !
              </Text>
              <Text className="text-gray-600 text-xs font-poppins-regular">
                Silahkan Untuk Menambahkan Parameter Lainnya Di Dalam Halaman
                Titik Uji Dan Parameter !
              </Text>
            </View>
          </View>
          <View className="absolute right-1 top-1/4 -translate-y-1/2">
            <MaterialIcons name="check-circle" size={50} color="#22C55E" />
          </View>
        </View>
      </>
    ),

    error: ({ text2 }) => (
      <View className="bg-white mx-4 mt-2 p-4 rounded-xl min-h-16 flex-row items-center justify-between shadow-md">
        <View className="flex-1 mr-3">
          <Text className="text-red-500 text-sm font-semibold mb-1">Error</Text>
          <Text className="text-gray-600 text-xs">{text2}</Text>
        </View>
        <View className="w-6 h-6 justify-center items-center">
          <MaterialIcons name="close-circle" size={24} color="#EF4444" />
        </View>
      </View>
    ),
  };

  const queryClient = useQueryClient();
  const {
    mutate: send,
    isLoading,
    isSuccess,
  } = useMutation(
    () => {
      const requestData = {
        industri: getValues("industri"),
        alamat: getValues("alamat"),
        kegiatan: getValues("kegiatan"),
        keterangan: getValues("keterangan"),
        is_mandiri: selectedCara === "kirimMandiri" ? 1 : 0,
        pembayaran: "transfer",
        jasa_pengambilan_id: selectedJasaPengambilan,
        // tanggal_surat: getValues("tanggal_surat"),
        // no_surat: getValues("no_surat"),
        // bulan: getValues("bulan"),
        // perihal: getValues("perihal"),
        // dokumen_permohonan: getValues("dokumen_permohonan"),
      };

      return axios.post("/permohonan/store", requestData).then(res => res.data);
    },
    {
      onSuccess: data => {
        setPercuy(data);
        // setTimeout(() => {
        //   navigation.navigate("Permohonan");
        // }, 2000);
        setModalPercuy(true);
        queryClient.invalidateQueries(["/permohonan"]);
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
    },
  );

  const onSubmit = data => {
    if (!selectedCara) {
      Toast.show({
        type: "error",
        text1: "Silakan pilih cara pengambilan",
      });
      return;
    }

    if (selectedCara === "ambilPetugas" && !selectedJasaPengambilan) {
      Toast.show({
        type: "error",
        text1: "Silakan pilih jasa pengambilan",
      });
      return;
    }

    send(data);
  };

  const handleSelectCara = cara => {
    setSelectedCara(cara);
  };

  const handleSelectPembayaran = pembayaran => {
    setSelectedPembayaran(pembayaran);
  };

  const handleSubmitData = data => {
    setSubmitted(true);
    send(data);
  };


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
  const handleFilePicker = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
      });
      setSelectedFile(res[0]);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker
      } else {
        console.error("Error picking document:", err);
        Alert.alert("Error", "Failed to pick document");
      }
    }
  };

  const handleUploadPDF = async () => {
    try {
      if (!selectedFile) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Please select a PDF file first",
        });
        return;
      }
      const formData = new FormData();
      formData.append("file", {
        uri: selectedFile.uri,
        type: selectedFile.type,
        name: selectedFile.name,
      });
      const response = await axios.post("/permohonan/store", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSelectedFile(null);
      setUploadModalVisible(false);

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "File berhasil diupload",
      });

      paginateRef.current?.refetch();
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.response?.data?.message || "Failed to upload file",
      });
    }
  };
  return (
    <>
      <ScrollView className="bg-[#ececec] w-full h-full  p-3">
        <View
          className="bg-[#fff] w-full h-full rounded-3xl"
          style={{
            elevation: 5,
            shadowColor: "rgba(0,0,0,0.1)",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 2,
          }}>
          <View className="flex-row  p-3 ">
            <Back
              size={30}
              color={"black"}
              action={() => navigation.goBack()}
              className="mr-5 "
              style={{
                borderWidth: 0.5,
                padding: 4,
                borderColor: "#f8f8f8",
                borderRadius: 8,
              }}
            />
            <Text className="font-poppins-semibold text-black text-2xl mt-1 ">
              Tambah Permohonan
            </Text>
          </View>
          <View className=" py-4 px-3">
            <Controller
              control={control}
              name="industri"
              rules={{ required: "Nama Industri tidak boleh kosong" }}
              render={({ field: { onChange, value } }) => (
                <View>
                  <Text className="font-poppins-semibold mb-1 text-black ">
                    Nama Industri
                  </Text>
                  <TextField
                    enableErrors
                    placeholder="CV. PT. "
                    onChangeText={onChange}
                    placeholderTextColor="grey"
                    className="p-3 bg-[#fff] rounded-2xl text-black border-stone-300 border font-poppins-regular"
                    value={value}
                  />
                  {errors.industri && (
                    <Text
                      style={{ color: "red" }}
                      className="-mt-5 mb-2 lowercase font-poppins-regular">
                      {errors.industri.message}
                    </Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="alamat"
              rules={{ required: "alamat industri tidak boleh kosong" }}
              render={({ field: { onChange, value } }) => (
                <View>
                  <Text className="font-poppins-semibold mb-1 text-black ">
                    Alamat Industri
                  </Text>
                  <TextField
                    enableErrors
                    placeholderTextColor="grey"
                    className="p-3 bg-[#fff] rounded-2xl border-stone-300 border font-poppins-regular"
                    onChangeText={onChange}
                    placeholder="Masukkan Alamat Industri"
                    value={value}
                  />
                </View>
              )}
            />
            {errors.alamat && (
              <Text
                style={{ color: "red" }}
                className="-mt-5 mb-2 lowercase font-poppins-regular">
                {errors.alamat.message}
              </Text>
            )}

            <Controller
              control={control}
              name="kegiatan"
              rules={{ required: "Kegiatan Industri tidak boleh kosong" }}
              render={({ field: { onChange, value } }) => (
                <View>
                  <Text className="font-poppins-semibold mb-1 text-black ">
                    Kegiatan Industri
                  </Text>
                  <TextField
                    enableErrors
                    placeholderTextColor="grey"
                    placeholder="Masukkan Kegiatan Industri"
                    className="p-3 bg-[#fff] rounded-2xl  border-stone-300 border font-poppins-regular"
                    onChangeText={onChange}
                    value={value}
                  />
                </View>
              )}
            />
            {errors.kegiatan && (
              <Text
                style={{ color: "red" }}
                className="-mt-5 mb-2 lowercase font-poppins-regular">
                {errors.kegiatan.message}
              </Text>
            )}

            {/* <Controller
              control={control}
              name="keterangan"
              rules={{ required: "Keterangan tidak boleh kosong" }}
              render={({ field: { onChange, value } }) => (
                <View>
                  <Text className="font-poppins-semibold mb-2 text-black ">
                    Keterangan
                  </Text>
                  <View className="border border-stone-300 bg-[#fff]">
                    <TextArea
                      placeholder="Ketikkan Keterangan"
                      placeholderTextColor="black"
                      className="px-2 py-4 bg-[#fff] rounded-md font-poppins-regular"
                      value={value}
                      onChangeText={onChange}
                    />
                  </View>
                </View>
              )}
            /> */}
            <View>
              <Text className="text-xl text-black mb-4 font-poppins-semibold text-center">
                Cara Pengambilan
              </Text>

              <View style={styles.cardContainer}>
                <TouchableOpacity
                  className="rounded-2xl"
                  style={[
                    styles.cardPengambilan,
                    selectedCara === "kirimMandiri" && styles.selectedCard,
                  ]}
                  onPress={() => handleSelectCara("kirimMandiri")}>
                  <MaterialIcons name="transfer" size={40} color="black" />
                </TouchableOpacity>
                <TouchableOpacity
                  className="rounded-2xl"
                  style={[
                    styles.cardPengambilan,
                    selectedCara === "ambilPetugas" && styles.selectedCard,
                  ]}
                  onPress={() => handleSelectCara("ambilPetugas")}>
                  <MaterialIcons name="truck" size={40} color="black" />
                </TouchableOpacity>
              </View>
              {selectedCara === "ambilPetugas" && (
                <View className=" mb-4">
                  <Select2
                    onSelect={value => {
                      setSelectedJasaPengambilan(value);
                    }}
                    data={jasaPengambilan}
                    placeholder="Pilih Jasa Pengambilan"
                  />
                </View>
              )}
            </View>

            {/* <View>
              <Text className="font-poppins-semibold text-black mt-2 mb-6  text-center text-base">
                Detail Kontrak
              </Text>

              <Controller
                control={control}
                name="nomor_surat"
                rules={{ required: "Nomor surat tidak boleh kosong" }}
                render={({ field: { onChange, value } }) => (
                  <View>
                    <Text className="font-poppins-semibold mb-1 text-black ">
                      Nomor Surat
                    </Text>
                    <TextField
                      enableErrors
                      placeholderTextColor="grey"
                      placeholder="Masukkan nomor surat"
                      className="p-3 bg-[#fff] rounded-2xl  border-stone-300 border font-poppins-regular"
                      onChangeText={onChange}
                      value={value}
                    />
                  </View>
                )}
              />

              <View>
                <Text className="font-poppins-semibold text-black mb-1">
                  Tanggal
                </Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                  <View className="flex-row items-center p-4 bg-[#fff] rounded-2xl border-stone-300 border ">
                    <Text className="text-sm flex-1 text-gray-500 font-poppins-regular">
                      {date
                        ? `${moment(date).format("YYYY-MM-DD HH:mm:ss")} `
                        : "Pilih Tanggal"}
                    </Text>
                    <FontAwesome5Icon
                      name="calendar-alt"
                      size={20}
                      color="black"
                      marginHorizontal={10}
                    />
                  </View>
                </TouchableOpacity>
              </View>

              <Controller
                name="bulan"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <View>
                    <Text className="font-poppins-semibold text-black mt-4">
                      Bulan
                    </Text>

                    <Select2
                      data={filteredMonths}
                      onSelect={value => {
                        onChange(value);
                      }}
                      defaultValue={bulan}
                    />
                  </View>
                )}
              />

              <Controller
                name="perihal"
                control={control}
                defaultValue=""
                render={({ field: { onChange, value } }) => (
                  <View>
                    <Text className="font-poppins-semibold mt-4 text-black">
                      Perihal
                    </Text>
                    <View className="border rounded-2xl  border-stone-300 bg-[#fff]">
                      <TextArea
                        className="p-3 bg-[#fff] rounded-2xl  border-stone-300 font-poppins-regular"
                        value={value}
                        onChangeText={onChange}
                      />
                    </View>
                  </View>
                )}
              />

              <Text className="font-poppins-semibold mt-4 text-black">
                Dokumen Permohonan
              </Text>
              <View className="rounded-lg">
                <TouchableOpacity
                  onPress={() => {
                    setUploadModalVisible(true);
                  }}
                  className="flex-row items-center p-4  bg-indigo-100 rounded-xl mr-2">
                  <FontIcon name="file-upload" size={25} color="#4f46e5" />
                  <Text className="ml-2 text-indigo-600  font-poppins-semibold">
                    Upload
                  </Text>
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={date || new Date()}
                  mode="date"
                  timeZoneName="Asia/Jakarta"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onChange={handleDateChange}
                />
              )}
            </View> */}

            <Button
              backgroundColor={Colors.brand}
              className="p-3 my-5 rounded-3xl "
              onPress={handleSubmit(send)}
              disabled={isLoading || isSuccess}>
              <Text className="text-white text-center text-base font-bold font-sans">
                SUBMIT
              </Text>
            </Button>
          </View>
        </View>
      </ScrollView>
      <Modal animationType="fade" transparent={true} visible={modalPercuy}>
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="w-80 bg-white rounded-2xl p-6 items-center shadow-2xl">
            <View className="w-20 h-20 rounded-full bg-green-50 justify-center items-center mb-4">
              <IonIcons size={40} color="#95bb72" name="checkmark-done-sharp" />
            </View>
            <Text className="text-xl font-poppins-semibold text-black mb-3">
              Berhasil Di Tambahkan !
            </Text>

            <View className="w-full h-px bg-gray-200 mb-4" />

            <Text className="text-md text-center text-gray-600  capitalize font-poppins-regular">
              Silahkan untuk melanjutkan menambahkan titik pengujian
            </Text>
            <View className="flex flex-row justify-center items-center space-x-3 w-full mt-3 ">
              <TouchableOpacity
                className="w-28 h-10 justify-center items-center"
                style={{
                  backgroundColor: "#ffcbd1",
                  borderRadius: 5,
                  marginTop: 10,
                }}>
                <Text
                  className="text-[#de0a26] font-poppins-semibold "
                  onPress={() => {
                    setModalPercuy(false);
                    navigation.goBack();
                  }}>
                  Tutup
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="w-28 h-10 justify-center items-center"
                style={{
                  backgroundColor: "#ddead1",
                  borderRadius: 5,
                  marginTop: 10,
                }}>
                <Text
                  className="text-[#4b6043] text-sm font-poppins-semibold "
                  onPress={() => {
                    setModalPercuy(false);
                    if (percuy) {
                      navigation.navigate("TitikUji", {
                        uuid: percuy?.permohonan.uuid,
                        tipePengambilan: {
                          is_mandiri: selectedCara === "kirimMandiri" ? 1 : 0,
                        },
                      });
                    }
                  }}>
                  Lanjutkan {percuy?.uuid}
                </Text>
              </TouchableOpacity>
            </View>
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
              <IonIcons size={40} color="#f43f5e" name="close-sharp" />
            </View>
            <Text className="text-xl font-poppins-semibold text-black mb-3">
              Data Gagal Di Tambahkan !
            </Text>

            <View className="w-full h-px bg-gray-200 mb-4" />

            <Text className="text-md text-center text-gray-600  capitalize font-poppins-regular">
              {errorMessage}
            </Text>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        animationType="slide"
        visible={uploadModalVisible}
        onRequestClose={() => {
          setUploadModalVisible(false);
          setSelectedFile(null);
        }}>
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-[#ffffff] rounded-lg w-[90%] p-5">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-poppins-semibold text-black">
                Upload File
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setUploadModalVisible(false);
                  setSelectedFile(null);
                }}>
                <AntDesign name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedFile ? (
              <View className="mb-4  ">
                <View className="bg-[#f8f8f8] rounded-lg shadow">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 mr-2">
                      {/* <Text className="text-sm mb-1">Selected File:</Text> */}
                      <Text className="text-sm font-poppins-semibold">
                        {selectedFile.name}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setSelectedFile(null)}
                      className="bg-gray-200 p-2 rounded-full">
                      <AntDesign name="close" size={16} color="black" />
                    </TouchableOpacity>
                  </View>
                </View>
                <View className="flex-row justify-end mt-4">
                  <TouchableOpacity
                    onPress={handleUploadPDF}
                    className="bg-indigo-600 p-4 rounded-lg ">
                    <Text className="text-white font-poppins-semibold">
                      Upload
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View>
                <Text className="text-sm mb-4 font-poppins-regular">
                  Silahkan pilih file PDF yang akan diupload
                </Text>
                <View className="flex-row justify-end">
                  <TouchableOpacity
                    onPress={handleFilePicker}
                    className="bg-indigo-600 px-4 py-2 rounded">
                    <Text className="text-white font-poppins-semibold">
                      Pilih File
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ececec",
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    alignSelf: "center",
    marginVertical: 10,
  },
  cardContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  cardPengambilan: {
    flex: 1,
    paddingVertical: 30,
    paddingHorizontal: 10,
    alignItems: "center",
    marginHorizontal: 5,
    backgroundColor: "#fff",
    borderWidth: 0.5,
    borderColor: "#D6D3D1",
  },
  cardPembayaran: {
    flex: 1,
    paddingVertical: 50,
    paddingHorizontal: 10,
    borderRadius: 7,
    marginBottom: 10,
    alignItems: "center",
    marginHorizontal: 5,
    backgroundColor: "#fff",
  },
  selectedCard: {
    backgroundColor: "#C5CAE9",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#5C6BC0",
  },
  CardTitleText: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#fff",
  },
  cardText: {
    color: "white",
    textAlign: "justify",
  },
  icon: {
    width: 40,
    height: 40,
    marginBottom: 10,
    tintColor: "white",
  },
  submitButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 90,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  overlayView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.88)",
  },
  successContainer: {
    alignItems: "center",
    padding: 20,
    width: "90%",
    paddingVertical: 30,
    borderRadius: 10,
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

export default TambahPermohonan;
