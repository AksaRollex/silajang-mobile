import * as React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
  PermissionsAndroid,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import axios from "@/src/libs/axios";
import { useForm, Controller } from "react-hook-form";
import { Button, Colors, TextField } from "react-native-ui-lib";
import Header from "@/src/screens/components/Header";
import Back from "@/src/screens/components/Back";
import DropDownPicker from "react-native-dropdown-picker";
import Geolocation from "react-native-geolocation-service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { memo, useEffect } from "react";
import { useState } from "react";
import MaterialIcons from "react-native-vector-icons/MaterialCommunityIcons";

const FormTitikUji = ({ route, navigation, props }) => {
  const [sampelData, setSampelData] = useState([]);
  const [selectedSampel, setSelectedSampel] = useState(null);
  const [openSampel, setOpenSampel] = useState(false);

  const [jenisWadah, setJenisWadah] = useState([]);
  const [selectedJenisWadah, setSelectedJenisWadah] = useState(null);
  const [openJenisWadah, setOpenJenisWadah] = useState(false);

  const [metode, setMetode] = useState([]);
  const [selectedMetode, setSelectedMetode] = useState(null);
  const [openMetode, setOpenMetode] = useState(false);

  const { uuid } = route.params || {};
  // const { permohonan } = props;

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  const queryClient = useQueryClient();

  const { data, isLoading: isLoadingData } = useQuery(
    ["permohonan", uuid],
    () =>
      axios.get(`/permohonan/titik/${uuid}/edit`).then(res => res.data.data),
    {
      enabled: !!uuid,
      // MENAMPILKAN DATA -> REQUEST DATA YANG DI TAMPILKAN
      onSuccess: data => {
        if (data) {
          setValue("lokasi", data.lokasi);
          setValue("jenis_sampel_id", data.jenis_sampel_id);
          setValue("jenis_wadahs_id", data.jenis_wadahs_id);
          setValue("keterangan", data.keterangan);
          setValue("nama_pengambil", data.nama_pengambil);
          setValue("tanggal_pengambilan", data.tanggal_pengambilan);
          setValue("acuan_metode_id", data.acuan_metode_id);
          setValue("south", data.south);
          setValue("east", data.east);
          setValue("suhu_air", data.lapangan.suhu_air);
          setValue("ph", data.lapangan.ph);
          setValue("dhl", data.lapangan.dhl);
          setValue("salinitas", data.lapangan.salinitas);
          setValue("do", data.lapangan.do);
          setValue("kekeruhan", data.lapangan.kekeruhan);
          setValue("klorin_bebas", data.lapangan.klorin_bebas);
          setValue("suhu_udara", data.lapangan.suhu_udara);
          setValue("cuaca", data.lapangan.cuaca);
          setValue("arah_angin", data.lapangan.arah_angin);
          setValue("kelembapan", data.lapangan.kelembapan);
          setValue("kecepatan_angin", data.lapangan.kecepatan_angin);
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

  const { mutate: createOrUpdate, isLoading } = useMutation(data => {
    axios.post(
      uuid ? `/permohonan/titik/${uuid}/update` : "/permohonan/titikuji/store",
      data,
    ),
      {
        onSuccess: () => {
          Toast.show({
            type: "success",
            text1: "Success",
            text2: "Data updated successfully",
          });
          navigation.navigate("Permohonan");
        },
        onError: error => {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: error.response?.data?.message || "Failed to update data",
          });
          console.error(error.response?.data || error);
        },
      };
  });

  if (isLoadingData && uuid) {
    return (
      <View className-="h-full flex justify-center items-center">
        <ActivityIndicator size="large" color={"#312e81"} />
      </View>
    );
  }
  const onSubmit = data => {
    createOrUpdate(data);
  };

  // DATETIME PICKER
  const [tanggalJam, setTanggalJam] = useState(new Date());
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);

  const handleDateTimeChange = (event, selectedDate) => {
    if (event.type === "dismissed") {
      setShowDateTimePicker(false);
      return;
    }

    const currentDate = selectedDate || tanggalJam;
    setShowDateTimePicker(false);
    setTanggalJam(currentDate);
  };

  // LOCATION STATE
  const [location, setLocation] = useState({
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sampelResponse, wadahResponse, acuanMetodeResponse] =
          await Promise.all([
            axios.get("/master/jenis-sampel"),
            axios.get("/master/jenis-wadah"),
            axios.get("/master/acuan-metode"),
          ]);

        const formattedSampelData = sampelResponse.data.data.map(item => ({
          label: item.nama,
          value: item.id,
        }));

        const formattedJenisWadah = wadahResponse.data.data.map(item => ({
          label: item.nama,
          value: item.id,
        }));

        const formattedAcuanMetode = acuanMetodeResponse.data.data.map(
          item => ({
            label: item.nama,
            value: item.id,
          }),
        );

        setSampelData(formattedSampelData);
        setJenisWadah(formattedJenisWadah);
        setMetode(formattedAcuanMetode);
      } catch (error) {
        console.error("Error fetching data :", error);
      }
    };

    fetchData();
  }, []);

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
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
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

  return (
    <>
      <Header />

      <View className="bg-[#ececec] w-full h-full p-7">
        <Back />

        <ScrollView>
          <Text className="text-lg font-bold my-4 text-black">
            {data ? "Edit Titik Uji" : "Tambah Titik Pengujian"}
          </Text>

          <View className="flex-1 flex-row justify-between ">
            <View className="w-44 h-48 bg-gray-700 rounded-lg p-4 items-center">
              <MaterialIcons
                name="cellphone-text"
                size={50}
                color="black"
                className="my-2"
              />
              <Text className="text-white font-bold text-lg text-center">
                Virtual Account
              </Text>
              <Text className="text-white text-justify">
                Transfer melalui Virtual Account Bank Jatim
              </Text>
            </View>
            <View className="w-44 h-48 bg-gray-700 rounded-lg p-4 items-center">
              <MaterialIcons
                name="barcode"
                size={50}
                color="black"
                className="my-2"
              />
              <Text className="text-white font-bold text-lg text-center">
                QRIS
              </Text>
              <Text className="text-white text-justify">
                Scan dan bayar melalui QRIS
              </Text>
            </View>
          </View>

          <Text className="text-black  mt-2">Nama Lokasi / Titik Uji</Text>
          <Controller
            name="lokasi"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextField
                className="p-3 mt-2 bg-[#bebcbc] rounded-md"
                value={value}
                onChangeText={onChange}
                error={errors.lokasi?.message}
              />
            )}
          />

          <Text className="text-black">Jenis Sampel</Text>
          <Controller
            name="jenis_sampel_id"
            control={control}
            render={({ field: { onChange, value } }) => (
              <DropDownPicker
                className="p-3 mt-2 bg-[#bebcbc] rounded-md"
                open={openSampel}
                value={value}
                items={sampelData}
                setOpen={setOpenSampel}
                setValue={onChange}
                setItems={setSampelData}
                style={styles.dropdown}
              />
            )}
          />
          <Text className="text-black mt-2">Jenis Wadah</Text>
          <Controller
            name="jenis_wadahs_id"
            control={control}
            render={({ field: { onChange, value } }) => (
              <DropDownPicker
                className="p-3 mt-2 bg-[#bebcbc] rounded-md"
                open={openJenisWadah}
                value={value}
                label="Jenis Wadah"
                items={jenisWadah}
                setOpen={setOpenJenisWadah}
                setValue={onChange}
                setItems={setJenisWadah}
                style={styles.dropdown}
              />
            )}
          />

          <Controller
            name="keterangan"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextField
                className="p-3 mt-2 bg-[#bebcbc] rounded-md"
                value={value}
                label="Keterangan"
                onChangeText={onChange}
                error={errors.keterangan?.message}
              />
            )}
          />

          <Text className="text-base font-bold text-center my-5">
            Detail Pengiriman
          </Text>
          {/* {permohonan && permohonan.is_mandiri && (
            <> */}
          <Controller
            name="nama_pengambil"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextField
                className="p-3 mt-2 bg-[#bebcbc] rounded-md"
                value={value}
                label="Nama Pengirim"
                onChangeText={onChange}
                error={errors.nama_pengambil?.message}
              />
            )}
          />

          <TouchableOpacity onPress={() => setShowDateTimePicker(true)}>
            <Controller
              name="tanggal_pengambilan"
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextField
                  className="p-3 mt-2 bg-[#bebcbc] rounded-md"
                  label="Tanggal / Jam Pengirim"
                  value={tanggalJam.toLocaleString()}
                  editable={false}
                  color="black"
                  onChangeText={onChange}
                />
              )}
            />
          </TouchableOpacity>

          <Text className="text-black"> Metode</Text>
          <Controller
            name="acuan_metode_id"
            control={control}
            render={({ field: { onChange, value } }) => (
              <DropDownPicker
                className="p-3 mt-2 bg-[#bebcbc] rounded-md"
                open={openMetode}
                value={value}
                items={metode}
                label="Metode"
                setOpen={setOpenMetode}
                setValue={onChange}
                setItems={setMetode}
                style={styles.dropdown}
              />
            )}
          />

          <Text className="text-base font-bold text-center my-5">
            Detail Lokasi
          </Text>

          <Controller
            name="south"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextField
                className="p-3 mt-2 bg-[#bebcbc] rounded-md"
                label="South"
                placeholder={value}
                value={location.latitude}
                onChangeText={onChange}
              />
            )}
          />

          <Controller
            name="east"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextField
                className="p-3 mt-2 bg-[#bebcbc] rounded-md"
                label="East"
                placeholder={value}
                value={location.longitude}
                onChangeText={onChange}
              />
            )}
          />

          <TouchableOpacity
            onPress={handleLocationPress}
            className="w-full h-10 bg-slate-500 rounded-md flex-1"
            style={{
              justifyContent: "center",
              alignItems: "center",
            }}>
            <Text className="text-white text-base font-bold">
              Gunakan Lokasi Saat Ini
            </Text>
          </TouchableOpacity>

          <Text className="text-base font-bold text-center my-5">
            Hasil Pengukuran Lapangan
          </Text>

          <Controller
            name="suhu_air"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextField
                className="p-3 mt-2 bg-[#bebcbc] rounded-md"
                label="Suhu Air (t°C)"
                value={value}
                onChangeText={onChange}
              />
            )}
          />

          <Controller
            name="ph"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextField
                className="p-3 mt-2 bg-[#bebcbc] rounded-md"
                label="pH"
                value={value}
                onChangeText={onChange}
              />
            )}
          />

          <Controller
            name="dhl"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextField
                className="p-3 mt-2 bg-[#bebcbc] rounded-md"
                label="DHL (µS/cm)"
                value={value}
                onChangeText={onChange}
              />
            )}
          />

          <Controller
            name="salinitas"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextField
                className="p-3 mt-2 bg-[#bebcbc] rounded-md"
                label="Salinitas (‰)"
                value={value}
                onChangeText={onChange}
              />
            )}
          />

          <Controller
            name="do"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextField
                className="p-3 mt-2 bg-[#bebcbc] rounded-md"
                label="DO (mg/L)"
                value={value}
                onChangeText={onChange}
              />
            )}
          />

          <Controller
            name="kekeruhan"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextField
                className="p-3 mt-2 bg-[#bebcbc] rounded-md"
                label="Kekeruhan"
                value={value}
                onChangeText={onChange}
              />
            )}
          />

          <Controller
            name="klorin_bebas"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextField
                className="p-3 mt-2 bg-[#bebcbc] rounded-md"
                label="Klorin Bebas"
                value={value}
                onChangeText={onChange}
              />
            )}
          />

          <Controller
            name="suhu_udara"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextField
                className="p-3 mt-2 bg-[#bebcbc] rounded-md"
                label="Suhu Udara (t°C)"
                value={value}
                onChangeText={onChange}
              />
            )}
          />

          <Controller
            name="cuaca"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextField
                className="p-3 mt-2 bg-[#bebcbc] rounded-md"
                label="Cuaca"
                value={value}
                onChangeText={onChange}
              />
            )}
          />

          <Controller
            name="arah_angin"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextField
                className="p-3 mt-2 bg-[#bebcbc] rounded-md"
                label="Arah Angin"
                value={value}
                onChangeText={onChange}
              />
            )}
          />

          <Controller
            name="kelembapan"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextField
                className="p-3 mt-2 bg-[#bebcbc] rounded-md"
                label="Kelembapan (%RH)"
                value={value}
                onChangeText={onChange}
              />
            )}
          />

          <Controller
            name="kecepatan_angin"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextField
                className="p-3 mt-2 bg-[#bebcbc] rounded-md"
                label="Kecepatan Angin"
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {/* </>
          )} */}

          <Button
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            className="p-3 rounded-lg my-4 mb-28"
            style={{ backgroundColor: Colors.brand }}>
            <Text className="text-white text-center text-lg font-bold font-sans">
              Simpan Data
            </Text>
          </Button>
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#ececec",
  },

  backButton: {
    padding: 10,
    backgroundColor: "#6b7fde",
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  datePickerButton: {
    padding: 10,
    backgroundColor: "#6b7fde",
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 16,
  },
  datePickerText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  submitButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    backgroundColor: Colors.brand,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default memo(FormTitikUji);
