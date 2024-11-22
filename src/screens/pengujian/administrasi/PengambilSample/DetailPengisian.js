import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, TextInput, Alert, Platform  } from "react-native";
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
import { launchImageLibrary } from "react-native-image-picker";
import { useForm, Controller } from "react-hook-form";
import { rupiah } from "@/src/libs/utils";
import Geolocation from 'react-native-geolocation-service';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const DetailPengisian = ({ route, navigation }) => {
    const { uuid } = route.params;
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [file, setFile] = React.useState(null);
    const [currentPhotoUrl, setCurrentPhotoUrl] = useState(null);
    const { control, handleSubmit } = useForm();
    const [locationData, setLocationData] = useState({
      south: '',
      east: '',
    });
  
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
        },
        (error) => {
          console.error('Error getting location:', error);
          Alert.alert('Error', 'Unable to retrieve your location.');
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    };
  
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
  
    function rupiah(value) {
      return 'Rp. ' + value.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
  
  
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
          const source = { uri: response.assets[0].uri };
          setCurrentPhotoUrl(source.uri);
          setFile(source);
        }
      });
    };
  
    const handleDeletePhoto = () => {
      setCurrentPhotoUrl(null);
      setFile(null);
    };
  
    const onSubmit = (data) => {
      console.log(data);
    };
  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer} showVerticalScrollIndicator={false}>
         <View style={styles.cardContainer}>
              <Text style={styles.title}>Detail Lokasi</Text>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <Ionicons name="compass-outline" size={30} color="black" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.label}>South</Text>
                  {data.south ? (
                  <TextInput
                  value={data.south}
                  editable={true}
                  className="h-10 bg-slate-50 "></TextInput>
                ) : (
                  <TextInput
                  value={locationData.south}
                  onChangeText={(value) => setLocationData({ ...locationData, south: value })}
                  editable={true}
                  className="h-10 bg-slate-50 ">

                  </TextInput>
                )}  
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <Ionicons name="compass-outline" size={30} color="black" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.label}>East</Text>
                  {data.east ? (
                  <TextInput 
                  value={data.east}
                  editable={true}
                  className="h-10 bg-slate-50 "></TextInput>
                ) : (
                  <TextInput
                  value={locationData.east}
                  onChangeText={(value) => setLocationData({ ...locationData, east: value })}
                  editable={true}
                  className="h-10 bg-slate-50 ">

                  </TextInput>
                )}
                  </View>
              </View>

              <TouchableOpacity>
                <Text 
                onPress={handleCurrentLocation}
                className="bg-blue-500 text-center text-white text-sm font-poppins-semibold py-3" style={{ width: 140, borderRadius: 8, marginLeft: 210 }}>Lokasi saat ini </Text>
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
                  <TextInput className="h-10 bg-slate-50  ">{data.lapangan?.suhu_air}</TextInput>
                </View>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer} className="mt-4">
                  <MaterialCommunityIcons name="clipboard-check-outline" size={28} color="black"></MaterialCommunityIcons>
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.label}>pH</Text>
                  <TextInput className="h-10 bg-slate-50  ">{data.lapangan?.ph}</TextInput>
                </View>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer} className="mt-4">
                  <MaterialCommunityIcons name="clipboard-check-outline" size={28} color="black"></MaterialCommunityIcons>
                </View>
                <View style={styles.textContainer} className="">
                  <Text style={styles.label}>DHL (µS/cm)</Text>
                  <TextInput className="h-10 bg-slate-50  ">{data.lapangan?.dhl}</TextInput>
                </View>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer} className="mt-4">
                  <MaterialCommunityIcons name="clipboard-check-outline" size={28} color="black"></MaterialCommunityIcons>
                </View>
                <View style={styles.textContainer} className="">
                  <Text style={styles.label}>Salinitas (‰)</Text>
                  <TextInput className="h-10 bg-slate-50  ">{data.lapangan?.salitinitas}</TextInput>
                </View>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer} className="mt-4">
                  <MaterialCommunityIcons name="clipboard-check-outline" size={28} color="black"></MaterialCommunityIcons>
                </View>
                <View style={styles.textContainer} className="">
                  <Text style={styles.label}>DO (mg/L)</Text>
                  <TextInput className="h-10 bg-slate-50  ">{data.lapangan?.do}</TextInput>
                </View>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer} className="mt-4">
                  <MaterialCommunityIcons name="clipboard-check-outline" size={28} color="black"></MaterialCommunityIcons>
                </View>
                <View style={styles.textContainer} className="">
                  <Text style={styles.label}>Kekeruhan</Text>
                  <TextInput className="h-10 bg-slate-50  ">{data.lapangan?.kekeruhan}</TextInput>
                </View>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer} className="mt-4">
                  <MaterialCommunityIcons name="clipboard-check-outline" size={28} color="black"></MaterialCommunityIcons>
                </View>
                <View style={styles.textContainer} className="">
                  <Text style={styles.label}>Klorin Bebas</Text>
                  <TextInput className="h-10 bg-slate-50  ">{data.lapangan?.klorin_bebas}</TextInput>
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
                  <TextInput className="h-10 bg-slate-50  ">{data.lapangan?.suhu_udara}</TextInput>
                </View>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer} className="mt-4">
                  <FontAwesome5 name="seedling" size={28} color="black"></FontAwesome5>
                </View>
                <View style={styles.textContainer} className="">
                  <Text style={styles.label}>Cuaca</Text>
                  <TextInput className="h-10 bg-slate-50 ">{data.lapangan?.cuaca}</TextInput>
                </View>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer} className="mt-4">
                  <FontAwesome5 name="seedling" size={28} color="black"></FontAwesome5>
                </View>
                <View style={styles.textContainer} className="">
                  <Text style={styles.label}>Arah Angin</Text>
                  <TextInput className="h-10 bg-slate-50 ">{data.lapangan?.arah_angin}</TextInput>
                </View>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer} className="mt-4">
                  <FontAwesome5 name="seedling" size={28} color="black"></FontAwesome5>
                </View>
                <View style={styles.textContainer} className="">
                  <Text style={styles.label}>Kelembapan (%RH)</Text>
                  <TextInput className="h-10 bg-slate-50 ">{data.lapangan?.kelembapan}</TextInput>
                </View>
              </View>
              <View style={styles.infoItem}>
                <View style={styles.iconContainer} className="mt-4">
                  <FontAwesome5 name="seedling" size={28} color="black"></FontAwesome5>
                </View>
                <View style={styles.textContainer} className="">
                  <Text style={styles.label}>Kecepatan Angin</Text>
                  <TextInput className="h-10 bg-slate-50 ">{data.lapangan?.kecepatan_angin}</TextInput>
                </View>
              </View>
            </View>
            <View style={styles.lokasiContainer}>
              <Text style={styles.title}>Foto Lapangan/Lokasi</Text>
              <View style={styles.infoItem}>
                <Controller
                  control={control}
                  name="photo"
                  render={({ field: { onChange } }) => (
                    <View className="w-full">
                      <View style={styles.signatureField}>
                        {currentPhotoUrl || file ? (
                          <View style={styles.imageContainer}>
                            <Image
                              source={{ uri: file ? file.uri : currentPhotoUrl }}
                              style={styles.signaturePreview}
                              onError={(e) => console.log("Error loading image:", e.nativeEvent.error)}
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
                        <Text
                        className="flex bg-blue-500 text-white text-base font-poppins-semibold py-3" style={{ width: 170, borderRadius: 8, textAlign: 'center'}}>Simpan & Upload</Text>
                      </TouchableOpacity>
                      <TouchableOpacity>
                        <Text className="bg-blue-500 ml-3 text-center  text-white text-base font-poppins-semibold py-3" style={{ width: 170, borderRadius: 8,}}>Konfirmasi {""}
                          <FontAwesome6 name="check" className="" size={23}></FontAwesome6>
                        </Text>
                      </TouchableOpacity>
                      </View>
                    </View>
                  )}
                />
              </View>
            </View>
    </ScrollView>
  )
}

export default DetailPengisian