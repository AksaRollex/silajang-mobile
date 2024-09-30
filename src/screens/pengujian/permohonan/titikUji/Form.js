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

  const [selectedPayment, setSelectedPayment] = useState(null);
  const handleSelectedPayment = cara => {
    setSelectedPayment(cara);
  };
  const { mutate: createOrUpdate, isLoading } = useMutation(data => {
    const requestData = {
      payment_type: selectedPayment === "va" ? "va" : "QRIS",
    };
    axios.post(
      uuid ? `/permohonan/titik/${uuid}/update` : "/permohonan/titikuji/store",
      requestData,
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
          value: item.id,
        }));

        const formattedJenisWadah = wadahResponse.data.data.map(item => ({
          value: item.id,
        }));

        const formattedAcuanMetode = acuanMetodeResponse.data.data.map(
          item => ({
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
      <View className="w-full">
        <View
          className="flex-row mb-4 p-3 justify-between"
          style={{ backgroundColor: Colors.brand }}>
          <Back
            size={24}
            color={"white"}
            action={() => navigation.goBack()}
            className="mr-2 "
          />
          <Text className="font-bold text-white text-lg ">
            {data ? "Edit Titik Uji" : "Tambah Titik Pengujian"}
          </Text>
        </View>
      </View>

      <ScrollView className="bg-[#ececec] w-full h-full px-3 py-1">
        <View className="bg-[#f8f8f8] py-4 px-3 rounded-md mb-20">
          <Text className="text-base font-bold text-center  text-black">
            Detail Pengiriman
          </Text>
          <View className="flex-1 flex-row justify-between my-2 ">
            <TouchableOpacity
              className="w-1/2 bg-[#fff] rounded-sm py-12 px-2 m-0.5 items-center"
              style={[selectedPayment === "va" && styles.selectedCard]}
              onPress={() => handleSelectedPayment("va")}>
              <MaterialIcons
                name="cellphone-text"
                size={50}
                color="black"
                className="my-2"
              />
              <Text className="text-black font-bold text-lg text-center">
                Virtual Account
              </Text>
              <Text className="text-black text-justify">
                Transfer melalui Virtual Account Bank Jatim
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="w-1/2 bg-[#fff] rounded-sm py-12 px-2   m-0.5 items-center"
              style={[selectedPayment === "qris" && styles.selectedCard]}
              onPress={() => handleSelectedPayment("qris")}>
              <MaterialIcons
                name="barcode"
                size={50}
                color="black"
                className="my-2"
              />
              <Text className="text-black font-bold text-lg text-center">
                QRIS
              </Text>
              <Text className="text-black text-justify">
                Scan dan bayar melalui QRIS
              </Text>
            </TouchableOpacity>
          </View>

          <Controller
            name="lokasi"
            control={control}
            render={({ field: { onChange, value } }) => (
              <View>
                <Text className="font-sans font-bold mb-2 text-black">
                  Nama Lokasi / Titik Uji
                </Text>
                <TextField
                  className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-sans"
                  value={value}
                  onChangeText={onChange}
                  error={errors.lokasi?.message}
                />
              </View>
            )}
          />

          <Controller
            name="jenis_sampel_id"
            control={control}
            render={({ field: { onChange, value } }) => (
              <View>
                <Text className="font-sans font-bold mb-2 text-black">
                  Jenis Sampel
                </Text>

                <DropDownPicker
                  className="p-2 bg-[#fff] rounded-sm border-stone-300 font-sans border-0"
                  open={openSampel}
                  value={value}
                  items={sampelData}
                  setOpen={setOpenSampel}
                  setValue={onChange}
                  nestedScrollEnabled={true}
                  setItems={setSampelData}
                />
              </View>
            )}
          />
          <Controller
            name="jenis_wadahs_id"
            control={control}
            render={({ field: { onChange, value } }) => (
              <View>
                <Text className="font-sans font-bold mb-2 text-black">
                  Jenis Wadah
                </Text>

                <DropDownPicker
                  className="p-2 bg-[#fff] rounded-sm border-stone-300 border-0 font-sans text-black"
                  nestedScrollEnabled={true}
                  open={openJenisWadah}
                  value={value}
                  items={jenisWadah}
                  setOpen={setOpenJenisWadah}
                  setValue={onChange}
                  setItems={setJenisWadah}
                />
              </View>
            )}
          />

          <Controller
            name="keterangan"
            control={control}
            render={({ field: { onChange, value } }) => (
              <View>
                <Text className="font-sans font-bold mb-2 text-black">
                  Keterangan
                </Text>
                <TextField
                  className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-sans"
                  value={value}
                  onChangeText={onChange}
                  error={errors.keterangan?.message}
                />
              </View>
            )}
          />

          <Text className="text-base font-bold text-center my-5 text-black">
            Detail Pengiriman
          </Text>
          {/* {permohonan && permohonan.is_mandiri && (
            <> */}
          <Controller
            name="nama_pengambil"
            control={control}
            render={({ field: { onChange, value } }) => (
              <View>
                <Text className="font-sans font-bold mb-2 text-black">
                  Nama Pengirim
                </Text>

                <TextField
                  className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-sans"
                  value={value}
                  onChangeText={onChange}
                  error={errors.nama_pengambil?.message}
                />
              </View>
            )}
          />

          <TouchableOpacity onPress={() => setShowDateTimePicker(true)}>
            <Controller
              name="tanggal_pengambilan"
              control={control}
              render={({ field: { onChange, value } }) => (
                <View>
                  <Text className="font-sans font-bold mb-2 text-black">
                    Tanggal Pengambilan
                  </Text>
                  <TextField
                    className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-sans"
                    value={tanggalJam.toLocaleString()}
                    editable={false}
                    color="black"
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
          </TouchableOpacity>

          <Controller
            name="acuan_metode_id"
            control={control}
            render={({ field: { onChange, value } }) => (
              <View>
                <Text className="font-sans font-bold mb-2 text-black">
                  Metode
                </Text>

                <DropDownPicker
                  className="p-2 bg-[#fff] rounded-sm border-stone-300 border-0 font-sans"
                  open={openMetode}
                  value={value}
                  items={metode}
                  setOpen={setOpenMetode}
                  setValue={onChange}
                  nestedScrollEnabled={true}
                  setItems={setMetode}
                  style={styles.dropdown}
                />
              </View>
            )}
          />

          <Text className="text-base font-bold text-center my-5 text-black">
            Detail Lokasi
          </Text>

          <View className="flex-row justify-between">
            <Controller
              name="south"
              control={control}
              render={({ field: { onChange, value } }) => (
                <View className="w-1/2 pr-2">
                  <Text className="font-sans font-bold mb-2 text-black text-start">
                    South
                  </Text>
                  <TextField
                    className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-sans"
                    placeholder={value}
                    value={location.latitude}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />

            <Controller
              name="east"
              control={control}
              render={({ field: { onChange, value } }) => (
                <View className="w-1/2 pl-2">
                  <Text className="font-sans font-bold mb-2 text-black text-right">
                    East
                  </Text>
                  <TextField
                    className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-sans"
                    placeholder={value}
                    value={location.longitude}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
          </View>
          <TouchableOpacity
            onPress={handleLocationPress}
            className="w-full p-3 rounded-sm "
            style={{
              backgroundColor: Colors.brand,
            }}>
            <Text className="text-white text-base font-bold text-center">
              Gunakan Lokasi Saat Ini
            </Text>
          </TouchableOpacity>

          <Text className="text-base font-bold text-center my-5 text-black">
            Hasil Pengukuran Lapangan
          </Text>

          <View className="flex-row flex-wrap">
            <Controller
              name="suhu_air"
              control={control}
              render={({ field: { onChange, value } }) => (
                <View className="w-1/2 pr-2">
                  <Text className="font-sans font-bold mb-2 text-black">
                    Suhu Air
                  </Text>
                  <TextField
                    className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-sans"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />

            <Controller
              name="ph"
              control={control}
              render={({ field: { onChange, value } }) => (
                <View className="w-1/2 pl-2">
                  <Text className="font-sans font-bold mb-2 text-black">
                    pH
                  </Text>
                  <TextField
                    className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-sans"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
            <Controller
              name="dhl"
              control={control}
              render={({ field: { onChange, value } }) => (
                <View className="w-1/2 pr-2">
                  <Text className="font-sans font-bold mb-2 text-black">
                    DHL
                  </Text>
                  <TextField
                    className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-sans"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
            <Controller
              name="salinitas"
              control={control}
              render={({ field: { onChange, value } }) => (
                <View className="w-1/2 pl-2">
                  <Text className="font-sans font-bold mb-2 text-black">
                    Salinitas
                  </Text>

                  <TextField
                    className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-sans"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
            <Controller
              name="do"
              control={control}
              render={({ field: { onChange, value } }) => (
                <View className="w-1/2 pr-2">
                  <Text className="font-sans font-bold mb-2 text-black">
                    DO
                  </Text>

                  <TextField
                    className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-sans"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />

            <Controller
              name="kekeruhan"
              control={control}
              render={({ field: { onChange, value } }) => (
                <View className="w-1/2 pl-2">
                  <Text className="font-sans font-bold mb-2 text-black">
                    Kekeruhan
                  </Text>

                  <TextField
                    className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-sans"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />

            <Controller
              name="klorin_bebas"
              control={control}
              render={({ field: { onChange, value } }) => (
                <View className="w-1/2 pr-2">
                  <Text className="font-sans font-bold mb-2 text-black">
                    Klorin Babas
                  </Text>

                  <TextField
                    className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-sans"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />

            <Controller
              name="suhu_udara"
              control={control}
              render={({ field: { onChange, value } }) => (
                <View className="w-1/2 pl-2">
                  <Text className="font-sans font-bold mb-2 text-black">
                    Suhu Udara
                  </Text>

                  <TextField
                    className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-sans"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />

            <Controller
              name="cuaca"
              control={control}
              render={({ field: { onChange, value } }) => (
                <View className="w-1/2 pr-2">
                  <Text className="font-sans font-bold mb-2 text-black">
                    Cuaca
                  </Text>

                  <TextField
                    className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-sans"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />

            <Controller
              name="arah_angin"
              control={control}
              render={({ field: { onChange, value } }) => (
                <View className="w-1/2 pl-2">
                  <Text className="font-sans font-bold mb-2 text-black">
                    Arah Angin
                  </Text>

                  <TextField
                    className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-sans"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />

            <Controller
              name="kelembapan"
              control={control}
              render={({ field: { onChange, value } }) => (
                <View className="w-1/2 pr-2">
                  <Text className="font-sans font-bold mb-2 text-black">
                    Kelembapan
                  </Text>

                  <TextField
                    className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-sans"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />

            <Controller
              name="kecepatan_angin"
              control={control}
              render={({ field: { onChange, value } }) => (
                <View className="w-1/2 pl-2">
                  <Text className="font-sans font-bold mb-2 text-black">
                    Kecepatan Angin
                  </Text>

                  <TextField
                    className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-sans"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
              )}
            />
            {/* </>
          )} */}
          </View>

          <Button
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            className="p-2 rounded-sm mt-4"
            style={{ backgroundColor: Colors.brand }}>
            <Text className="text-white text-center text-base font-bold font-sans">
              SUBMIT
            </Text>
          </Button>
        </View>
      </ScrollView>
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
  selectedCard: {
    backgroundColor: "#C5CAE9",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#5C6BC0",
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
