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
  ScrollView,
} from "react-native";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { create } from "zustand";
import { Controller } from "react-hook-form";
import { useForm } from "react-hook-form";
import { Colors, TextField, Button } from "react-native-ui-lib";
import Geolocation from "react-native-geolocation-service";
import Toast from "react-native-toast-message";
import { launchImageLibrary } from "react-native-image-picker"; // Perbaikan Import
import RNPickerSelect from "react-native-picker-select";
import DropDownPicker from "react-native-dropdown-picker";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
const Perusahaan = () => {
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation();

  const [kotaKabupaten, setKotaKabupaten] = useState([[]]);
  const [selectedKotaKabupaten, setSelectedKotaKabupaten] = useState(null);

  const [kecamatan, setKecamatan] = useState([]);
  const [selectedKecamatan, setSelectedKecamatan] = useState(null);

  const [kelurahan, setKelurahan] = useState([]);
  const [selectedKelurahan, setSelectedKelurahan] = useState(null);

  const [text, setText] = React.useState("");

  // geo location
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
        Alert.alert(
          "Lokasi Ditemukan",
          `Latitude: ${position.coords.latitude}, Longitude: ${position.coords.longitude}`,
        );
      },
      error => {
        console.log(error.code, error.message);
      },
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
  // end geo location

  // Geo Location
  useEffect(() => {
    if (location.lat && location.long) {
      setValue("lat", location.lat);
      setValue("long", location.long);
    }
  }, [location.lat, location.long]);

  // fetching kota-kabupaten
  useEffect(() => {
    axios
      .get("/master/kota-kabupaten")
      .then(response => {
        const formattedKotaKabupaten = response.data.data.map(item => ({
          label: item.nama,
          value: item.id,
        }));
        setKotaKabupaten(formattedKotaKabupaten);
      })
      .catch(error => {
        console.error("error fetching data kabupaten : ", error);
      });
  }, []);

  // FETCHING kecamatan
  useEffect(() => {
    if (selectedKotaKabupaten) {
      axios
        .get(`/wilayah/kota-kabupaten/${selectedKotaKabupaten}/kecamatan`)
        .then(response => {
          console.log("Response data:", response.data); // Log untuk debugging
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

  // fetch data kelurahan
  useEffect(() => {
    if (selectedKecamatan) {
      // Pastikan ada kecamatan yang dipilih
      axios
        .get(`/wilayah/kecamatan/${selectedKecamatan}/kelurahan`)
        .then(response => {
          // Format data kelurahan yang diterima dari API
          const formattedKelurahan = response.data.data.map(item => ({
            label: item.nama, // Nama kelurahan untuk label
            value: item.id, // ID kelurahan untuk value
          }));
          setKelurahan(formattedKelurahan); // Simpan data kelurahan ke state
        })
        .catch(error => {
          console.error("error fetching data kelurahan : ", error); // Tampilkan error jika terjadi
        });
    } else {
      setKelurahan([]); // Kosongkan data kelurahan jika tidak ada kecamatan yang dipilih
    }
  }, [selectedKecamatan]); // useEffect akan dijalankan setiap kali selectedKecamatan berubah

  // fetch data detail user
  useEffect(() => {
    axios
      .get("/auth")
      .then(response => {
        console.log(
          "Response Data detail user akun:",
          response.data.user.detail,
        ); // Log data response
        setUserData(response.data.user.detail);
      })
      .catch(error => {
        console.error("Error fetching data:", error); // Log error
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

  // function update data
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
    formData.append("kab_kota_id", getValues("kab_kotas"));
    formData.append("kecamatan_id", getValues("kecamatans"));
    formData.append("kelurahan_id", getValues("kelurahans"));

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
      const updatedImageUrl = `http://192.168.18.14:8000${tanda_tangan}?t=${new Date().getTime()}`;
      setImageUrl(updatedImageUrl);
      setData(prevData => ({
        ...prevData,
        tanda_tangan: getValues("tanda_tangan"),
      }));
    } catch (error) {
      console.error("Update failed:", error.message);
    }
  };

  // respone setelah update
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
      navigation.navigate("Profile"); // Navigasi kembali untuk refresh halaman
      reset();
    },
    onError: error => {
      console.error(error.message);
      Toast.show({
        type: "error",
        text1: error.message,
      });
    },
  });

  // Gambar
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
  };

  return (
    <View style={styles.container}>
      {/* <ScrollView nestedScrollEnabled={true} style={styles.container}
       contentContainerStyle={styles.scrollViewContainer}
       showsVerticalScrollIndicator={false}> */}
      {userData ? (
        <>
          <Text style={{ color: "black" }}>Tanda Tangan</Text>
          <Controller
            control={control}
            name="tanda_tangan"
            render={({ field: { value } }) => (
              <View style={styles.textFieldContainer}>
                <View
                  style={[
                    styles.textField,
                    {
                      backgroundColor: file ? "#D4D4D4" : "#fff",
                      padding: 20,
                      marginBottom: 20,
                      borderRadius: 7,
                    },
                  ]}
                  value={value}>
                  {/* Tampilkan tombol "Pilih Gambar" hanya jika tidak ada gambar */}
                  {!file && (
                    <TouchableOpacity onPress={handleChoosePhoto}>
                      <Text style={styles.selectPhotoText}>Pilih Gambar</Text>
                    </TouchableOpacity>
                  )}

                  {/* Tampilkan gambar dan tombol hapus jika ada gambar */}
                  {file && (
                    <View style={styles.imageContainer}>
                      <Image
                        source={{ uri: file.uri }} // Pastikan file.uri adalah path yang benar
                        style={styles.imagePreview}
                      />
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={handleDeletePhoto}>
                        <Text style={styles.deleteButtonText}>
                          Hapus Gambar
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            )}
          />
          {/* <Text>{JSON.stringify(userData)}</Text> ->  "menampilkan data user" */}
          <Text style={{ color: "black" }}>Instansi</Text>
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
          <Text style={{ color: "black" }}>Alamat</Text>
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
          <Text style={{ color: "black" }}>Pimpinan</Text>
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
          <Text style={{ color: "black" }}>PJ Mutu</Text>
          <Controller
            control={control}
            name="pj_mutu"
            rules={{ required: "PJ MUTU Tidak Boleh Kosong" }}
            render={({ field: { onChange, value } }) => (
              <TextField
                // onChangeText={handleNumberChange}

                fieldStyle={styles.textField}
                enableErrors
                keyboardType="text-input" // Ensures number keyboard
                placeholderTextColor="black"
                placeholder={userData.pj_mutu}
                onChangeText={onChange}
              />
            )}></Controller>
          {errors.pj_mutu && (
            <Text style={{ color: "red" }}>{errors.pj_mutu.message}</Text>
          )}
          <Text style={{ color: "black" }}>Nomor Telepon</Text>
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
          <Text style={{ color: "black" }}>Fax</Text>
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
          <Text style={{ color: "black" }}>Email</Text>
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
          <Text style={{ color: "black" }}> Jenis Kegiatan</Text>
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
          <Text
            style={{ alignSelf: "center", marginBottom: 5, color: "black" }}>
            Lokasi
          </Text>
          <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
  <Controller
    control={control}
    name="lat"
    rules={{ required: "Latitude Tidak Boleh Kosong" }}
    render={({ field: { onChange, value } }) => (
      <TextField
        style={{ flex: 1, backgroundColor: "white", marginRight: 10 }} // Memberikan margin antar field
        enableErrors
        keyboardType="text-input"
        onChangeText={onChange}
        value={value || location.lat}
        placeholderTextColor="black"
        placeholder={userData.lat}
      />
    )}
  />
  <Controller
    control={control}
    name="long"
    rules={{ required: "Longitude Tidak Boleh Kosong" }}
    render={({ field: { onChange, value } }) => (
      <TextField
        style={{ flex: 1, backgroundColor: "white" }} // Menggunakan flex untuk mengisi ruang
        keyboardType="text-input"
        onChangeText={onChange}
        enableErrors
        value={value || location.long}
        placeholderTextColor="black"
        placeholder={userData.long}
      />
    )}
  />
</View>

          <TouchableOpacity
            style={styles.buttonLokasi}
            onPress={handleLocationPress}>
            <Text style={styles.buttonLokasiText}>Gunakan Lokasi Saat Ini</Text>
          </TouchableOpacity>
          <Text style={styles.label}>Select Kabupaten/Kota:</Text>
          <Controller
            name="kab_kotas"
            control={control}
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputContainer}>
                <RNPickerSelect
                  onValueChange={value => {
                    onChange(value);
                    setSelectedKotaKabupaten(value);
                  }}
                  value={value}
                  items={kotaKabupaten}
                  style={pickerSelectStyles} // Tambahkan style khusus
                  Icon={() => {
                    return <Icon name="chevron-down" size={24} color="gray" />;
                  }}
                />
              </View>
            )}
          />
          {errors.kab_kotas && (
            <Text style={{ color: "red" }}>{errors.kab_kotas.message}</Text>
          )}
          <Text style={styles.label}>Select Kecamatan:</Text>
          <Controller
            name="kecamatans"
            control={control}
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputContainer}>
                <RNPickerSelect
                  onValueChange={value => {
                    onChange(value);
                    setSelectedKecamatan(value);
                  }}
                  value={value}
                  items={kecamatan}
                  style={pickerSelectStyles} // Tambahkan style khusus
                  Icon={() => {
                    return <Icon name="chevron-down" size={24} color="gray" />;
                  }}
                />
              </View>
            )}
          />
          {errors.kecamatans && (
            <Text style={{ color: "red" }}>{errors.kecamatans.message}</Text>
          )}
          <Text style={styles.label}>Select Kelurahan:</Text>
          <Controller
            name="kelurahans"
            control={control}
            render={({ field: { onChange, value } }) => (
              <View style={styles.inputContainer}>
                <RNPickerSelect
                  onValueChange={value => {
                    onChange(value);
                    setSelectedKelurahan(value);
                  }}
                  value={value}
                  items={kelurahan}
                  style={pickerSelectStyles} // Tambahkan style khusus
                  Icon={() => {
                    return <Icon name="chevron-down" size={24} color="gray" />;
                  }}
                />
              </View>
            )}
          />
          {errors.kelurahans && (
            <Text style={{ color: "red" }}>{errors.kelurahans.message}</Text>
          )}
        </>
      ) : (
        <Text style={text}>Loading...</Text>
      )}

      <Button
        label="Simpan"
        style={{ marginBottom: 60 }}
        backgroundColor={Colors.brand}
        borderRadius={5}
        onPress={handleSubmit(update)}
        disabled={isLoading || isSuccess}></Button>
      {/* </ScrollView> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  TextField: {
    marginBottom: 16, // Adds space between each TextField
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
    marginBottom: 50,
  },

  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonLokasi: {
    width: "100%",
    height: 50,
    marginVertical: 7,
    fontWeight: "bold",
    backgroundColor: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  buttonLokasiText: {
    color: "#000",
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
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
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
    paddingRight: 30, // untuk memberi ruang bagi icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    color: "black",
    paddingRight: 30, // untuk memberi ruang bagi icon
  },
  iconContainer: {
    top: 12,
    right: 10,
  },
});

export default Perusahaan;
