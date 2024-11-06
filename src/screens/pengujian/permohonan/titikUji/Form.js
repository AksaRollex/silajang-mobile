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
} from "react-native";
import Geolocation from "react-native-geolocation-service";
import MultiSelect from "react-native-multiple-select";
import Toast from "react-native-toast-message";
import { Button, Colors, TextField } from "react-native-ui-lib";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import MaterialIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIconss from "react-native-vector-icons/MaterialIcons";
import { TextArea } from "react-native-ui-lib";

moment.locale("id");
const FormTitikUji = ({ route, navigation, formData, mapStatusPengujian }) => {
  const [sampelData, setSampelData] = useState([]);
  const [selectedSampel, setSelectedSampel] = useState(null);
  const [openSampel, setOpenSampel] = useState(false);

  const [jenisWadah, setJenisWadah] = useState([]);
  const [selectedJenisWadah, setSelectedJenisWadah] = useState(null);
  const [openJenisWadah, setOpenJenisWadah] = useState(false);
  const [loading, setLoading] = useState(false);
  const [metode, setMetode] = useState([]);
  const [selectedMetode, setSelectedMetode] = useState(null);
  const [openMetode, setOpenMetode] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const [date, setDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isDateSelected, setIsDateSelected] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [location, setLocation] = useState({
    latitude: "",
    longitude: "",
  });

  const [tanggalJam, setTanggalJam] = useState();
  useEffect(() => {
    if (data && data.tanggal_pengambilan) {
      setDate(new Date(data.tanggal_pengambilan));
    }
  }, [data]);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      setIsDateSelected(true);
      setShowTimePicker(true); // Menampilkan time picker setelah tanggal dipilih
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime && date) {
      // Gabungkan tanggal dan waktu yang dipilih
      const updatedDate = new Date(date);
      updatedDate.setHours(selectedTime.getHours());
      updatedDate.setMinutes(selectedTime.getMinutes());
      setDate(updatedDate);

      // Set nilai ke form state melalui setValue agar validasi bekerja
      setValue("tanggal_pengambilan", updatedDate);
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

  const handleCardPress = card => {
    setSelectedCard(card);
  };

  const { uuid } = route.params || {};
  const { permohonan } = route.params || {};

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
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
          setDate(new Date(data.tanggal_pengambilan));
          (location.latitude = data.south),
            (location.longitude = data.east),
            setSelectedPayment(data.payment_type);
          reset({
            lokasi: data.lokasi,
            tanggal_pengambilan: data.tanggal_pengambilan, // Tambahkan tanggal_pengambilan
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

  console.log(data);

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentTypeError, setPaymentTypeError] = useState(null);

  const handleSelectedPayment = cara => {
    setSelectedPayment(cara);
    setPaymentTypeError(null);
  };

  const { mutate: createOrUpdate, isLoading } = useMutation(
    data => {
      const errors = [];

      // Collect all validation errors
      if (!selectedPayment) {
        errors.push("Metode pembayaran");
      }
      if (!date) {
        errors.push("Tanggal");
      }

      // Show combined error message if there are validation errors
      if (errors.length > 0) {
        const errorMessage = `${errors.join(" & ")} harus diisi`;
        Toast.show({
          type: "error",
          text1: "Error",
          text2: errorMessage,
        });
        return Promise.reject(new Error(errorMessage));
      }

      const requestData = {
        payment_type: selectedPayment === "va" ? "va" : "qris",
        ...data,
        permohonan_uuid: permohonan.uuid,
        tanggal_pengambilan: date
          ? moment(date).format("YYYY-MM-DD HH:mm:ss")
          : null,
        south: location.latitude,
        east: location.longitude,
      };

      return axios.post(
        uuid ? `/permohonan/titik/${uuid}/update` : "/permohonan/titik/store",
        requestData,
      );
    },
    {
      onSuccess: () => {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: uuid
            ? "Data updated successfully"
            : "Data created successfully",
        });
        queryClient.invalidateQueries(["/permohonan/titik"]);
        navigation.navigate("TitikUji", { uuid: permohonan.uuid });
      },
      onError: error => {
        // Hanya tampilkan toast error dari server jika bukan error validasi form
        if (!error.message?.includes("harus diisi")) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2:
              error.message?.data?.message ||
              "mohon lengkapi data yang di wajibkan",
          });
        }
      },
    },
  );

  const onSubmit = data => {
    let requestData = {
      ...data,
      permohonan_uuid: permohonan.uuid,
      south: location.latitude,
      east: location.longitude,
    };

    if (permohonan && permohonan.is_mandiri) {
      if (date) {
        requestData.tanggal_pengambilan = moment(date).format(
          "YYYY-MM-DD HH:mm:ss",
        );
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Tanggal pengambilan harus diisi",
        });
        return;
      }
    }

    createOrUpdate(requestData, {
      onError: error => {
        console.error("Form submission error:", error);
      },
    });
  };

  const handleDateTimeChange = (event, selectedDate) => {
    if (event.type === "dismissed") {
      setShowDatePicker(false);
      return;
    }

    const currentDate = selectedDate || tanggalJam;
    setShowDatePicker(false);
    setTanggalJam(currentDate);
  };

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
          label: item.nama,
        }));

        const formattedJenisWadah = wadahResponse.data.data.map(item => ({
          id: item.id,
          name: `${item.nama} (${item.keterangan || "tidak ada keterangan"})`,
        }));

        const formattedAcuanMetode = acuanMetodeResponse.data.data.map(
          item => ({
            value: item.id,
            label: item.nama,
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
    setLoading(true);
    Geolocation.getCurrentPosition(
      position => {
        const latitude = position.coords.latitude.toString();
        const longitude = position.coords.longitude.toString();

        setLocation({
          latitude,
          longitude,
        });

        // Set form values
        setValue("south", latitude);
        setValue("east", longitude);

        setModalVisible(true);
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
    setModalVisible(true);
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
      <View className="p-2 bg-[#ececec] w-full h-full">
        <FlatList
          className="bg-[#ececec] h-full px-1 py-1"
          data={[{ key: "from" }]}
          renderItem={() => (
            <View className="bg-[#f8f8f8] p-2 rounded-md ">
              <View className="flex-row items-center justify-between mb-2 ">
                <BackButton
                  action={() => navigation.goBack()}
                  size={24}
                  color={"black"}
                />
                <Text className="text-lg font-poppins-semibold text-black">
                  {uuid ? "Edit" : "Tambah"} Titik Pengujian
                </Text>
              </View>
              {formData?.uuid && formData?.status > 2 && (
                <Text className="text-gray-500 italic">
                  Tidak bisa melakukan pengeditan karena status sudah dalam{" "}
                  {mapStatusPengujian(formData.status)}
                </Text>
              )}
              <View className="p-2 border-slate-600 border my-2 rounded-md">
                <Text className="text-base font-poppins-semibold text-center mt-2 mb-4 text-black">
                  Detail Pembayaran
                </Text>
                <View className="flex-1 flex-row justify-between ">
                  <Controller
                    name="paymentMethod"
                    control={control}
                    rules={{ required: "Metode pembayaran tidak boleh kosong" }}
                    render={({ field: { onChange } }) => (
                      <View className="flex-1 flex-row justify-between">
                        <TouchableOpacity
                          className="w-1/2 bg-[#fff] rounded-sm py-12 px-2 m-0.5 items-center"
                          style={[
                            selectedPayment === "va" && styles.selectedCard,
                          ]}
                          onPress={() => {
                            handleSelectedPayment("va");
                            onChange("va");
                          }}>
                          <MaterialIcons
                            name="cellphone-text"
                            size={50}
                            color="black"
                            style={{ marginVertical: 8 }}
                          />
                          <Text className="text-black font-poppins-semibold text-lg text-center">
                            Virtual Account
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          className="w-1/2 bg-[#fff] rounded-sm py-12 px-2 m-0.5 items-center"
                          style={[
                            selectedPayment === "qris" && styles.selectedCard,
                          ]}
                          onPress={() => {
                            handleSelectedPayment("qris");
                            onChange("qris");
                          }}>
                          <MaterialIconss
                            name="qr-code-2"
                            size={50}
                            color="black"
                            style={{ marginVertical: 8 }}
                          />
                          <Text className="text-black font-poppins-semibold text-lg text-center">
                            QRIS
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                </View>

                {errors.paymentMethod && (
                  <Text className="text-red-500 mt-2">
                    {errors.paymentMethod.message}
                  </Text>
                )}

                <Controller
                  name="lokasi"
                  control={control}
                  rules={{ required: "Lokasi harus diisi" }}
                  render={({ field: { onChange, value } }) => (
                    <View>
                      <Text className="font-poppins-semibold  mb-2 mt-4 text-black">
                        Nama Lokasi / Titik Uji
                      </Text>
                      <TextField
                        className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-poppins-regular"
                        value={value}
                        placeholder="Masukkan Nama Lokasi"
                        onChangeText={onChange}
                        error={errors.lokasi?.message}
                      />
                    </View>
                  )}
                />
                {errors.lokasi && (
                  <Text
                    style={{ color: "red", fontFamily: "Poppins-Regular" }}
                    className="">
                    {errors.lokasi.message}
                  </Text>
                )}

                <Controller
                  name="jenis_sampel_id"
                  control={control}
                  rules={{ required: "Jenis Sampel harus diisi" }}
                  render={({ field: { onChange, value } }) => (
                    <View>
                      <Text className="font-poppins-semibold  text-black">
                        Jenis Sampel
                      </Text>

                      <Select2
                        onChangeValue={value => {
                          onChange(value);
                          setSelectedSampel(value);
                        }}
                        value={value}
                        items={sampelData}
                        placeholder={{ label: "Pilih Jenis Sampel" }}
                      />
                    </View>
                  )}
                />
                {errors.jenis_sampel_id && (
                  <Text
                    style={{ color: "red", fontFamily: "Poppins-Regular" }}
                    className="-mt-2">
                    {errors.jenis_sampel_id.message}
                  </Text>
                )}

                <Controller
                  name="jenis_wadahs_id"
                  control={control}
                  rules={{ required: "Jenis Wadah harus diisi" }}
                  render={({ field: { onChange, value } }) => (
                    <View>
                      <Text className="font-poppins-semibold  mb-2 text-black">
                        Jenis Wadah
                      </Text>

                      <MultiSelect
                        hideTags
                        items={jenisWadah}
                        uniqueKey="id"
                        onSelectedItemsChange={items => {
                          onChange(items);
                          setSelectedJenisWadah(items);
                        }}
                        selectedItems={value || []}
                        selectText="  Pilih Jenis Wadah"
                        searchInputPlaceholderText="Cari Jenis Wadah..."
                        onChangeInput={text => console.log(text)}
                        style={{
                          fontFamily: "Poppins-Regular",
                        }}
                        tagRemoveIconColor="#CCC"
                        tagTextColor="#CCC"
                        selectedItemTextColor="#CCC"
                        selectedItemIconColor="#CCC"
                        itemTextColor="#000"
                        displayKey="name"
                        searchInputStyle={{
                          color: "#CCC",
                          fontFamily: "Poppins-Regular",
                        }}
                        submitButtonColor="#311B74"
                        submitButtonText="Pilih Wadah"
                      />
                    </View>
                  )}
                />
                {errors.jenis_wadahs_id && (
                  <Text
                    style={{ color: "red", fontFamily: "Poppins-Regular" }}
                    className="-mt-2">
                    {errors.jenis_wadahs_id.message}
                  </Text>
                )}

                <Controller
                  name="keterangan"
                  control={control}
                  rules={{ required: "Keterangan harus diisi" }}
                  render={({ field: { onChange, value } }) => (
                    <View>
                      <Text className="font-poppins-semibold  mb-2 text-black">
                        Keterangan
                      </Text>
                      <View className="border border-stone-300 bg-[#fff]">
                        <TextArea
                          className=" bg-[#fff] rounded-sm font-poppins-regular"
                          value={value}
                          placeholder="Masukkan Keterangan"
                          onChangeText={onChange}
                          error={errors.keterangan?.message}
                        />
                      </View>
                    </View>
                  )}
                />
                {errors.keterangan && (
                  <Text
                    style={{ color: "red", fontFamily: "Poppins-Regular" }}
                    className="">
                    {errors.keterangan.message}
                  </Text>
                )}
              </View>

              {permohonan && permohonan?.is_mandiri ? (
                <>
                  <View className="border p-2 border-slate-slate-600 my-2 rounded-md">
                    <Text className="text-base font-bold text-center mb-4  rounded-md text-black">
                      Detail Pengiriman
                    </Text>
                    <Controller
                      name="nama_pengambil"
                      control={control}
                      rules={{ required: "Nama tidak boleh kosong" }}
                      render={({ field: { onChange, value } }) => (
                        <View>
                          <Text className="font-poppins-semibold  mb-2 text-black">
                            Nama Pengirim
                          </Text>

                          <TextField
                            className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-poppins-regular"
                            value={value}
                            placeholder="Masukkan Nama Pengirim"
                            onChangeText={onChange}
                            error={errors.nama_pengambil?.message}
                          />
                        </View>
                      )}
                    />
                    {errors.nama_pengambil && (
                      <Text
                        style={{ color: "red", fontFamily: "Poppins-Regular" }}
                        className="">
                        {errors.nama_pengambil.message}
                      </Text>
                    )}

                    <Text className="text-sans font-poppins-semibold text-black mb-2">
                      Tanggal /Jam Pengambilan
                    </Text>
                    <Controller
                      name="tanggal_pengambilan"
                      control={control}
                      rules={{ required: "Waktu pengambilan harus diisi" }}
                      render={({ field: { value, onChange } }) => (
                        <TouchableOpacity
                          onPress={() => setShowDatePicker(true)}>
                          <View className="flex-row items-center p-2 bg-[#fff] rounded-sm border-stone-300 border font-poppins-regular">
                            <Text className="text-sm flex-1 text-black font-poppins-regular">
                              {value
                                ? moment(value).format("YYYY-MM-DD HH:mm:ss") // Format value dengan moment
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
                      )}
                    />

                    {errors.tanggal_pengambilan && (
                      <Text
                        style={{ color: "red", fontFamily: "Poppins-Regular" }}>
                        {errors.tanggal_pengambilan.message}
                      </Text>
                    )}

                    {showDatePicker && (
                      <DateTimePicker
                        value={date || new Date()}
                        mode="date"
                        timeZoneName="Asia/Jakarta"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={handleDateChange}
                      />
                    )}

                    {showTimePicker && isDateSelected && (
                      <DateTimePicker
                        value={date || new Date()}
                        mode="time"
                        timeZoneName="Asia/Jakarta"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={handleTimeChange}
                      />
                    )}

                    <Controller
                      name="acuan_metode_id"
                      rules={{ required: "Metode tidak boleh kosong" }}
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <View>
                          <Text className="font-poppins-semibold  text-black mt-2">
                            Metode
                          </Text>

                          <Select2
                            onChangeValue={value => {
                              onChange(value);
                              setSelectedMetode(value);
                            }}
                            value={value}
                            items={metode}
                            placeholder={{ label: "Pilih Metode" }}
                          />
                        </View>
                      )}
                    />
                    {errors.acuan_metode_id && (
                      <Text
                        style={{ color: "red", fontFamily: "Poppins-Regular" }}
                        className="-mt-2">
                        {errors.acuan_metode_id.message}
                      </Text>
                    )}
                  </View>

                  <View className="border border-slate-600 p-3 my-2 rounded-md">
                    <Text className="text-base font-bold text-center  mb-4 text-black">
                      Detail Lokasi
                    </Text>
                    <View className="flex-row">
                      <Controller
                        name="south"
                        rules={{ required: "Selatan tidak boleh kosong" }}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <View className="w-1/2 pr-2">
                            <Text className="font-poppins-semibold mb-2 text-black text-start">
                              Selatan
                            </Text>
                            <TextField
                              className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-poppins-regular"
                              placeholder="0.0"
                              value={value || location.latitude} // Use form value or location state
                              onChangeText={text => {
                                onChange(text); // Update form value
                                setLocation(prev => ({
                                  // Update location state
                                  ...prev,
                                  latitude: text,
                                }));
                              }}
                            />
                            {errors.south && (
                              <Text
                                style={{
                                  color: "red",
                                  fontFamily: "Poppins-Regular",
                                }}
                                className="text-xs my-1">
                                {errors.south.message}
                              </Text>
                            )}
                          </View>
                        )}
                      />

                      <Controller
                        name="east"
                        rules={{ required: "Timur tidak boleh kosong" }}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <View className="w-1/2 pl-2">
                            <Text className="font-poppins-semibold mb-2 text-black">
                              Timur
                            </Text>
                            <TextField
                              className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-poppins-regular"
                              placeholder="0.0"
                              value={value || location.longitude} // Use form value or location state
                              onChangeText={text => {
                                onChange(text); // Update form value
                                setLocation(prev => ({
                                  // Update location state
                                  ...prev,
                                  longitude: text,
                                }));
                              }}
                            />
                            {errors.east && (
                              <Text
                                style={{
                                  color: "red",
                                  fontFamily: "Poppins-Regular",
                                }}
                                className="text-xs my-1">
                                {errors.east.message}
                              </Text>
                            )}
                          </View>
                        )}
                      />
                    </View>

                    <TouchableOpacity
                      onPress={handleLocationPress}
                      className="w-full mt-2 p-3 rounded-md bg-[#007AFF]">
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
                          <ActivityIndicator size="large" className="mb-5" color="#007AFF" />
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

                  <View
                    className="border-slate-600 border p-3 my-2 rounded-md"
                    style={{ borderWidth: 0.5 }}>
                    <Text className="text-base font-bold text-center mb-4  text-black">
                      Hasil Pengukuran Lapangan
                    </Text>

                    <View className="flex-row flex-wrap">
                      <Controller
                        name="suhu_air"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <View className="w-1/2 pr-2">
                            <Text className="font-poppins-semibold  mb-2 text-black">
                              Suhu Air
                            </Text>
                            <TextField
                              className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-poppins-regular"
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
                            <Text className="font-poppins-semibold  mb-2 text-black">
                              pH
                            </Text>
                            <TextField
                              className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-poppins-regular"
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
                            <Text className="font-poppins-semibold  mb-2 text-black">
                              DHL
                            </Text>
                            <TextField
                              className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-poppins-regular"
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
                            <Text className="font-poppins-semibold  mb-2 text-black">
                              Salinitas
                            </Text>

                            <TextField
                              className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-poppins-regular"
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
                            <Text className="font-poppins-semibold  mb-2 text-black">
                              DO
                            </Text>

                            <TextField
                              className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-poppins-regular"
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
                            <Text className="font-poppins-semibold  mb-2 text-black">
                              Kekeruhan
                            </Text>

                            <TextField
                              className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-poppins-regular"
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
                            <Text className="font-poppins-semibold  mb-2 text-black">
                              Klorin Babas
                            </Text>

                            <TextField
                              className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-poppins-regular"
                              value={value}
                              onChangeText={onChange}
                            />
                          </View>
                        )}
                      />
                    </View>
                  </View>
                  <View
                    className="border-slate-600 border p-3 my-2 rounded-md"
                    style={{ borderWidth: 0.5 }}>
                    <Text className="text-base font-bold text-center mb-4  text-black">
                      Kondisi Lingkungan
                    </Text>

                    <View className="flex-row flex-wrap">
                      <Controller
                        name="suhu_udara"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <View className="w-1/2 pr-2">
                            <Text className="font-poppins-semibold  mb-2 text-black">
                              Suhu Udara
                            </Text>

                            <TextField
                              className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-poppins-regular"
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
                            <Text className="font-poppins-semibold  mb-2 text-black">
                              Cuaca
                            </Text>

                            <TextField
                              className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-poppins-regular"
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
                            <Text className="font-poppins-semibold  mb-2 text-black">
                              Arah Angin
                            </Text>

                            <TextField
                              className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-poppins-regular"
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
                            <Text className="font-poppins-semibold  mb-2 text-black">
                              Kelembapan
                            </Text>

                            <TextField
                              className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-poppins-regular"
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
                            <Text className="font-poppins-semibold  mb-2 text-black">
                              Kecepatan Angin
                            </Text>

                            <TextField
                              className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-poppins-regular"
                              value={value}
                              onChangeText={onChange}
                            />
                          </View>
                        )}
                      />
                    </View>
                  </View>
                </>
              ) : (
                <View></View>
              )}

              <Button
                onPress={handleSubmit(createOrUpdate)}
                loading={isLoading}
                className="p-3 rounded-md mt-4"
                style={{ backgroundColor: Colors.brand }}>
                <Text className="text-white text-center text-base font-poppins-semibold">
                  SUBMIT
                </Text>
              </Button>
            </View>
          )}
        />
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
