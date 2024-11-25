import { View, Text, Button } from "react-native-ui-lib";
import React, { memo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ActivityIndicator, ScrollView, StyleSheet, TextInput, Image, TouchableOpacity, } from "react-native";
import axios from "@/src/libs/axios";
import Toast from "react-native-toast-message";
import { launchImageLibrary } from "react-native-image-picker";
import BackButton from "@/src/screens/components/BackButton";
import Select2 from "@/src/screens/components/Select2";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";

export default memo(function Form({ route, navigation }) {
    const { uuid } = route.params || {};
    const [photos, setPhotos] = useState([]);
    const [kotaKab, setKotaKab] = useState([]);
    const [kecamatan, setKecamatan] = useState([]);
    const [kelurahan, setKelurahan] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        tanda_tangan_id: '',
        passphrase: '',
    });
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
      };

    const { handleSubmit, control, formState: { errors }, setValue } = useForm({
        defaultValues: {
            nama: '',
            nip: '',
            nik: '',
            email: '',
            phone: '',
            password: '',
            password_confirmation: '',
            detail: {
                instansi: '',
                alamat: '',
                pimpinan: '',
                pj_mutu: '',
                telepon: '',
                fax: '',
                email: '',
                jenis_kegiatan: '',
                lat: '',
                long: ''
            }
        }
    });

    const { data, isLoading: isLoadingData } = useQuery(['user', uuid], () =>
        uuid ? axios.get(`/master/user/${uuid}/edit`).then(res => res.data.data) : null,
        {
            enabled: !!uuid,
            onSuccess: (data) => {
                if (data) {
                    setValue('nama', data.nama);
                    setValue('nip', data.nip);
                    setValue('nik', data.nik);
                    setValue('email', data.email);
                    setValue('phone', data.phone);
                    if (data.detail) {
                        Object.keys(data.detail).forEach(key => {
                            setValue(`detail.${key}`, data.detail[key]);
                        });
                    }
                }
            },
            onError: (error) => {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to load data'
                });
                console.error(error);
            }
        }
    );

    const queryClient = useQueryClient();

    const { mutate: createOrUpdate, isLoading } = useMutation(
        (data) => axios.post(uuid ? `/master/user/${uuid}/update` : '/master/user/store', data),
        {
            onSuccess: () => {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: uuid ? 'Success update data' : 'Success create data'
                });
                queryClient.invalidateQueries(['/master/user']);
                navigation.navigate("Users");
            },
            onError: (error) => {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: uuid ? 'Failed update data' : 'Failed create data'
                });
                console.error(error);
            }
        }
    );

    const onSubmit = (data) => {
        createOrUpdate(data);
    };

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
                {/* Personal Information */}
                <View style={styles.cardContainer}>

                    <View className="info-item">
                        <Controller
                            control={control}
                            name="photos"
                            render={({ field: { onChange } }) => (
                                <View className="w-full flex items-center justify-center">
                                    {photos.length > 0 ? (
                                        <View className="relative">
                                            {/* Foto Bundar */}
                                            <Image
                                                source={{ uri: photos[0].uri }} // Ambil foto pertama
                                                className="w-36 h-36 rounded-full border-2 border-gray-300"
                                            />
                                            {/* Icon Pensil */}
                                            <TouchableOpacity
                                                onPress={handleChoosePhoto}
                                                className="absolute top-0 right-0 bg-white p-1 rounded-full border border-gray-300"
                                            >
                                                <Text className="text-xs text-gray-700">✏️</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <View className="relative">
                                            <TouchableOpacity
                                                onPress={handleChoosePhoto}
                                                className="w-36 h-36 rounded-full bg-gray-200 flex items-center justify-center"
                                            >
                                                <Text className="text-gray-500 text-xs font-semibold">Tanda Tangan</Text>
                                            </TouchableOpacity>
                                            {/* Icon Pensil */}
                                            {/* <TouchableOpacity
                                onPress={handleChoosePhoto}
                                className="absolute top-0 right-0 bg-white p-1 rounded-full border border-gray-300"
                                >
                                <Text className="text-xs">✏️</Text>
                                </TouchableOpacity> */}
                                        </View>
                                    )}
                                </View>
                            )}
                        />
                    </View>




                    <View style={styles.fieldContainer}>
                        <Text style={styles.label}>Nama</Text>
                        <Controller
                            control={control}
                            name="nama"
                            rules={{ required: 'Nama is required' }}
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
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email address'
                                }
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
                                required: 'Phone number is required',
                                pattern: {
                                    value: /^08[0-9]\d{8,11}$/,
                                    message: 'Invalid phone number'
                                }
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

                    <Text style={styles.label}>Jabatan</Text>
                    <Controller
                        control={control}
                        name="kecamatan_id"
                        rules={{ required: "Kecamatan harus diisi" }}
                        render={({ field: { onChange, value } }) => (
                            <Select2
                                onChangeValue={onChange}
                                value={value}
                                items={kecamatan}
                                placeholder={{ label: "Pilih kecamatan", value: null }}
                            />
                        )}
                    />

                    {errors.kecamatan_id && (
                        <Text className="text-red-500">{errors.kecamatan_id.message}</Text>
                    )}<Text style={styles.label}>Tipe</Text>
                    <Controller
                        control={control}
                        name="kecamatan_id"
                        rules={{ required: "Kecamatan harus diisi" }}
                        render={({ field: { onChange, value } }) => (
                            <Select2
                                onChangeValue={onChange}
                                value={value}
                                items={kecamatan}
                                placeholder={{ label: "Pilih kecamatan", value: null }}
                            />
                        )}
                    />
                    {errors.kecamatan_id && (
                        <Text className="text-red-500">{errors.kecamatan_id.message}</Text>
                    )}

                    <Text style={styles.label}>Tanda Tangan</Text>
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
                                            <TouchableOpacity className=" w-20 py-2 flex justify-center mt-4 bg-blue-500" onPress={handleChoosePhoto} style={{ borderRadius: 4, marginStart: "38.7%" }}>
                                                <Text className="text-white text-xs font-poppins-semibold text-center">Tambah</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <TouchableOpacity style={styles.addSignatureButton} onPress={handleChoosePhoto}>
                                            <Text style={styles.addSignatureText}>Tanda Tangan</Text>
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
                        rules={{ required: "Kecamatan harus diisi" }}
                        render={({ field: { onChange, value } }) => (
                            <Select2
                                onChangeValue={async (newValue) => {
                                    onChange(newValue);
                                    setValue('kecamatan_id', null); // Reset kecamatan
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
                        rules={{ required: "Kecamatan harus diisi" }}
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
                            onChangeText={(text) => setFormData(prev => ({ ...prev, passphrase: text }))}
                        />
                        <TouchableOpacity 
                            onPress={togglePasswordVisibility}
                            className="absolute right-4 top-4"
                        >
                            {showPassword ? (
                            <Ionicons name="eye-outline" size={20} color="grey" />
                            ) : (
                            <Ionicons name="eye-off-outline" size={20} color="grey"/>
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
                            onChangeText={(text) => setFormData(prev => ({ ...prev, passphrase: text }))}
                        />
                        <TouchableOpacity 
                            onPress={togglePasswordVisibility}
                            className="absolute right-4 top-4"
                        >
                            {showPassword ? (
                            <Ionicons name="eye-outline" size={20} color="grey" />
                            ) : (
                            <Ionicons name="eye-off-outline" size={20} color="grey"/>
                            )}
                        </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <Button
                    label={uuid ? "Update" : "Save"}
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
        backgroundColor: '#f5f5f5'
    },
    cardContainer: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#312e81'
    },
    fieldContainer: {
        marginBottom: 16
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    label: {
        fontSize: 14,
        marginBottom: 8,
        color: '#4b5563'
    },
    input: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f9fafb'
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top'
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        marginTop: 4
    },
    submitButton: {
        backgroundColor: '#312e81',
        padding: 16,
        borderRadius: 8,
        marginVertical: 16
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