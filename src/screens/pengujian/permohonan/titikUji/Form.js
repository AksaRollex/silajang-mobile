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
} from "react-native";
import Geolocation from "react-native-geolocation-service";
import MultiSelect from "react-native-multiple-select";
import Toast from "react-native-toast-message";
import { Button, Colors, TextField } from "react-native-ui-lib";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import MaterialIcons from "react-native-vector-icons/MaterialCommunityIcons";

moment.locale("id");
const FormTitikUji = ({ route, navigation, formData, mapStatusPengujian }) => {
  const [sampelData, setSampelData] = useState([]);
  const [selectedSampel, setSelectedSampel] = useState(null);
  const [openSampel, setOpenSampel] = useState(false);

  const [jenisWadah, setJenisWadah] = useState([]);
  const [selectedJenisWadah, setSelectedJenisWadah] = useState(null);
  const [openJenisWadah, setOpenJenisWadah] = useState(false);

  const [metode, setMetode] = useState([]);
  const [selectedMetode, setSelectedMetode] = useState(null);
  const [openMetode, setOpenMetode] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

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
      if (currentDate instanceof Date && !isNaN(currentDate)){
        setDate(currentDate);
        setShowDatePicker(false);
        setIsDateSelected(true);
        setShowTimePicker(true);
      } else {
        console.error("Invalid date selected")
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
          setDate(new Date(data.tanggal_pengambilan))
          location.latitude = data.south,
          location.longitude = data.east,
          setSelectedPayment(data.payment_type)
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
          ].forEach(key => {
            delete requestData[key];
          });
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
    data => {
      if (!selectedPayment) {
        throw new Error("silahkan pilih metode pembayaran")
      }
      const requestData = {
        payment_type: selectedPayment === "va" ? "va" : "qris",
        ...data,
        permohonan_uuid: permohonan.uuid,
        tanggal_pengambilan: date ? moment(date).format('YYYY-MM-DD HH:mm:ss') : null,
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
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.response?.data?.message || "Failed to update data",
        });
        console.error("Mutation error:", error.response.data);
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
        requestData.tanggal_pengambilan = moment(date).format('YYYY-MM-DD HH:mm:ss');
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Tanggal pengambilan harus diisi"
        });
        return;
      }
    }

    createOrUpdate(requestData, {
      onError: error => {
        console.error("Form submission error:", error );
      }
    })
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
          name: item.nama,
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

  if (isLoadingData && uuid) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={"#312e81"} />
      </View>
    );
  }

  return (
    <>
      <View
        className="flex-row items-center justify-between p-3 "
        style={{ backgroundColor: Colors.brand }}>
        <BackButton
          action={() => navigation.goBack()}
          size={24}
          color={"white"}
        />
        <Text className="text-lg font-bold text-white">
          {uuid ? "Edit" : "Tambah"} Titik Pengujian
        </Text>
      </View>
      {formData?.uuid && formData?.status > 2 && (
        <Text className="text-gray-500 italic">
          Tidak bisa melakukan pengeditan karena status sudah dalam{" "}
          {mapStatusPengujian(formData.status)}
        </Text>
      )}
      <FlatList
        className="bg-[#ececec] h-full px-3 py-1"
        data={[{ key: "from" }]}
        renderItem={() => (
          <View className="bg-[#ececec] w-full h-full px-3 py-1">
            <View className="bg-[#f8f8f8] py-4 px-3 rounded-md mb-2">
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
                    style={{ marginVertical: 8 }} // Sesuaikan dengan my-2
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
                    style={{ marginVertical: 8 }} // Sesuaikan dengan my-2
                  />
                  <Text className="text-black font-bold text-lg text-center">
                    QRIS
                  </Text>
                  <Text className="text-black text-justify">
                    Scan dan bayar melalui QRIS
                  </Text>
                </TouchableOpacity>
              </View>
              {paymentTypeError && (
                <Text className="text-red-500 text-sm mt-2">{paymentTypeError}</Text>
              )}

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
                    <Text className="font-sans font-bold text-black">
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
              <Controller
                name="jenis_wadahs_id"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <View>
                    <Text className="font-sans font-bold mb-2 text-black">
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
                      altFontFamily="ProximaNova-Light"
                      tagRemoveIconColor="#CCC"
                      tagBorderColor="#CCC"
                      tagTextColor="#CCC"
                      selectedItemTextColor="#CCC"
                      selectedItemIconColor="#CCC"
                      itemTextColor="#000"
                      displayKey="name"
                      searchInputStyle={{ color: "#CCC" }}
                      submitButtonColor="black"
                      submitButtonText="Submit"
                      // className="p-2 bg-[#fff] rounded-sm border-stone-300 border-0 font-sans text-black"
                      // nestedScrollEnabled={true}
                      // open={openJenisWadah}
                      // value={value}
                      // items={jenisWadah}
                      // setOpen={setOpenJenisWadah}
                      // setValue={onChange}
                      // setItems={setJenisWadah}
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
              {permohonan && permohonan?.is_mandiri ? (
                <>
                  <Text className="text-base font-bold text-center my-5 text-black">
                    Detail Pengiriman
                  </Text>
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

                  <Text className="text-sans font-bold text-black mb-2">
                    Tanggal/Jam Pengambilan
                  </Text>
                  <View>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                      <View className="flex-row items-center p-2 bg-[#fff] rounded-sm border-stone-300 border font-sans">
                        <Text className="text-sm flex-1 text-black">
                          {date
                            ? `${moment(date).format("YYYY-MM-DD HH:mm:ss")} `
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
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <View>
                        <Text className="font-sans font-bold text-black mt-2">
                          Metode
                        </Text>

                        <Select2
                          onChangeValue={value => {
                            onChange(value);
                            setSelectedMetode(value);
                          }}
                          value={value}
                          items={metode}
                          // className="p-2 bg-[#fff] rounded-sm border-stone-300 border-0 font-sans"
                          // open={openMetode}
                          // value={value}
                          // items={metode}
                          // setOpen={setOpenMetode}
                          // setValue={onChange}
                          // nestedScrollEnabled={true}
                          // setItems={setMetode}
                          // style={styles.dropdown}
                        />
                      </View>
                    )}
                  />

                  <Text className="text-base font-bold text-center my-5 text-black">
                    Detail Lokasi
                  </Text>

                  <View className="flex-row">
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
                          <Text className="font-sans font-bold mb-2 text-black ">
                            East
                          </Text>
                          <TextField
                            className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-sans"
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
                </>
              ) : (
                <View></View>
              )}

              <Button
                onPress={handleSubmit(createOrUpdate)}
                loading={isLoading}
                className="p-2 rounded-sm mt-4"
                style={{ backgroundColor: Colors.brand }}>
                <Text className="text-white text-center text-base font-bold font-sans">
                  SUBMIT
                </Text>
              </Button>
            </View>
          </View>
        )}
      />
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
