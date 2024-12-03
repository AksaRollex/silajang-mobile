import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BackButton from '../components/BackButton';

const ChangePasswordForm = ({navigation}) => {
  const [profileImage, setProfileImage] = useState(null);
  const [formData, setFormData] = useState({
    old_password: '',
    password: '',
    password_confirmation: '',
  });

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

    if (!old_password) return Alert.alert('Error', 'Password Lama harus diisi');
    if (!password || password.length < 12)
      return Alert.alert('Error', 'Password Baru minimal terdiri dari 12 karakter');
    if (password !== password_confirmation)
      return Alert.alert('Error', 'Konfirmasi Password Baru tidak cocok');
    return true;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      Alert.alert('Sukses', 'Password berhasil diubah!');
      setFormData({ old_password: '', password: '', password_confirmation: '' });
    }
  };

  return (
    <ScrollView className="bg-gray-100 py-8">
      <View style={{ alignItems: 'center' }} className="">
        <View className="bg-white rounded-lg p-6 w-[95%] shadow-lg">
      <View className="flex-row items-center space-x-2 mb-10 mt-2 ">
        <BackButton action={() => navigation.goBack()} size={26} />
        <View className="absolute left-0 right-3 items-center">
          <Text className="text-[20px] text-black font-poppins-semibold">Update Password</Text>
        </View>
      </View>

          {/* Password Lama */}
          <View className="mb-6">
            <Text className="font-poppins-semibold text-sm mb-3">Password Lama</Text>
            <View className="relative">
              <TextInput
                secureTextEntry={!showPassword.old}
                className="border border-gray-300 rounded-lg px-4 py-3 text-base font-poppins-regular bg-white"
                value={formData.old_password}
                onChangeText={(text) => setFormData({ ...formData, old_password: text })}
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
            className="rounded-lg py-3 flex items-center mb-5"
            style={{ backgroundColor: '#312e81' }}
          >
            <Text className="text-white font-poppins-semibold text-sm">Ubah Password</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default ChangePasswordForm;
