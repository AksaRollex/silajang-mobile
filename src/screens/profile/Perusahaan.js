import React, { useEffect, useState, useRef } from 'react';
import axios from '@/src/libs/axios';
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
  Modal
} from 'react-native';
import { Controller, useForm } from "react-hook-form";
import Ionicons from 'react-native-vector-icons/Ionicons';
import BackButton from '../components/BackButton';
import Select2 from "@/src/screens/components/Select2";
import { launchImageLibrary } from 'react-native-image-picker';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from '@react-navigation/native';
import { APP_URL } from "@env";
import Geolocation from "react-native-geolocation-service";
import { TextField } from 'react-native-ui-lib';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icons from 'react-native-vector-icons/AntDesign';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import { Camera, useCameraDevices } from 'react-native-vision-camera';


const Perusahaan = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [photoUri, setPhotoUri] = useState(null);
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [data, setData] = useState({});
  const [imageUrl, setImageUrl] = useState(null);

  const [kotaKabupaten, setKotaKabupaten] = useState([]);
  const [selectedKotaKabupaten, setSelectedKotaKabupaten] = useState(null);

  const [kecamatan, setKecamatan] = useState([]);
  const [selectedKecamatan, setSelectedKecamatan] = useState(null);

  const [kelurahan, setKelurahan] = useState([]);
  const [selectedKelurahan, setSelectedKelurahan] = useState(null);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [hasPermission, setHasPermission] = useState(false);
  const devices = useCameraDevices();
  const device = devices.back;
  const camera = useRef<Camera>(null);

  //CAMERAAAA
  useEffect(() => {
    (async () => {
    const status = await Camera.requestCameraPermission();
    setHasPermission(status === "authorized");
    })();
  }, []);

  const takePhoto = async () => {
    if (camera.current) {
      const photo = await camera.current.takePhoto();
      Alert.alert('Photo Captured!', `Photo path: ${photo.path}`);
      console.log('Photo path:', photo.path);
    }
  };

  if (!device) return <View style={styles.container}/>;
  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={async () => {
          const status = await Camera.requestCameraPermission();
          setHasPermission(status === "authorized");
        }}>
          <Text className="font-poppins-semibold text-sm mb-3 flex text-center">
            Grant Camera Permission
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  
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

  const [location, setLocation] = useState({ lat: "", long: "",});

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
    }  catch (err) {
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
          longitude
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
    axios
    .get("/master/kota-kabupaten")
    .then(response => {
      const formattedKotaKabupaten = response.data.data.map(item => ({
        label: item.nama,
        value: item.id,
      }));
      console.log("Response data from API:", response.data);
      setKotaKabupaten(formattedKotaKabupaten);
    })
    .catch(error => {
      console.error("Error fetching data kabupaten:", error);
    })
  }, []);

  useEffect(() => {
    console.log({ selectedKotaKabupaten });
    if (selectedKotaKabupaten || watch("kab_kota_id")) {
      axios
        .get(`/wilayah/kota-kabupaten/${selectedKotaKabupaten}/kecamatan`)
        .then(response => {
          console.log("Response data:", response.data);
          if (response.data && response.data.data) {
            const formattedKecamatan = response.data.data.map(item => ({
              label: item.nama,
              value: item.id,
            }));
            setKecamatan(formattedKecamatan);
          } else {
            console.warn("No data found for kecamtan");
            setKecamatan([]);
          }
        })
        .catch(error => {
          console.error("Error fetching data kecamatan:", error);
        })
    } else {
      setKecamatan([]);
    }
  }, [selectedKotaKabupaten, watch("kab_kota_id")]);

  useEffect(() => {
    if (selectedKecamatan) {
      axios
        .get(`/wilayah/kecamatan/${selectedKecamatan}/kelurahan`)
        .then(response => {
          console.log("Response data:", response.data);
          if (response.data && response.data.data) {
            const formattedKelurahan = response.data.data.map(item => ({
              label: item.nama,
              value: item.id,
            }));
            setKelurahan(formattedKelurahan);
          } else {
            console.warn("No data found for kelurahan");
            setKelurahan([]);
          }
        })
        .catch(error => {
          console.error("Error fetching data kelurahan:", error);
        })
    } else {
      setKelurahan([]);
    }
  }, [selectedKecamatan]);

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
      })
  }, [])

  useEffect(() => {
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

  const updateUser = async () => {
    const formData = new FormData();
    formData.append("instansi", getValues("instansi"));
    formData.append("alamat", getValues("alamat"));
    formData.append("pimpinan", getValues("pimpinan"));
    formData.append("pj_mutu", getValues("pj_mutu"));
    formData.append("telepon", getValues("telepon"));
    formData.append("fax", getValues("fax"));
    formData.append("email", getValues("email"));
    formData.append("jenis_kegiatan", getValues("jenis_kegiatan"));
    formData.append("lat", getValues("lat"));
    formData.append("long", getValues("long"));
    formData.append("kab_kota_id", getValues("kab_kota_id"));
    formData.append("kecamatan_id", getValues("kecamatan_id"));
    formData.append("kelurahan_id", getValues("kelurahan_id"));
    formData.append("tanda_tangan", getValues("tanda_tangan"));

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
        // setModalKintud(false);
        // navigation.navigate("IndexProfile");
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

  const [file, setFile] = useState(null);
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
        setFile(file);
      }
    });
  };

  const handleDeletePhoto = () => {
    setFile(null);
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

  
     

  // const validateForm = () => {
  //   const {
  //     instansi, alamat, pimpinan, pj_mutu, 
  //     telepon, email, jenis_kegiatan, 
  //     lat, long, kecamatan_id, kelurahan_id
  //   } = formData;

  //   if (!instansi) {
  //     Alert.alert('Error', 'Nama Perusahaan/Instansi harus diisi');
  //     return false;
  //   }
  //   if (!alamat) {
  //     Alert.alert('Error', 'Alamat harus diisi');
  //     return false;
  //   }
  //   if (!pimpinan) {
  //     Alert.alert('Error', 'Pimpinan harus diisi');
  //     return false;
  //   }
  //   if (!pj_mutu) {
  //     Alert.alert('Error', 'PJ Mutu harus diisi');
  //     return false;
  //   }
  //   if (!telepon || !/^08[0-9]\d{8,11}$/.test(telepon)) {
  //     Alert.alert('Error', 'No. Telepon tidak valid');
  //     return false;
  //   }
  //   if (!email || !/\S+@\S+\.\S+/.test(email)) {
  //     Alert.alert('Error', 'Email tidak valid');
  //     return false;
  //   }
  //   if (!jenis_kegiatan) {
  //     Alert.alert('Error', 'Jenis Kegiatan harus diisi');
  //     return false;
  //   }
  //   if (!lat) {
  //     Alert.alert('Error', 'Latitude harus diisi');
  //     return false;
  //   }
  //   if (!long) {
  //     Alert.alert('Error', 'Longitude harus diisi');
  //     return false;
  //   }
  //   if (!kecamatan_id) {
  //     Alert.alert('Error', 'Kecamatan harus diisi');
  //     return false;
  //   }
  //   if (!kelurahan_id) {
  //     Alert.alert('Error', 'Kelurahan harus diisi');
  //     return false;
  //   }

  //   return true;
  // };

  // const [formData, setFormData] = useState({
  //   instansi: '',
  //   alamat: '',
  //   pimpinan: '',
  //   pj_mutu: '',
  //   telepon: '',
  //   fax: '',
  //   email: '',
  //   jenis_kegiatan: '',
  //   lat: '',
  //   long: '',
  //   kab_kota_id: '',
  //   kecamatan_id: '',
  //   kelurahan_id: '',
  //   tanda_tangan: null
  // });

  // const handleSubmit = () => {
  //   if (validateForm()) {
  //     // TODO: Implement actual submit logic
  //     Alert.alert('Sukses', 'Data Perusahaan berhasil disimpan!');
  //   }
  // };

  // const handleGetLocation = async () => {
  //   let { status } = await Location.requestForegroundPermissionsAsync();
  //   if (status !== 'granted') {
  //     Alert.alert('Error', 'Izin lokasi diperlukan');
  //     return;
  //   }

  //   let location = await Location.getCurrentPositionAsync({});
  //   setFormData(prev => ({
  //     ...prev,
  //     lat: location.coords.latitude.toString(),
  //     long: location.coords.longitude.toString()
  //   }));
  // };

  // const handleImagePick = async () => {
  //   let result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ImagePicker.MediaTypeOptions.Images,
  //     allowsEditing: true,
  //     aspect: [4, 3],
  //     quality: 1,
  //   });

  //   if (!result.canceled) {
  //     setPhotoUri(result.assets[0].uri);
  //     setFormData(prev => ({
  //       ...prev,
  //       tanda_tangan: result.assets[0].uri
  //     }));
  //   }
  // };

  return (
    <ScrollView className="bg-gray-100 py-8">
      <View style={{ alignItems: 'center' }} className=" mb-28">
        <View className="bg-white rounded-lg p-6 w-[95%] shadow-lg">
        <View className="flex-row items-center space-x-2 mb-10 mt-2 ">
          <BackButton action={() => navigation.goBack()} size={26} />
          <View className="absolute left-0 right-3 items-center">
            <Text className="text-[20px] text-black font-poppins-semibold">Update Perusahaan</Text>
            <View className="h-px w-[120%] bg-gray-200 top-5"/>
          </View>
        </View>
          <View className="mb-6">
          <Text className="font-poppins-semibold text-sm mb-3">Tanda Tangan</Text>

            <View style={styles.container}>
              <Camera
                ref={camera}
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
                photo={true}
              />
          <TouchableOpacity onPress={takePhoto} style={styles.captureButton}>
            <Text className="font-poppins-semibold text-sm mb-3 flex text-center">
              Open Camera
            </Text>
          </TouchableOpacity>
            </View>
            
          <Text className="font-poppins-semibold text-sm mb-3 flex text-center">Or</Text>
          <Controller
    control={control}
    name="tanda_tangan"
    render={({ field: { onChange } }) => (
      <View className="w-full">
        {/* Check if there's a tanda_tangan in data.detail or photos array */}
        {currentPhotoUrl || file ? (
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
            rules={{  required: "Instansi harus diisi" }}
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
            rules={{  required: "alamat harus diisi" }}
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
            rules={{  required: "pimpinan harus diisi" }}
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
            rules={{  required: "pj mutu harus diisi" }}
            defaultValue={userData?.pj_mutu}
            render={({ field: { onChange, value } }) => (
              <View>
                <Text className="font-poppins-semibold mb-2 text-black">
                  Pj Mutu"
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
            rules={{  required: "telepon harus diisi" }}
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
            rules={{  required: "fax harus diisi" }}
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
            rules={{  required: "email harus diisi" }}
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
            rules={{  required: "jenis kegiatan harus diisi" }}
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
            rules={{  required: "lokasi harus diisi" }}
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
            rules={{  required: "lokasi harus diisi" }}
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

          <Controller
            name="kab_kota_id"
            control={control}
            rules={{ required: "Kabupaten/Kota harus diisi" }}
            render={({ field: { onChange, value } }) => (
              <View className="mt-5">
                <Text className="font-poppins-semibold text-black mb-2">
                  Kabupaten / Kota
                </Text>
                <View style={{ borderColor: "black", borderWidth: 0.5 }} className="rounded-2xl">
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
                    placeholder={{ label: "Pilih Kabupaten/Kota", value: null }}
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

          {/* Simpan Button */}
          <TouchableOpacity
            onPress={handleSubmit(updateUser)}
            className="rounded-lg py-3 flex items-center mt-4"
            style={{ backgroundColor: '#312e81' }}
          >
            <Text className="text-white font-poppins-semibold text-sm">Simpan</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 10,
  },
});

export default Perusahaan