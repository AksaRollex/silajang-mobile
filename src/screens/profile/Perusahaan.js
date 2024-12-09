import React, { useEffect, useState, useRef } from "react";
import axios from "@/src/libs/axios";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Image,
  StyleSheet,
  PermissionsAndroid,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import Ionicons from "react-native-vector-icons/Ionicons";
import BackButton from "../components/BackButton";
import Select2 from "@/src/screens/components/Select2";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import { APP_URL } from "@env";
import Geolocation from "react-native-geolocation-service";
import { TextField } from "react-native-ui-lib";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Icons from "react-native-vector-icons/AntDesign";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from "react-native-vision-camera";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";

const Perusahaan = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [photoUri, setPhotoUri] = useState(null);
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [data, setData] = useState({});
  const [imageUrl, setImageUrl] = useState("");

  const [kotaKabupaten, setKotaKabupaten] = useState([]);
  const [selectedKotaKabupaten, setSelectedKotaKabupaten] = useState(null);

  const [kecamatan, setKecamatan] = useState([]);
  const [selectedKecamatan, setSelectedKecamatan] = useState(null);

  const [kelurahan, setKelurahan] = useState([]);
  const [selectedKelurahan, setSelectedKelurahan] = useState(null);

  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isKotaKabupatenLoaded, setIsKotaKabupatenLoaded] = useState(false);
  const [isKecamatanLoaded, setIsKecamatanLoaded] = useState(false);
  const [isKelurahanLoaded, setIsKelurahanLoaded] = useState(false);

  const openCameraLib = async () => {
    try {
      const options = {
        mediaType: "photo",
        includeBase64: false,
        maxHeight: 3000,
        maxWidth: 3000,
      };

      launchCamera(options, response => {
        console.log("Full Camera Response:", response);

        if (response.didCancel) {
          console.log("User cancelled camera");
          return;
        } else if (response.errorCode) {
          console.log("Camera Error: ", response.errorMessage);
          return;
        }

        if (response.assets && response.assets.length > 0) {
          const uri = response.assets[0].uri;
          console.log("Captured Image URI:", uri);
          setImageUrl(uri);
        }
      });
    } catch (error) {
      console.error("Camera Launch Error:", error);
    }
  };

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

  const [location, setLocation] = useState({ lat: "", long: "" });

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

  const getLocation = async () => {
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

        setValue("lat", latitude);
        setValue("long", longitude);

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

  useEffect(() => {
    if (location.lat && location.long) {
      setValue("lat", location.lat);
      setValue("long", location.long);
    }
  }, [location.lat, location.long]);

  useEffect(() => {
    // Fetch data kota/kabupaten saat komponen pertama kali dimuat
    axios
      .get("/master/kota-kabupaten")
      .then(response => {
        const formattedKotaKabupaten = response.data.data.map(item => ({
          label: item.nama,
          value: item.id,
        }));
        console.log("Response data from API:", response.data);
        setKotaKabupaten(formattedKotaKabupaten);
        setIsKotaKabupatenLoaded(true); // Set status menjadi true
      })
      .catch(error => {
        console.error("Error fetching data kabupaten:", error);
      });
  }, []);

  useEffect(() => {
    // Fetch data kecamatan saat kota/kabupaten dipilih
    if (selectedKotaKabupaten) {
      axios
        .get(`/wilayah/kota-kabupaten/${selectedKotaKabupaten}/kecamatan`)
        .then(response => {
          const formattedKecamatan = response.data.data.map(item => ({
            label: item.nama,
            value: item.id,
          }));
          console.log("Response data kecamatan:", response.data);
          setKecamatan(formattedKecamatan);
          setSelectedKecamatan(null); // Reset kecamatan saat kota/kabupaten berubah
          setKelurahan([]); // Reset kelurahan
          setIsKecamatanLoaded(true); // Set status menjadi true
        })
        .catch(error => {
          console.error("Error fetching data kecamatan:", error);
          setKecamatan([]);
        });
    } else {
      setKecamatan([]);
      setKelurahan([]);
      setIsKecamatanLoaded(false); // Reset status jika tidak ada value
    }
  }, [selectedKotaKabupaten]);

  useEffect(() => {
    // Fetch data kelurahan saat kecamatan dipilih
    if (selectedKecamatan) {
      axios
        .get(`/wilayah/kecamatan/${selectedKecamatan}/kelurahan`)
        .then(response => {
          const formattedKelurahan = response.data.data.map(item => ({
            label: item.nama,
            value: item.id,
          }));
          console.log("Response data kelurahan:", response.data);
          setKelurahan(formattedKelurahan);
          setSelectedKelurahan(null);
          setIsKelurahanLoaded(true); // Set status menjadi true
        })
        .catch(error => {
          console.error("Error fetching data kelurahan:", error);
          setKelurahan([]);
        });
    } else {
      setKelurahan([]);
      setIsKelurahanLoaded(false); // Reset status jika tidak ada value
    }
  }, [selectedKecamatan]);

  useEffect(() => {
    if (isKotaKabupatenLoaded && isKecamatanLoaded && isKelurahanLoaded) {
      console.log("Semua data sudah tersedia:");
      console.log("Kota/Kabupaten:", kotaKabupaten);
      console.log("Kecamatan:", kecamatan);
      console.log("Kelurahan:", kelurahan);

      // Jika diperlukan, lakukan sesuatu dengan data ini
    }
  }, [
    isKotaKabupatenLoaded,
    isKecamatanLoaded,
    isKelurahanLoaded,
    kotaKabupaten,
    kecamatan,
    kelurahan,
  ]);

  useEffect(() => {
    // Fetch data user dan atur nilai default
    axios
      .get("/auth")
      .then(response => {
        const userDetail = response.data.user.detail;
        setUserData(userDetail);

        // Set nilai form berdasarkan data user
        setValue("kab_kota_id", userDetail.kab_kota_id || null);
        setValue("kecamatan_id", userDetail.kecamatan_id || null);
        setValue("kelurahan_id", userDetail.kelurahan_id || null);

        // Set selected value dan fetch data terkait
        setSelectedKotaKabupaten(userDetail.kab_kota_id);

        if (userDetail.kab_kota_id) {
          axios
            .get(`/wilayah/kota-kabupaten/${userDetail.kab_kota_id}/kecamatan`)
            .then(kecamatanResponse => {
              const formattedKecamatan = kecamatanResponse.data.data.map(
                item => ({
                  label: item.nama,
                  value: item.id,
                }),
              );
              setKecamatan(formattedKecamatan);
              setSelectedKecamatan(userDetail.kecamatan_id);

              if (userDetail.kecamatan_id) {
                axios
                  .get(
                    `/wilayah/kecamatan/${userDetail.kecamatan_id}/kelurahan`,
                  )
                  .then(kelurahanResponse => {
                    const formattedKelurahan = kelurahanResponse.data.data.map(
                      item => ({
                        label: item.nama,
                        value: item.id,
                      }),
                    );
                    setKelurahan(formattedKelurahan);
                    setSelectedKelurahan(userDetail.kelurahan_id);
                  })
                  .catch(error => {
                    console.error("Error fetching kelurahan:", error);
                  });
              }
            })
            .catch(error => {
              console.error("Error fetching kecamatan:", error);
            });
        }
      })
      .catch(error => {
        console.error("Error fetching data user:", error);
      });
  }, []);

  useEffect(() => {
    // Reset state saat komponen dilepas
    return () => {
      setSelectedKotaKabupaten(null);
      setSelectedKecamatan(null);
      setSelectedKelurahan(null);
      setKecamatan([]);
      setKelurahan([]);
    };
  }, []);

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
        }
      })
      .catch(error => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const QueryClient = useQueryClient();

  const handleChoosePhoto = () => {
    launchImageLibrary({ mediaType: "photo" }, response => {
      const file = response.assets[0];
      const fileSizeInBytes = file.fileSize;
      const fileSizeInKB = fileSizeInBytes / 1024;
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.errorMessage) {
        console.log("ImagePicker Error: ", response.errorMessage);
      }
      if (fileSizeInKB > 2048) {
        Toast.show({
          type: "error",
          text1: "Ukuran file terlalu besar",
          text2: "Ukuran file tidak boleh melebihi 2048 KB (2 MB)",
        });
      } else {
        console.log("Chosen file:", file);
        setImageUrl(file);
      }
    });
  };

  const handleDeletePhoto = () => {
    setImageUrl(null);
    setCurrentPhotoUrl(null);
  };

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const response = await axios.get(`${APP_URL}/user/tanda_tangan`);
        if (response.data && response.data.photo_url) {
          setCurrentPhotoUrl(response.data.photo_url);
        }
      } catch (error) {
        console.log("Error fetching photo:", error);
      }
    };

    fetchPhoto();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get("/auth");

      // Pastikan response.data.user dan detail ada sebelum diakses
      if (response.data && response.data.user && response.data.user.detail) {
        const userDetail = response.data.user.detail;

        // Set data detail user
        setUserData(userDetail);

        // Jika tanda tangan ada, set photoUrl
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

  const { mutate: update, isLoading } = useMutation({
    mutationFn: () => {
    // if (imageUrl) {
    //   formData.append("tanda_tangan", {
    //     uri: imageUrl.uri,
    //     type: imageUrl.type || "image/jpeg",
    //     name: imageUrl.fileName || "tanda_tangan.jpg",
    //   });
    // }
    // console.log(formData, 99888);
      return axios.post("/user/company", {
        instansi: watch("instansi"),
        pimpinan: watch("pimpinan"),
        pj_mutu: watch("pj_mutu"),
        alamat: watch("alamat"),
        telepon: watch("telepon"),
        fax: watch("fax"),
        email: watch("email"),
        jenis_kegiatan: watch("jenis_kegiatan"),
        lat: watch("lat"),
        long: watch("long"),
        kab_kota_id: watch("kab_kota_id"),
        kecamatan_id: watch("kecamatan_id"),
        kelurahan_id: watch("kelurahan_id"),
        tanda_tangan: imageUrl ? { uri: imageUrl.uri, type: imageUrl.type, name: imageUrl.fileName } : '',
      }, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }).then(res => res.data.data);
    },
    onSuccess: res => {
      QueryClient.invalidateQueries("/auth");

      const { tanda_tangan } = res.detail;
      const updatedImageUrl = `${APP_URL}${tanda_tangan}?t=${new Date().getTime()}`;
      setImageUrl(updatedImageUrl);
      setData(prevData => ({
        ...prevData,
        tanda_tangan: watch("tanda_tangan"),
      }));
      navigation.navigate("Profile");
    },
    onError: error => {
      setErrorMessage(
        error.response?.data?.message || "Gagal memperbarui data.",
      );
      console.log(err.response.data.message)
    },
  });

  return (
    <ScrollView className="bg-gray-100 py-8">
      <View style={{ alignItems: "center" }} className=" mb-28">
        <View className="bg-white rounded-lg p-6 w-[95%] shadow-lg">
          <View className="flex-row items-center space-x-2 mb-10 mt-2 ">
            <BackButton action={() => navigation.goBack()} size={26} />
            <View className="absolute left-0 right-3 items-center">
              <Text className="text-[20px] text-black font-poppins-semibold">
                Update Perusahaan
              </Text>
              <View className="h-px w-[120%] bg-gray-200 top-5" />
            </View>
          </View>
          <View className="mb-6">
            <Text className="font-poppins-semibold mb-3 text-black">
              Tanda Tangan
            </Text>

            <View style={styles.container}>
              <TouchableOpacity onPress={openCameraLib} style={styles.button}>
                <Text className="font-poppins-semibold text-lg mb-3">
                  Open Camera
                </Text>
              </TouchableOpacity>
              <View>
                <Image
                  resizeMode="cover"
                  className={`rounded-lg ${imageUrl ? "w-48 h-48" : ""}`}
                  source={{
                    uri: imageUrl ? imageUrl : currentPhotoUrl,
                  }}
                />
              </View>
            </View>

            <Text className="font-poppins-semibold text-sm mb-3 mt-3 flex text-center">
              Or
            </Text>
            <Controller
              control={control}
              name="tanda_tangan"
              render={({ field: { onChange } }) => (
                <View className="w-full">
                  {/* Check if there's a tanda_tangan in data.detail or photos array */}
                  {currentPhotoUrl || imageUrl ? (
                    <View className="border-2 border-dashed border-indigo-600/30 bg-indigo-50/30 rounded-2xl p-4">
                      <View className="items-center">
                        <View className="relative">
                          <Image
                            source={{
                              uri: imageUrl ? imageUrl : currentPhotoUrl,
                            }}
                            className="w-48 h-48 rounded-lg"
                            onError={e =>
                              console.log(
                                "Error loading image:",
                                e.nativeEvent.error,
                              )
                            }
                          />

                          {/* Overlay gradient */}
                          <View className="absolute inset-0 rounded-full bg-black/5" />
                          {/* Delete button */}
                          <TouchableOpacity
                            className="absolute -top-2 -right-2 bg-white rounded-full w-8 h-8 items-center justify-center shadow-lg border border-red-100"
                            onPress={handleDeletePhoto}>
                            <Icons name="close" size={18} color="#dc2626" />
                          </TouchableOpacity>

                          {/* Change photo button */}
                          <TouchableOpacity
                            className="absolute bottom-0 right-0 bg-indigo-600 rounded-full w-10 h-10 items-center justify-center shadow-lg"
                            onPress={handleChoosePhoto}>
                            <Icons name="camera" size={20} color="white" />
                          </TouchableOpacity>
                        </View>

                        <Text className="font-poppins-medium text-sm text-gray-600 mt-3">
                          Ketuk ikon kamera untuk mengubah foto
                        </Text>
                      </View>
                    </View>
                  ) : (
                    // State sebelum upload foto
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
                            Unggah Tanda Tangan
                          </Text>
                          <Text className="font-poppins-regular text-sm text-gray-500 text-center">
                            Klik atau sentuh area ini untuk memilih foto
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            />
          </View>

          {/* Nama Perusahaan/Instansi */}
          <Controller
            control={control}
            name="instansi"
            rules={{ required: "Instansi harus diisi" }}
            defaultValue={userData?.instansi}
            render={({ field: { onChange, value } }) => (
              <View>
                <Text className="font-poppins-semibold mb-2 text-black">
                  Instansi
                </Text>

                <TextField
                  value={value}
                  enableErrors
                  placeholder="Masukkan Nama Perusahaan/Instansi"
                  placeholderTextColor="#9CA3AF"
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base font-poppins-regular bg-white"
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

          {/* Alamat */}
          <Controller
            control={control}
            name="alamat"
            rules={{ required: "alamat harus diisi" }}
            defaultValue={userData?.alamat}
            render={({ field: { onChange, value } }) => (
              <View>
                <Text className="font-poppins-semibold mb-2 text-black">
                  Alamat
                </Text>

                <TextField
                  value={value}
                  enableErrors
                  placeholder="Masukkan Alamat"
                  placeholderTextColor="#9CA3AF"
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base font-poppins-regular bg-white"
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

          {/* Pimpinan */}
          <Controller
            control={control}
            name="pimpinan"
            rules={{ required: "pimpinan harus diisi" }}
            defaultValue={userData?.pimpinan}
            render={({ field: { onChange, value } }) => (
              <View>
                <Text className="font-poppins-semibold mb-2 text-black">
                  pimpinan
                </Text>

                <TextField
                  value={value}
                  enableErrors
                  placeholder="Masukkan Pimpinan"
                  placeholderTextColor="#9CA3AF"
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base font-poppins-regular bg-white"
                  onChangeText={onChange}
                />
              </View>
            )}
          />
          {errors.pimpinan && (
            <Text style={{ color: "red" }} className="bottom-5">
              {errors.pimpinan.message}
            </Text>
          )}

          {/* PJ Mutu */}
          <Controller
            control={control}
            name="pj_mutu"
            rules={{ required: "pj mutu harus diisi" }}
            defaultValue={userData?.pj_mutu}
            render={({ field: { onChange, value } }) => (
              <View>
                <Text className="font-poppins-semibold mb-2 text-black">
                  Pj Mutu
                </Text>

                <TextField
                  value={value}
                  enableErrors
                  placeholder="Masukkan Pj Mutu"
                  placeholderTextColor="#9CA3AF"
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base font-poppins-regular bg-white"
                  onChangeText={onChange}
                />
              </View>
            )}
          />
          {errors.pj_mutu && (
            <Text style={{ color: "red" }} className="bottom-5">
              {errors.pj_mutu.message}
            </Text>
          )}

          {/* No. Telepon */}
          <Controller
            control={control}
            name="telepon"
            rules={{ required: "telepon harus diisi" }}
            defaultValue={userData?.telepon}
            render={({ field: { onChange, value } }) => (
              <View>
                <Text className="font-poppins-semibold mb-2 text-black">
                  Telepon
                </Text>

                <TextField
                  value={value}
                  enableErrors
                  placeholder="Masukkan telepon"
                  placeholderTextColor="#9CA3AF"
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base font-poppins-regular bg-white"
                  onChangeText={onChange}
                />
              </View>
            )}
          />
          {errors.telepon && (
            <Text style={{ color: "red" }} className="bottom-5">
              {errors.telepon.message}
            </Text>
          )}

          <Controller
            control={control}
            name="fax"
            rules={{ required: "fax harus diisi" }}
            defaultValue={userData?.fax}
            render={({ field: { onChange, value } }) => (
              <View>
                <Text className="font-poppins-semibold mb-2 text-black">
                  Fax
                </Text>

                <TextField
                  value={value}
                  enableErrors
                  placeholder="Masukkan Fax"
                  placeholderTextColor="#9CA3AF"
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base font-poppins-regular bg-white"
                  onChangeText={onChange}
                />
              </View>
            )}
          />
          {errors.fax && (
            <Text style={{ color: "red" }} className="bottom-5">
              {errors.fax.message}
            </Text>
          )}

          <Controller
            control={control}
            name="email"
            rules={{ required: "email harus diisi" }}
            defaultValue={userData?.email}
            render={({ field: { onChange, value } }) => (
              <View>
                <Text className="font-poppins-semibold mb-2 text-black">
                  Email
                </Text>

                <TextField
                  value={value}
                  enableErrors
                  placeholder="Masukkan email"
                  placeholderTextColor="#9CA3AF"
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base font-poppins-regular bg-white"
                  onChangeText={onChange}
                />
              </View>
            )}
          />
          {errors.email && (
            <Text style={{ color: "red" }} className="bottom-5">
              {errors.email.message}
            </Text>
          )}

          <Controller
            control={control}
            name="jenis_kegiatan"
            rules={{ required: "jenis kegiatan harus diisi" }}
            defaultValue={userData?.jenis_kegiatan}
            render={({ field: { onChange, value } }) => (
              <View>
                <Text className="font-poppins-semibold mb-2 text-black">
                  jenis kegiatan
                </Text>

                <TextField
                  value={value}
                  enableErrors
                  placeholder="Masukkan jenis kegiatan"
                  placeholderTextColor="#9CA3AF"
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base font-poppins-regular bg-white"
                  onChangeText={onChange}
                />
              </View>
            )}
          />
          {errors.jenis_kegiatan && (
            <Text style={{ color: "red" }} className="bottom-5">
              {errors.jenis_kegiatan.message}
            </Text>
          )}

          {/* Lokasi */}
          <View className="rounded-2xl p-2 bottom-1">
            <View className="flex-row justify-between">
              <Controller
                control={control}
                name="lat"
                rules={{ required: "lokasi harus diisi" }}
                render={({ field: { onChange, value } }) => (
                  <View className="w-1/2 pr-2">
                    <Text className="font-poppins-semibold mb-2 text-black">
                      Latitude
                    </Text>

                    <TextField
                      className="p-3  bg-[#fff] rounded-2xl border-stone-300 border font-poppins-regular"
                      enableErrors
                      keyboardType="numeric"
                      onChangeText={onChange}
                      value={value || location.lat}
                      placeholderTextColor="gray"
                      placeholder="Masukkan latitude"
                    />
                  </View>
                )}
              />

              <Controller
                control={control}
                name="long"
                rules={{ required: "lokasi harus diisi" }}
                render={({ field: { onChange, value } }) => (
                  <View className="w-1/2 pr-2">
                    <Text className="font-poppins-semibold mb-2 text-black">
                      Longitude
                    </Text>

                    <TextField
                      className="p-3  bg-[#fff] rounded-2xl border-stone-300 border font-poppins-regular"
                      enableErrors
                      keyboardType="numeric"
                      onChangeText={onChange}
                      value={value || location.long}
                      placeholderTextColor="gray"
                      placeholder="Masukkan longitude"
                    />
                  </View>
                )}
              />
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

            {/* <TouchableOpacity 
              onPress={handleGetLocation}
              className="mt-2 p-2 bg-blue-600 rounded-lg"
            >
              <Text className="text-white text-center">Dapatkan Lokasi Saya</Text>
            </TouchableOpacity> */}
          </View>

          {isKotaKabupatenLoaded && isKecamatanLoaded && isKelurahanLoaded ? (
            <>
              <Controller
                name="kab_kota_id"
                control={control}
                rules={{ required: "Kabupaten/Kota harus diisi" }}
                render={({ field: { onChange, value } }) => (
                  <View className="mt-5">
                    <Text className="font-poppins-semibold text-black mb-2">
                      Kabupaten / Kota
                    </Text>
                    <View
                      style={{ borderColor: "black", borderWidth: 0.5 }}
                      className="rounded-2xl">
                      <Select2
                        data={kotaKabupaten}
                        onChangeValue={value => {
                          onChange(value);
                          setSelectedKotaKabupaten(value);
                          setSelectedKecamatan(null); // Reset Kecamatan
                          setSelectedKelurahan(null); // Reset Kelurahan
                          setValue("kecamatan_id", null); // Clear Kecamatan field
                          setValue("kelurahan_id", null); // Clear Kelurahan field
                          setKecamatan([]);
                          setKelurahan([]);
                        }}
                        items={kotaKabupaten}
                        value={value}
                        defaultValue={watch("kab_kota_id")}
                        placeholder={{
                          label: "Pilih Kabupaten/Kota",
                          value: null,
                        }}
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
                        onChangeValue={value => {
                          onChange(value);
                          setSelectedKecamatan(value);
                          setSelectedKelurahan(null); // Reset Kelurahan when Kecamatan changes
                          setValue("kelurahan_id", null); // Clear Kelurahan field
                          setKelurahan([]);
                        }}
                        items={kecamatan}
                        value={value}
                        defaultValue={selectedKecamatan} // Use local state to reset
                        placeholder={{ label: "Pilih Kecamatan", value: null }}
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
                        onChangeValue={value => {
                          onChange(value);
                          setSelectedKelurahan(value);
                        }}
                        items={kelurahan}
                        value={value}
                        defaultValue={selectedKelurahan} // Use local state to reset
                        placeholder={{ label: "Pilih Kelurahan", value: null }}
                        disabled={!selectedKecamatan} // Disable if Kecamatan not selected
                      />
                    </View>
                  </View>
                )}
              />
            </>
          ) : (
            <Text>Memuat data, mohon tunggu...</Text>
          )}

          {/* Simpan Button */}
          <TouchableOpacity
            onPress={handleSubmit(update)}
            loading={isLoading}
            className="rounded-lg py-3 flex items-center mt-4"
            style={{ backgroundColor: "#312e81" }}>
            <Text className="text-white font-poppins-semibold text-sm">
              Simpan
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  captureButton: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 10,
  },
});

export default Perusahaan;
