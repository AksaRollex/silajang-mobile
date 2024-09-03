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
import { TextInput } from "react-native-paper";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { create } from "zustand";
import { Controller } from "react-hook-form";
import { useForm } from "react-hook-form";
import { Colors, TextField, Button } from "react-native-ui-lib";
import Geolocation from "react-native-geolocation-service";
import Toast from "react-native-toast-message";
import { launchImageLibrary } from "react-native-image-picker"; // Perbaikan Import

import DropDownPicker from "react-native-dropdown-picker";
import { useNavigation } from "@react-navigation/native";

const Perusahaan = () => {
  const [userData, setUserData] = useState(null);
  const navigation = useNavigation();

  const [kotaKabupaten, setKotaKabupaten] = useState([[]]);
  const [selectedKotaKabupaten, setSelectedKotaKabupaten] = useState(null);
  const [openKotaKabupaten, setOpenKotaKabupaten] = useState(false);

  const [kecamatan, setKecamatan] = useState([]);
  const [selectedKecamatan, setSelectedKecamatan] = useState(null);
  const [openKecamatan, setOpenKecamatan] = useState(false);

  const [kelurahan, setKelurahan] = useState([]);
  const [selectedKelurahan, setSelectedKelurahan] = useState(null);
  const [openKelurahan, setOpenKelurahan] = useState(false);

  // geo location

  const [text, setText] = React.useState("");

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

  // fetching kecamatan v.1
  // useEffect(() => {
  //   axios
  //     .get("/master/kecamatan/gets")
  //     .then(response => {
  //       const formattedKecamatan = response.data.data.map(item => ({
  //         label: item.nama,
  //         value: item.id,
  //       }));
  //       setKecamatan(formattedKecamatan);
  //     })
  //     .catch(error => {
  //       console.error("error fetching data kecamatan : ", error);
  //     });
  // }, []);

  // fetching kecamatan v.2
  useEffect(() => {
    if (selectedKotaKabupaten) {
      axios
        .get(`/master/kecamatan/gets/${selectedKotaKabupaten}`)
        .then(response => {
          const formattedKecamatan = response.data.data.map(item => ({
            label : item.nama,
            value: item.id
          }));
          setKecamatan(formattedKecamatan);
        })
        .catch(error => {
          console.error("Error fetching data kecamatan : ", error);
        });
    } else {
      setKecamatan([]);
    }
  }, [selectedKotaKabupaten]);

  // fetching kelurahan
  // useEffect (() => {
  //   axios
  //   .get("/master/kelurahan")
  //   .then((response) => {
  //     console.log("response data kelurahan : ", response.data)
  //     setKelurahan(response.data)
  //   })
  //   .catch(error => {
  //     console.error("error fetching data kelurahan : ", error)
  //   })
  // },[])

  useEffect (() => {
    axios.get("/master/kelurahan/gets").then((response ) => {
      const formattedKelurahan = response.data.data.map(item => ({
        label : item.nama,
        value: item.id,
      }));
      setKelurahan(formattedKelurahan);
    })
    .catch(error => {L
      console.error("error fetching data kelurahan : ", error)
    })
  },[])

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
    watch,
    setValue,
  } = useForm({
    values: {...userData}
  });

  useEffect(() => {
    if (location.lat && location.long) {
      setValue("lat", location.lat);
      setValue("long", location.long);
    }
  }, [location.lat, location.long]);

  const useFormPut = create(set => ({
    credential: {
      tanda_tangan: "",
      instansi: "",
      pimpinan: "",
      alamat: "",
      pj_mutu: "",
      telepon: "",
      fax: "",
      email: "",
      jenis_kegiatan: "",
      lat: "",
      long: "",
      // kab_kota_id: "",
      // kecamatan_id: "",
      // kelurahan_id: "",
    },
  }));

  const { setAkun } = useFormPut();

  const {
    mutate: update,
    isLoading,
    isSuccess,
  } = useMutation(
    () => {
      const requestData = {
        tanda_tangan: getValues("tanda_tangan"),
        instansi: getValues("instansi"),
        pimpinan: getValues("pimpinan"),
        pj_mutu: getValues("pj_mutu"),
        alamat: getValues("alamat"),
        telepon: getValues("telepon"),
        fax: getValues("fax"),
        email: getValues("email"),
        jenis_kegiatan: getValues("jenis_kegiatan"),
        lat: getValues("lat"),
        long: getValues("long"),
        // kab_kota_id: getValues("kab_kota_id"),
        // kecamatan_id: getValues("kecamatan_id"),
        // kelurahan_id: getValues("kelurahan_id"),
      };
      return axios
        .put("/user/updatePerusahaan", requestData)
        .then(res => res.data);
    },
    {
      onSuccess: () => {
        Toast.show({
          type: "success",
          text1: "Data Berhasil Di Kirim",
        });
        reset();
        navigation.navigate("Profile"); // Navigasi kembali untuk refresh halaman
      },
      onError: error => {
        console.error(error.response.data);
        Toast.show({
          type: "error",
          text1: error.response.data.message,
        });
      },
    },
  );

  // Gambar

  const [file, setFile] = React.useState(null);

  const handleChoosePhoto = () => {
    launchImageLibrary({ mediaType: "photo" }, response => {
      if (response.assets && response.assets.length > 0) {
        const selectedImage = response.assets[0].uri;
        setFile(selectedImage);
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
          {/* <Text style={{ color : 'black' }}>Tanda Tangan</Text> */}
          {/* <TouchableOpacity onPress={handleChoosePhoto}>
            <Text style={styles.selectPhotoText}>Pilih Gambar</Text>
          </TouchableOpacity>
          <Controller
            control={control}
            name="tanda_tangan"
            render={({ field: { onChange, value } }) => (
              <View style={styles.textFieldContainer}>
                <TextField
                  enableErrors
                  fieldStyle={styles.textField}
                  onChangeText={onChange}
                  value={value}
                />
                {file && (
                  <View style={styles.imageContainer}>
                    <Image source={{ uri: file }} style={styles.imagePreview} />
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={handleDeletePhoto}>
                      <Text style={styles.deleteButtonText}>Hapus Gambar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          /> */}

          <Text>
            {JSON.stringify(userData)}
          </Text>

          <Text style={{ color : 'black' }}>Instansi</Text>

          <Controller
            control={control}
            name="instansi"
            rules={{ required: "Instansi Tidak Boleh Kosong" }}
            render={({ field: { onChange, value } }) => (
              <TextField
                placeholder={userData.instansi}
                enableErrors
                fieldStyle={styles.textField}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.instansi && (
            <Text style={{ color: "red" }}>{errors.instansi.message}</Text>
          )}
          <Text style={{ color : 'black' }}>Alamat</Text>

          <Controller
            control={control}
            name="alamat"
            rules={{ required: "Alamat Tidak Boleh Kosong" }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                mode="outlined"
                style={styles.textInput}
                keyboardType="text-input"
                placeholder={userData.alamat}
                onChangeText={onChange}
                value={value}
              />
            )}></Controller>
          {errors.alamat && (
            <Text style={{ color: "red" }}>{errors.alamat.message}</Text>
          )}
          <Text style={{ color : 'black' }}>Pimpinan</Text>

          <Controller
            control={control}
            name="pimpinan"
            rules={{ required: "Pimpinan Tidak Boleh Kosong" }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                mode="outlined"
                style={styles.textInput}
                keyboardType="text-input"
                placeholder={userData.pimpinan}
                onChangeText={onChange}
                value={value}
              />
            )}></Controller>
          {errors.pimpinan && (
            <Text style={{ color: "red" }}>{errors.pimpinan.message}</Text>
          )}
          <Text style={{ color : 'black' }}>PJ Mutu</Text>

          <Controller
            control={control}
            name="pj_mutu"
            rules={{ required: "PJ MUTU Tidak Boleh Kosong" }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                // onChangeText={handleNumberChange}
                mode="outlined"
                style={styles.textInput}
                keyboardType="text-input" // Ensures number keyboard
                placeholder={userData.pj_mutu}
                onChangeText={onChange}
                value={value}
              />
            )}></Controller>
          {errors.pj_mutu && (
            <Text style={{ color: "red" }}>{errors.pj_mutu.message}</Text>
          )}
          <Text style={{ color : 'black' }}>Nomor Telepon</Text>

          <Controller
            control={control}
            name="telepon"
            rules={{ required: "Telepon Tidak Boleh Kosong" }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                mode="outlined"
                onChangeText={onChange}
                value={value}
                style={styles.textInput}
                keyboardType="phone-pad"
                placeholder={userData.telepon}
              />
            )}></Controller>
          {errors.telepon && (
            <Text style={{ color: "red" }}>{errors.telepon.message}</Text>
          )}

          <Text style={{ color : 'black' }}>Fax</Text>

          <Controller
            control={control}
            name="fax"
            render={({ field: { onChange, value } }) => (
              <TextInput
                onChangeText={onChange}
                value={value}
                mode="outlined"
                style={styles.textInput}
                keyboardType="phone-pad"
                placeholder={userData.fax}
              />
            )}></Controller>
          {errors.fax && (
            <Text style={{ color: "red" }}>{errors.fax.message}</Text>
          )}
          <Text style={{ color : 'black' }}>Email</Text>

          <Controller
            control={control}
            name="email"
            rules={{ required: "Email Tidak Boleh Kosong" }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                mode="outlined"
                style={styles.textInput}
                keyboardType="email-address"
                onChangeText={onChange}
                value={value}
                placeholder={userData.email}
              />
            )}></Controller>
          {errors.email && (
            <Text style={{ color: "red" }}>{errors.email.message}</Text>
          )}
          <Text style={{ color : 'black' }}> Jenis Kegiatan</Text>
          <Controller
            control={control}
            name="jenis_kegiatan"
            rules={{ required: "Jenis Kegiatan Tidak Boleh Kosong" }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                mode="outlined"
                style={styles.textInput}
                keyboardType="text-input"
                onChangeText={onChange}
                value={value}
                placeholder={userData.jenis_kegiatan}
              />
            )}></Controller>
          {/* <Controller
            control={control}
            name="lat"
            rules={{ required: "Jenis Kegiatan Tidak Boleh Kosong" }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                mode="outlined"
                style={styles.textInput}
                keyboardType="text-input"
                onChangeText={onChange}
                value={value}
                placeholder={userData.lat}
              />
            )}></Controller>
          <Controller
            control={control}
            name="long"
            rules={{ required: "Jenis Kegiatan Tidak Boleh Kosong" }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                mode="outlined"
                style={styles.textInput}
                keyboardType="text-input"
                onChangeText={onChange}
                value={value}
                placeholder={userData.long}
              />
            )}></Controller> */}

          <Text style={{ alignSelf: "center", marginBottom: 5, color : 'black' }}>Lokasi</Text>

          <View style={{ display: "flex", flexDirection: "row" }}>
            <Controller
              control={control}
              name="lat"
              rules={{ required: "Latitude Tidak Boleh Kosong" }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  mode="outlined"
                  style={{ width: "48%" }}
                  enableErrors
                  keyboardType="text-input"
                  onChangeText={onChange}
                  value={value || location.lat}
                  placeholder={userData.lat}
                />
              )}></Controller>
            <Controller
              control={control}
              name="long"
              rules={{ required: "Longitude Tidak Boleh Kosong" }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  mode="outlined"
                  style={{ width: "48%", marginHorizontal: "4%" }}
                  keyboardType="text-input"
                  onChangeText={onChange}
                  enableErrors
                  value={value || location.long}
                  placeholder={userData.long}
                />
              )}></Controller>
          </View>
          <TouchableOpacity
            style={styles.buttonLokasi}
            onPress={handleLocationPress}>
            <Text style={styles.buttonLokasiText}>Gunakan Lokasi Saat Ini</Text>
          </TouchableOpacity>
          <Text style={{ color : 'black' }}>Kota</Text>

          <Controller
            control={control}
            name="kota_kab_id"
            render={({ field: { onChange, value } }) => (
              <DropDownPicker
                open={openKotaKabupaten}
                value={watch("kab_kota_id")}
                items={kotaKabupaten}
                setOpen={setOpenKotaKabupaten}
                setValue={onChange}
                setItems={setKotaKabupaten}
                placeholder="Pilih Kota / Kabupaten"
                style={styles.dropdown}
              />
            )}></Controller>
          <Text style={{ color : 'black' }}>Kecamatan</Text>
          <Controller
  control={control}
  name="kota_kab_id"
  render={({ field: { onChange, value } }) => (
    <DropDownPicker
      open={openKotaKabupaten}
      items={kotaKabupaten}
      setOpen={setOpenKotaKabupaten}
      setValue={(val) => {
        onChange(val);
        setSelectedKabKota(val); // Atur state ketika kab/kota dipilih
      }}
      setItems={setKotaKabupaten}
      placeholder="Pilih Kota / Kabupaten"
      style={styles.dropdown}
    />
  )}
/>
            <Text style={{ color : 'black' }}>Kelurahan</Text>
          <Controller
            control={control}
            name="kelurahan_id"
            render={({ field: { onChange, value } }) => (
             <DropDownPicker
             open={openKelurahan}
             value={selectedKelurahan}
             items={kelurahan}
             setOpen={setOpenKelurahan}
             setValue={setSelectedKelurahan}
             onChangeText={onChange}
             setItems={setKelurahan}
             placeholder="Pilih Kelurahan"
             style={styles.dropdown}
             >
              
             </DropDownPicker>
            )}></Controller>
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
  textInput: {
    marginBottom: 16, // Adds space between each TextInput
  },
  text: {
    textAlign: "center",
    fontSize: 18,
    fontWeight : 'bold',
    color : 'black',
    marginVertical : 10
  },
  textField: {
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    borderColor: "#ccc",
    borderWidth: 1,
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
});

export default Perusahaan;
