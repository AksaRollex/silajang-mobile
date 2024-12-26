import { View, Text, Modal, TouchableOpacity, Button, TextInput } from "react-native";
import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import BackButton from "../../components/Back";
import IonIcons from "react-native-vector-icons/Ionicons";
import AntDesign from "react-native-vector-icons/AntDesign";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import FontIcon from "react-native-vector-icons/FontAwesome5";
import DocumentPicker from "react-native-document-picker";
import SectionedMultiSelect from "react-native-sectioned-multi-select";
import { Colors, TextField, TextArea } from "react-native-ui-lib";
import Icon from "react-native-vector-icons/MaterialIcons";
import Toast from "react-native-toast-message";
import axios from "@/src/libs/axios";
import moment from "moment";
import DateTimePicker from "@react-native-community/datetimepicker";
const OpenKontrak = ({ route, navigation }) => {
  const { uuid } = route.params;
  console.log(uuid);
  const [date, setDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedBulan, setSelectedBulan] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const paginateRef = React.useRef;

  const queryClient = useQueryClient();

  // FETCH DATA
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  // FETCH DATA
  const { data, isLoading: isLoadingData } = useQuery(
    ["permohonan", uuid],
    () =>
      uuid
        ? axios.get(`/permohonan/${uuid}/edit`).then(res => {
            console.log("Full response:", res.data.data);
            return res.data.data;
          })
        : null,
    {
      enabled: !!uuid,
      onSuccess: data => {
        if (data && data.kontrak) {
          setValue("nomor_surat", data.kontrak.nomor_surat);
          setValue("perihal", data.kontrak.perihal);
          setValue(
            "bulan",
            data.kontrak.bulan ? data.kontrak.bulan.map(Number) : [],
          );
          setDate(
            data.kontrak.tanggal_surat
              ? new Date(data.kontrak.tanggal_surat)
              : null,
          );
          setSelectedFile(data.kontrak.dokumen_permohonan || null);
        }
      },
      onError: error => {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to load data",
        });
        console.error(error);
      },
    },
  );

  // UPDATE DATA
  const { mutate: update, isLoading: isUpdating } = useMutation(
    data => axios.post(`/permohonan/${uuid}/update-kontrak`, data),
    {
      onSuccess: () => {
        setModalVisible(true); // Tampilkan modal dulu
        queryClient.invalidateQueries(["/permohonan"]);

        setTimeout(() => {
          navigation.navigate("Permohonan");
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
    },
  );
  const onSubmit = data => {
    data.tanggal_surat = date ? moment(date).format("YYYY-MM-DD") : null;
    console.log("Submitting data:", data);
    update(data);
  };

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

  const bulan = [
    { id: 1, name: "Januari" },
    { id: 2, name: "Februari" },
    { id: 3, name: "Maret" },
    { id: 4, name: "April" },
    { id: 5, name: "Mei" },
    { id: 6, name: "Juni" },
    { id: 7, name: "Juli" },
    { id: 8, name: "Agustus" },
    { id: 9, name: "September" },
    { id: 10, name: "Oktober" },
    { id: 11, name: "November" },
    { id: 12, name: "Desember" },
  ];
  const handleFilePicker = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
      });
      setSelectedFile(res[0]);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
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
      <View className="bg-[#ececec] w-full h-full p-3">
        <View className="rounded-3xl bg-[#fff] w-full h-full ">
          <View className="flex-row pt-5 px-4 pb-1 justify-between items-center">
            <BackButton
              size={30}
              color={"black"}
              action={() => navigation.goBack()}
              className="mr-5 "
            />
            <Text className="font-poppins-semibold text-black text-lg text-end  ">
              Edit Kontrak
            </Text>
          </View>

          <View className="py-4 px-3">
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
                  <View className="border rounded-2xl border-stone-300 bg-[#fff] p-3">
                    <SectionedMultiSelect
                      IconRenderer={Icon}
                      hideTags
                      styles={{
                        selectToggle: {
                          backgroundColor: "#fff",
                          borderWidth: 1,
                          borderColor: "#CCC",
                          borderRadius: 16,
                          padding: 12,
                          fontFamily: "Poppins-Regular",
                          marginBottom: 8,
                        },
                        selectToggleText: {
                          fontFamily: "Poppins-Regular",
                        },
                        displayKey: {
                          fontFamily: "Poppins-Regular",
                          color: "#333",
                        },
                        chipContainer: {
                          borderRadius: 16,
                          margin: 4,
                          backgroundColor: "#f8f8f8",
                        },
                        chipText: {
                          color: "#FF0000",
                          fontSize: 14,
                          fontFamily: "Poppins-Regular",
                        },
                        chipIcon: {
                          color: "#000",
                        },
                        itemText: {
                          borderRadius: 16,
                          backgroundColor: "#f8f8f8",
                          padding: 12,
                          color: "#333",
                          fontFamily: "Poppins-Regular",
                        },
                        selectedItem: {
                          borderRadius: 16,
                        },
                        selectedItemText: {
                          fontFamily: "Poppins-Regular",
                          color: "#46923c",
                          backgroundColor: "#ececec",
                        },
                        confirmText: {
                          fontFamily: "Poppins-Semibold",
                          color: "#FFF",
                        },
                        button: {
                          backgroundColor: "#3730a3",
                          borderRadius: 16,
                          paddingHorizontal: 12,
                          paddingVertical: 12,
                          margin: 10,
                        },
                        cancelButton: {
                          backgroundColor: "#FF0000",
                          borderRadius: 16,
                          paddingHorizontal: 12,
                          paddingVertical: 12,
                          margin: 10,
                        },
                        searchTextInput: {
                          fontFamily: "Poppins-Regular",
                          color: "#333",
                        },
                        itemFontFamily: "Poppins-Regular",
                        icons: {
                          search: {
                            name: "search",
                            color: "#000",
                          },
                        },
                      }}
                      items={bulan}
                      uniqueKey="id"
                      subKey="children"
                      onSelectedItemsChange={items => {
                        onChange(items);
                        setSelectedBulan(items);
                      }}
                      selectedItems={value || []}
                      selectText="Pilih Bulan"
                      confirmText="KONFIRMASI"
                      showRemoveAll={true}
                      removeAllText="Hapus Semua"
                      modalAnimationType="fade"
                      showCancelButton={true}
                      searchPlaceholderText="Cari Bulan..."
                      onChangeInput={text => console.log(text)}
                    />
                  </View>
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
                  <View className="border rounded-2xl border-stone-300 bg-[#fff]">
                    <TextField
                      className="p-3 bg-[#fff] rounded-2xl border-stone-300 font-poppins-regular"
                      value={value}
                      onChangeText={onChange}
                      numberOfLines={4}
                      maxLength={200}
                      multiline={true} // Pastikan ini diaktifkan
                      style={{
                        height: 120, // Atur tinggi tetap
                        minHeight: 120, // Jika tinggi ingin dinamis
                        textAlignVertical: "top", // Pastikan teks berada di atas
                      }}
                    />
                  </View>
                </View>
              )}
            />

            <Text className="font-poppins-semibold mt-4 text-black">
              Dokumen Permohonan
            </Text>
            <View className="rounded-lg">
              {selectedFile ? (
                <View className="flex-row items-center p-4 bg-indigo-100 rounded-xl mr-2 ">
                  <FontIcon name="file-upload" size={25} color="#4f46e5" />
                  <View className="px-4  flex-row justify-center items-center">
                    <View className="w-72">
                      <Text className=" text-indigo-600 font-poppins-semibold">
                        {selectedFile.name || selectedFile.split("/").pop()}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setSelectedFile(null)}
                      className="p-2 rounded-full">
                      <AntDesign name="close" size={16} color="black" />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    setUploadModalVisible(true);
                  }}
                  className="flex-row items-center p-4 bg-indigo-100 rounded-xl mr-2">
                  <FontIcon name="file-upload" size={25} color="#4f46e5" />
                  <Text className="ml-2 text-indigo-600 font-poppins-semibold">
                    Upload
                  </Text>
                </TouchableOpacity>
              )}
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

            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={isUpdating}
              className="p-3 rounded-2xl mt-4"
              style={{ backgroundColor: Colors.brand }}>
              <Text className="text-white text-center text-base font-poppins-semibold">
                SIMPAN
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

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
                      <Text className="text-sm mb-1">Selected File:</Text>
                      <Text className="text-sm px-2 text-black font-poppins-semibold">
                        {selectedFile.name}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setSelectedFile(null)}
                      className="p-2 rounded-full">
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
      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="w-80 bg-white rounded-2xl p-6 items-center shadow-2xl">
            <View className="w-20 h-20 rounded-full bg-green-50 justify-center items-center mb-4">
              <IonIcons size={40} color="#95bb72" name="checkmark-done-sharp" />
            </View>
            <Text className="text-xl font-poppins-semibold text-black mb-3">
              Data Berhasil Diperbarui !
            </Text>

            <View className="w-full h-px bg-gray-200 mb-4" />

            <Text className="text-md text-center text-gray-600  capitalize font-poppins-regular">
              Pastikan data sudah benar
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
              <IonIcons size={40} color="#f43f5e" name="close-sharp" />
            </View>
            <Text className="text-xl font-poppins-semibold text-black mb-3">
              Gagal Memperbarui Data !
            </Text>

            <View className="w-full h-px bg-gray-200 mb-4" />

            <Text className="text-md text-center text-gray-600  capitalize font-poppins-regular">
              {errorMessage}
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default OpenKontrak;
