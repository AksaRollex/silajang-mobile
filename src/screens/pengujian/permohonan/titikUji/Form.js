import axios from "@/src/libs/axios";
import BackButton from "@/src/screens/components/Back";
import Select2 from "@/src/screens/components/Select2";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import "moment/locale/id";
import * as React from "react";
import { memo, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Image,
} from "react-native";
import Geolocation from "react-native-geolocation-service";
import MultiSelect from "react-native-multiple-select";
import Toast from "react-native-toast-message";
import { Button, Colors, TextArea, TextField } from "react-native-ui-lib";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import MaterialIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIconss from "react-native-vector-icons/MaterialIcons";
import LottieView from "lottie-react-native";
import SectionedMultiSelect from "react-native-sectioned-multi-select";
import Icon from "react-native-vector-icons/MaterialIcons";
import { color } from "@rneui/base";
import TitikUji from "./TitikUji";

moment.locale("id");
const FormTitikUji = ({ route, navigation, formData, mapStatusPengujian }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalKintud, setModalKintud] = useState(false);
  const [modalParam, setModalParam] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [sampelData, setSampelData] = useState([]);
  const [selectedSampel, setSelectedSampel] = useState(null);
  const [openSampel, setOpenSampel] = useState(false);

  const [jenisWadah, setJenisWadah] = useState([]);
  const [selectedJenisWadah, setSelectedJenisWadah] = useState(null);
  const [openJenisWadah, setOpenJenisWadah] = useState(false);
  const [titikUji, setTitikUji] = useState(null);
  const [metode, setMetode] = useState([]);
  const [selectedMetode, setSelectedMetode] = useState(null);
  const [openMetode, setOpenMetode] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isDateSelected, setIsDateSelected] = useState(false);
  const [location, setLocation] = useState({
    latitude: "",
    longitude: "",
  });

  const [tanggalJam, setTanggalJam] = useState();
  useEffect(() => {
    setTanggalJam(new Date());
  }, []);

  const handleDateChange = (event, selectedDate) => {
    if (event.type === "set") {
      const currentDate = selectedDate || date;
      if (currentDate instanceof Date && !isNaN(currentDate)) {
        setDate(currentDate);
        setShowDatePicker(false);
        setIsDateSelected(true);
        setShowTimePicker(true);
      } else {
        console.error("Invalid date selected");
      }
    } else {
      setShowDatePicker(false);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    if (event.type === "set") {
      const currentTime = selectedTime || date;
      setDate(currentTime);
      setShowTimePicker(false);
      handleWaktu(currentTime); // Simpan setelah memilih waktu
    } else {
      setShowTimePicker(false);
    }
  };

  const handleWaktu = async selectedTime => {
    try {
      const formattedTime = moment(selectedTime).format("YYYY-MM-DD HH:mm:ss");
      const response = await axios.post(`/permohonan/titik/${uuid}/update`, {
        tanggal_pengambilan: formattedTime,
      });
      console.log("Data berhasil disimpan:", response.data);
    } catch (error) {}
  };

  const { uuid } = route.params || {};
  const { permohonan } = route.params || {};
  const queryClient = useQueryClient();

  const {
    watch,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm();

  const { data, isFetching: isLoadingData } = useQuery(
    ["permohonan", uuid],
    () =>
      axios.get(`/permohonan/titik/${uuid}/edit`).then(res => res.data.data),
    {
      enabled: !!uuid,
      onSuccess: data => {
        if (data) {
          // console.log(data.keterangan, 999);
          setDate(
            data.tanggal_pengambilan
              ? new Date(data.tanggal_pengambilan)
              : null,
          );
          setLocation({
            latitude: data.south || "",
            longitude: data.east || "",
          });
          setSelectedPayment(data.payment_type || "");
          reset({
            lokasi: data.lokasi,
            jenis_sampel_id: data.jenis_sampel_id,
            jenis_wadahs_id: data.jenis_wadahs_id,
            keterangan: data.keterangan,
            nama_pengambil: data.nama_pengambil,
            acuan_metode_id: data.acuan_metode_id,
            east: data.east,
            suhu_air: data.suhu_air,
            ph: data.ph,
            dhl: data.dhl,
            salinitas: data.salinitas,
            do: data.do,
            kekeruhan: data.kekeruhan,
            klorin_bebas: data.klorin_bebas,
            suhu_udara: data.suhu_udara,
            cuaca: data.cuaca,
            arah_angin: data.arah_angin,
            kelembapan: data.kelembapan,
            kecepatan_angin: data.kecepatan_angin,
            payment_type: data.payment_type,
            tanggal_pengambilan: data.tanggal_pengambilan,
            south: data.south,
          });
          [
            "suhu_air",
            "ph",
            "dhl",
            "salinitas",
            "do",
            "kekeruhan",
            "klorin_bebas",
            "suhu_udara",
            "cuaca",
            "arah_angin",
            "kelembapan",
            "kecepatan_angin",
          ];
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
  const [paymentTypeError, setPaymentTypeError] = useState(null);

  const handleSelectedPayment = cara => {
    setSelectedPayment(cara);
    setPaymentTypeError(null);
  };
  const { mutate: createOrUpdate, isLoading } = useMutation(
    async data => {
      if (!selectedPayment) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Silahkan pilih metode pembayaran",
        });
        return Promise.reject(new Error("Silahkan pilih metode pembayaran"));
      }
      const requestData = {
        ...data,
        payment_type: selectedPayment,
        permohonan_uuid: permohonan.uuid,
        tanggal_pengambilan: date
          ? moment(date).format("YYYY-MM-DD HH:mm:ss")
          : null,
        south: location.latitude || null,
        east: location.longitude || null,
      };

      Object.keys(requestData).forEach(
        key =>
          (requestData[key] === undefined || requestData[key] === null) &&
          delete requestData[key],
      );

      // Kirim data ke API
      const response = await axios.post(
        uuid ? `/permohonan/titik/${uuid}/update` : "/permohonan/titik/store",
        requestData,
      );

      return response.data; // Pastikan API mengembalikan data yang relevan
    },
    {
      onSuccess: data => {
        setTitikUji(data); // Simpan data titik uji di state
        setModalParam(true); // Tampilkan modal
        queryClient.invalidateQueries(["/permohonan/titik"]); // Refresh data
      },
      onError: error => {
        if (error.message !== "Silahkan pilih metode pembayaran") {
          setErrorMessage(
            error.response?.data?.message || "Gagal memperbarui data",
          );
          setErrorModalVisible(true);
          setTimeout(() => {
            setErrorModalVisible(false);
          }, 2000);
        }
      },
    },
  );

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
          title: item.nama,
          value: item.id,
        }));
        setSampelData(formattedSampelData);

        const formattedJenisWadah = wadahResponse.data.data.map(item => ({
          id: item.id,
          name: `${item.nama} (${item.keterangan || "tidak ada keterangan"})`,
        }));

        const formattedAcuanMetode = acuanMetodeResponse.data.data.map(
          item => ({
            title: item.nama,
            value: item.id,
          }),
        );
        setMetode(formattedAcuanMetode);
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
    setLoading(true);
    setModalVisible(true); // Langsung tampilkan modal setelah klik tombol

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

        setLoading(false); // Selesai loading saat koordinat didapatkan
      },
      error => {
        console.log(error.code, error.message);
        setLoading(false); // Selesai loading jika terjadi error
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  };

  const handleLocationPress = () => {
    if (Platform.OS === "android") {
      const permissionGranted = requestLocationPermission();
      if (permissionGranted) {
        getLocation();
      }
    } else {
      getLocation();
    }
  };

  if (isLoadingData && uuid) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={"#312e81"} />
      </View>
    );
  }

  return (
    <>
      {formData?.uuid && formData?.status > 2 && (
        <Text className="text-gray-500 italic">
          Tidak bisa melakukan pengeditan karena status sudah dalam{" "}
          {mapStatusPengujian(formData.status)}
        </Text>
      )}
      <FlatList
        className=" h-full rounded-lg"
        data={[{ key: "from" }]}
        renderItem={() => (
          <View className="bg-[#ececec] w-full h-full p-3 ">
            <View
              className="w-full h-full rounded-3xl bg-[#fff]"
              style={{
                elevation: 5,
                shadowColor: "rgba(0,0,0,0.1)",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 2,
              }}>
              <View className="flex-row p-3 ">
                <BackButton
                  action={() => navigation.goBack()}
                  size={30}
                  style={{
                    padding: 4,
                  }}
                  className="mr-2"
                  color={"black"}
                />
                <Text className="font-poppins-semibold text-black text-2xl mt-1 ">
                  {uuid ? "Edit" : "Tambah"} Titik Pengujian
                </Text>
              </View>
              <View className=" p-3 mb-2">
                <View className="p-3 rounded-2xl border border-stone-300">
                  <Text className="text-base font-poppins-bold text-center  text-black mb-4">
                    Detail Pengiriman
                  </Text>
                  <View className="flex-1 flex-row justify-between  ">
                    <TouchableOpacity
                      className="w-1/2 bg-[#fff] rounded-2xl py-7 px-2 m-0.5 items-center"
                      style={[selectedPayment === "va" && styles.selectedCard]}
                      onPress={() => handleSelectedPayment("va")}>
                      <MaterialIcons
                        name="cellphone-text"
                        size={50}
                        color="black"
                        style={{ marginVertical: 8 }}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="w-1/2 bg-[#fff] rounded-2xl py-7 px-2 m-0.5 items-center"
                      style={[
                        selectedPayment === "qris" && styles.selectedCard,
                      ]}
                      onPress={() => handleSelectedPayment("qris")}>
                      <MaterialIcons
                        name="qrcode"
                        size={50}
                        color="black"
                        style={{ marginVertical: 8 }}
                      />
                    </TouchableOpacity>
                  </View>
                  <Controller
                    name="lokasi"
                    rules={{ required: "Lokasi tidak boleh kosong" }}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <View className="mt-2">
                        <Text className="font-poppins-semibold mb-1 text-black">
                          Nama Lokasi / Titik Uji
                        </Text>
                        <TextField
                          className="p-3 bg-[#fff] rounded-2xl border-stone-300 border font-poppins-regular"
                          value={value}
                          placeholderTextColor={"grey"}
                          onChangeText={onChange}
                          placeholder="Masukkan Lokasi Titik Uji"
                          error={errors.lokasi?.message}
                        />
                      </View>
                    )}
                  />
                  {errors.lokasi && (
                    <Text className="text-red-500 mb-2 lowercase font-poppins-regular">
                      {errors.lokasi.message}
                    </Text>
                  )}
                  <Controller
                    name="jenis_sampel_id"
                    control={control}
                    rules={{ required: "Jenis Sampel tidak boleh kosong" }}
                    render={({ field: { onChange, value } }) => (
                      <View>
                        <Text className="font-poppins-semibold mb-1  text-black">
                          Jenis Sampel
                        </Text>

                        <View className="mb-1">
                          <Select2
                            data={sampelData}
                            onSelect={value => {
                              onChange(value);
                              setSelectedSampel(value);
                            }}
                            defaultValue={data?.jenis_sampel_id}
                            placeholder="Pilih Jenis Sampel"
                          />
                        </View>
                      </View>
                    )}
                  />
                  {errors.jenis_sampel_id && (
                    <Text className="text-red-500 mb-2 lowercase font-poppins-regular">
                      {errors.jenis_sampel_id.message}
                    </Text>
                  )}
                  <Controller
                    name="jenis_wadahs_id"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <View className="mt-1">
                        <Text className="font-poppins-semibold mb-1  text-black">
                          Jenis Wadah
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
                                backgroundColor: "#311B74",
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
                              confirmText: {
                                fontFamily: "Poppins-Regular",
                                color: "#FFF",
                              },
                              itemFontFamily: "Poppins-Regular",
                            }}
                            items={jenisWadah}
                            uniqueKey="id"
                            subKey="children"
                            onSelectedItemsChange={items => {
                              onChange(items);
                              setSelectedJenisWadah(items);
                            }}
                            selectedItems={value || []}
                            selectText="Pilih Jenis Wadah"
                            confirmText="KONFIRMASI"
                            showRemoveAll={true}
                            removeAllText="Hapus Semua"
                            modalAnimationType="fade"
                            showCancelButton={true}
                            searchPlaceholderText="Cari Jenis Wadah..."
                            onChangeInput={text => console.log(text)}
                          />
                        </View>
                      </View>
                    )}
                  />
                  <Controller
                    name="keterangan"
                    control={control}
                    defaultValue=""
                    render={({ field: { onChange, value } }) => (
                      <View>
                        <Text className="font-poppins-semibold mb-1 mt-2 text-black">
                          Keterangan
                        </Text>
                        <View className="border rounded-2xl  border-stone-300 bg-[#fff]">
                          <TextArea
                            className="p-3 bg-[#fff] rounded-2xl  border-stone-300 font-poppins-regular"
                            value={value}
                            onChangeText={onChange}
                            error={errors.keterangan?.message}
                          />
                        </View>
                      </View>
                    )}
                  />
                </View>

                {permohonan && permohonan?.is_mandiri ? (
                  <>
                    <View className=" p-3 mt-5 border rounded-2xl border-stone-300">
                      <Text className="text-base font-poppins-bold text-center  text-black mb-4">
                        Detail Pengiriman
                      </Text>
                      <Controller
                        name="nama_pengambil"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <View>
                            <Text className="font-poppins-semibold mb-1 text-black">
                              Nama Pengirim
                            </Text>

                            <TextField
                              className="p-3 bg-[#fff] rounded-2xl border-stone-300 border font-poppins-regular"
                              value={value}
                              onChangeText={onChange}
                              placeholder="Masukkan nama pengirim"
                              error={errors.nama_pengambil?.message}
                            />
                          </View>
                        )}
                      />

                      <Text className="font-poppins-semibold text-black mb-1 mt-2">
                        Tanggal/Jam Pengambilan
                      </Text>
                      <View>
                        <TouchableOpacity
                          onPress={() => setShowDatePicker(true)}>
                          <View className="flex-row items-center p-4 bg-[#fff] rounded-2xl border-stone-300 border ">
                            <Text className="text-sm flex-1 text-gray-500 font-poppins-regular">
                              {date
                                ? `${moment(date).format(
                                    "YYYY-MM-DD HH:mm:ss",
                                  )} `
                                : "Pilih Tanggal dan Waktu"}
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

                      {showDatePicker && (
                        <DateTimePicker
                          value={date || new Date()}
                          mode="date"
                          timeZoneName="Asia/Jakarta"
                          display={
                            Platform.OS === "ios" ? "spinner" : "default"
                          }
                          onChange={handleDateChange}
                        />
                      )}

                      {showTimePicker && isDateSelected && (
                        <DateTimePicker
                          value={date || new Date()}
                          mode="time"
                          timeZoneName="Asia/Jakarta"
                          display={
                            Platform.OS === "ios" ? "spinner" : "default"
                          }
                          onChange={handleTimeChange}
                        />
                      )}

                      <Controller
                        name="acuan_metode_id"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <View>
                            <Text className="font-poppins-semibold text-black mt-2">
                              Metode
                            </Text>

                            <Select2
                              data={metode}
                              onSelect={value => {
                                onChange(value);
                                setSelectedMetode(value);
                              }}
                              defaultValue={data?.acuan_metode_id}
                              placeholder="Pilih Metode"
                            />
                          </View>
                        )}
                      />
                    </View>
                    <View className=" p-3 mt-5 border rounded-2xl border-stone-300">
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
                                color="#007AFF"
                                className="mb-5 justify-center"
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

                      <Text className="font-poppins-semibold text-base text-center mb-4 text-black">
                        Lokasi Pada Koordinat
                      </Text>

                      <View className="flex-row">
                        <Controller
                          name="south"
                          control={control}
                          render={({ field: { onChange, value } }) => (
                            <View className="w-1/2 pr-2">
                              <Text className="font-poppins-semibold mb-2 text-black text-start">
                                Selatan
                              </Text>
                              <TextField
                                className="p-3 bg-[#fff] rounded-2xl border-stone-300 border font-poppins-regular"
                                placeholder="0.0"
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
                              <Text className="font-poppins-semibold mb-2 text-black ">
                                Timur
                              </Text>
                              <TextField
                                className="p-3 bg-[#fff] rounded-2xl border-stone-300 border font-poppins-regular"
                                placeholder="0.0"
                                value={location.longitude}
                                onChangeText={onChange}
                              />
                            </View>
                          )}
                        />
                      </View>
                      <TouchableOpacity
                        onPress={handleLocationPress}
                        className="w-full mt-2 p-3 rounded-2xl bg-[#007AFF]">
                        <View className="flex-row gap-4 justify-center">
                          <MaterialIconss
                            name="location-searching"
                            size={24}
                            color={"white"}
                          />
                          <Text className="text-white text-base  font-poppins-semibold text-center">
                            Tekan Untuk Mendapatkan Lokasi
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                    <View className=" p-3 mt-5 border rounded-2xl border-stone-300">
                      <Text className="text-base font-poppins-semibold text-center mb-5 text-black">
                        Hasil Pengukuran Lapangan
                      </Text>

                      <View className="flex-row flex-wrap">
                        <Controller
                          name="suhu_air"
                          control={control}
                          render={({ field: { onChange, value } }) => (
                            <View className="w-1/2 pr-2">
                              <Text className="font-poppins-semibold mb-2 text-black">
                                Suhu Air
                              </Text>
                              <TextField
                                className="p-3 rounded-2xl bg-[#fff] border-stone-300 border font-poppins-regular"
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
                              <Text className="font-poppins-semibold mb-2 text-black">
                                pH
                              </Text>
                              <TextField
                                className="p-3 rounded-2xl bg-[#fff] border-stone-300 border font-poppins-regular"
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
                              <Text className="font-poppins-semibold mb-2 text-black">
                                DHL
                              </Text>
                              <TextField
                                className="p-3 rounded-2xl bg-[#fff] border-stone-300 border font-poppins-regular"
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
                              <Text className="font-poppins-semibold mb-2 text-black">
                                Salinitas
                              </Text>

                              <TextField
                                className="p-3 rounded-2xl bg-[#fff] border-stone-300 border font-poppins-regular"
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
                              <Text className="font-poppins-semibold mb-2 text-black">
                                DO
                              </Text>

                              <TextField
                                className="p-3 rounded-2xl bg-[#fff] border-stone-300 border font-poppins-regular"
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
                              <Text className="font-poppins-semibold mb-2 text-black">
                                Kekeruhan
                              </Text>

                              <TextField
                                className="p-3 rounded-2xl bg-[#fff] border-stone-300 border font-poppins-regular"
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
                              <Text className="font-poppins-semibold mb-2 text-black">
                                Klorin Babas
                              </Text>

                              <TextField
                                className="p-3 rounded-2xl bg-[#fff] border-stone-300 border font-poppins-regular"
                                value={value}
                                onChangeText={onChange}
                              />
                            </View>
                          )}
                        />
                      </View>
                    </View>
                    <View className=" p-3 mt-5 border rounded-2xl border-stone-300">
                      <Text className="text-base font-poppins-semibold text-center mt-5 mb-5 text-black">
                        Kondisi Lingkungan
                      </Text>
                      <View className="flex-row flex-wrap">
                        <Controller
                          name="suhu_udara"
                          control={control}
                          render={({ field: { onChange, value } }) => (
                            <View className="w-1/2 pr-2">
                              <Text className="font-poppins-semibold mb-2 text-black">
                                Suhu Udara
                              </Text>

                              <TextField
                                className="p-3 rounded-2xl bg-[#fff] border-stone-300 border font-poppins-regular"
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
                            <View className="w-1/2 pl-2">
                              <Text className="font-poppins-semibold mb-2 text-black">
                                Cuaca
                              </Text>

                              <TextField
                                className="p-3 rounded-2xl bg-[#fff] border-stone-300 border font-poppins-regular"
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
                            <View className="w-1/2 pr-2">
                              <Text className="font-poppins-semibold mb-2 text-black">
                                Arah Angin
                              </Text>

                              <TextField
                                className="p-3 rounded-2xl bg-[#fff] border-stone-300 border font-poppins-regular"
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
                            <View className="w-1/2 pl-2">
                              <Text className="font-poppins-semibold mb-2 text-black">
                                Kelembapan
                              </Text>

                              <TextField
                                className="p-3 rounded-2xl bg-[#fff] border-stone-300 border font-poppins-regular"
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
                            <View className="w-1/2 pr-2">
                              <Text className="font-poppins-semibold mb-2 text-black">
                                Kecepatan Angin
                              </Text>

                              <TextField
                                className="p-3 rounded-2xl bg-[#fff] border-stone-300 border font-poppins-regular"
                                value={value}
                                onChangeText={onChange}
                              />
                            </View>
                          )}
                        />
                      </View>
                    </View>
                    <Button
                      onPress={handleSubmit(createOrUpdate)}
                      loading={isLoading}
                      className="p-3 rounded-3xl mt-4 mb-3"
                      style={{ backgroundColor: Colors.brand }}>
                      <Text className="text-white text-center text-base font-poppins-semibold">
                        SUBMIT
                      </Text>
                    </Button>
                  </>
                ) : (
                  <View></View>
                )}
              </View>
            </View>
          </View>
        )}
      />

      <Modal animationType="fade" transparent={true} visible={modalParam}>
        <View style={styles.overlayView}>
          <View style={styles.successContainer}>
            <View>
              <Image
                source={require("@/assets/images/cek.png")}
                style={styles.lottie}
              />
            </View>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 20,
              }}>
              <Text
                className="font-poppins-bold"
                style={{ color: "black", fontSize: 16, textAlign: "center" }}>
                Titik Uji sukses dibuat
              </Text>
              <Text
                className="font-poppins-regular"
                style={{ color: "black", fontSize: 16, textAlign: "center" }}>
                Lanjutkan Untuk mengisi Parameter
              </Text>
            </View>

            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <TouchableOpacity
                onPress={() => {
                  setModalParam(false);
                  navigation.navigate("TitikUji", { uuid: permohonan.uuid });
                }}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  backgroundColor: "#ffcbd1",
                  borderRadius: 5,
                  marginRight: 10,
                }}>
                <Text
                  style={{ color: "#de0a26", fontFamily: "Poppins-SemiBold" }}>
                  Tutup
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setModalParam(false);
                  if (titikUji) {
                    navigation.navigate("Parameter", {
                      uuid: titikUji?.data?.uuid,
                    });
                  }
                }}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  backgroundColor: "#ddead1",
                  borderRadius: 5,
                  marginRight: 10,
                }}>
                <Text
                  style={{ color: "#4b6043", fontFamily: "Poppins-SemiBold" }}>
                  Lanjut
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal animationType="fade" transparent={true} visible={modalKintud}>
        <View style={styles.overlayView}>
          <View style={styles.successContainer}>
            <Image
              source={require("@/assets/images/cek.png")}
              style={styles.lottie}
            />
            {/* <LottieView
              source={require("../../../../../assets/lottiefiles/success-animation.json")}
              autoPlay
              loop={false}
              style={styles.lottie}
            /> */}
            <Text style={styles.successTextTitle}>
              {uuid ? "Data berhasil di perbarui" : "Data berhasil ditambahkan"}
            </Text>
            <Text style={styles.successText}>
              Silahkan memastikan bahwa data yang anda kirim telah benar !
            </Text>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={errorModalVisible}>
        <View style={styles.overlayView}>
          <View style={[styles.successContainer, styles.errorContainer]}>
            <Image
              source={require("@/assets/images/error.png")}
              style={styles.lottie}
            />
            <Text style={[styles.successTextTitle, styles.errortitle]}>
              {uuid ? "Data gagal di perbarui" : "Data gagal ditambahkan"}
            </Text>
            <Text style={[styles.successText, styles.errorText]}>
              {errorMessage}
            </Text>
          </View>
        </View>
      </Modal>
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
  overlayView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  successContainer: {
    alignItems: "center",
    backgroundColor: "white",
    padding: 20,
    width: "90%",
    paddingVertical: 30,
    borderRadius: 10,
  },
  lottie: {
    width: 170,
    height: 170,
  },

  successTextTitle: {
    textAlign: "center",
    color: "black",
    fontSize: rem(1.5),
    fontFamily: "Poppins-Bold",
    marginBottom: rem(1.5),
    marginTop: rem(1),
    fontFamily: "Poppins-SemiBold",
  },
  successText: {
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Poppins-Regular",
    color: "black",
  },
  errortitle: {
    color: "#FF4B4B",
  },
  errorText: {
    color: "#666",
  },
});

export default memo(FormTitikUji);
