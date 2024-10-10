import axios from "@/src/libs/axios";
import * as React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  Alert,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  ScrollView,
  Modal,
} from "react-native";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller } from "react-hook-form";
import { useForm } from "react-hook-form";
import { Colors, TextField, Button } from "react-native-ui-lib";
import Geolocation from "react-native-geolocation-service";
import Toast from "react-native-toast-message";
import { launchImageLibrary } from "react-native-image-picker";
import RNPickerSelect from "react-native-picker-select";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { APP_URL } from "@env";
import BackButton from "../../components/Back";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";

rem = multiplier => baseRem * multiplier;
const baseRem = 16;
const Perusahaan = () => {
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation();
  const [imageUrl, setImageUrl] = useState(null); // Tambahkan state untuk imageUrl
  const [data, setData] = useState({}); // Tambahkan state untuk data

  const [kotaKabupaten, setKotaKabupaten] = useState([[]]);
  const [selectedKotaKabupaten, setSelectedKotaKabupaten] = useState(null);

  const [kecamatan, setKecamatan] = useState([]);
  const [selectedKecamatan, setSelectedKecamatan] = useState(null);

  const [kelurahan, setKelurahan] = useState([]);
  const [selectedKelurahan, setSelectedKelurahan] = useState(null);

  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

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
  const getLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        setLocation({
          lat: position.coords.latitude.toString(),
          long: position.coords.longitude.toString(),
        });
        setModalVisible(true); // Tampilkan modal setelah lokasi ditemukan
        setTimeout(() => {
          setModalVisible(false);
        }, 3000);
      },
      // error => {
      //   console.log(error.code, error.message);
      // },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  };
  const handleLocationPress = () => {
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
          label: item.nama,
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
    if (selectedKotaKabupaten) {
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
  }, [selectedKotaKabupaten]);

  // FETCH KELURAHAN
  useEffect(() => {
    if (selectedKecamatan) {
      axios
        .get(`/wilayah/kecamatan/${selectedKecamatan}/kelurahan`)
        .then(response => {
          const formattedKelurahan = response.data.data.map(item => ({
            label: item.nama,
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
        // console.log(
        //   "Response Data detail user akun:",
        //   response.data.user.detail,
        // );
        setUserData(response.data.user.detail);
        console.log("userData setelah setUserData:", response.data.user.detail);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
      });
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
        }
      })
      .catch(error => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const {
    handleSubmit,
    control,
    formState: { errors },
    getValues,
    reset,
    setValue,
  } = useForm({
    values: { ...userData },
  });

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
    } catch (error) {
      console.error("Update failed:", error.message);
    }
  };

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

  // RESPONSE SETELAH UPDATE
  const { mutate: update, isLoading } = useMutation(updateUser, {
    onSuccess: () => {
      Toast.show({
        type: "success",
        text1: "Data Berhasil Di Kirim",
      });
      QueryClient.invalidateQueries("/auth");
      navigation.navigate("Profile");
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

  // GAMBAR
  const [file, setFile] = React.useState(null);
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

  const ImageComponent = () => {
    const imageSource = file?.uri || currentPhotoUrl;

    if (!imageSource) {
      return <Text>Tidak ada gambar yang dipilih</Text>;
    }

    return (
      <Image
        source={{ uri: imageSource }}
        style={styles.signaturePreview}
        onError={e => console.log("Error loading image:", e.nativeEvent.error)}
      />
    );
  };
  return (
    <ScrollView>
    <View style={styles.container}>
      {userData ? (
        <View style={styles.card}>
          <View className="flex-row justify-between mx-2 mb-4">
            <BackButton action={() => navigation.goBack()} size={26}/>
              <View className="flex-row gap-2 items-center">
                <FontAwesome5Icon name="briefcase" size={24} color="black" />
                <Text className="text-xl font-extrabold me-10">Perusahaan</Text>
              </View>
          </View>
          <Text style={{ color: "black" }}>Tanda Tangan</Text>
          <Controller
            control={control}
            name="tanda_tangan"
            render={({ field: { value } }) => (
              <View style={styles.signatureContainer}>
                <View style={styles.signatureField}>
                  {file || currentPhotoUrl ? (
                    <View style={styles.imageContainer}>
                      <ImageComponent />
                      <TouchableOpacity
                        style={styles.changeButton}
                        onPress={handleChoosePhoto}>
                        <Text style={styles.buttonText}>Ubah Tanda tangan</Text>
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
                        Tambah Tanda Tangan
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          />
          <Text style={{ color: "black", marginBottom: 5, fontWeight: "bold" }}>
            Instansi
          </Text>
          <Controller
            control={control}
            name="instansi"
            rules={{ required: "Instansi Tidak Boleh Kosong" }}
            render={({ field: { onChange, value } }) => (
              <TextField
                placeholderTextColor="black"
                placeholder={userData.instansi}
                enableErrors
                fieldStyle={styles.textField}
                onChangeText={onChange}
              />
            )}
          />
          {errors.instansi && (
            <Text style={{ color: "red" }}>{errors.instansi.message}</Text>
          )}
          <Text style={{ color: "black", marginBottom: 5, fontWeight: "bold" }}>
            Alamat
          </Text>
          <Controller
            control={control}
            name="alamat"
            rules={{ required: "Alamat Tidak Boleh Kosong" }}
            render={({ field: { onChange, value } }) => (
              <TextField
                fieldStyle={styles.textField}
                enableErrors
                keyboardType="text-input"
                placeholderTextColor="black"
                placeholder={userData.alamat}
                onChangeText={onChange}
              />
            )}></Controller>
          {errors.alamat && (
            <Text style={{ color: "red" }}>{errors.alamat.message}</Text>
          )}
          <Text style={{ color: "black", marginBottom: 5, fontWeight: "bold" }}>
            Pimpinan
          </Text>
          <Controller
            control={control}
            name="pimpinan"
            rules={{ required: "Pimpinan Tidak Boleh Kosong" }}
            render={({ field: { onChange, value } }) => (
              <TextField
                fieldStyle={styles.textField}
                enableErrors
                keyboardType="text-input"
                placeholderTextColor="black"
                placeholder={userData.pimpinan}
                onChangeText={onChange}
              />
            )}></Controller>
          {errors.pimpinan && (
            <Text style={{ color: "red" }}>{errors.pimpinan.message}</Text>
          )}
          <Text style={{ color: "black", marginBottom: 5, fontWeight: "bold" }}>
            PJ Mutu
          </Text>
          <Controller
            control={control}
            name="pj_mutu"
            rules={{ required: "PJ MUTU Tidak Boleh Kosong" }}
            render={({ field: { onChange, value } }) => (
              <TextField
                fieldStyle={styles.textField}
                enableErrors
                keyboardType="text-input"
                placeholderTextColor="black"
                placeholder={userData.pj_mutu}
                onChangeText={onChange}
              />
            )}></Controller>
          {errors.pj_mutu && (
            <Text style={{ color: "red" }}>{errors.pj_mutu.message}</Text>
          )}
          <Text style={{ color: "black", marginBottom: 5, fontWeight: "bold" }}>
            Nomor Telepon
          </Text>
          <Controller
            control={control}
            name="telepon"
            rules={{ required: "Telepon Tidak Boleh Kosong" }}
            render={({ field: { onChange, value } }) => (
              <TextField
                onChangeText={onChange}
                fieldStyle={styles.textField}
                enableErrors
                keyboardType="phone-pad"
                placeholderTextColor="black"
                placeholder={userData.telepon}
              />
            )}></Controller>
          {errors.telepon && (
            <Text style={{ color: "red" }}>{errors.telepon.message}</Text>
          )}
          <Text style={{ color: "black", marginBottom: 5, fontWeight: "bold" }}>
            Fax
          </Text>
          <Controller
            control={control}
            name="fax"
            render={({ field: { onChange, value } }) => (
              <TextField
                onChangeText={onChange}
                fieldStyle={styles.textField}
                enableErrors
                keyboardType="phone-pad"
                placeholderTextColor="black"
                placeholder={userData.fax}
              />
            )}></Controller>
          <Text style={{ color: "black", marginBottom: 5, fontWeight: "bold" }}>
            Email
          </Text>
          <Controller
            control={control}
            name="email"
            rules={{ required: "Email Tidak Boleh Kosong" }}
            render={({ field: { onChange, value } }) => (
              <TextField
                fieldStyle={styles.textField}
                enableErrors
                keyboardType="email-address"
                onChangeText={onChange}
                placeholderTextColor="black"
                placeholder={userData.email}
              />
            )}></Controller>
          {errors.email && (
            <Text style={{ color: "red" }}>{errors.email.message}</Text>
          )}
          <Text style={{ color: "black", marginBottom: 5, fontWeight: "bold" }}>
            {" "}
            Jenis Kegiatan
          </Text>
          <Controller
            control={control}
            name="jenis_kegiatan"
            rules={{ required: "Jenis Kegiatan Tidak Boleh Kosong" }}
            render={({ field: { onChange, value } }) => (
              <TextField
                fieldStyle={styles.textField}
                enableErrors
                keyboardType="text-input"
                onChangeText={onChange}
                placeholderTextColor="black"
                placeholder={userData.jenis_kegiatan}
              />
            )}></Controller>
          {errors.jenis_kegiatan && (
            <Text style={{ color: "red" }}>
              {errors.jenis_kegiatan.message}
            </Text>
          )}
          <View
            style={{ justifyContent: "space-between", flexDirection: "row" }}>
            <Text
              style={{
                marginBottom: 5,
                color: "black",
                marginLeft: 55,
                fontWeight: "bold",
              }}>
              Lintang
            </Text>
            <Text
              style={{ color: "black", marginRight: 65, fontWeight: "bold" }}>
              Bujur
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}>
            <View style={{ flex: 1, marginRight: 5 }}>
              <Controller
                control={control}
                name="lat"
                rules={{ required: "Latitude Tidak Boleh Kosong" }}
                render={({ field: { onChange, value } }) => (
                  <TextField
                    fieldStyle={styles.textField}
                    enableErrors
                    keyboardType="numeric"
                    onChangeText={onChange}
                    value={value || location.lat}
                    placeholderTextColor="gray"
                    placeholder={userData.lat}
                  />
                )}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 5 }}>
              <Controller
                control={control}
                name="long"
                rules={{ required: "Longitude Tidak Boleh Kosong" }}
                render={({ field: { onChange, value } }) => (
                  <TextField
                    fieldStyle={styles.textField}
                    keyboardType="numeric"
                    onChangeText={onChange}
                    enableErrors
                    value={value || location.long}
                    placeholderTextColor="gray"
                    placeholder={userData.long}
                  />
                )}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.buttonLokasi}
            onPress={handleLocationPress}>
            <Text style={styles.buttonLokasiText}>Gunakan Lokasi Saat Ini</Text>
          </TouchableOpacity>
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Anda Berada Pada :</Text>
                <Text style={styles.modalText}>Lintang: {location.lat}</Text>
                <Text style={styles.modalText}>Bujur: {location.long}</Text>
                {/* <TouchableOpacity
                  style={styles.buttonModal}
                  onPress={() => setModalVisible(false)}>
                  <Text>Tutup</Text>
                </TouchableOpacity> */}
              </View>
            </View>
          </Modal>
          <Text style={styles.label}>Kabupaten/Kota</Text>
          <Controller
            name="kab_kota_id"
            control={control}
            rules={{ required: "Kabupaten Kota Tidak Boleh Kosong" }}
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputContainer}>
                <RNPickerSelect
                  onValueChange={value => {
                    onChange(value);
                    setSelectedKotaKabupaten(value);
                  }}
                  value={value}
                  items={kotaKabupaten.map(item => ({
                    label: item.label,
                    value: item.value,
                    key: item.value, // Tambahkan key yang unik
                  }))}
                  style={pickerSelectStyles}
                  // placeholder={{
                  //   label: userData.kab_kota_id
                  //     ? `Kab/Kota: ${userData.kab_kota_id}`
                  //     : "Pilih Kabupaten/Kota",
                  //   value: null, // Tambahkan nilai untuk placeholder
                  // }}
                />
              </View>
            )}
          />
          {errors.kab_kota_id && (
            <Text style={{ color: "red" }}>{errors.kab_kota_id.message}</Text>
          )}

          <Text style={styles.label}>Kecamatan</Text>
          <Controller
            name="kecamatan_id"
            rules={{ required: "Kecamatan Tidak Boleh Kosong" }}
            control={control}
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputContainer}>
                <RNPickerSelect
                  onValueChange={value => {
                    onChange(value);
                    setSelectedKecamatan(value); // Set Kecamatan
                  }}
                  value={value}
                  items={kecamatan.map(item => ({
                    label: item.label,
                    value: item.value,
                    key: item.value, // Tambahkan key yang unik
                  }))}
                  style={pickerSelectStyles}
                  // placeholder={{
                  //   label: userData.kecamatan_id
                  //     ? `Kecamatan: ${userData.kecamatan_id}`
                  //     : "Pilih Kecamatan",
                  //   value: null, // Tambahkan nilai untuk placeholder
                  // }}
                  disabled={!selectedKotaKabupaten} // Disabled jika Kota/Kabupaten belum dipilih
                />
              </View>
            )}
          />
          {errors.kecamatan_id && (
            <Text style={{ color: "red" }}>{errors.kecamatan_id.message}</Text>
          )}

          <Text style={styles.label}>Kelurahan</Text>
          <Controller
            name="kelurahan_id"
            control={control}
            rules={{ required: "Kelurahan Tidak Boleh Kosong" }}
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputContainer}>
                <RNPickerSelect
                  onValueChange={value => {
                    onChange(value);
                    setSelectedKelurahan(value); // Set Kelurahan
                  }}
                  value={value}
                  items={kelurahan.map(item => ({
                    label: item.label,
                    value: item.value,
                    key: item.value, // Tambahkan key yang unik
                  }))}
                  style={pickerSelectStyles}
                  // placeholder={{
                  //   label: userData.kelurahan_id
                  //     ? `Kelurahan: ${userData.kelurahan_id}`
                  //     : "Pilih Kelurahan",
                  //   value: null, // Tambahkan nilai untuk placeholder
                  // }}
                  disabled={!selectedKecamatan} // Disabled jika Kecamatan belum dipilih
                />
              </View>
            )}
          />
          {errors.kelurahan_id && (
            <Text style={{ color: "red" }}>{errors.kelurahan_id.message}</Text>
          )}
           <Button
        label="Simpan"
        style={{ marginBottom: 60 }}
        backgroundColor={Colors.brand}
        borderRadius={5}
        onPress={handleSubmit(update)}
        disabled={isLoading}></Button>
        </View>
      ) : (
        <View className="h-full flex justify-center">
          <ActivityIndicator size={"large"} color={"#312e81"} />
        </View>
      )}
    </View>
    </ScrollView>
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
    shadowOffset: {width: 0, height: 2},
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
  deleteButton: {},
  deleteButtonText: {
    color: "red",
    marginBottom: 15,
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
    height: 100,
    resizeMode: "contain",
    marginBottom: 10,
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
  input: {
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: "black",
    borderWidth: 1,
    borderColor: "#ccc",
  },
});
const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    color: "black",
  },
  inputAndroid: {
    fontSize: 16,
    borderRadius: 8,
    color: "black",
    backgroundColor: "#f0f0f0",
  },
  iconContainer: {
    top: 12,
    right: 10,
  },
});

export default Perusahaan;
