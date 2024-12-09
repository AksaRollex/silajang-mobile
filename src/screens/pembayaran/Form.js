import { StyleSheet, Text, TextInput, View, ScrollView, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { TextField } from "react-native-ui-lib";
import axios from "axios";
import Select2 from "../components/Select2";
import DatePicker from "react-native-date-picker";
import moment from "moment";
import AntDesign from 'react-native-vector-icons/AntDesign';


export default function FormNonPengujian() {
  const [kodeRetribusi, setKodeRetribusi] = useState([]);
  
  const [paymentType, setPaymentType] = useState('va');

  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const formSchema = Yup.object().shape({
    type: Yup.string().oneOf(['va', 'qris']).required('Metode Pembayaran harus diisi'),
    nama: Yup.string().required('Atas Nama harus diisi'),
    jumlah: Yup.string().required('Jumlah harus diisi'),
    tanggal_exp: Yup.date().required('Tanggal Exp harus diisi'),
    kode_retribusi_id: Yup.string().required('Kode Retribusi harus diisi'),
  });

  const { control, handleSubmit, setValue, watch } = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: {
      type: 'va',
      tanggal_exp: new Date(),
    }
  });

  useEffect(() => {
    axios
      .get("/master/kode-retribusi")
      .then(res => {
        const formattedKodeRetribusi = res.data.data.map(item => ({
          label: item.nama,
          value: item.id,
        }));
        setKodeRetribusi(formattedKodeRetribusi);
      })
      .catch(err => {
        console.error(err);
      });
  }, []);

  const onSubmit = async (data) => {
    try {
      const response = await axios.post('/pembayaran/non-pengujian/store', {
        ...data,
        jumlah: data.jumlah.replace(/\./g, ''), 
      });
      
      console.log('Submission successful', response.data);

    } catch (error) {
      console.error('Submission error', error);
    }
  };

  const formatCurrency = (value) => {
    const cleaned = value.replace(/\D/g, '');
    
    return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  return (
    <ScrollView className="h-full w-full bg-[#ececec] px-3 py-2">
      <View className="w-full bg-[#f8f8f8] px-3 py-4">
        <Text className="font-poppins-bold text-black mb-2">Metode Pembayaran</Text>
        <View className="w-full mb-4 space-y-3">
        <TouchableOpacity 
          className={`flex flex-row items-center p-3 rounded w-full ${paymentType === 'va' ? 'bg-[#312e81]' : 'bg-gray-300'}`}
          onPress={() => {
            setPaymentType('va');
            setValue('type', 'va');
          }}
        >
          <AntDesign name="calculator" size={20} color={paymentType === 'va' ? 'white' : 'black'} />
          <Text className={`ml-2 font-poppins-regular text-base ${paymentType === 'va' ? 'text-white' : 'text-black'}`}>
            Virtual Account
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`flex flex-row items-center p-3 rounded w-full ${paymentType === 'qris' ? 'bg-[#312e81]' : 'bg-gray-300'}`}
          onPress={() => {
            setPaymentType('qris');
            setValue('type', 'qris');
          }}
        >
          <AntDesign name="qrcode" size={20} color={paymentType === 'qris' ? 'white' : 'black'} />
          <Text className={`ml-2 font-poppins-regular text-base ${paymentType === 'qris' ? 'text-white' : 'text-black'}`}>
            QRIS
          </Text>
        </TouchableOpacity>
        </View>

        <Controller
          control={control}
          name="kode_retribusi_id"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <View className="mb-4">
              <Text className="font-poppins-bold text-black mb-2">Kode Retribusi</Text>
              <Select2
                placeholder="Pilih Kode Retribusi"
                items={kodeRetribusi}
                value={value}
                onChange={value => onChange(value)}
              />
              {error && <Text className="text-red-500 font-poppins-regular">{error.message}</Text>}
            </View>
          )}
        />

        <Controller
          control={control}
          name="nama"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <View className="mb-4">
              <Text className="font-poppins-bold text-black mb-2">Atas Nama</Text>
              <TextField
                className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-poppins-regular"
                value={value}
                onChangeText={onChange}
                placeholder="Masukkan Nama"
              />
              {error && <Text className="text-red-500 font-poppins-regular">{error.message}</Text>}
            </View>
          )}
        />

        <Controller
          control={control}
          name="jumlah"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <View className="mb-4">
              <Text className="font-poppins-bold text-black mb-2">Nominal</Text>
              <TextField
                className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-poppins-regular"
                value={value ? formatCurrency(value) : ''}
                onChangeText={(text) => onChange(text.replace(/\./g, ''))}
                keyboardType="numeric"
                placeholder="Masukkan Nominal"
              />
              {error && <Text className="text-red-500 font-poppins-regular">{error.message}</Text>}
            </View>
          )}
        />

        <Controller
          control={control}
          name="tanggal_exp"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <View className="mb-4">
              <Text className="font-poppins-bold text-black mb-2">Tanggal Kedaluwarsa</Text>
              <TouchableOpacity 
                className="p-2 bg-[#fff] rounded-sm border-stone-300 border"
                onPress={() => setDatePickerOpen(true)}
              >
                <Text className="font-poppins-regular">{moment(value).format('DD-MM-YYYY')}</Text>
              </TouchableOpacity>
              <DatePicker
                modal
                open={datePickerOpen}
                date={value || new Date()}
                mode="date"
                onConfirm={(date) => {
                  setDatePickerOpen(false);
                  onChange(date);
                }}
                onCancel={() => {
                  setDatePickerOpen(false);
                }}
              />
              {error && <Text className="text-red-500 font-poppins-regular">{error.message}</Text>}
            </View>
          )}
        />

        {paymentType === 'va' && (
          <>
            {['berita1', 'berita2', 'berita3', 'berita4', 'berita5'].map((field, index) => (
              <Controller
                key={field}
                control={control}
                name={field}
                render={({ field: { onChange, value } }) => (
                  <View className="mb-4">
                    <Text className="font-poppins-bold text-black mb-2">
                      Berita {index + 1}
                    </Text>
                    <TextField
                      className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-poppins-regular"
                      value={value}
                      onChangeText={onChange}
                      placeholder={`Masukkan Berita ${index + 1}`}
                    />
                  </View>
                )}
              />
            ))}
          </>
        )}

        <TouchableOpacity 
          className="bg-[#312e81] p-3 rounded mt-4"
          onPress={handleSubmit(onSubmit)}
        >
        <Text className="text-white text-center font-poppins-regular">Simpan</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({});