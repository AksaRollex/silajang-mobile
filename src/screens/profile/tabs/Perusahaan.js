import axios from "@/src/libs/axios";
import * as React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  ScrollView,
  Modal,
  Alert,
  Linking,
} from "react-native";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller } from "react-hook-form";
import { useForm } from "react-hook-form";
import { Colors, TextField, Button } from "react-native-ui-lib";
import Geolocation from "react-native-geolocation-service";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { APP_URL } from "@env";
import Back from "../../components/Back";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Icons from "react-native-vector-icons/AntDesign";
import Select2 from "@/src/screens/components/Select2";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import IonIcons from "react-native-vector-icons/Ionicons";
import FooterText from "../../components/FooterText";

rem = multiplier => baseRem * multiplier;
const baseRem = 16;
const Perusahaan = () => {
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation();
  const [data, setData] = useState({});

  const [imageUri, setImageUri] = React.useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [typePhoto, setTypePhoto] = useState("");

  const [kotaKabupaten, setKotaKabupaten] = useState([[]]);
  const [selectedKotaKabupaten, setSelectedKotaKabupaten] = useState(null);

  const [kecamatan, setKecamatan] = useState([]);
  const [selectedKecamatan, setSelectedKecamatan] = useState(null);

  const [kelurahan, setKelurahan] = useState([]);
  const [selectedKelurahan, setSelectedKelurahan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalKintud, setModalKintud] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const {
    handleSubmit,
    control,
    formState: { errors },
    getValues,
    reset,
    setValue,
    watch,
  } = useForm({
    values: { ...userData },
  });

  // START GEO LOCATION
  const [location, setLocation] = useState({
    lat: "",
    long: "",
  });
  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location Permission",
          message: "We need to access your location",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        getLocation();
      } else {
        console.log("Location permission denied");
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === "android") {
      try {
        // Cek status izin terlebih dahulu
        const checkPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        );

        if (checkPermission) {
          return true;
        }

        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Izin Kamera Diperlukan",
            message:
              "Aplikasi membutuhkan akses kamera untuk mengambil foto tanda tangan",
            buttonNeutral: "Tanya Nanti",
            buttonNegative: "Batal",
            buttonPositive: "OK",
          },
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        } else {
          // Jika izin ditolak, tampilkan dialog dengan opsi untuk membuka pengaturan
          Alert.alert(
            "Izin Diperlukan",
            "Aplikasi memerlukan akses kamera. Apakah Anda ingin membuka pengaturan sekarang?",
            [
              {
                text: "Tidak",
                style: "cancel",
              },
              {
                text: "Buka Pengaturan",
                onPress: () => {
                  Linking.openSettings();
                },
              },
            ],
          );
          return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // Untuk iOS
  };

  const getLocation = () => {
    setLoading(true);
    setModalVisible(true);

    Geolocation.getCurrentPosition(
      position => {
        const latitude = position.coords.latitude.toString();
        const longitude = position.coords.longitude.toString();

        setLocation({
          latitude,
          longitude,
        });

        setValue("south", latitude);
        setValue("east", longitude);

        setLoading(false);
      },
      error => {
        console.log(error.code, error.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  };

  const handleLocationPress = () => {
    setLoading(true);
    if (Platform.OS === "android") {
      requestLocationPermission();
    } else {
      getLocation();
    }
  };
  // END GEO LOCATOIN

  // GEO LOCATION COLUMN
  useEffect(() => {
    if (location.lat && location.long) {
      setValue("lat", location.lat);
      setValue("long", location.long);
    }
  }, [location.lat, location.long]);

  // FETCH KOTA-KABUPATEN
  useEffect(() => {
    axios
      .get("/master/kota-kabupaten")
      .then(response => {
        const formattedKotaKabupaten = response.data.data.map(item => ({
          title: item.nama,
          value: item.id,
        }));
        console.log("Response data from API:", response.data);
        setKotaKabupaten(formattedKotaKabupaten);
      })
      .catch(error => {
        console.error("error fetching data kabupaten : ", error);
      });
  }, []);

  // FETCH KECAMATAN
  useEffect(() => {
    console.log({ selectedKotaKabupaten });
    if (selectedKotaKabupaten || watch("kab_kota_id")) {
      axios
        .get(`/wilayah/kota-kabupaten/${selectedKotaKabupaten}/kecamatan`)
        .then(response => {
          console.log("Response data:", response.data);
          if (response.data && response.data.data) {
            const formattedKecamatan = response.data.data.map(item => ({
              title: item.nama,
              value: item.id,
            }));
            setKecamatan(formattedKecamatan);
          } else {
            console.warn("No data found for kecamatan");
            setKecamatan([]);
          }
        })
        .catch(error => {
          console.error("Error fetching data kecamatan:", error);
        });
    } else {
      setKecamatan([]);
    }
  }, [selectedKotaKabupaten, watch("kab_kota_id")]);

  // FETCH KELURAHAN
  useEffect(() => {
    if (selectedKecamatan) {
      axios
        .get(`/wilayah/kecamatan/${selectedKecamatan}/kelurahan`)
        .then(response => {
          const formattedKelurahan = response.data.data.map(item => ({
            title: item.nama,
            value: item.id,
          }));
          setKelurahan(formattedKelurahan);
        })
        .catch(error => {
          console.error("error fetching data kelurahan : ", error);
        });
    } else {
      setKelurahan([]);
    }
  }, [selectedKecamatan]);

  // FETCH DATA DETAIL USER
  useEffect(() => {
    axios
      .get("/auth")
      .then(response => {
        setUserData(response.data.user.detail);

        setSelectedKotaKabupaten(response.data.user.detail.kab_kota_id);
        setSelectedKecamatan(response.data.user.detail.kecamatan_id);
        setSelectedKelurahan(response.data.user.detail.kelurahan_id);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
      });
  }, []);

  useEffect(() => {
    return () => {
      setSelectedKotaKabupaten(null);
      setSelectedKecamatan(null);
      setSelectedKelurahan(null);
      setKecamatan([]);
      setKelurahan([]);
    };
  }, []);

  // FETCH DATA TANDA TANGAN
  useEffect(() => {
    axios
      .get("/auth")
      .then(response => {
        setUserData(response.data.user.detail);
        // console.log({ APP_URL });
        if (
          response.data.user.detail &&
          response.data.user.detail.tanda_tangan
        ) {
          const photoUrl = `${APP_URL}${response.data.user.detail.tanda_tangan}`;
          setCurrentPhotoUrl(photoUrl);
          setImageUrl(photoUrl);
          setTypePhoto("upload");
        }
      })
      .catch(error => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const QueryClient = useQueryClient();

  // FUNCTION UPDATE DATA
  const updateUser = async () => {
    const formData = new FormData();
    formData.append("instansi", getValues("instansi"));
    formData.append("pimpinan", getValues("pimpinan"));
    formData.append("pj_mutu", getValues("pj_mutu"));
    formData.append("alamat", getValues("alamat"));
    formData.append("telepon", getValues("telepon"));
    formData.append("fax", getValues("fax"));
    formData.append("email", getValues("email"));
    formData.append("jenis_kegiatan", getValues("jenis_kegiatan"));
    formData.append("lat", getValues("lat"));
    formData.append("long", getValues("long"));
    formData.append("kab_kota_id", getValues("kab_kota_id"));
    formData.append("kecamatan_id", getValues("kecamatan_id"));
    formData.append("kelurahan_id", getValues("kelurahan_id"));

    if (file) {
      const fileSizeInKB = file.fileSize / 1024;
      if (fileSizeInKB > 2048) {
        Toast.show({
          type: "error",
          text1: "File terlalu besar",
          text2: "Ukuran file tidak boleh melebihi 2048 KB (2 MB)",
        });
        return;
      }
    }
    if (file) {
      formData.append("tanda_tangan", {
        uri: file.uri,
        type: file.type || "image/jpeg",
        name: file.fileName || "tanda_tangan.jpg",
      });
    }
    try {
      const response = await axios.post("/user/company", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const { tanda_tangan } = response.data;
      const updatedImageUrl = `${APP_URL}${tanda_tangan}?t=${new Date().getTime()}`;
      setImageUrl(updatedImageUrl);
      setData(prevData => ({
        ...prevData,
        tanda_tangan: getValues("tanda_tangan"),
      }));
      setModalKintud(true);
      QueryClient.invalidateQueries("/auth");

      setTimeout(() => {
        navigation.navigate("IndexProfile");
        setFile(null);
        fetchUserData();
      }, 2000);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Gagal memperbarui data.",
      );
      setErrorModalVisible(true);
      setTimeout(() => {
        setErrorModalVisible(false);
      }, 2000);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await axios.get("/auth");

      if (response.data && response.data.user && response.data.user.detail) {
        const userDetail = response.data.user.detail;

        setUserData(userDetail);

        if (userDetail.tanda_tangan) {
          const photoUrl = `${APP_URL}${userDetail.tanda_tangan}`;
          setCurrentPhotoUrl(photoUrl);
        }
      } else {
        console.error("Data detail user tidak ditemukan:", response.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };

  // RESPONSE SETELAH UPDATE
  const { mutate: update, isLoading } = useMutation(updateUser, {
    onSuccess: () => {
      setModalKintud(true);
      QueryClient.invalidateQueries("/auth");

      setTimeout(() => {
        setModalKintud(false);
        navigation.navigate("IndexProfile");
        setFile(null);
        fetchUserData();
      }, 2000);
    },
    onError: error => {
      setErrorMessage(
        error.response?.data?.message || "Gagal memperbarui data.",
      );
      setErrorModalVisible(true);
      setTimeout(() => {
        setErrorModalVisible(false);
      }, 2000);
    },
  });

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const response = await axios.get(`${APP_URL}/user/tanda_tangan`);
        if (response.data && response.data.photo_url) {
          setCurrentPhotoUrl(response.data.photo_url);
          setTypePhoto("upload");
        }
      } catch (error) {
        console.log("Error fetching photo:", error);
      }
    };

    fetchPhoto();
  }, []);

  // GAMBAR
  const [file, setFile] = React.useState(null);
  const handleChoosePhoto = () => {
    launchImageLibrary(
      { mediaType: "photo", maxHeight: 3000, maxWidth: 3000 },
      response => {
        if (response.didCancel) {
          console.log("User cancelled image picker");
          return;
        }

        if (response.errorMessage) {
          console.log("ImagePicker Error: ", response.errorMessage);
          return;
        }

        const file = response.assets[0];
        const fileSizeInKB = file.fileSize / 1024;

        if (fileSizeInKB > 2048) {
          Toast.show({
            type: "error",
            text1: "Ukuran file terlalu besar",
            text2: "Ukuran file tidak boleh melebihi 2048 KB (2 MB)",
          });
          return;
        }

        setFile(file);
        setImageUri(file.uri);
        setCurrentPhotoUrl(file.uri);
        setTypePhoto("upload");
      },
    );
  };

  const openCameraLib = async () => {
    const hasPermission = await requestCameraPermission();

    if (!hasPermission) {
      return;
    }

    try {
      const options = {
        mediaType: "photo",
        includeBase64: false,
        maxHeight: 3000,
        maxWidth: 3000,
      };

      launchCamera(options, response => {
        if (response.didCancel) {
          console.log("User cancelled camera");
          return;
        }

        if (response.errorCode) {
          console.log("Camera Error: ", response.errorMessage);
          return;
        }

        if (response.assets && response.assets.length > 0) {
          const file = response.assets[0];
          setFile(file);
          setImageUri(file.uri);
          setCurrentPhotoUrl(file.uri);
          setTypePhoto("capture");
        }
      });
    } catch (error) {
      console.error("Camera Launch Error:", error);
      Alert.alert("Error", "Terjadi kesalahan saat membuka kamera");
    }
  };

  const handleDeletePhoto = () => {
    setFile(null);
    setImageUri(null);
    setCurrentPhotoUrl(null);
    setTypePhoto("");
    setImageUrl(null);
  };

  return (
    <>
      <ScrollView className="flex-1">
        <View className="bg-[#ececec] p-3  w-full h-full ">
          <View
            className="bg-[#fff] px-4  rounded-3xl flex-1"
            style={{
              elevation: 5,
              shadowColor: "rgba(0, 0, 0, 0.1)",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: 2,
            }}>
            <View className="flex-row justify-between items-center py-5">
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
                Informasi Perusahaan
              </Text>
            </View>
            {userData ? (
              <View>
                <View>
                  {currentPhotoUrl || imageUrl ? (
                    <View className="border-2 border-dashed border-indigo-600/30 bg-indigo-50/30 rounded-2xl p-4">
                      <View className="items-center">
                        <View className="relative">
                          <Image
                            source={{
                              uri: imageUrl || currentPhotoUrl, // Prioritaskan imageUrl
                            }}
                            className="w-48 h-48 rounded-lg"
                            resizeMode="cover"
                            onError={e => {
                              console.log(
                                "Error loading image:",
                                e.nativeEvent.error,
                              );
                              // Tambahkan error handling jika gambar gagal dimuat
                              setImageUrl(null);
                              setCurrentPhotoUrl(null);
                            }}
                          />
                          <TouchableOpacity
                            className="absolute -top-2 -right-2 bg-white rounded-full w-8 h-8 items-center justify-center shadow-lg border border-red-100"
                            onPress={handleDeletePhoto}>
                            <Icons name="close" size={18} color="#dc2626" />
                          </TouchableOpacity>

                          <TouchableOpacity
                            className="absolute bottom-0 right-0 bg-indigo-600 rounded-full w-10 h-10 items-center justify-center shadow-lg"
                            onPress={handleChoosePhoto}>
                            <Icons name="camera" size={20} color="white" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ) : (
                    <View className="items-center justify-center">
                      <TouchableOpacity
                        onPress={openCameraLib}
                        className="border-2 border-dashed w-full  border-indigo-600/30 bg-indigo-50/20 rounded-2xl p-8  ">
                        <View className="items-center ">
                          <Text className="font-poppins-semibold text-lg  text-indigo-600">
                            Foto Tanda Tangan Anda
                          </Text>
                          {/* <Text className="font-poppins-regular text-sm text-gray-500 text-center">
                            Klik atau sentuh area ini untuk memilih foto
                          </Text> */}
                        </View>
                      </TouchableOpacity>

                      <Text className="font-poppins-semibold text-base  my-4 flex text-center text-black ">
                        Atau
                      </Text>

                      <TouchableOpacity
                        className="border-2 w-full border-dashed border-indigo-600/30 bg-indigo-50/20 rounded-2xl p-8  mb-4"
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
                              Unggah Tanda Tangan
                            </Text>
                            <Text className="font-poppins-regular text-sm text-gray-500 text-center">
                              Klik atau sentuh area ini untuk memilih foto
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                <Controller
                  control={control}
                  name="instansi"
                  rules={{ required: "Instansi Tidak Boleh Kosong" }}
                  defaultValue={userData.instansi}
                  render={({ field: { onChange, value } }) => (
                    <View>
                      <Text className="font-poppins-semibold mb-2 text-black">
                        Instansi
                      </Text>

                      <TextField
                        value={value}
                        enableErrors
                        placeholder="Masukkan nama instansi"
                        className="p-3 bg-[#fff] rounded-2xl border-stone-300 border font-poppins-regular"
                        onChangeText={onChange}
                      />
                    </View>
                  )}
                />
                {errors.instansi && (
                  <Text style={{ color: "red" }} className="bottom-5">
                    {errors.instansi.message}
                  </Text>
                )}

                <Controller
                  control={control}
                  name="alamat"
                  defaultValue={userData.alamat}
                  rules={{ required: "Alamat Tidak Boleh Kosong" }}
                  render={({ field: { onChange, value } }) => (
                    <View>
                      <Text className="font-poppins-semibold mb-2 text-black">
                        Alamat Industri
                      </Text>
                      <TextField
                        className="p-3 bg-[#fff] rounded-2xl border-stone-300 border font-poppins-regular"
                        enableErrors
                        placeholder="Masukkan alamat industri"
                        keyboardType="text-input"
                        value={value}
                        onChangeText={onChange}
                      />
                    </View>
                  )}
                />
                {errors.alamat && (
                  <Text style={{ color: "red" }} className="bottom-5">
                    {errors.alamat.message}
                  </Text>
                )}

                <Controller
                  control={control}
                  name="pimpinan"
                  rules={{ required: "Pimpinan Tidak Boleh Kosong" }}
                  render={({ field: { onChange, value } }) => (
                    <View className="">
                      <Text className="font-poppins-semibold mb-2 text-black">
                        Pimpinan
                      </Text>
                      <TextField
                        className="p-3 bg-[#fff] rounded-2xl border-stone-300 border font-poppins-regular"
                        enableErrors
                        placeholder="Masukkan nama pimpinan"
                        keyboardType="text-input"
                        value={value}
                        onChangeText={onChange}
                      />
                    </View>
                  )}></Controller>
                {errors.pimpinan && (
                  <Text style={{ color: "red" }} className="bottom-5">
                    {errors.pimpinan.message}
                  </Text>
                )}

                <Controller
                  control={control}
                  name="pj_mutu"
                  rules={{ required: "PJ MUTU Tidak Boleh Kosong" }}
                  render={({ field: { onChange, value } }) => (
                    <View className="">
                      <Text className="font-poppins-semibold mb-2 text-black">
                        PJ Mutu
                      </Text>
                      <TextField
                        className="p-3 bg-[#fff] rounded-2xl border-stone-300 border font-poppins-regular"
                        enableErrors
                        placeholder="Masukkan PJ Mutu"
                        keyboardType="text-input"
                        value={value}
                        onChangeText={onChange}
                      />
                    </View>
                  )}></Controller>
                {errors.pj_mutu && (
                  <Text style={{ color: "red" }} className="bottom-5">
                    {errors.pj_mutu.message}
                  </Text>
                )}

                <Controller
                  control={control}
                  name="telepon"
                  rules={{ required: "Telepon Tidak Boleh Kosong" }}
                  render={({ field: { onChange, value } }) => (
                    <View className="">
                      <Text className="font-poppins-semibold mb-2 text-black">
                        Nomor Telepon
                      </Text>
                      <TextField
                        onChangeText={onChange}
                        className="p-3 bg-[#fff] rounded-2xl border-stone-300 border font-poppins-regular"
                        enableErrors
                        placeholder="Masukkan No Telepon"
                        keyboardType="phone-pad"
                        value={value}
                      />
                    </View>
                  )}></Controller>
                {errors.telepon && (
                  <Text style={{ color: "red" }} className="bottom-5">
                    {errors.telepon.message}
                  </Text>
                )}

                <Controller
                  control={control}
                  name="fax"
                  render={({ field: { onChange, value } }) => (
                    <View className="">
                      <Text className="font-poppins-semibold mb-2 text-black">
                        Fax
                      </Text>
                      <TextField
                        onChangeText={onChange}
                        className="p-3 bg-[#fff] rounded-2xl border-stone-300 border font-poppins-regular"
                        enableErrors
                        placeholder="Masukkan fax"
                        keyboardType="phone-pad"
                        value={value}
                      />
                    </View>
                  )}></Controller>

                <Controller
                  control={control}
                  name="email"
                  rules={{ required: "Email Tidak Boleh Kosong" }}
                  render={({ field: { onChange, value } }) => (
                    <View className="">
                      <Text className="font-poppins-semibold mb-2 text-black">
                        Email
                      </Text>
                      <TextField
                        className="p-3 bg-[#fff] rounded-2xl border-stone-300 border font-poppins-regular"
                        enableErrors
                        placeholder="Masukkan email"
                        keyboardType="email-address"
                        onChangeText={onChange}
                        value={value}
                      />
                    </View>
                  )}></Controller>
                {errors.email && (
                  <Text style={{ color: "red" }} className="bottom-5">
                    {errors.email.message}
                  </Text>
                )}

                <Controller
                  control={control}
                  name="jenis_kegiatan"
                  rules={{ required: "Jenis Kegiatan Tidak Boleh Kosong" }}
                  render={({ field: { onChange, value } }) => (
                    <View className="">
                      <Text className="font-poppins-semibold mb-2 text-black">
                        Jenis Kegiatan
                      </Text>
                      <TextField
                        className="p-3 bg-[#fff] rounded-2xl border-stone-300 border font-poppins-regular"
                        enableErrors
                        placeholder="Masukkan jenis kegiatan"
                        keyboardType="text-input"
                        onChangeText={onChange}
                        value={value}
                      />
                    </View>
                  )}></Controller>
                {errors.jenis_kegiatan && (
                  <Text style={{ color: "red" }} className="bottom-5">
                    {errors.jenis_kegiatan.message}
                  </Text>
                )}
                <View className="rounded-2xl p-3 bottom-1 ">
                  <View className="flex-row justify-between">
                    <Controller
                      control={control}
                      name="lat"
                      rules={{ required: "Tidak Boleh Kosong" }}
                      render={({ field: { onChange, value } }) => (
                        <View className="w-1/2 pr-2">
                          <Text className="font-poppins-semibold mb-2 text-black">
                            Selatan
                          </Text>

                          <TextField
                            className="p-3 bg-[#fff] rounded-2xl border-stone-300 border font-poppins-regular"
                            enableErrors
                            keyboardType="numeric"
                            onChangeText={onChange}
                            value={value || location.lat}
                            placeholderTextColor="gray"
                            placeholder={userData.lat}
                          />
                        </View>
                      )}
                    />

                    <Controller
                      control={control}
                      name="long"
                      rules={{ required: "Tidak Boleh Kosong" }}
                      render={({ field: { onChange, value } }) => (
                        <View className="w-1/2 pl-2">
                          <Text className="font-poppins-semibold mb-2 text-black text-end">
                            Timur
                          </Text>

                          <TextField
                            className="p-3 bg-[#fff] rounded-2xl border-stone-300 border font-poppins-regular"
                            keyboardType="numeric"
                            onChangeText={onChange}
                            enableErrors
                            value={value || location.long}
                            placeholderTextColor="gray"
                            placeholder={userData.long}
                          />
                        </View>
                      )}
                    />
                  </View>
                  <View className="flex-row">
                    {errors.lat && (
                      <Text style={{ color: "red" }} className="bottom-5">
                        {errors.lat.message}
                      </Text>
                    )}
                    {errors.long && (
                      <Text style={{ color: "red" }} className="bottom-5 ml-14">
                        {errors.long.message}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={handleLocationPress}
                    className="w-full p-3 rounded-3xl bg-[#007AFF]">
                    <View className="flex-row gap-4 justify-center">
                      <MaterialIcons
                        name="location-searching"
                        size={24}
                        color={"white"}
                      />
                      <Text className="text-white font-poppins-semibold text-center">
                        Tekan Untuk Mendapatkan Lokasi
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                <Modal
                  transparent={true}
                  visible={modalVisible}
                  animationType="fade"
                  onRequestClose={() => setModalVisible(false)}>
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                    }}>
                    <View
                      style={{
                        width: 300,
                        padding: 20,
                        backgroundColor: "white",
                        borderRadius: 10,
                        alignItems: "center",
                      }}>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "bold",
                          marginBottom: 15,
                          color: "black",
                        }}>
                        Koordinat Anda
                      </Text>

                      <View
                        style={{
                          width: "100%",
                          borderBottomWidth: 1,
                          borderBottomColor: "#dedede",
                          marginBottom: 15,
                        }}
                      />

                      {loading ? (
                        <ActivityIndicator
                          size="large"
                          style={{ marginBottom: 15 }}
                          color="#007AFF"
                        />
                      ) : (
                        <>
                          <Text
                            style={{
                              fontSize: 16,
                              marginBottom: 10,
                              color: "black",
                            }}>
                            Latitude: {location.latitude}
                          </Text>
                          <Text
                            style={{
                              fontSize: 16,
                              marginBottom: 25,
                              color: "black",
                            }}>
                            Longitude: {location.longitude}
                          </Text>
                        </>
                      )}

                      <View style={{ flexDirection: "row" }}>
                        <TouchableOpacity
                          onPress={() => setModalVisible(false)}
                          style={{
                            paddingVertical: 10,
                            paddingHorizontal: 20,
                            backgroundColor: "#dedede",
                            borderRadius: 5,
                            marginRight: 10,
                          }}>
                          <Text style={{ color: "black" }}>Tutup</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Modal>

                <Controller
                  name="kab_kota_id"
                  control={control}
                  rules={{ required: "Kabupaten Kota Tidak Boleh Kosong" }}
                  render={({ field: { onChange, value } }) => (
                    <View className="mt-5">
                      <Text className="font-poppins-semibold mb-2 text-black">
                        Kabupaten / Kota
                      </Text>
                      <View
                        style={{ borderColor: "black", borderWidth: 0.5 }}
                        className="rounded-2xl">
                        <Select2
                          data={kotaKabupaten}
                          onSelect={value => {
                            onChange(value);
                            setSelectedKotaKabupaten(value);
                            setSelectedKecamatan(null); // Reset Kecamatan
                            setSelectedKelurahan(null); // Reset Kelurahan
                            setValue("kecamatan_id", null); // Clear Kecamatan field
                            setValue("kelurahan_id", null); // Clear Kelurahan field
                            setKecamatan([]);
                            setKelurahan([]);
                          }}
                          defaultValue={watch("kab_kota_id")}
                          placeholder={"Pilih Kabupaten/Kota"}
                        />
                      </View>
                    </View>
                  )}
                />

                <Controller
                  name="kecamatan_id"
                  control={control}
                  rules={{ required: "Kecamatan Tidak Boleh Kosong" }}
                  render={({ field: { onChange, value } }) => (
                    <View className="mt-4">
                      <Text className="font-poppins-semibold mb-2 text-black">
                        Kecamatan
                      </Text>
                      <View
                        style={{ borderColor: "black", borderWidth: 0.5 }}
                        className="rounded-2xl">
                        <Select2
                          data={kecamatan}
                          onSelect={value => {
                            onChange(value);
                            setSelectedKecamatan(value);
                            setSelectedKelurahan(null); // Reset Kelurahan when Kecamatan changes
                            setValue("kelurahan_id", null); // Clear Kelurahan field
                            setKelurahan([]);
                          }}
                          defaultValue={selectedKecamatan} // Use local state to reset
                          placeholder={"Pilih Kecamatan"}
                          disabled={!selectedKotaKabupaten} // Disable if Kota/Kabupaten not selected
                        />
                      </View>
                    </View>
                  )}
                />

                <Controller
                  name="kelurahan_id"
                  control={control}
                  rules={{ required: "Kelurahan Tidak Boleh Kosong" }}
                  render={({ field: { onChange, value } }) => (
                    <View className="mt-4">
                      <Text className="font-poppins-semibold mb-2 text-black">
                        Kelurahan
                      </Text>
                      <View
                        style={{ borderColor: "black", borderWidth: 0.5 }}
                        className="rounded-2xl">
                        <Select2
                          data={kelurahan}
                          onSelect={value => {
                            onChange(value);
                            setSelectedKelurahan(value);
                          }}
                          defaultValue={selectedKelurahan} // Use local state to reset
                          placeholder={"Pilih Kelurahan"}
                          disabled={!selectedKecamatan} // Disable if Kecamatan not selected
                        />
                      </View>
                    </View>
                  )}
                />
                <Button
                  onPress={handleSubmit(updateUser)}
                  loading={isLoading}
                  className="p-3 rounded-3xl mt-10 mb-5"
                  style={{ backgroundColor: Colors.brand }}>
                  <Text className="text-white text-center text-base font-bold font-poppins-regular">
                    SIMPAN
                  </Text>
                </Button>
                <FooterText />
              </View>
            ) : (
              <View className="flex-1 justify-center items-center my-4">
                <ActivityIndicator size="large" color="#312e81" />
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal animationType="fade" transparent={true} visible={modalKintud}>
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="w-80 bg-white rounded-2xl p-6 items-center shadow-2xl">
            <View className="w-20 h-20 rounded-full bg-green-50 justify-center items-center mb-4">
              <IonIcons size={40} color="#95bb72" name="checkmark-done-sharp" />
            </View>
            <Text className="text-xl font-poppins-semibold text-black mb-3">
              Data Berhasil Dirubah !
            </Text>

            <View className="w-full h-px bg-gray-200 mb-4" />

            <Text className="text-md text-center text-gray-600  capitalize font-poppins-regular">
              Pastikan Data perusahaan kamu sudah benar / sesuai !
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
              <IonIcons size={40} color="#95bb72" name="checkmark-done-sharp" />
            </View>
            <Text className="text-xl font-poppins-semibold text-black mb-3">
              Data Gagal Dirubah !
            </Text>

            <View className="w-full h-px bg-gray-200 mb-4" />

            <Text className="text-md text-center text-gray-600  capitalize font-poppins-regular">
              {errorMessage ||
                "Terjadi kesalahan saat memperbarui data. Silahkan coba lagi !"}
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)", // Warna semi transparan untuk latar belakang modal
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "white", // Latar belakang modal agar konten terlihat jelas
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "black", // Warna teks agar terlihat jelas
    marginBottom: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 16,
    color: "black", // Warna teks agar terlihat jelas
    marginBottom: 10,
  },
  container: {
    flex: 1,
    padding: 16,
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
    marginTop: 20,
  },
  text: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "black",
    marginVertical: 10,
  },
  submitButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4682B4",
    marginBottom: 20,
  },

  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonLokasi: {
    width: "100%",
    height: 50,
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    borderRadius: 6,
    justifyContent: "center",
    marginBottom: rem(1.5),
    backgroundColor: Colors.brand,
  },
  buttonModal: {
    width: 100,
    height: 30,
    backgroundColor: Colors.brand,
    borderRadius: 5,
    marginTop: 30,
  },
  buttonLokasiText: {
    color: "white",
    fontSize: 16,
  },
  dropdown: {
    marginBottom: 16,
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
  selectPhotoText: {
    color: "black",
  },
  textFieldContainer: {},
  imageContainer: {
    alignItems: "center",
  },

  inputContainer: {
    borderRadius: 8,
    marginBottom: 16,
    padding: 1,
    color: "black",
    borderColor: "#ccc",
    borderWidth: 1,
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
  },
  changeButton: {
    backgroundColor: Colors.brand,
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
    backgroundColor: "#ebf0ff",
    padding: 20,
    borderWidth: 2,
    borderColor: "#5c85ff",
    borderStyle: "dashed",
    borderRadius: 8,
  },
  addSignatureText: {
    marginLeft: 10,
    color: "#fff",
    fontSize: 16,
  },
  input: {
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: "black",
    borderWidth: 1,
    borderColor: "#ccc",
  },

  successContainer: {
    alignItems: "center",
    padding: 20,
    width: "90%",
    paddingVertical: 30,
    borderRadius: 10,
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
  errorContainer: {},
  errortitle: {
    color: "#FF4B4B",
  },
  errorText: {
    color: "#fff",
  },
});

export default Perusahaan;
