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
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { RadioButton } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import RNPickerSelect from "react-native-picker-select";
import axios from "@/src/libs/axios";
import Parameter from "./Parameter";

const currency = (number) => {
  return number.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
  });
};

export default function DetailPersetujuan({ route, navigation }) {
  const { uuid } = route.params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState();
  const [interpretasi, setInterpretasi] = useState();
  const [keterangan, setKeterangan] = useState("");

  const [date, setDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isDateSelected, setIsDateSelected] = useState(false);
  
  const [radiusPengambilan, setRadiusPengambilan] = useState([]);
  const [selectedRadius, setSelectedRadius] = useState(null);
  const [pengambilSample, setPengambilSample] = useState([]);
  const [selectedPengambilSample, setSelectedPengambilSample] = useState(null);
  const [Metode, setMetode] = useState([]);
  const [selectedMetode, setSelectedMetode] = useState(null);
  const [obyekPelayanan, setObyekPelayanan] = useState('');

  const [modalVisible, setModalVisible] = useState({
    visible: false,
    selectedParameter: null,
  });
  const [modalState, setModalState] = useState({
    visible: false,
    selectedParameter: null,
  });

  const handleParameter = (parameter, uuid) => {
    setModalState({
      visible: true,
      selectedParameter: parameter,
      uuid: uuid,
    });
  };

  const handleCloseModal = () => {
    setModalState({ visible: false, selectedParameter: null });
  };

  useEffect(() => {
    const fetchRadiusPengambilan = async () => {
      try {
        const response = await axios.get("/master/radius-pengambilan");
        setRadiusPengambilan(response.data.data);
      } catch (error) {
        console.error("Error fetching RadiusPengambilan data:", error);
      }
    };

    fetchRadiusPengambilan();
  }, []);

  useEffect(() => {
    const fetchPengambilSample = async () => {
      try {
        const response = await axios.get("/administrasi/pengambil-sample/petugas");
        setPengambilSample(response.data.data);
      } catch (error) {
        console.error("Error fetching pengambil data:", error);
      }
    };
  
    fetchPengambilSample();
  }, []);

  useEffect(() => {
    const fetchMetode = async () => {
      try {
        const response = await axios.get("/master/acuan-metode");
        setMetode(response.data.data);
      } catch (error) {
        console.error("Error fetching Metode data:", error);
      }
    };
  
    fetchMetode();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/administrasi/pengambil-sample/${uuid}`);
        console.log("Response data:", response.data);
        setData(response.data.data);
        if (response.data.data) {
          setObyekPelayanan(response.data.data.obyek_pelayanan || ''); // Atur state ke obyek_pelayanan
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [uuid]);

   useEffect(() => {

    const fetchData = async () => {
      try {
        const response = await axios.get(`/administrasi/pengambil-sample/${uuid}`);
        if (response.data.data && response.data.data.tanggal_pengambilan) {
          setDate(new Date(response.data.data.tanggal_pengambilan));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [uuid]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `/administrasi/pengambil-sample/${uuid}`,
        );
        console.log("Response data:", response.data);
        setData(response.data.data);
        if (
          response.data.data &&
          response.data.data.kesimpulan_permohonan !== undefined
        ) {
          setChecked(response.data.data.kesimpulan_permohonan);
        }
        if (
          response.data.data &&
          response.data.data.hasil_pengujian !== undefined
        ) {
          setInterpretasi(response.data.data.hasil_pengujian);
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

  const formatDateTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const handleWaktu = async (selectedDateTime) => {
    const formattedDateTime = formatDateTime(selectedDateTime);
    try {
      const response = await axios.post(`/administrasi/pengambil-sample/${uuid}/update`, {
        tanggal_pengambilan: formattedDateTime,
      });
      console.log("Data berhasil disimpan:", response.data);
    } catch (error) {
      // console.error("Gagal menyimpan data:", error.response ? error.response.data : error.message);
    }
  };

  function rupiah(value) {
    return 'Rp. ' + value.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

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
 
  // const jenisWadahValues = data.jenis_wadahs
  //   ? data.jenis_wadahs
  //       .map(item => `${item.nama} (${item.keterangan})`)
  //       .join(", ")
  //   : "Tidak ada data";

  const parameters = data.parameters ? data.parameters : [];

  const handleSave = value => {
    setChecked(value);
    saveStatus(value);
  };

  const saveStatus = async status => {
   
      const response = await axios.post(
        `/administrasi/pengambil-sample/${uuid}/update`,
        {
          kesimpulan_permohonan: status,
        },
      );
      console.log("Data berhasil disimpan:", response.data);
    
  };

  const saveInterpretasi = value => {
    setInterpretasi(value);
    saveInter(value);
  };

  const saveInter = async status => {
      const response = await axios.post(
        `/administrasi/pengambil-sample/${uuid}/update`,
        {
          hasil_pengujian: status,
        },
      );
      console.log("Data berhasil disimpan:", response.data);
  };

  const saveObyekPelayanan = value => {
    setObyekPelayanan(value);
    saveObyek(value);
  };

  const saveObyek= async status => {
      const response = await axios.post(
        `/administrasi/pengambil-sample/${uuid}/update`,
        {
          obyek_pelayanan: status,
        },
      );
      console.log("Data berhasil disimpan:", response.data);
  };

  const tanggal = value => {
    setDate(value);
    saveDateAndTime(value);
  };

  const saveDateAndTime = async status => {
    const response = await axios.post(
      `/administrasi/pengambil-sample/${uuid}/update`,
      {
        tanggal_pengambilan: status,
      },
    );
  };
 

  const updateKondisiSampel = async (kondisiSampel, keterangan = "") => {
    try {
      const response = await axios.post(
        `/administrasi/pengambil-sample/${uuid}/update`,
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
                  <FontAwesome6 name="user-large" size={29} color="black" />
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
                    {data.permohonan.user.phone}
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
                    {data.permohonan.kegiatan}
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
                  <Text style={styles.value}>{data.jenis_wadah?.nama}</Text>
                </View>
              </View>

              <Text style={styles.value}>Interpretasi Hasil Pengujian</Text>
              <View style={styles.switchContainer}>
                  <Text style={styles.optionText}>Tidak</Text>
                  <Switch
                    value={interpretasi === 1}
                    onValueChange={(value) => saveInterpretasi(value ? 1 : 0)}
                    trackColor={{ false: "#767577", true: "#312e81" }}
                    thumbColor={interpretasi === 1 ? "#f4f3f4" : "#f4f3f4"}
                  />
                  <Text style={styles.optionText}>Ada</Text>
                </View>



              <Text style={styles.value}>Kesimpulan Permohonan</Text>

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
            <View style={styles.cardContainer}>
              <Text style={styles.title}>Peraturan/Parameter</Text>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <FontAwesome name="file-text-o" size={34} color="black" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.label}>Peraturan</Text>
                  <Text style={styles.value}>
                    {data?.peraturan?.nama || ''} - {data?.peraturan?.nomor || ''}
                  </Text>
                </View>
              </View>
              <View className="mt-4">
                  <View className="flex-row items-center mb-2">
                    <View className="bg-[#4caf501a] p-2 rounded-lg mr-2">
                      <FontAwesome6 name="vial" size={30} color="black" />
                    </View>
                    <Text style={styles.label}>Parameter</Text>
                  </View>
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-base font-bold text-black">Nama</Text>
                    <Text className="text-base font-bold text-black">Harga</Text>
                  </View>
                  {parameters.length > 0 ? (
                    parameters.map((item, index) => (
                      <View key={index} className="flex-row justify-between items-center py-2 border-b border-gray-200 border-dashed">
                        <View className="flex-row items-center">
                          <Text className="text-base text-black mr-2 font-bold">{item.nama}</Text>
                          <TouchableOpacity onPress={() => handleParameter(item, uuid)}>
                            <EvilIcons name="pencil" size={20} color="black" style={{ marginLeft: 10 }} />
                          </TouchableOpacity>
                        </View>
                        <Text className="text-base text-black font-bold">{rupiah(item.harga)}</Text>
                      </View>
                    ))
                  ) : (
                    <Text className="text-base text-gray-500 italic">No parameters available</Text>
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
                        uuid={modalState.uuid}
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
            <View style={styles.pengambilanContainer}>
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
                    {data?.permohonan?.user?.golongan_id == 1 && (
                      <Text> ({currency(data?.permohonan?.jasa_pengambilan?.harga)})</Text>
                    )}
                  </Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <FontAwesome6
                    name="id-card-clip"
                    size={30}
                    color="black"
                  />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.label}>Radius Pengambilan</Text>
                  <View style={styles.pickerContainer}>
                  <RNPickerSelect
                      placeholder={{ label: 'Pilih Radius', value: null }}
                      onValueChange={(value) => setSelectedRadius(value)}
                      items={radiusPengambilan.map(item => ({
                        label: `${item.nama} (${item.radius}m) - ${currency(item.harga)}`,
                        value: item.id
                      }))}
                      style={{
                        inputIOS: styles.pickerStyle,
                        inputAndroid: styles.pickerStyle,
                        iconContainer: {
                          top: 10,
                          right: 12,
                        },  
                      }}
                      value={selectedRadius}
                      useNativeAndroidPickerStyle={false}
                      Icon={() => {
                        return <FontAwesome6 name="caret-down" size={11} color="#999" style={{ marginTop: 4 }}/>;
                      }}
                    />
                  </View>
                </View>
              </View>

                
              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <FontAwesome6 name="id-card-clip" size={30} color="black" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.label}>Petugas</Text>
                  <View style={styles.pickerContainer}>
                  <RNPickerSelect
                      placeholder={{ label: 'Pilih Petugas', value: null }}
                      onValueChange={(value) => setSelectedPengambilSample(value)}
                      items={pengambilSample.map(item => ({
                        label: `${item.nama}`,
                        value: item.id
                      }))}
                      style={{
                        inputIOS: styles.pickerStyle,
                        inputAndroid: styles.pickerStyle,
                        iconContainer: {
                          top: 10,
                          right: 12,
                        },  
                      }}
                      value={selectedPengambilSample}
                      useNativeAndroidPickerStyle={false}
                      Icon={() => {
                        return <FontAwesome6 name="caret-down" size={11} color="#999" style={{ marginTop: 4 }}  />;
                      }}
                    />
                  </View>
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
                <View>
                  <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                    <View style={styles.dateTimeButton}>
                      <Text style={styles.dateTimeText}>
                        {date
                          ? `${date.toLocaleDateString()} - ${date.toLocaleTimeString()}`
                          : "Pilih Tanggal dan Waktu"}
                      </Text>
                      <FontAwesome
                        name="calendar"
                        size={13}
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
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <Ionicons name="pricetags" size={33} color="black" />
                </View>
                <View style={styles.textContainer} >
                  <Text style={styles.label}>Metode</Text>
                  <View style={styles.pickerContainer}>
                  <RNPickerSelect
                      placeholder={{ label: 'Pilih Metode', value: null }}
                      onValueChange={(value) => setSelectedMetode(value)}
                      items={Metode.map(item => ({
                        label: `${item.nama}`,
                        value: item.id
                      }))}
                      style={{
                        inputIOS: styles.pickerStyle,
                        inputAndroid: styles.pickerStyle,
                        iconContainer: {
                          top: 10,
                          right: 12,
                        },  
                      }}
                      value={selectedMetode}
                      useNativeAndroidPickerStyle={false}
                      Icon={() => {
                        return <FontAwesome6 name="caret-down" size={11} color="#999" style={{ marginTop: 4 }}  />;
                      }}
                    />
                  </View>
                </View>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <FontAwesome6 name="landmark-dome" size={33} color="black" />
                </View>
                <View style={styles.textContainer}>
                <Text style={styles.label}>Obyek Pelayanan</Text>
                <TextInput 
                  style={styles.inputStyle} 
                  value={obyekPelayanan} 
                  keyboardType="default"
                  onChangeText={saveObyekPelayanan}
                />
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
  pengambilanContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    width: "90%",
    elevation: 3,
    marginVertical: 10,
    marginBottom: 70,
  },  
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
    marginTop: 3 ,
    padding: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderColor: '#cccccc',
    borderWidth: 1,
  },
  dateTimeText: {
    fontSize: 15,
    flex: 1,
    color: "black",
    fontWeight: "bold",
  },
  dateTimeIcon: {
    marginLeft: 8,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "flex-start", // Aligns items to the start without space between
    alignItems: "center",
    marginVertical: 15,
    marginRight: 110, // You can adjust this based on your layout
  },
  optionText: {
    fontSize: 16,
    marginHorizontal: 5, // Reduce this for closer spacing
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
  input: {
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    padding: 10,
    marginTop: 9,
  },
  pickerContainer: { 
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    width: 290,  // Memperluas lebar picker
    overflow: 'hidden',
    // shadowOpacity: 0.1,
    // shadowRadius: 3,
    // elevation: 2,
  },
  pickerStyle: {
    fontSize: 12,
    paddingVertical: 8,
    paddingHorizontal: 15,  // Menambah padding horizontal agar lebih lebar
    color: '#333333',
    width: '100%',
    height: 40,  // Membuat picker lebih tinggi
  },

  inputStyle: {
    fontSize: 13.5,
    fontWeight: "bold",
    paddingVertical: 8,
    paddingHorizontal: 15, 
    color: '#333333',
    width: '100%',
    height: 40,  // Sama dengan tinggi picker
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    backgroundColor: "#f8fafc",
  },
  
});
