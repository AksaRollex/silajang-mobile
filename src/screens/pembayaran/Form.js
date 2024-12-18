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
import BackButton from '../components/BackButton';
import { useNavigation } from '@react-navigation/native';
import { useKodeRetribusi } from "@/src/services/useKodeRetribusi";


export default function FormNonPengujian() {
  const navigation = useNavigation();
  const { data: kodeRetribusi = [], isLoading, error } = useKodeRetribusi();

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

  const formattedKodeRetribusi = kodeRetribusi.map(item => ({
    label: item.nama,
    value: item.id,
  }));

  const formatCurrency = (value) => {
    const cleaned = value.replace(/\D/g, '');

    return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  return (
    <ScrollView className="h-full w-full bg-[#ececec] px-3 py-2 ">
      <View className={`w-full bg-[#f8f8f8] rounded-md px-3 ${paymentType === 'va' ? 'pt-4 mb-20 pb-4' : 'py-4'}`}>
        <View className="flex-row items-center space-x-2 mb-10 mt-2 ">
          <BackButton action={() => navigation.navigate('NonPengujian')} size={26} />
          <View className="absolute left-0 right-2 items-center">
            <Text className="text-[18px] text-black font-poppins-semibold">Buat Pembayaran</Text>
            <View className="h-px w-[120%] bg-gray-200 top-5" />
          </View>
        </View>
      <View>

      <Text className="text-lg text-black mb-4 font-poppins-semibold text-center">
        Metode Pembayaran
      </Text>
      <View style={styles.cardContainer}>
        <TouchableOpacity 
          className="rounded-2xl" 
          style={[
            styles.cardPembayaran, 
            paymentType === "va" ? styles.selectedCard : styles.unselectedCard
          ]} 
          onPress={() => {
            setPaymentType('va');
            setValue('type', 'va');
          }}
        >
          <AntDesign 
            name="calculator" 
            size={40} 
            color={paymentType === "va" ? "white" : "black"} 
          />
          <Text 
            className={`mt-2 font-poppins-bold text-center ${
              paymentType === "va" ? "text-white" : "text-black"
            }`}
          >
            Virtual Account
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="rounded-2xl" 
          style={[
            styles.cardPembayaran, 
            paymentType === "qris" ? styles.selectedCard : styles.unselectedCard
          ]} 
          onPress={() => {
            setPaymentType('qris');
            setValue('type', 'qris');
          }}
        >
          <AntDesign 
            name="qrcode" 
            size={40} 
            color={paymentType === "qris" ? "white" : "black"} 
          />
          <Text 
            className={`mt-2 font-poppins-bold text-center ${
              paymentType === "qris" ? "text-white" : "text-black"
            }`}
          >
            QRIS
          </Text>
        </TouchableOpacity>
      </View>

      </View>
        <Controller
          control={control}
          name="kode_retribusi_id"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <View className="mb-4">
              <Text className="font-poppins-bold text-black mb-2">Kode Retribusi</Text>
              <Select2
                placeholder={{ label: "Pilih Kode Retribusi", value: null }}
                items={formattedKodeRetribusi}
                value={value}
                onChangeValue={value => onChange(value)}
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

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 16,
  },
  cardPembayaran: {
    width: 140, 
    height: 140, 
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
  },
  selectedCard: {
    backgroundColor: '#312e81', 
  },
  unselectedCard: {
    backgroundColor: '#E5E5E5', 
  },
});