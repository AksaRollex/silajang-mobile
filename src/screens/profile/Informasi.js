import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  Alert, 
  ActivityIndicator,
  Platform
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { launchImageLibrary } from 'react-native-image-picker';
import BackButton from "../components/BackButton";
import { useUser } from "@/src/services";
import axios from "@/src/libs/axios"; // Adjust the import path as needed
import Icons from "react-native-vector-icons/AntDesign";

const UserProfileForm = ({ navigation }) => {
  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [nameError, setNameError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: userData, isLoading } = useUser();
  useEffect(() => {
    if (userData) {
      setName(userData.nama || "");
      if (userData.photo) {
        setProfileImage(userData.photo);
      }
    }
  }, [userData]);

  const handleDeletePhoto = () => {
    Alert.alert(
      "Hapus Foto Profil",
      "Apakah Anda yakin ingin menghapus foto profil?",
      [
        {
          text: "Batal",
          style: "cancel"
        },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => {
            // Set profileImage ke null
            setProfileImage(null);
          }
        }
      ]
    );
  };

  const validateName = () => {
    if (!name.trim()) {
      setNameError("Nama harus diisi");
      return false;
    }
    setNameError("");
    return true;
  };

  const handleImagePick = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Something went wrong');
      } else if (response.assets && response.assets.length > 0) {
        const selectedImage = response.assets[0];
        setProfileImage(selectedImage.uri);
      }
    });
  };

  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    if (!validateName()) return;
  
    const formData = new FormData();
    formData.append('nama', name);
  
    if (profileImage && profileImage !== userData?.photo) {
      const localUri = profileImage;
      const filename = localUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;
    
      formData.append('photo', {
        uri: Platform.OS === 'android' 
          ? localUri 
          : localUri.replace('file://', ''),
        name: filename,
        type,
      });
    }
  
    setIsSubmitting(true);
  
    try {
      const response = await axios.post("/user/account", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      // Mutate data (refresh state or cache)
      // onSuccess logic
      Alert.alert("Berhasil", "Profil Anda telah berhasil diperbarui.", [
        { text: "OK", onPress: () => console.log("Profil diperbarui") },
      ]);

      queryClient.invalidateQueries(["auth", "user"]);
  
      // Navigasi kembali ke halaman sebelumnya, jika diperlukan
      navigation.goBack();
    } catch (error) {
      // Tangani kesalahan di luar onSuccess
      Alert.alert(
        "Kesalahan",
        error.response?.data?.message || "Gagal memperbarui profil"
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const isSubmitDisabled = isSubmitting || 
    (name.trim() === userData?.nama && 
     (!profileImage || profileImage === userData?.photo));

  return (
    <ScrollView className="bg-gray-100 py-3">
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#312e81" />
        </View>
      ) : (
        <View className="mt-5" style={{ alignItems: "center" }}>
          <View className="bg-white rounded-lg p-6 w-[95%] shadow-lg">
          <View className="flex-row items-center space-x-2 mb-10 ">
            <BackButton action={() => navigation.goBack()} size={26} />
            <View className="absolute left-0 right-3 items-center">
              <Text className="text-[20px] text-black font-poppins-semibold">
                Update Profile
              </Text>
              <View className="h-px w-[120%] bg-gray-200 top-5" />
            </View>
          </View>
            <View className="mb-6">
              <Text className="font-poppins-semibold text-sm mb-3">Foto</Text>
              <TouchableOpacity
                onPress={handleImagePick}
                className="w-full h-40 border-2 border-dashed border-gray-300 bg-gray-50 rounded-lg flex items-center justify-center"
              >

                {profileImage ? (
                  <>
                  <Image
                  source={{ 
                    uri: profileImage.startsWith('http') || profileImage.startsWith('file:') 
                      ? profileImage 
                      : `${process.env.APP_URL}${profileImage}` 
                  }}
                    className="w-full h-full rounded-lg"
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                      onPress={handleDeletePhoto}
                      className="absolute -top-2 -right-2 bg-white rounded-full w-8 h-8 items-center justify-center shadow-lg border border-red-100"
                    >
                      <Icons name="close" size={18} color="#dc2626" />
                    </TouchableOpacity>
                  </>
                  
                ) : (
                  <Text className="text-gray-400 text-xs font-poppins-regular">
                    Pilih Foto
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <View className="mb-6">
              <Text className="font-poppins-semibold text-sm mb-3">Nama</Text>
              <TextInput
                className={`border rounded-lg px-4 py-2 text-sm font-poppins-regular ${
                  nameError ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:border-blue-500`}
                value={name}
                onChangeText={setName}
                onBlur={validateName}
                placeholder="Masukkan nama Anda"
                placeholderTextColor="#aaa"
              />
              {nameError && (
                <Text className="text-red-500 text-sm mt-2 font-poppins-regular">
                  {nameError}
                </Text>
              )}
            </View>

            <View className="mb-6">
              <Text className="font-poppins-semibold text-sm mb-3">Email</Text>
              <TextInput
                value={userData?.email || ""}
                placeholder="Tidak tersedia"
                className="border border-gray-300 bg-gray-100 rounded-lg px-4 py-2 text-sm font-poppins-regular text-gray-500"
                editable={false}
              />
            </View>

            <View className="mb-6">
              <Text className="font-poppins-semibold text-sm mb-3">
                No. Telepon
              </Text>
              <TextInput
                value={userData?.phone || ""}
                placeholder="Tidak tersedia"
                className="border border-gray-300 bg-gray-100 rounded-lg px-4 py-2 text-sm font-poppins-regular text-gray-500"
                editable={false}
              />
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitDisabled}
              className="rounded-lg py-3 flex items-center mt-3 mb-5"
              style={{ 
                backgroundColor: "#312e81",
              }}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-poppins-bold text-sm">
                  Simpan
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default UserProfileForm;