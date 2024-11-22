import { View, Text, Button } from "react-native-ui-lib";
import React, { memo } from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ActivityIndicator, ScrollView, StyleSheet, TextInput } from "react-native";
import axios from "@/src/libs/axios";
import Toast from "react-native-toast-message";
import BackButton from "@/src/screens/components/BackButton";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

export default memo(function Form({ route, navigation }) {
    const { uuid } = route.params || {};
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
                    <Text style={styles.sectionTitle}>Personal Information</Text>
                    
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
    }
});