import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput, Alert, Platform, ActivityIndicator  } from "react-native";
import { Button, Colors, ComponentsColors, TextField } from "react-native-ui-lib";
import Fontisto from "react-native-vector-icons/Fontisto";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Feather from "react-native-vector-icons/Feather";
import Octicons from "react-native-vector-icons/Octicons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import axios from "@/src/libs/axios";
import { launchImageLibrary } from "react-native-image-picker";
import { useForm, Controller } from "react-hook-form";
import { rupiah } from "@/src/libs/utils";
import Geolocation from 'react-native-geolocation-service';
import {  request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import Toast from 'react-native-toast-message';
import Foundation from "react-native-vector-icons/Foundation";
import AntDesign from "react-native-vector-icons/AntDesign";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";



export default function Detail({ route, navigation }) {
  const { uuid, status, pengambilOptions } = route.params;
  const [file, setFile] = React.useState(null);
  const [photos, setPhotos] = useState([]);
  const [locationData, setLocationData] = useState({
    south: '',
    east: '',
  });

  const { data, isLoading: isLoadingData } = useQuery(["/administrasi/pengambil-sample", uuid], () =>
    uuid ? axios.get(`/administrasi/pengambil-sample/${uuid}`).then(res => res.data.data) : null,
    {
      enabled: !!uuid,
      onSuccess: (data) => {
        if (data.photos) {
          setPhotos(data.photos);
        }
      }
    }
  )
  const { handleSubmit, control, setValue, watch } = useForm({
    values: {...data}
  });

  const queryClient = useQueryClient();
  const { mutate: createOrUpdate, isLoading } = useMutation(
    (data) => {
      console.log(data)
      return axios.post(`/administrasi/pengambil-sample/${uuid}/update`, data)
    },
    {
      onSuccess: () => {
          console.log("berhasil")
          Toast.show({
              type: "success",
              text1: "Success",
              text2: uuid ? "Success update data" : "Success create data",
          });
          queryClient.setQueryData(["/administrasi/pengambil-sample", uuid], data);
          queryClient.invalidateQueries("/administrasi/pengambil-sample");
      },
      
      onError: (error) => {
          Toast.show({ 
              type: "error",
              text1: "Error",
              text2: "Failed to update data",
          });
          console.error(error);
      },
  },
  )

  const handleBatalkanKonfirmasi = () => {
    axios.post(`/administrasi/pengambil-sample/${uuid}/update-status`, { status: 0 })
      .then(() => {
        Toast.show({
          type: "success",
          text1: "Success",
        });
      })
      .catch((error) => {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to cancel status",
        });
      });
  };
  const handleKonfirmasi = () => {
    axios.post(`/administrasi/pengambil-sample/${uuid}/update-status`, { status: 1 })
      .then(() => {
        Toast.show({
          type: "success",
          text1: "Success",
        });
      })
      .catch((error) => {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Kesimpulan Permohonan Harus Diterima",
        });
      });
  };

  const onSubmit = (data) => {
    createOrUpdate(data);
  }
  if (isLoadingData && uuid) {
    return <View className="h-full flex justify-center"><ActivityIndicator size={"large"} color={"#312e81"} /></View>
 }

 useEffect(() => {
  requestLocationPermission();
}, []);

const requestLocationPermission = async () => {
  try {
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

    const result = await request(permission);
    if (result === RESULTS.GRANTED) {
      console.log('Location permission granted.');
    } else {
      console.log('Location permission denied.');
      Alert.alert('Permission Denied', 'Location permission is required to access your location.');
    }
  } catch (error) {
    console.log('Error requesting location permission:', error);
  }
};

const handleCurrentLocation = () => {
  Geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      setLocationData({
        south: latitude.toString(),
        east: longitude.toString(),
      });
      setValue('south', latitude.toString());
      setValue('east', longitude.toString());
      autosave({ south: latitude.toString(), east: longitude.toString() });
    },
    (error) => {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Unable to retrieve your location.');
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
  );
};


function rupiah(value) {
  return 'Rp. ' + value.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const jenisWadahValues = data?.jenis_wadahs
? data?.jenis_wadahs
    .map(item => `${item.nama} (${item.keterangan})`)
    .join(", ")
: "Tidak ada data";

const handleChoosePhoto = () => {
  const options = {
    mediaType: 'photo',
    quality: 1,
  };

  launchImageLibrary(options, (response) => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.error) {
      console.log('ImagePicker Error: ', response.error);
    } else {
      const newPhoto = { uri: response.assets[0].uri };
      setPhotos((prevPhotos) => [...prevPhotos, newPhoto]); // Tambahkan foto baru ke array
    }
  });
};

