import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  ActivityIndicator 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BackButton from '../components/BackButton';
import axios from "@/src/libs/axios";

const ChangePasswordForm = ({navigation}) => {
  const [formData, setFormData] = useState({
    old_password: '',
    password: '',
    password_confirmation: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const togglePasswordVisibility = (field) => {
    setShowPassword((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const validateForm = () => {
    const { old_password, password, password_confirmation } = formData;

    if (!old_password) {
      Alert.alert('Error', 'Password Lama harus diisi');
      return false;
    }
    if (!password || password.length < 12) {
      Alert.alert('Error', 'Password Baru minimal terdiri dari 12 karakter');
      return false;
    }
    if (password !== password_confirmation) {
      Alert.alert('Error', 'Konfirmasi Password Baru tidak cocok');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await axios.post("/user/security", formData);
      
      // Berhasil mengubah password
      Alert.alert("Berhasil", response.data.message || "Password berhasil diubah!", [
        { 
          text: "OK", 
          onPress: () => {
            // Reset form
            setFormData({ 
              old_password: '', 
              password: '', 
              password_confirmation: '' 
            });
            // Kembali ke halaman sebelumnya
            navigation.goBack();
          } 
        }
      ]);
    } catch (error) {
      // Tangani kesalahan dari backend
      Alert.alert(
        "Kesalahan", 
        error.response?.data?.message || "Gagal mengubah password"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView className="bg-gray-100 py-8">

      <View className="flex-row items-center space-x-2  bg-white p-2 ml-3 mr-3 rounded-lg py-2.5">
        <BackButton action={() => navigation.goBack()} size={26} className="ml-2" ></BackButton>
        <View className="w-px h-full bg-gray-200 " />
        <View className="flex-1 items-center mr-11">
          <Text className="text-[18px] text-black font-poppins-semibold">
            Update Password
          </Text>
        </View>
      </View>

      <View style={{ alignItems: 'center' }} className="mt-5">
        <View className="bg-white rounded-lg p-6 w-[95%] shadow-lg">

          {/* Password Lama */}
          <View className="mb-6">
            <Text className="font-poppins-semibold text-sm mb-3">Password Lama</Text>
            <View className="relative">
              <TextInput
                secureTextEntry={!showPassword.old}
                className="border border-gray-300 rounded-lg px-4 py-3 text-base font-poppins-regular bg-white"
                value={formData.old_password}
                onChangeText={(text) => setFormData({ ...formData, old_password: text })}
                placeholderTextColor="#aaa"
              />
              <TouchableOpacity
                onPress={() => togglePasswordVisibility('old')}
                className="absolute top-0 right-0 h-full px-3 justify-center"
              >
                {showPassword.old ? (
                  <Ionicons name="eye-outline" size={20} color="grey" />
                ) : (
                  <Ionicons name="eye-off-outline" size={20} color="grey" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Password Baru */}
          <View className="mb-6">
            <Text className="font-poppins-semibold text-sm mb-3">Password Baru</Text>
            <View className="relative">
              <TextInput
                secureTextEntry={!showPassword.new}
                className="border border-gray-300 rounded-lg px-4 py-3 text-base font-poppins-regular bg-white"
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                placeholderTextColor="#aaa"
              />
              <TouchableOpacity
                onPress={() => togglePasswordVisibility('new')}
                className="absolute top-0 right-0 h-full px-3 justify-center"
              >
                {showPassword.new ? (
                  <Ionicons name="eye-outline" size={20} color="grey" />
                ) : (
                  <Ionicons name="eye-off-outline" size={20} color="grey" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Konfirmasi Password Baru */}
          <View className="mb-6">
            <Text className="font-poppins-semibold text-sm mb-3">Konfirmasi Password Baru</Text>
            <View className="relative">
              <TextInput
                secureTextEntry={!showPassword.confirm}
                className="border border-gray-300 rounded-lg px-4 py-3 text-base font-poppins-regular bg-white"
                value={formData.password_confirmation}
                onChangeText={(text) =>
                  setFormData({ ...formData, password_confirmation: text })
                }
                placeholderTextColor="#aaa"
              />
              <TouchableOpacity
                onPress={() => togglePasswordVisibility('confirm')}
                className="absolute top-0 right-0 h-full px-3 justify-center"
              >
                {showPassword.confirm ? (
                  <Ionicons name="eye-outline" size={20} color="grey" />
                ) : (
                  <Ionicons name="eye-off-outline" size={20} color="grey" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Tombol Simpan */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            className="rounded-lg py-3 flex items-center mb-5"
            style={{ backgroundColor: isSubmitting ? '#a0a0a0' : '#312e81' }}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-poppins-semibold text-sm">Ubah Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default ChangePasswordForm;