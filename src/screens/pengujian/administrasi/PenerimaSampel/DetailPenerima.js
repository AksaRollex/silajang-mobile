import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  TextInput,
  Platform,
  ScrollView,
  Modal,
} from "react-native";
import { Colors } from "react-native-ui-lib";
import Fontisto from "react-native-vector-icons/Fontisto";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Octicons from "react-native-vector-icons/Octicons";
import EvilIcons from "react-native-vector-icons/EvilIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { RadioButton } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import axios from "@/src/libs/axios";
import Parameter from "./Parameter";

export default function Detail({ route, navigation }) {
  const { uuid } = route.params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState();
  const [pengawetan, setPengawetan] = useState("");
  const [interpretasi, setInterpretasi] = useState();
  const [baku, setBaku] = useState();
  const [isAbnormal, setIsAbnormal] = useState(false);
  const [keterangan, setKeterangan] = useState("");
  const [date, setDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isDateSelected, setIsDateSelected] = useState(false);
  const [modalVisible, setModalVisible] = useState({
    visible: false,
    selectedParameter: null,
  });
  const [modalState, setModalState] = useState({
    visible: false,
    selectedParameter: null,
  });

  const handleParameter = parameter => {
    setModalState({
      visible: true,
      selectedParameter: parameter,
    });
  };

  const handleCloseModal = () => {
    setModalState({ visible: false, selectedParameter: null });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `/administrasi/penerima-sample/${uuid}`,
        );
        console.log("Response data:", response.data);
        setData(response.data.data);
        if (
          response.data.data &&
          response.data.data.kesimpulan_sampel !== undefined
        ) {
          setChecked(response.data.data.kesimpulan_sampel);
        }
        if (
          response.data.data &&
          response.data.data.pengawetan_oleh !== undefined
        ) {
          setPengawetan(response.data.data.pengawetan_oleh);
        }
        if (
          response.data.data &&
          response.data.data.hasil_pengujian !== undefined
        ) {
          setInterpretasi(response.data.data.hasil_pengujian);
        }
        if (response.data.data && response.data.data.baku_mutu !== undefined) {
          setBaku(response.data.data.baku_mutu);
        }
        if (
          response.data.data &&
          response.data.data.tanggal_diterima !== undefined
        ) {
          setDate(new Date(response.data.data.tanggal_diterima));
        }
        if (
          response.data.data &&
          response.data.data.kondisi_sampel !== undefined
        ) {
          setIsAbnormal(response.data.data.kondisi_sampel === 1);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [uuid]);

  const setByTimezone = time => {
    const date = new Date();
    const difference = -date.getTimezoneOffset() / 60;

    time.setHours(time.getHours() + difference);
  };

  const handleDateChange = (event, selectedDate) => {
    if (event.type === "set") {
      const currentDate = selectedDate || date;
      setDate(currentDate);
      setShowDatePicker(false);
      setIsDateSelected(true); // jika perlu, bisa ditambahkan ke state lain
      setShowTimePicker(true);
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

  const handleWaktu = async selectedDateTime => {
    try {
      setByTimezone(selectedDateTime);
      // Lakukan request POST ke endpoint yang sesuai
      const response = await axios.post(
        `/administrasi/penerima-sample/${uuid}/update`,
        {
          tanggal_diterima: selectedDateTime, // Kirimkan data tanggal dan waktu yang dipilih
        },
      );

      console.log("Data berhasil disimpan:", response.data);
    } catch (error) {
      console.error(
        "Gagal menyimpan data:",
        error.response ? error.response.data : error.message,
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Data not found</Text>
      </View>
    );
  }

  const jenisWadahValues = data.jenis_wadahs
    ? data.jenis_wadahs
        .map(item => `${item.nama} (${item.keterangan})`)
        .join(", ")
    : "Tidak ada data";

  const parameters = data.parameters ? data.parameters : [];

  const handleSave = value => {
    setChecked(value);
    saveStatus(value);
  };

  const saveStatus = async status => {
    try {
      const response = await axios.post(
        `/administrasi/penerima-sample/${uuid}/update`,
        {
          kesimpulan_sampel: status,
        },
      );
      console.log("Data berhasil disimpan:", response.data);
    } catch (error) {
      console.error(
        "Gagal menyimpan data:",
        error.response ? error.response.data : error.message,
      );
    }
  };
  const saving = value => {
    setPengawetan(value);
    savePengawetan(value);
  };

  const savePengawetan = async status => {
    try {
      const response = await axios.post(
        `/administrasi/penerima-sample/${uuid}/update`,
        {
          pengawetan_oleh: status,
        },
      );
      console.log("Data berhasil disimpan:", response.data);
    } catch (error) {
      console.error(
        "Gagal menyimpan data:",
        error.response ? error.response.data : error.message,
      );
    }
  };
  const saveInterpretasi = value => {
    setInterpretasi(value);
    saveInter(value);
  };

  const saveInter = async status => {
    try {
      const response = await axios.post(
        `/administrasi/penerima-sample/${uuid}/update`,
        {
          hasil_pengujian: status,
        },
      );
      console.log("Data berhasil disimpan:", response.data);
    } catch (error) {
      console.error(
        "Gagal menyimpan data:",
        error.response ? error.response.data : error.message,
      );
    }
  };
  const saveBaku = value => {
    setBaku(value);
    saveBak(value);
  };

  const saveBak = async status => {
    const response = await axios.post(
      `/administrasi/penerima-sample/${uuid}/update`,
      {
        baku_mutu: status,
      },
    );
  };
  const tanggal = value => {
    setDate(value);
    saveDateAndTime(value);
  };

  const saveDateAndTime = async status => {
    const response = await axios.post(
      `/administrasi/penerima-sample/${uuid}/update`,
      {
        tanggal_diterima: status,
      },
    );
  };

  const handleSwitchChange = value => {
    setIsAbnormal(value);
    console.log(value);
    updateKondisiSampel(value ? 1 : 0, value ? null : keterangan);
  };

  const updateKondisiSampel = async (kondisiSampel, keterangan = "") => {
    try {
      const response = await axios.post(
        `/administrasi/penerima-sample/${uuid}/update`,
        {
          kondisi_sampel: kondisiSampel,
          keterangan_kondisi_sampel: keterangan,
        },
      );
      console.log("Data berhasil disimpan:", response.data);
    } catch (error) {
      console.error(
        "Gagal menyimpan data:",
        error.response ? error.response.data : error.message,
      );
    }
  };

  const handleKeteranganChange = text => {
    setKeterangan(text);
    if (isAbnormal) {
      console.log(text);
      updateKondisiSampel(0, text);
    }
  };

  const handleInputBlur = () => {
    if (!isAbnormal) {
      updateKondisiSampel(0, keterangan);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollViewContainer}
      showVerticalScrollIndicator={false}>
      <View style={styles.container}>
        {data ? (
          <>
            <View style={styles.cardContainer}>
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: "#ef4444",
                    width: 55,
                    height: 45,
                    borderRadius: 15,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={() => navigation.goBack()}>
                  <Icon name="arrow-left" size={20} color="white" />
                </TouchableOpacity>
                <View>
                  <Text style={styles.kode}>{data.kode}</Text>
                </View>
              </View>
            </View>
            {/* Card Pertama */}
            <View style={styles.cardContainer}>
              <Text style={styles.title}>Informasi Pemohon</Text>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <Fontisto name="user-secret" size={35} color="black" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.label}>Customer</Text>
                  <Text style={styles.value}>{data.permohonan.user.nama}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons name="bank" size={30} color="black" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.label}>Instansi</Text>
                  <Text style={styles.value}>
                    {data.permohonan.user.detail.instansi}
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <FontAwesome6
                    name="map-location-dot"
                    size={26}
                    color="black"
                  />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.label}>Alamat</Text>
                  <Text style={styles.value}>
                    {data.permohonan.user.detail.alamat}
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <SimpleLineIcons name="phone" size={28} color="black" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.label}>No. Telepon/WhatsApp</Text>
                  <Text style={styles.value}>
                    {data.permohonan.user.detail.telepon}
                  </Text>
                </View>
              </View>
            </View>

            {/* Card Kedua */}
            <View style={styles.cardContainer}>
              <Text style={styles.title}>Detail Uji</Text>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons
                    name="target"
                    size={30}
                    color="black"
                  />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.label}>Lokasi/Titik Uji</Text>
                  <Text style={styles.value}>{data.lokasi}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <FontAwesome6 name="warehouse" size={24} color="black" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.label}>Nama Industri</Text>
                  <Text style={styles.value}>{data.permohonan.industri}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <FontAwesome name="building" size={35} color="black" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.label}>Alamat Industri</Text>
                  <Text style={styles.value}>{data.permohonan.alamat}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <FontAwesome name="newspaper-o" size={27} color="black" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.label}>Jenis Kegiatan Industri</Text>
                  <Text style={styles.value}>
                    {data.permohonan.user.detail.jenis_kegiatan}
                  </Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <Octicons name="beaker" size={33} color="black" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.label}>Jenis Sampel</Text>
                  <Text style={styles.value}>{data.jenis_sampel.nama}</Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons
                    name="beaker"
                    size={30}
                    color="black"
                  />
                </View>
                {/* <View style={styles.textContainer}>
                  <Text style={styles.label}>Jenis Sampel</Text>
                  <Text style={styles.value}>{data.jenis_sampel.nama}</Text>
                </View> */}
                <View style={styles.textContainer}>
                  <Text style={styles.label}>Jenis Wadah</Text>
                  <Text style={styles.value}>{jenisWadahValues}</Text>
                </View>
              </View>

              <Text style={styles.value}>Kesimpulan Sampel</Text>

              <View style={styles.radioContainer}>
                <View style={styles.radioItem}>
                  <RadioButton
                    value={0}
                    status={checked === 0 ? "checked" : "unchecked"}
                    onPress={() => handleSave(0)}
                  />
                  <Text style={styles.radioLabel}>Menunggu</Text>
                </View>
                <View style={styles.radioItem}>
                  <RadioButton
                    value={1}
                    status={checked === 1 ? "checked" : "unchecked"}
                    onPress={() => handleSave(1)}
                  />
                  <Text style={styles.radioLabel}>Diterima</Text>
                </View>
                <View style={styles.radioItem}>
                  <RadioButton
                    value={2}
                    status={checked === 2 ? "checked" : "unchecked"}
                    onPress={() => handleSave(2)}
                  />
                  <Text style={styles.radioLabel}>Ditolak</Text>
                </View>
              </View>

              <Text style={styles.value}>Pengawetan Dilakukan Oleh</Text>

              <View style={styles.radioContainer2}>
                <View style={styles.radioItem}>
                  <RadioButton
                    value="Pelanggan"
                    status={
                      pengawetan === "Pelanggan" ? "checked" : "unchecked"
                    }
                    onPress={() => saving("Pelanggan")}
                  />
                  <Text style={styles.radioLabel}>Pelanggan</Text>
                </View>
                <View style={styles.radioItem}>
                  <RadioButton
                    value="Laboratorium"
                    status={
                      pengawetan === "Laboratorium" ? "checked" : "unchecked"
                    }
                    onPress={() => saving("Laboratorium")}
                  />
                  <Text style={styles.radioLabel}>Laboratorium</Text>
                </View>
              </View>

              <Text style={styles.value}>Interpretasi Hasil Pengujian</Text>
              <View style={styles.radioContainer2}>
                <View style={styles.radioItem}>
                  <RadioButton
                    value={1}
                    status={interpretasi === 1 ? "checked" : "unchecked"}
                    onPress={() => saveInterpretasi(1)}
                  />
                  <Text style={styles.radioLabel}>Ada</Text>
                </View>
                <View style={styles.radioItem}>
                  <RadioButton
                    value={0}
                    status={interpretasi === 0 ? "checked" : "unchecked"}
                    onPress={() => saveInterpretasi(0)}
                  />
                  <Text style={styles.radioLabel}>Tidak Ada</Text>
                </View>
              </View>

              <Text style={styles.value}>Baku Mutu</Text>
              <View style={styles.radioContainer2}>
                <View style={styles.radioItem}>
                  <RadioButton
                    value={1}
                    status={baku === 1 ? "checked" : "unchecked"}
                    onPress={() => saveBaku(1)}
                  />
                  <Text style={styles.radioLabel}>Ada</Text>
                </View>
                <View style={styles.radioItem}>
                  <RadioButton
                    value={0}
                    status={baku === 0 ? "checked" : "unchecked"}
                    onPress={() => saveBaku(0)}
                  />
                  <Text style={styles.radioLabel}>Tidak Ada</Text>
                </View>
              </View>

              <Text style={styles.value}>Tanggal Diterima</Text>
              <View>
                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                  <View style={styles.dateTimeButton}>
                    <Text style={styles.dateTimeText}>
                      {date
                        ? `Tanggal/Waktu: ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
                        : "Pilih Tanggal dan Waktu"}
                    </Text>
                    <FontAwesome
                      name="calendar"
                      size={30}
                      color="#000"
                      style={styles.dateTimeIcon}
                    />
                  </View>
                </TouchableOpacity>

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
              </View>

              <Text style={styles.mt}>Kondisi Sampel Saat Diterima</Text>
              <View style={styles.switchContainer}>
                <Text style={styles.value}>Abnormal</Text>
                <Switch value={isAbnormal} onValueChange={handleSwitchChange} />
                <View style={styles.normal}>
                  <Text style={styles.value}>Normal</Text>
                </View>
              </View>
              <View>
                {!isAbnormal && (
                  <TextInput
                    placeholder={data.keterangan_kondisi_sampel}
                    style={styles.input}
                    onChangeText={handleKeteranganChange}
                    onBlur={handleInputBlur}
                    value={keterangan}
                  />
                )}
              </View>
            </View>
            <View style={styles.cardContainer}>
              <Text style={styles.title}>Peraturan/Parameter</Text>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <FontAwesome6 name="vial" size={30} color="black" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.label}>Peraturan</Text>
                  <Text style={styles.value}>
                    {data?.peraturan?.nama || ''} - {data?.peraturan?.nomor || ''}
                  </Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <FontAwesome name="file-text-o" size={34} color="black" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.label}>Parameter</Text>
                  <Text style={styles.value}>Nama</Text>
                </View>
              </View>
              <View>
                {parameters.length > 0 ? (
                  parameters.map((item, index) => (
                    <View key={index} style={styles.paramContainer}>
                      <Text style={styles.param}>{item.nama}</Text>
                      <TouchableOpacity onPress={() => handleParameter(item)}>
                        <EvilIcons name="pencil" size={20} color="black" />
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <Text>No parameters available</Text>
                )}
                <Modal
                  animationType="slide"
                  transparent={true}
                  visible={modalState.visible}
                  onRequestClose={() =>
                    setModalState({ visible: false, selectedParameter: null })
                  }>
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                      <Parameter
                      data={data}
                        selectedParameter={modalState.selectedParameter}
                      />
                      <TouchableOpacity
                        onPress={handleCloseModal}
                        style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>Close</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>
              </View>
            </View>
            <View style={styles.cardContainer}>
              <Text style={styles.title}>Detail Pengambilan</Text>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons
                    name="car-pickup"
                    size={33}
                    color="black"
                  />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.label}>Jasa Pengambilan</Text>
                  <Text style={styles.value}>
                    {data?.permohonan?.jasa_pengambilan?.wilayah || ''}  
                  </Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <FontAwesome6 name="id-card-clip" size={30} color="black" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.label}>Petugas Pengambil</Text>
                  <Text style={styles.value}>{data?.pengambil?.nama || ''}</Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <MaterialIcons
                    name="date-range"
                    size={34}
                    color="black"></MaterialIcons>
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.label}>Tanggal/Jam</Text>
                  <Text style={styles.value}>{data.tanggal_pengambilan}</Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <Ionicons name="pricetags" size={33} color="black" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.label}>Metode</Text>
                  <Text style={styles.value}>{data?.acuan_metode?.nama || ''}</Text>
                </View>
              </View>
            </View>
            <View style={styles.lokasiContainer}>
              <Text style={styles.title}>Detail Lokasi</Text>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <Ionicons name="compass-outline" size={30} color="black" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.label}>South</Text>
                  <Text style={styles.value}>{data.south}</Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <Ionicons name="compass-outline" size={30} color="black" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.label}>East</Text>
                  <Text style={styles.value}>{data.east}</Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          <Text style={styles.text}>Loading...</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#312e81",
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  param: {
    marginRight: 10,
    fontSize: 16,
  },
  paramContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  kode: {
    fontWeight: "bold",
    fontSize: 23,
    color: "black",
    marginLeft: 20,
    marginTop: 5,
  },
  paramContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
  },
  param: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.black,
    marginRight: 10,
    marginLeft: 59,
  },
  scrollViewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingVertical: 10,
  },
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Colors.grey80,
  },
  cardContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    width: "90%",
    elevation: 3,
    marginVertical: 10,
  },
  lokasiContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    width: "90%",
    elevation: 3,
    marginVertical: 10,
    marginBottom: 70,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: Colors.black,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  iconContainer: {
    backgroundColor: "rgba(76, 175, 80, 0.1)", // Light green background
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  icon: {
    width: 30,
    height: 30,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: Colors.grey40,
  },
  value: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.black,
  },
  radioContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 10,
  },
  radioContainer2: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 10,
    marginBottom: 10,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  radioLabel: {
    fontSize: 16,
    color: "black",
  },
  inputContainerStyle: {
    alignItems: "flex-start",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#CAD3DF",
    borderRadius: 5,
    marginVertical: 10,
    marginHorizontal: 10,
    paddingRight: 10,
    height: 50,
  },
  textStyle: {
    fontSize: 16,
    marginHorizontal: 10,
  },
  dateTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  dateTimeText: {
    fontSize: 16,
    flex: 1,
    color: "black",
  },
  dateTimeIcon: {
    marginLeft: 8,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 15,
    marginRight: 110,
  },
  normalRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginVertical: 5,
  },
  normalText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 10,
  },
  mt: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.black,
    justifyContent: "center",
    alignItems: "center",
  },
  abnormalContainer: {
    padding: 10,
    backgroundColor: "#f8d7da", // warna background merah terang
    borderRadius: 5,
    marginTop: 10,
  },
  abnormalText: {
    color: "#721c24", // warna teks merah gelap
    fontSize: 16,
  },
  input: {
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    padding: 10,
    marginTop: 9,
  },
});
