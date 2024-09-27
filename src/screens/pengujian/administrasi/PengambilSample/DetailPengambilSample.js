import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Button, Colors } from "react-native-ui-lib";
import Fontisto from "react-native-vector-icons/Fontisto";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Octicons from "react-native-vector-icons/Octicons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import axios from "@/src/libs/axios";
import { TextInput } from "react-native-paper";
import { launchImageLibrary } from "react-native-image-picker";
import { useForm, Controller } from "react-hook-form";

export default function Detail({ route, navigation }) {
  const { uuid } = route.params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = React.useState(null);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `/administrasi/pengambil-sample/${uuid}`,
        );
        setData(response.data.data);
        
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

  const updateUser = async () => {
    const formData = new FormData();
    formData.append("nama", getValues("nama"));

    if (file) {
      formData.append("photo", {
        uri: file.uri,
        type: file.type || "image/jpeg",
        name: file.fileName || "profile_photo.jpg",
      });
    }

    try {
      const response = await axios.post("/user/account", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const { photo } = response.data.user;
      const updatedImageUrl = `${API_URL}${photo}?t=${new Date().getTime()}`;
      setCurrentPhotoUrl(updatedImageUrl);
    } catch (error) {
      console.error("Update failed:", error.message);
    }
  };

  const { handleSubmit, control, formState: { errors }, getValues, reset } = useForm();

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

  const handleCancel = () => {
    reset();
    setFile(null);
  };

  const handleWaktu = async selectedDateTime => {
    try {
      setByTimezone(selectedDateTime);
      const response = await axios.post(
        `/administrasi/pengambil-sample/${uuid}/update`,
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

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer} showVerticalScrollIndicator={false}>
      <View style={styles.container}>
        {data ? (
          <>
            <View style={styles.cardContainer}>
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity
                  style={{ backgroundColor: "#ef4444", width: 55, height: 45, borderRadius: 15, justifyContent: "center", alignItems: "center",}}
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
                  <FontAwesome6 name="map-location-dot" size={26} color="black"
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
                  <MaterialCommunityIcons name="target" size={30} color="black"
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
                <View style={styles.textContainer}>
                  <Text style={styles.label}>Jenis Wadah</Text>
                  <Text style={styles.value}>{jenisWadahValues}</Text>
                </View>
              </View>
            </View>

            <View style={styles.cardContainer}>
              <Text style={styles.title}>Detail Pengambilan</Text>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons name="car-pickup" size={31} color="black"
                  />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.label}>Jasa Pengambilan</Text>
                  <Text style={styles.value}>
                    {data.permohonan?.jasa_pengambilan?.wilayah}
                  </Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <FontAwesome6 name="id-card-clip" size={30} color="black" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.label}>Radius Pengambilan</Text>
                  <Text style={styles.value}>{data.permohonan?.radius_pengambilan?.radius}</Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <FontAwesome6 name="id-card-clip" size={30} color="black" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.label}>Petugas</Text>
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
                  <Text style={styles.value}>{data?.tanggal_pengambilan_indo}</Text>
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
            <View style={styles.cardContainer}>
              <Text style={styles.title}>Detail Lokasi</Text>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <Ionicons name="compass-outline" size={30} color="black" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.label}>South</Text>
                  <TextInput className="h-10 bg-gray-100 ">{data.south}</TextInput>
                </View>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <Ionicons name="compass-outline" size={30} color="black" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.label}>East</Text>
                  <TextInput className="h-10 bg-gray-100 ">{data.east}</TextInput>
                </View>
              </View>
              <TouchableOpacity>
                <Text className="bg-blue-500 text-center text-white text-sm font-bold py-3" style={{ width: 140, borderRadius: 8, marginLeft: 210 }}>Lokasi saat ini </Text>
              </TouchableOpacity>
            </View>

            
            <View style={styles.cardContainer}>
              <Text style={styles.title}>Hasil Pengukuran Lapangan</Text>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer} className="mt-4">
                  <MaterialCommunityIcons name="clipboard-check-outline" size={28} color="black"></MaterialCommunityIcons>
                </View>
                <View style={styles.textContainer} className="">
                  <Text style={styles.label}>Suhu Air (t°C)</Text>
                  <TextInput className="h-10 bg-gray-100  "></TextInput>
                </View>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer} className="mt-4">
                  <MaterialCommunityIcons name="clipboard-check-outline" size={28} color="black"></MaterialCommunityIcons>
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.label}>pH</Text>
                  <TextInput className="h-10 bg-gray-100  "></TextInput>
                </View>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer} className="mt-4">
                  <MaterialCommunityIcons name="clipboard-check-outline" size={28} color="black"></MaterialCommunityIcons>
                </View>
                <View style={styles.textContainer} className="">
                  <Text style={styles.label}>DHL (µS/cm)</Text>
                  <TextInput className="h-10 bg-gray-100  "></TextInput>
                </View>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer} className="mt-4">
                  <MaterialCommunityIcons name="clipboard-check-outline" size={28} color="black"></MaterialCommunityIcons>
                </View>
                <View style={styles.textContainer} className="">
                  <Text style={styles.label}>Salinitas (‰)</Text>
                  <TextInput className="h-10 bg-gray-100  "></TextInput>
                </View>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer} className="mt-4">
                  <MaterialCommunityIcons name="clipboard-check-outline" size={28} color="black"></MaterialCommunityIcons>
                </View>
                <View style={styles.textContainer} className="">
                  <Text style={styles.label}>DO (mg/L)</Text>
                  <TextInput className="h-10 bg-gray-100  "></TextInput>
                </View>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer} className="mt-4">
                  <MaterialCommunityIcons name="clipboard-check-outline" size={28} color="black"></MaterialCommunityIcons>
                </View>
                <View style={styles.textContainer} className="">
                  <Text style={styles.label}>Kekeruhan</Text>
                  <TextInput className="h-10 bg-gray-100  "></TextInput>
                </View>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer} className="mt-4">
                  <MaterialCommunityIcons name="clipboard-check-outline" size={28} color="black"></MaterialCommunityIcons>
                </View>
                <View style={styles.textContainer} className="">
                  <Text style={styles.label}>Klorin Bebas</Text>
                  <TextInput className="h-10 bg-gray-100  "></TextInput>
                </View>
              </View>
            </View>

            <View style={styles.cardContainer}>
              <Text style={styles.title}>Kondisi Lingkungan</Text>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer} className="mt-4">
                  <FontAwesome5 name="seedling" size={28} color="black"></FontAwesome5>
                </View>
                <View style={styles.textContainer} className="">
                  <Text style={styles.label}>Suhu Udara (t°C)</Text>
                  <TextInput className="h-10 bg-gray-100  "></TextInput>
                </View>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer} className="mt-4">
                  <FontAwesome5 name="seedling" size={28} color="black"></FontAwesome5>
                </View>
                <View style={styles.textContainer} className="">
                  <Text style={styles.label}>Cuaca</Text>
                  <TextInput className="h-10 bg-gray-100 "></TextInput>
                </View>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer} className="mt-4">
                  <FontAwesome5 name="seedling" size={28} color="black"></FontAwesome5>
                </View>
                <View style={styles.textContainer} className="">
                  <Text style={styles.label}>Arah Angin</Text>
                  <TextInput className="h-10 bg-gray-100 "></TextInput>
                </View>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer} className="mt-4">
                  <FontAwesome5 name="seedling" size={28} color="black"></FontAwesome5>
                </View>
                <View style={styles.textContainer} className="">
                  <Text style={styles.label}>Kelembapan (%RH)</Text>
                  <TextInput className="h-10 bg-gray-100 "></TextInput>
                </View>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer} className="mt-4">
                  <FontAwesome5 name="seedling" size={28} color="black"></FontAwesome5>
                </View>
                <View style={styles.textContainer} className="">
                  <Text style={styles.label}>Kecepatan Angin</Text>
                  <TextInput className="h-10 bg-gray-100 "></TextInput>
                </View>
              </View>
            </View>
            <View style={styles.lokasiContainer}>
              <Text style={styles.title}>Foto Lapangan/Lokasi</Text>
              <View style={styles.infoItem}>
                <Controller
                  control={control}
                  name="photo"
                  render={({ field: { value } }) => (
                    <View className="w-full">
                      <View style={styles.signatureField}>
                        {currentPhotoUrl || file ? (
                          <View style={styles.imageContainer}>
                            <Image
                              source={{ uri: file ? file.uri : currentPhotoUrl }}
                              style={styles.signaturePreview}
                              onError={e => console.log("Error loading image:", e.nativeEvent.error)}
                            />
                            <TouchableOpacity style={styles.changeButton} onPress={handleChoosePhoto}>
                              <Text style={styles.buttonText}>Ubah</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePhoto}>
                              <Text style={styles.deleteButtonText}>X</Text>
                            </TouchableOpacity>
                          </View>
                          ) : (
                          <TouchableOpacity style={styles.addSignatureButton} onPress={handleChoosePhoto}>
                            <Text style={styles.addSignatureText}>Tambah Foto</Text>
                          </TouchableOpacity>

                        )}
                      </View>
                      <View className="w-full mt-5" style={styles.infoItem}>
                      <TouchableOpacity>
                        <Text className="flex bg-blue-500 text-white text-base font-bold py-3" style={{ width: 170, borderRadius: 8, textAlign: 'center'}}>Simpan & Upload</Text>
                      </TouchableOpacity>
                      <TouchableOpacity>
                        <Text className="bg-blue-500 ml-3 text-center text-white text-base font-bold py-3" style={{ width: 170, borderRadius: 8,}}>Konfirmasi 
                          <FontAwesome6 name="check" className="" size={23}></FontAwesome6>
                        </Text>
                      </TouchableOpacity>
                      </View>
                    </View>
                  )}
                />
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
    height: 100,
    resizeMode: "contain",
    marginBottom: 10,
  },
  changeButton: {
    backgroundColor: "#4682B4",
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
  mt: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.black,
    justifyContent: "center",
    alignItems: "center",
  },
});
