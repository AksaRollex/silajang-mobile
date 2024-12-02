import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import BackButton from '../components/BackButton';

const UserProfileForm = ({navigation}) => {
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [nameError, setNameError] = useState('');

  const validateName = () => {
    if (!name.trim()) {
      setNameError('Nama harus diisi');
      return false;
    }
    setNameError('');
    return true;
  };

  const handleSubmit = () => {
    if (validateName()) {
      Alert.alert('Berhasil', 'Profil berhasil disimpan');
    }
  };

  const handleImagePick = () => {
    Alert.alert('Pilih Foto', 'Fungsi pemilihan foto akan diimplementasikan');
  };

  return (
    <ScrollView className="bg-gray-100 py-8">
      <View className="mt-">
      </View>
      <View style={{ alignItems: 'center' }} className="">
      <View className="bg-white rounded-lg p-6 w-[95%] shadow-lg">
      <View className="flex-row items-center space-x-2 mb-10 mt-2 ">
        <BackButton action={() => navigation.goBack()} size={26} />
        <View className="absolute left-0 right-3 items-center">
          <Text className="text-[20px] text-black font-poppins-semibold">Update Profile</Text>
        </View>
      </View>
        {/* Foto */}
        <View className="mb-6">
          <Text className="font-poppins-semibold text-sm mb-3">Foto</Text>
          <TouchableOpacity 
            onPress={handleImagePick} 
            className="w-full h-40 border-2 border-dashed border-gray-300 bg-gray-50 rounded-lg flex items-center justify-center"
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

        {/* Nama */}
        <View className="mb-6">
          <Text className="font-poppins-semibold text-sm mb-3">Nama</Text>
          <TextInput
            className={`border rounded-lg px-4 py-2 text-base font-poppins-regular ${nameError ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-blue-500`}
            value={name}
            onChangeText={setName}
            onBlur={validateName}
            placeholderTextColor="#aaa"
          />
          {nameError && (
            <Text className="text-red-500 text-sm mt-2 font-poppins-regular">{nameError}</Text>
          )}
        </View>

        {/* Email */}
        <View className="mb-6">
          <Text className="font-poppins-semibold text-sm mb-3">Email</Text>
          <TextInput
            className="border border-gray-300 bg-gray-100 rounded-lg px-4 py-2 text-base font-poppins-regular text-gray-500"
            editable={false}
          />
        </View>

        {/* No. Telepon */}
        <View className="mb-6">
          <Text className="font-poppins-semibold text-sm mb-3">No. Telepon</Text>
          <TextInput
            className="border border-gray-300 bg-gray-100 rounded-lg px-4 py-2 text-base font-poppins-regular text-gray-500"
            editable={false}
          />
        </View>

        {/* Tombol Simpan */}
        <TouchableOpacity 
          onPress={handleSubmit} 
          className=" rounded-lg py-3 flex items-center"
          style={{ backgroundColor: '#312e81' }}
        >
          <Text className="text-white font-poppins-bold text-base">Simpan</Text>
        </TouchableOpacity>
      </View>
      </View>
    </ScrollView>
  );
};

export default UserProfileForm;