const handleDeletePhoto = (index) => {
  setPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index)); // Hapus foto berdasarkan index
};

const handleSubmitData = async () => {
  const formData = new FormData();
  console.log(photos);
  photos.forEach((photo, index) => {
    formData.append(`photos[]`, {
      uri: photo.uri,       
      type: 'image/jpeg',   // Kamu bisa mengganti tipe sesuai file
      name: `photo_${index}.jpg`,  // Penamaan bisa disesuaikan
    });
  });

  if (file) {
    formData.append('photos[]', {
      uri: file.uri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    });
  }

  try {
    await axios.post(`/administrasi/pengambil-sample/${uuid}/upload-photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    Alert.alert('Success', 'Data berhasil disimpan.');
  } catch (error) {
    const message = error.response ? error.response.data.message : 'Something went wrong';
    Alert.alert('Error', message);
  }
};

function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

const autosave = debounce((data) => {
  createOrUpdate(watch());
}, 1500); 


  
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
                    <Feather name="user" size={28} color="#50cc96" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.label}>Customer</Text>
                  <Text style={styles.value}>{data.permohonan.user.nama}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                <FontAwesome name="building-o" size={33} color="#50cc96" />
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
                <MaterialCommunityIcons name="map-search-outline" size={29} color="#50cc96" />
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
                  <Feather name="phone" size={28} color="#50cc96" />
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
                  <Feather
                    name="target"
                    size={30}
                    color="#50cc96"
                  />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.label}>Lokasi/Titik Uji</Text>
                  <Text style={styles.value}>{data.lokasi}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons name="warehouse" size={30} color="#50cc96" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.label}>Nama Industri</Text>
                  <Text style={styles.value}>{data.permohonan.industri}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <FontAwesome name="building-o" size={31} color="#50cc96" style={{ marginHorizontal: 3 }} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.label}>Alamat Industri</Text>
                  <Text style={styles.value}>{data.permohonan.alamat}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <Foundation name="clipboard-pencil" size={32} color="#50cc96" style={{ marginLeft: 5 }} />
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
                  <AntDesign name="filter" size={30} color="#50cc96" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.label}>Jenis Sampel</Text>
                  <Text style={styles.value}>{data.jenis_sampel.nama}</Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons
                    name="beaker-outline"
                    size={33}
                    color="#50cc96"
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
            </View>

            <View style={styles.cardContainer}>
              <Text style={styles.title}>Detail Pengambilan</Text>
              <View style={styles.infoItem}>
              <View style={styles.iconContainer}>
                  <FontAwesome5Icon
                    name="dolly"
                    size={27}
                    color="#50cc96"
                  />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.label}>Jasa Pengambilan</Text>
                  <Text style={styles.value}>
                    {data.permohonan?.jasa_pengambilan?.wilayah} {""}
                    ({rupiah(data.permohonan?.jasa_pengambilan?.harga || 0)})
                  </Text>
                </View>

              </View>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                    name="smart-card-outline"
                    size={30}
                    color="#50cc96"
                  />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.label}>Radius Pengambilan</Text>
                  <Text style={styles.value}>
                    {data.permohonan?.radius_pengambilan?.radius}m
                    {data.permohonan?.radius_pengambilan?.harga !== undefined && 
                    data.permohonan?.radius_pengambilan?.harga !== null && 
                    !isNaN(data.permohonan?.radius_pengambilan?.harga) ? 
                      ` (${rupiah(data.permohonan.radius_pengambilan.harga)})` : 
                      ` (RpNaN)`
                    }
                  </Text>
                </View>


              </View>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons
                    name="smart-card-outline"
                    size={30}
                    color="#50cc96"
                  />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.label}>Petugas</Text>
                  <Text style={styles.value}>{data?.pengambil?.nama || ''}</Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <AntDesign
                    name="calendar"
                    size={30}
                    color="#50cc96"></AntDesign>
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.label}>Tanggal/Jam</Text>
                  <Text style={styles.value}>{data?.tanggal_pengambilan_indo}</Text>
                </View>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <Ionicons name="pricetags-outline" size={30} color="#50cc96" />
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
                  <Ionicons name="compass-outline" size={30} color="#50cc96" />
                </View>
                
                <View style={styles.textContainer}>
                  <Text style={styles.label}>South</Text>
                  <Controller
                    control={control}
                    name="south" 
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        value={value}
                        onChangeText={(text) => {
                          onChange(text);
                          autosave(data);
                        }}
                        editable={true}
                        className="h-10 bg-slate-50"
                      />
                    )}
                  />
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <Ionicons name="compass-outline" size={30}color="#50cc96" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.label}>East</Text>
                  <Controller
                    control={control}
                    name="east"
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        value={value}
                        onChangeText={(text) => {
                          onChange(text);
                          autosave(data);
                        }}
                        editable={true}
                        className="h-10 bg-slate-50"
                      />
                    )}
                  /> 
                </View>
              </View>

              <TouchableOpacity>
                <Text 
                onPress={handleCurrentLocation}
                className="bg-blue-500 text-center text-white text-sm font-bold py-3" style={{ width: 140, borderRadius: 8, marginLeft: 210 }}>Lokasi saat ini </Text>
              </TouchableOpacity>
            </View>

            
            <View style={styles.cardContainer}>
              <Text style={styles.title}>Hasil Pengukuran Lapangan</Text>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer} className="mt-4">
                  <MaterialCommunityIcons name="clipboard-check-outline" size={28} color="#50cc96"></MaterialCommunityIcons>
                </View>
                <View style={styles.textContainer} className="">
                  <Text style={styles.label}>Suhu Air (t°C)</Text>
                  <Controller control={control} name="lapangan.suhu_air" 
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        value={value}
                        onChangeText={(text) => {
                          onChange(text);
                          autosave(data);
                        }}
                        className="h-10 bg-slate-50"
                        enableErrors
                      />
                      )}
                    />
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.iconContainer} className="mt-4">
                  <MaterialCommunityIcons name="clipboard-check-outline" size={28} color="#50cc96"></MaterialCommunityIcons>
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.label}>pH</Text>
                  <Controller control={control} name="lapangan.ph" 
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        value={value}
                        onChangeText={(text) => {
                          onChange(text);
                          autosave(data);
                        }}
                        className="h-10 bg-slate-50"
                        enableErrors
                      />
                      )}
                    />
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <View style={styles.iconContainer} className="mt-4">
                  <MaterialCommunityIcons name="clipboard-check-outline" size={28} color="#50cc96"></MaterialCommunityIcons>
                </View>
                <View style={styles.textContainer} className="">
                  <Text style={styles.label}>DHL (µS/cm)</Text>
                  <Controller control={control} name="lapangan.dhl" 
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        value={value}
                        onChangeText={(text) => {
                          onChange(text);
                          autosave(data);
                        }}
                        className="h-10 bg-slate-50"
                        enableErrors
                      />
                      )}
                    />
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.iconContainer} className="mt-4">
                  <MaterialCommunityIcons name="clipboard-check-outline" size={28} color="#50cc96"></MaterialCommunityIcons>
                </View>
                <View style={styles.textContainer} className="">
                  <Text style={styles.label}>Salinitas (‰)</Text>
                  <Controller control={control} name="lapangan.salinitas" 
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        value={value}
                        onChangeText={(text) => {
                          onChange(text);
                          autosave(data);
                        }}
                        className="h-10 bg-slate-50"
                        enableErrors
                      />
                      )}
                    />
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.iconContainer} className="mt-4">
                  <MaterialCommunityIcons name="clipboard-check-outline" size={28} color="#50cc96"></MaterialCommunityIcons>
                </View>
                <View style={styles.textContainer} className="">
                  <Text style={styles.label}>DO (mg/L)</Text>
                  <Controller control={control} name="lapangan.do" 
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        value={value}
                        onChangeText={(text) => {
                          onChange(text);
                          autosave(data);
                        }}
                        className="h-10 bg-slate-50"
                        enableErrors
                      />
                      )}
                    />
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.iconContainer} className="mt-4">
                  <MaterialCommunityIcons name="clipboard-check-outline" size={28} color="#50cc96"></MaterialCommunityIcons>
                </View>
                <View style={styles.textContainer} className="">
                  <Text style={styles.label}>Kekeruhan</Text>
                  <Controller control={control} name="lapangan.kekeruhan" 
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        value={value}
                        onChangeText={(text) => {
                          onChange(text);
                          autosave(data);
                        }}
                        className="h-10 bg-slate-50"
                        enableErrors
                      />
                      )}
                    />
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.iconContainer} className="mt-4">
                  <MaterialCommunityIcons name="clipboard-check-outline" size={28} color="#50cc96"></MaterialCommunityIcons>
                </View>
                <View style={styles.textContainer} className="">
                  <Text style={styles.label}>Klorin Bebas</Text>
                  <Controller control={control} name="lapangan.klorin_bebas" 
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        value={value}
                        onChangeText={(text) => {
                          onChange(text);
                          autosave(data);
                        }}
                        className="h-10 bg-slate-50"
                        enableErrors
                      />
                      )}
                    />
                </View>
              </View>
            </View>

            <View style={styles.cardContainer}>
              <Text style={styles.title}>Kondisi Lingkungan</Text>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer} className="mt-4">
                  <Ionicons name="leaf-outline" size={28} color="#50cc96"></Ionicons>
                </View>
                <View style={styles.textContainer} className="">
                  <Text style={styles.label}>Suhu Udara (t°C)</Text>
                  <Controller control={control} name="lapangan.suhu_udara" 
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        value={value}
                        onChangeText={(text) => {
                          onChange(text);
                          autosave(data);
                        }}
                        className="h-10 bg-slate-50"
                        enableErrors
                      />
                      )}
                    />
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.iconContainer} className="mt-4">
                  <Ionicons name="leaf-outline" size={28} color="#50cc96"></Ionicons>
                </View>
                <View style={styles.textContainer} className="">
                  <Text style={styles.label}>Cuaca</Text>
                  <Controller control={control} name="lapangan.cuaca" 
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        value={value}
                        onChangeText={(text) => {
                          onChange(text);
                          autosave(data);
                        }}
                        className="h-10 bg-slate-50"
                        enableErrors
                      />
                      )}
                    />
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.iconContainer} className="mt-4">
                  <Ionicons name="leaf-outline" size={28} color="#50cc96"></Ionicons>
                </View>
                <View style={styles.textContainer} className="">
                  <Text style={styles.label}>Arah Angin</Text>
                  <Controller control={control} name="lapangan.arah_angin" 
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        value={value}
                        onChangeText={(text) => {
                          onChange(text);
                          autosave(data);
                        }}
                        className="h-10 bg-slate-50"
                        enableErrors
                      />
                      )}
                    />
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.iconContainer} className="mt-4">
                  <Ionicons name="leaf-outline" size={28} color="#50cc96"></Ionicons>
                </View>
                <View style={styles.textContainer} className="">
                  <Text style={styles.label}>Kelembapan (%RH)</Text>
                  <Controller control={control} name="lapangan.kelembapan" 
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        value={value}
                        onChangeText={(text) => {
                          onChange(text);
                          autosave(data);
                        }}
                        className="h-10 bg-slate-50"
                        enableErrors
                      />
                      )}
                    />
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.iconContainer} className="mt-4">
                  <Ionicons name="leaf-outline" size={28} color="#50cc96"></Ionicons>
                </View>
                <View style={styles.textContainer} className="">
                  <Text style={styles.label}>Kecepatan Angin</Text>
                  <Controller control={control} name="lapangan.kecepatan_angin" 
                    render={({ field: { onChange, value } }) => (
                      <TextInput
                        value={value}
                        onChangeText={(text) => {
                          onChange(text);
                          autosave(data);
                        }}
                        className="h-10 bg-slate-50"
                        enableErrors
                      />
                      )}
                    />
                </View>
              </View>
            </View>

            <View style={styles.lokasiContainer}>
              <Text style={styles.title}>Foto Lapangan/Lokasi</Text>
              <View style={styles.infoItem}>
              <Controller
                  control={control}
                  name="photos"
                  render={({ field: { onChange } }) => (
                    <View className="w-full">
                      {photos.length > 0 ? (
                        <View style={styles.imageContainer}>
                          {photos.map((photo, index) => (
                            <View key={index} style={styles.photoWrapper}>
                              <Image
                                source={{ uri: photo.uri }}  // Jika `photo` berisi URL, pastikan `photo.uri` sesuai
                                style={styles.signaturePreview}
                              />
                              <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => handleDeletePhoto(index)}
                              >
                                <Text style={styles.deleteButtonText}>X</Text>
                              </TouchableOpacity>
                            </View>
                          ))}
                          <TouchableOpacity className=" w-20 py-2 flex justify-center mt-4 bg-blue-500" onPress={handleChoosePhoto} style={{ borderRadius: 4, marginStart: "38.7%"}}>
                            <Text className="text-white text-sm font-semibold text-center">Tambah</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity style={styles.addSignatureButton} onPress={handleChoosePhoto}>
                          <Text style={styles.addSignatureText}>Tambah Foto</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                />
              </View>

              <View className="w-full mt-5" >
              <TouchableOpacity onPress={handleSubmitData}>
                <Text className="bg-blue-500 text-center text-white text-base font-bold py-3" style={{  borderRadius: 8 }}>Simpan & Upload</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={status == 0 ? handleKonfirmasi : handleBatalkanKonfirmasi}>
                <Text
                  className={`text-center text-white text-base font-bold py-3 mt-1 ${status == 0 ? 'bg-indigo-600' : 'bg-red-600'}`}
                  style={{ borderRadius: 8 }}
                >
                  {status == 0 ? 'KONFIRMASI' : 'BATALKAN KONFIRMASI'} {""}
                  
                </Text>
              </TouchableOpacity>
                  
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
