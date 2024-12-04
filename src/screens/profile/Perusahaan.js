import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  Platform 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BackButton from '../components/BackButton';


const Perusahaan = ({navigation}) => {
  const [profileImage, setProfileImage] = useState(null);
  const [formData, setFormData] = useState({
    instansi: '',
    alamat: '',
    pimpinan: '',
    pj_mutu: '',
    telepon: '',
    fax: '',
    email: '',
    jenis_kegiatan: '',
    lat: '',
    long: '',
    kab_kota_id: '',
    kecamatan_id: '',
    kelurahan_id: '',
    tanda_tangan: null
  });

  const [photoUri, setPhotoUri] = useState(null);

  const validateForm = () => {
    const {
      instansi, alamat, pimpinan, pj_mutu, 
      telepon, email, jenis_kegiatan, 
      lat, long, kecamatan_id, kelurahan_id
    } = formData;

    if (!instansi) {
      Alert.alert('Error', 'Nama Perusahaan/Instansi harus diisi');
      return false;
    }
    if (!alamat) {
      Alert.alert('Error', 'Alamat harus diisi');
      return false;
    }
    if (!pimpinan) {
      Alert.alert('Error', 'Pimpinan harus diisi');
      return false;
    }
    if (!pj_mutu) {
      Alert.alert('Error', 'PJ Mutu harus diisi');
      return false;
    }
    if (!telepon || !/^08[0-9]\d{8,11}$/.test(telepon)) {
      Alert.alert('Error', 'No. Telepon tidak valid');
      return false;
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Error', 'Email tidak valid');
      return false;
    }
    if (!jenis_kegiatan) {
      Alert.alert('Error', 'Jenis Kegiatan harus diisi');
      return false;
    }
    if (!lat) {
      Alert.alert('Error', 'Latitude harus diisi');
      return false;
    }
    if (!long) {
      Alert.alert('Error', 'Longitude harus diisi');
      return false;
    }
    if (!kecamatan_id) {
      Alert.alert('Error', 'Kecamatan harus diisi');
      return false;
    }
    if (!kelurahan_id) {
      Alert.alert('Error', 'Kelurahan harus diisi');
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // TODO: Implement actual submit logic
      Alert.alert('Sukses', 'Data Perusahaan berhasil disimpan!');
    }
  };

  const handleGetLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Error', 'Izin lokasi diperlukan');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setFormData(prev => ({
      ...prev,
      lat: location.coords.latitude.toString(),
      long: location.coords.longitude.toString()
    }));
  };

  const handleImagePick = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
      setFormData(prev => ({
        ...prev,
        tanda_tangan: result.assets[0].uri
      }));
    }
  };

  return (
    <ScrollView className="bg-gray-100 py-8">
      <View style={{ alignItems: 'center' }} className=" mb-28">
        <View className="bg-white rounded-lg p-6 w-[95%] shadow-lg">
        <View className="flex-row items-center space-x-2 mb-10 mt-2 ">
          <BackButton action={() => navigation.goBack()} size={26} />
          <View className="absolute left-0 right-3 items-center">
            <Text className="text-[20px] text-black font-poppins-semibold">Update Perusahaan</Text>
            <View className="h-px w-[120%] bg-gray-200 top-5"/>
          </View>
        </View>
          <View className="mb-6">
          <Text className="font-poppins-semibold text-sm mb-3">Tanda Tangan</Text>

          <TouchableOpacity>
            <Text className="font-poppins-semibold text-sm mb-3 flex text-center">Open Camera</Text>
          </TouchableOpacity>
          <Text className="font-poppins-semibold text-sm mb-3 flex text-center">Or</Text>
          <TouchableOpacity 
            onPress={handleImagePick} 
            className="w-full h-28 border-2 border-dashed border-gray-300 bg-gray-50 rounded-lg flex items-center justify-center"
          >
            {profileImage ? (
              <Image 
                source={{ uri: profileImage }} 
                className="w-full h-full rounded-lg" 
                resizeMode="cover" 
              />
            ) : (
              <Text className="text-gray-400 text-xs font-poppins-regular">Pilih Foto</Text>
            )}
          </TouchableOpacity>
        </View>

          {/* Nama Perusahaan/Instansi */}
          <View className="mb-6">
            <Text className="font-poppins-semibold text-sm mb-3">Nama Perusahaan/Instansi <Text className="text-red-500">*</Text> </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base font-poppins-regular bg-white"
              value={formData.instansi}
              onChangeText={(text) => setFormData(prev => ({ ...prev, instansi: text }))}
            />
          </View>

          {/* Alamat */}
          <View className="mb-6">
            <Text className="font-poppins-semibold text-sm mb-3">Alamat  <Text className="text-red-500">*</Text></Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base font-poppins-regular bg-white"
              value={formData.alamat}
              onChangeText={(text) => setFormData(prev => ({ ...prev, alamat: text }))}
            />
          </View>

          {/* Pimpinan */}
          <View className="mb-6">
            <Text className="font-poppins-semibold text-sm mb-3">Pimpinan <Text className="text-red-500">*</Text></Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base font-poppins-regular bg-white"
              value={formData.pimpinan}
              onChangeText={(text) => setFormData(prev => ({ ...prev, pimpinan: text }))}
            />
          </View>

          {/* PJ Mutu */}
          <View className="mb-6">
            <Text className="font-poppins-semibold text-sm mb-3">PJ Mutu <Text className="text-red-500">*</Text></Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base font-poppins-regular bg-white"
              value={formData.pj_mutu}
              onChangeText={(text) => setFormData(prev => ({ ...prev, pj_mutu: text }))}
            />
          </View>

          {/* No. Telepon */}
          <View className="mb-6">
            <Text className="font-poppins-semibold text-sm mb-3">No. Telepon <Text className="text-red-500">*</Text></Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base font-poppins-regular bg-white"
              keyboardType="phone-pad"
              value={formData.telepon}
              onChangeText={(text) => setFormData(prev => ({ ...prev, telepon: text }))}
            />
          </View>

          <View className="mb-6">
            <Text className="font-poppins-semibold text-sm mb-3">FAX </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base font-poppins-regular bg-white"
              keyboardType="phone-pad"
              value={formData.fax}
              onChangeText={(text) => setFormData(prev => ({ ...prev, fax: text }))}
            />
          </View>

          {/* Email */}
          <View className="mb-6">
            <Text className="font-poppins-semibold text-sm mb-3">Email <Text className="text-red-500">*</Text></Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base font-poppins-regular bg-white"
              keyboardType="email-address"
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
            />
          </View>

          <View className="mb-6">
            <Text className="font-poppins-semibold text-sm mb-3">Jenis Kegiatan <Text className="text-red-500">*</Text></Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base font-poppins-regular bg-white"
              value={formData.jenis_kegiatan}
              onChangeText={(text) => setFormData(prev => ({ ...prev, jenis_kegiatan: text }))}
            />
          </View>

          {/* Lokasi */}
          <View className="mb-6">
          <View className="flex-row space-x-[33%]">
            <Text className="font-poppins-semibold text-sm mb-3">Latitude <Text className="text-red-500">*</Text></Text>
            <Text className="font-poppins-semibold text-sm mb-3 ">Longitude <Text className="text-red-500">*</Text></Text>
            </View>  
            <View className="flex-row space-x-2">
              <TextInput
                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-base font-poppins-regular bg-white"
                value={formData.lat}
                onChangeText={(text) => setFormData(prev => ({ ...prev, lat: text }))}
              />
              <TextInput
                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-base font-poppins-regular bg-white"
                value={formData.long}
                onChangeText={(text) => setFormData(prev => ({ ...prev, long: text }))}
              />
            </View>
            {/* <TouchableOpacity 
              onPress={handleGetLocation}
              className="mt-2 p-2 bg-blue-600 rounded-lg"
            >
              <Text className="text-white text-center">Dapatkan Lokasi Saya</Text>
            </TouchableOpacity> */}
          </View>

          {/* Simpan Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            className="rounded-lg py-3 flex items-center mt-4"
            style={{ backgroundColor: '#312e81' }}
          >
            <Text className="text-white font-poppins-semibold text-sm">Simpan</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default Perusahaan;