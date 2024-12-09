import { View, Text, Button } from "react-native-ui-lib";
import React, { memo, useEffect, useState } from "react";
import { useForm, Controller, set } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ActivityIndicator, ScrollView, StyleSheet, TextInput, Image, TouchableOpacity,} from "react-native";
import axios from "@/src/libs/axios";
import Toast from "react-native-toast-message";
import { launchImageLibrary } from "react-native-image-picker";
import BackButton from "@/src/screens/components/BackButton";
import Select2 from "@/src/screens/components/Select2";
import { APP_URL } from "@env";
import SectionedMultiSelect from "react-native-sectioned-multi-select";
import Ionicons from "react-native-vector-icons/Ionicons";
import Icon from "react-native-vector-icons/MaterialIcons";
import Icons from "react-native-vector-icons/AntDesign";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Platform } from 'react-native';

export default memo(function Form({ route, navigation }) {
  const { uuid } = route.params || {};
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(null);
  const [userData, setUserData] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [photott, setPhotoTT] = useState([]);
  const [tandatangan, setTandaTangan] = useState([]);
  const [kotaKab, setKotaKab] = useState([]);
  const [kecamatan, setKecamatan] = useState([]);
  const [golongan, setGolongan] = useState([]);
  const [jabatan, setJabatan] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [selectedJabatan, setSelectedJabatan] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ tanda_tangan_id: "", });
  const [tandaTanganUrl, setTandaTanganUrl] = useState(null);
  const [tandaTanganFile, setTandaTanganFile] = useState(null);
  const togglePasswordVisibility = () => { setShowPassword(!showPassword);};

  const { handleSubmit, control, formState: { errors }, setValue, watch} = useForm({
    values: { ...userData },
    defaultValues: {
      nama: "",
      nip: "",
      nik: "",
      email: "",
      phone: "",
      password: "",
      password_confirmation: "",
      golongan_id: "",
      role_ids: "",
      detail: {
        instansi: "",
        alamat: "",
        pimpinan: "",
        pj_mutu: "",
        telepon: "",
        fax: "",
        email: "",
        jenis_kegiatan: "",
        lat: "",
        long: "",
      },
    },
  });

  const { data, isLoading: isLoadingData } = useQuery(
    ["user", uuid],
    () =>
      uuid
        ? axios.get(`/master/user/${uuid}/edit`).then(res => res.data.data)
        : null,
    {
      enabled: !!uuid,
      onSuccess: data => {
        if (data) {
          setValue("nama", data.nama);
          setValue("nip", data.nip);
          setValue("nik", data.nik);
          setValue("email", data.email);
          setValue("phone", data.phone);
          setPhotos(data.photo);
          setPhotoTT(data.detail.tanda_tangan);
          setValue("golongan_id", data.golongan_id);
          setValue("role_ids", data.role_ids);
          // setCurrentPhotoUrl(data.detail.tanda_tangan);
          if (data.detail) {
            Object.keys(data.detail).forEach(key => {
              setValue(`detail.${key}`, data.detail[key]);
            });
          }
        }
      },
      onError: error => {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to load data",
        });
        console.error(error);
      },
    },
  );

  
  
  useEffect(() => {
    const fetchTandaTangan = async () => {
      try {
        const response = await axios.get(`/master/user/${uuid}/edit`);
        const userData = response.data.data;
  
        if (userData.detail.tanda_tangan) {
          const fullTandaTanganUrl = `${APP_URL}${userData.detail.tanda_tangan}`;
          setTandaTanganUrl(fullTandaTanganUrl);
          setTandaTanganFile(fullTandaTanganUrl);
          setPhotoTT([]);
        } else {
          setTandaTanganUrl(null);
          setTandaTanganFile(null);
          setPhotoTT([]);
        }

      } catch (error) {
        console.error("Error fetching tanda tangan:", error);
        Toast.show({
          type: "error",
          text1: "Gagal memuat tanda tangan",
          text2: "Tidak dapat mengambil tanda tangan"
        });
        setTandaTanganUrl(null);
        setTandaTanganFile(null);
        setPhotoTT([])
      }
    };
  
    if (uuid) {
      fetchTandaTangan();
    }
  }, [uuid, APP_URL]);

  const handleChooseTandaTangan = () => {
    const options = {
      mediaType: 'photo',
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
      selectionLimit: 1,
    };
  
    launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        return;
      }
  
      if (response.errorCode) {
        Toast.show({
          type: "error",
          text1: "Kesalahan",
          text2: response.errorMessage || "Gagal memilih gambar"
        });
        return;
      }
  
      if (response.assets && response.assets.length > 0) {
        const selectedImage = response.assets[0];
        
        // Validasi ukuran file
        const fileSizeInKB = selectedImage.fileSize / 1024;
        if (fileSizeInKB > 2048) {
          Toast.show({
            type: "error",
            text1: "Ukuran file terlalu besar",
            text2: "Ukuran file tidak boleh melebihi 2 MB"
          });
          return;
        }
  
        const tandaTanganFile = {
          uri: Platform.OS === 'android' 
            ? selectedImage.uri 
            : selectedImage.uri.replace('file://', ''),
          type: selectedImage.type || "image/jpeg",
          name: selectedImage.fileName || "tanda_tangan.jpg"
        };
  
        // Update state
        setTandaTangan(tandaTanganFile);
        setTandaTanganUrl(selectedImage.uri);
      }
    });
  };
  const handleDeleteTandaTangan = async () => {
    try {
      const response = await axios.post(`/master/user/${uuid}/update`, {
        detail: { tanda_tangan: null }
      });

      setTandaTanganUrl(null);
      setTandaTanganFile([]);
  
      Toast.show({
        type: "success",
        text1: "Berhasil",
        text2: "Tanda tangan telah dihapus"
      });
      
      // Refetch user data to ensure sync with backend
      await refetchUserData();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Gagal",
        text2: "Tidak dapat menghapus tanda tangan"
      });
    }
  };

  useEffect(() => {
    const fetchUserPhoto = async () => {
      try {
        const response = await axios.get(`/master/user/${uuid}/edit`);
        const userData = response.data.data;

        if (userData.photo) {
          const fullPhotoUrl = `${APP_URL}${userData.photo}`;
          setCurrentPhotoUrl(fullPhotoUrl);
          setProfileImage(fullPhotoUrl);
          setPhotos([fullPhotoUrl]);
        } else {
          setCurrentPhotoUrl(null);
          setProfileImage(null);
          setPhotos([]);
        }
      } catch (error) {
        console.error("Error fetching photo:", error);
        Toast.show({
          type: "error",
          text1: "Gagal memuat foto",
          text2: "Tidak dapat mengambil foto profil"
        });
        setCurrentPhotoUrl(null);
        setProfileImage(null);
        setPhotos([]);
      }
    };
    if (uuid) {
      fetchUserPhoto();
    }
  }, [uuid, APP_URL]);
  const handleImagePick = () => {
    const options = {
      mediaType: 'photo',
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };
    launchImageLibrary(options, async (response) => {
      if (response.errorCode) {
        Toast.show({
          type: "error",
          text1: "Kesalahan",
          text2: response.errorMessage || "Gagal memilih gambar"
        });
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const selectedImage = response.assets[0];
        const fileSizeInKB = selectedImage.fileSize / 1024;
        if (fileSizeInKB > 2048) {
          Toast.show({
            type: "error",
            text1: "Ukuran file terlalu besar",
            text2: "Ukuran file tidak boleh melebihi 2 MB"
          });
          return;
        }
        const photoFile = {
          uri: selectedImage.uri,
          type: selectedImage.type || "image/jpeg",
          name: selectedImage.fileName || "profile_photo.jpg"
        };
        setProfileImage(photoFile);
      }
    });
  };

  const handleRemovePhoto = async () => {
    try {
      const response = await axios.post(`/master/user/${uuid}/update`, {
        photo: null
      });
      setProfileImage(null);
      setCurrentPhotoUrl(null);
      setPhotos([]);

      Toast.show({
        type: "success",
        text1: "Berhasil",
        text2: "Foto profil telah dihapus"
      });
      await refetchUserData();
    } catch (error) {
      console.error("Remove photo error:", error);
      Toast.show({
        type: "error",
        text1: "Gagal",
        text2: error.response?.data?.message || "Tidak dapat menghapus foto"
      });
    }
  };

  function fetchJabatan() {
    axios.get("/master/jabatan").then(res => {
      const jabatan = res.data.data.map(item => ({
        id: item.id,
        name: item.full_name,
      }));
      setJabatan(jabatan);
    });
  }

  useEffect(() => {
    setGolongan([
      {
        value: 1,
        label: "Customer",
      },
      {
        value: 2,
        label: "Dinas Internal",
      },
    ]);
    fetchJabatan();
  }, [data]);

  const queryClient = useQueryClient();

  const { mutate: createOrUpdate, isLoading } = useMutation(
    data =>
      axios.post(
        uuid ? `/master/user/${uuid}/update` : "/master/user/store",
        data,
      ),
    {
      onSuccess: () => {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: uuid ? "Success update data" : "Success create data",
        });
        queryClient.invalidateQueries(["/master/user"]);
        navigation.navigate("Users");
      },
      onError: error => {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: uuid ? "Failed update data" : "Failed create data",
        });
        console.error(error.response);
      },
    },
  );

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      
      formData.append('nama', data.nama);
      formData.append('nip', data.nip);
      formData.append('nik', data.nik);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('golongan_id', data.golongan_id);
      if (data.role_ids) {
        if (Array.isArray(data.role_ids)) {
          data.role_ids.forEach((roleId, index) => {
            formData.append(`role_ids[${index}]`, roleId);
          });
        } 
        else {
          const roleIds = String(data.role_ids).split(',').map(id => id.trim());
          roleIds.forEach((roleId, index) => {
            formData.append(`role_ids[${index}]`, roleId);
          });
        }
      }
  
      if (data.password) {
        formData.append('password', data.password);
        formData.append('password_confirmation', data.password_confirmation);
      }
  
      if (data.detail) {
        const detailFields = [
          'instansi', 'alamat', 'pimpinan', 'pj_mutu', 
          'telepon', 'fax', 'email', 'jenis_kegiatan', 
          'lat', 'long'
        ];
  
        detailFields.forEach(field => {
          if (data.detail[field]) {
            formData.append(`detail[${field}]`, data.detail[field]);
          }
        });
      }

      if (profileImage) {
        const photoFile = {
          uri: profileImage.uri || profileImage,
          type: profileImage.type || 'image/jpeg',
          name: profileImage.name || 'profile_photo.jpg'
        };
        formData.append('photo', {
          uri: photoFile.uri,
          type: photoFile.type,
          name: photoFile.name
        });
      }
  
      if (tandaTanganUrl) {
        formData.append('tanda_tangan', {
          uri: tandaTanganUrl.uri || tandaTanganUrl,
          type: tandaTanganUrl.type || 'image/jpeg',
          name: tandaTanganUrl.name || 'tanda_tangan.jpg'
        });
      }
  
      console.log(formData, 99888)
      const endpoint = uuid 
        ? `/master/user/${uuid}/update`
        : "/master/user/store";
  
      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      Toast.show({
        type: "success",
        text1: "Success",
        text2: uuid ? "Berhasil memperbarui data" : "Berhasil membuat data",
      });

      queryClient.invalidateQueries(["/master/user"]);
      navigation.navigate("Users");
      console.log(response.data);
    } catch (error) {
      console.error("Submit Error:", error.response?.data);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: uuid 
          ? `Gagal memperbarui data: ${error.response?.data?.message || ''}`
          : "Gagal membuat data",
      });
    }
  };

  if (isLoadingData && uuid) {
    return (
      <View className="h-full flex justify-center">
        <ActivityIndicator size={"large"} color={"#312e81"} />
      </View>
    );
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.cardContainer}>
          <View className="">
            <View className="w-full items-center mt-5 justify-center">
              <TouchableOpacity
                onPress={handleImagePick}
                style={{
                  alignSelf: "center"
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="large" color="#312e81" />
                ) : profileImage ? (
                  <View className="rounded-full w-40 h-40 overflow-hidden relative">
                    <Image
                      source={{ uri: profileImage.uri || profileImage }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      onPress={handleRemovePhoto}
                      className="absolute bottom-0 right-0 bg-red-500 p-1 rounded-full"
                    >
                      <MaterialIcons name="delete" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View
                    className="rounded-full  bg-gray-300 items-center justify-center w-36 h-36"
                    style={{ borderWidth: 2, borderColor: "#E2E8F0" }}
                  >
                    <Ionicons
                      name="person"
                      size={62}
                      color="#666666"
                    />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label} className="mt-8">Nama</Text>
            <Controller
              control={control}
              name="nama"
              rules={{ required: "Nama is required" }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.nama && (
              <Text style={styles.errorText}>{errors.nama.message}</Text>
            )}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>NIP</Text>
            <Controller
              control={control}
              name="nip"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>NIK</Text>
            <Controller
              control={control}
              name="nik"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Email</Text>
            <Controller
              control={control}
              name="email"
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                  keyboardType="email-address"
                />
              )}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email.message}</Text>
            )}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Phone</Text>
            <Controller
              control={control}
              name="phone"
              rules={{
                required: "Phone number is required",
                pattern: {
                  value: /^08[0-9]\d{8,11}$/,
                  message: "Invalid phone number",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                  keyboardType="phone-pad"
                />
              )}
            />
            {errors.phone && (
              <Text style={styles.errorText}>{errors.phone.message}</Text>
            )}
          </View>

          <Controller
            control={control}
            name="role_ids"
            rules={{ required: "Jabatan harus diisi" }}
            render={({ field: { onChange, value } }) => (
              <View className="mt-1">
                <Text style={styles.label}>Jabatan</Text>
                <View className="border rounded-lg border-stone-300 bg-[#fff] p-3">
                  <SectionedMultiSelect
                    IconRenderer={Icon}
                    hideTags
                    styles={{
                      selectToggle: {
                        backgroundColor: "#fff",
                        borderWidth: 1,
                        borderColor: "#CCC",
                        borderRadius: 10,
                        padding: 10,
                        fontFamily: "Poppins-Regular",
                        marginBottom: 8,
                      },
                      selectToggleText: {
                        fontFamily: "Poppins-Regular",
                        fontSize: 15,
                      },
                      displayKey: {
                        fontFamily: "Poppins-Regular",
                        color: "#333",
                      },
                      chipContainer: {
                        borderRadius: 10,
                        backgroundColor: "#f8f8f8",
                      },
                      chipText: {
                        color: "#FF0000",
                        fontSize: 12,
                        fontFamily: "Poppins-Regular",
                      },
                      chipIcon: {
                        color: "#000",
                      },
                      itemText: {
                        borderRadius: 16,
                        backgroundColor: "#f8f8f8",
                        padding: 12,
                        color: "#333",
                        fontFamily: "Poppins-Regular",
                      },
                      selectedItem: {
                        borderRadius: 16,
                      },
                      selectedItemText: {
                        fontFamily: "Poppins-Regular",
                        color: "#46923c",
                        backgroundColor: "#ececec",
                      },
                      confirmText: {
                        fontFamily: "Poppins-Semibold",
                        color: "#FFF",
                      },
                      button: {
                        backgroundColor: "#311B74",
                        borderRadius: 16,
                        paddingHorizontal: 12,
                        paddingVertical: 12,
                        margin: 10,
                      },
                      cancelButton: {
                        backgroundColor: "#FF0000",
                        borderRadius: 16,
                        paddingHorizontal: 12,
                        paddingVertical: 12,
                        margin: 10,
                      },
                      searchTextInput: {
                        fontFamily: "Poppins-Regular",
                        color: "#333",
                      },
                      itemFontFamily: "Poppins-Regular",
                      icons: {
                        search: {
                          name: "search",
                          color: "#000",
                        },
                      },
                      confirmText: {
                        fontFamily: "Poppins-Regular",
                        color: "#FFF",
                      },
                      itemFontFamily: "Poppins-Regular",
                    }}
                    items={jabatan}
                    uniqueKey="id"
                    subKey="children"
                    onSelectedItemsChange={items => {
                      onChange(items);
                      setSelectedJabatan(items);
                    }}
                    selectedItems={value || []}
                    selectText="Pilih Jabatan"
                    confirmText="KONFIRMASI"
                    showRemoveAll={true}
                    removeAllText="Hapus Semua"
                    modalAnimationType="fade"
                    showCancelButton={true}
                    searchPlaceholderText="Cari Jabatan..."
                    onChangeInput={text => console.log(text)}
                  />
                </View>
              </View>
            )}
          />

          {errors.role_ids && (
            <Text className="text-red-500">{errors.role_ids.message}</Text>
          )}
          <Text style={styles.label} className="mt-3">Tipe</Text>
          <Controller
            control={control}
            name="golongan_id"
            rules={{ required: "Tipe harus diisi" }}
            render={({ field: { onChange, value } }) => (
              <Select2
                onChangeValue={onChange}
                value={value}
                items={golongan}
                placeholder={{ label: "Pilih Tipe", value: null }}
              />
            )}
          />
          {errors.golongan_id && (
            <Text className="text-red-500">{errors.golongan_id.message}</Text>
          )}

          <Text style={styles.label} className="mt-3">Tanda Tangan</Text>
          <View style={styles.infoItem}>
            <Controller
              control={control}
              name="tanda_tangan"
              render={({ field: { onChange } }) => (
                <View className="w-full">
                  {tandaTanganUrl ? (
                    <View className="border-2 border-dashed border-indigo-600/30 bg-indigo-50/30 rounded-2xl p-4">
                      <View className="items-center">
                        <View className="relative">
                          <Image
                            source={{ uri: tandaTanganUrl }}
                            className="w-48 h-48 rounded-lg"
                            resizeMode="contain"
                            onError={(e) => {
                              console.log("Error loading image:", e.nativeEvent.error);
                              setTandaTanganUrl(null);
                            }}
                          />
                          <TouchableOpacity
                            className="absolute -top-2 -right-2 bg-white rounded-full w-8 h-8 items-center justify-center shadow-lg border border-red-100"
                            onPress={() => {
                              // handleDeleteTandaTangan();
                              setValue('detail.tanda_tangan', null);
                              setTandaTanganFile(null);
                              setTandaTanganUrl(null);
                            }}>
                            <Icons name="close" size={18} color="#dc2626" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            className="absolute bottom-0 right-0 bg-indigo-600 rounded-full w-10 h-10 items-center justify-center shadow-lg"
                            onPress={() => {
                              handleChooseTandaTangan();
                              onChange(null); 
                            }}>
                            <Icons name="camera" size={20} color="white" />
                          </TouchableOpacity>
                        </View>
                        <Text className="font-poppins-medium text-sm text-gray-600 mt-3">
                          Ketuk ikon kamera untuk mengubah foto
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity
                      className="border-2 border-dashed border-indigo-600/30 bg-indigo-50/20 rounded-2xl p-8"
                      onPress={() => {
                        handleChooseTandaTangan();
                        onChange(null); 
                      }}>
                      <View className="items-center space-y-4">
                        <View className="bg-indigo-100 rounded-full p-5">
                          <SimpleLineIcons
                            name="cloud-upload"
                            size={40}
                            color="#4f46e5"
                          />
                        </View>
                        <View className="items-center">
                          <Text className="font-poppins-semibold text-base text-indigo-600 mb-1">
                            Unggah Tanda Tangan
                          </Text>
                          <Text className="font-poppins-regular text-xs text-gray-500 text-center">
                            Klik atau sentuh area ini untuk memilih foto
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            />
          </View>
        </View>

        {/* Company Details */}
        <View style={styles.cardContainer}>
          <Text style={styles.sectionTitle}>Nama Instansi/Perusahaan</Text>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Nama Instansi/Perusahaan</Text>
            <Controller
              control={control}
              name="detail.instansi"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Pimpinan</Text>
            <Controller
              control={control}
              name="detail.pimpinan"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Email</Text>
            <Controller
              control={control}
              name="detail.pj_mutu"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
          </View>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>No. Telepon</Text>
            <Controller
              control={control}
              name="detail.pj_mutu"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
          </View>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>FAX</Text>
            <Controller
              control={control}
              name="detail.pj_mutu"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
          </View>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Jenis Kegiatan</Text>
            <Controller
              control={control}
              name="detail.pj_mutu"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
          </View>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>PJ Mutu</Text>
            <Controller
              control={control}
              name="detail.pj_mutu"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
          </View>
        </View>

        {/* Location Information */}
        <View style={styles.cardContainer}>
          <Text style={styles.sectionTitle}>Location Information</Text>

          <View style={styles.rowContainer}>
            <View style={[styles.fieldContainer, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Latitude</Text>
              <Controller
                control={control}
                name="detail.lat"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChange}
                    keyboardType="numeric"
                  />
                )}
              />
            </View>
            <View style={[styles.fieldContainer, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Longitude</Text>
              <Controller
                control={control}
                name="detail.long"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChange}
                    keyboardType="numeric"
                  />
                )}
              />
            </View>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Alamat</Text>
            <Controller
              control={control}
              name="detail.alamat"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={value}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={3}
                />
              )}
            />
          </View>
          <Text style={styles.label}>Kecamatan</Text>
          <Controller
            control={control}
            name="kecamatan_id"
            // rules={{ required: "Kecamatan harus diisi" }}
            render={({ field: { onChange, value } }) => (
              <Select2
                onChangeValue={async newValue => {
                  onChange(newValue);
                  setValue("kecamatan_id", null); // Reset kecamatan
                  setKecamatan([]); // Clear kecamatan list
                  if (newValue) {
                    await fetchKecamatan(newValue);
                  }
                }}
                value={value}
                items={kotaKab}
                placeholder={{ label: "Pilih Kecamatan", value: null }}
              />
            )}
          />
          {errors.kab_kota_id && (
            <Text className="text-red-500">{errors.kecamatan_id.message}</Text>
          )}

          <Text style={styles.label}>Kelurahan</Text>
          <Controller
            control={control}
            name="kecamatan_id"
            // rules={{ required: "Kecamatan harus diisi" }}
            render={({ field: { onChange, value } }) => (
              <Select2
                onChangeValue={onChange}
                value={value}
                items={kecamatan}
                placeholder={{ label: "Pilih kelurahan", value: null }}
              />
            )}
          />
          {errors.kecamatan_id && (
            <Text className="text-red-500">{errors.kecamatan_id.message}</Text>
          )}

          <View className="mb-4">
            <Text style={styles.label}>Password</Text>
            <View className="relative">
              <TextInput
                className="border border-gray-300 rounded-md p-3 font-poppins-medium w-full pr-12"
                secureTextEntry={!showPassword}
                value={formData.passphrase}
                onChangeText={text =>
                  setFormData(prev => ({ ...prev, passphrase: text }))
                }
              />
              <TouchableOpacity
                onPress={togglePasswordVisibility}
                className="absolute right-4 top-4">
                {showPassword ? (
                  <Ionicons name="eye-outline" size={20} color="grey" />
                ) : (
                  <Ionicons name="eye-off-outline" size={20} color="grey" />
                )}
              </TouchableOpacity>
            </View>
          </View>
          <View className="mb-4">
            <Text style={styles.label}>Konfirmasi Password</Text>
            <View className="relative">
              <TextInput
                className="border border-gray-300 rounded-md p-3 font-poppins-medium w-full pr-12"
                secureTextEntry={!showPassword}
                value={formData.passphrase}
                onChangeText={text =>
                  setFormData(prev => ({ ...prev, passphrase: text }))
                }
              />
              <TouchableOpacity
                onPress={togglePasswordVisibility}
                className="absolute right-4 top-4">
                {showPassword ? (
                  <Ionicons name="eye-outline" size={20} color="grey" />
                ) : (
                  <Ionicons name="eye-off-outline" size={20} color="grey" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Button
          labelStyle={{ fontFamily: "Poppins-Medium" }}
          label={uuid ? "Perbarui" : "Simpan"}
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
          style={styles.submitButton}
        />
      </View>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  cardContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
    fontFamily: "Poppins-Bold",
    color: "#312e81",
  },
  fieldContainer: {
    marginBottom: 16,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: "#4b5563",
    fontFamily: "Poppins-SemiBold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    backgroundColor: "#f9fafb",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: "#312e81",
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  signaturePreview: {
    height: 100,
    resizeMode: "contain",
    marginBottom: 10,
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
});
