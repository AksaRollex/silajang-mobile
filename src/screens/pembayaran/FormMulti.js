import { StyleSheet, Text, TextInput, View, ScrollView, TouchableOpacity } from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Yup from "yup";
import axios from "@/src/libs/axios";
import DatePicker from "react-native-date-picker";
import moment from "moment";
import AntDesign from 'react-native-vector-icons/AntDesign';
import BackButton from '../components/BackButton';
import { useNavigation } from '@react-navigation/native';
import { useKodeRetribusi } from "@/src/services/useKodeRetribusi";
import { useHeaderStore } from '@/src/screens/main/Index';
import Paginate from "../components/Paginate";

export default function FormMulti() {
  const navigation = useNavigation();
  const paginateRef = useRef();
  const [selectedTitik, setSelectedTitik] = useState([]);
  const [paymentType, setPaymentType] = useState('va');
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const { setHeader } = useHeaderStore();
  
  React.useLayoutEffect(() => {
    setHeader(false)
    return () => setHeader(true)
  }, [])

  const formSchema = Yup.object().shape({
    type: Yup.string().oneOf(['va', 'qris']).required('Metode Pembayaran harus diisi'),
  });

  const { control, handleSubmit, setValue, watch } = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: {
      type: 'va'
    }
  });

  const toggleTitikSelection = (titik) => {
    setSelectedTitik(prev => {
      const exists = prev.find(item => item.uuid === titik.uuid);
      if (exists) {
        return prev.filter(item => item.uuid !== titik.uuid);
      } else {
        return [...prev, titik];
      }
    });
  };

  const calculateTotalHarga = () => {
    return selectedTitik.reduce((acc, item) => acc + item.harga, 0);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(value).replace(/\s/g, '');
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        multiPayments: selectedTitik.map(item => ({
          titik_permohonan_id: item.id
        }))
      };

      const response = await axios.post('/pembayaran/multi-payment/store', payload);
      console.log('Submission successful', response.data);
      navigation.navigate('MultiPayment');
    } catch (error) {
      console.error('Submission error', error);
    }
  };

  const renderItem = ({ item }) => {
    const isSelected = selectedTitik.find(selected => selected.uuid === item.uuid);

    return (
      <View className="my-2 bg-[#f8f8f8] rounded-md border-t-[6px] border-indigo-900 p-4 shadow-md">
        <View className="flex-row justify-between items-center">
          {/* Left side - Information */}
          <View className="flex-1 mr-3">
            <View className="mb-3">
              <Text className="text-xs text-gray-500 font-poppins-regular">Kode</Text>
              <Text className="text-md font-poppins-semibold text-black">{item.kode}</Text>
            </View>
            
            <View className="mb-3">
              <Text className="text-xs text-gray-500 font-poppins-regular">Pelanggan</Text>
              <Text className="text-md font-poppins-semibold text-black">{item.permohonan?.user.nama}</Text>
            </View>
            
            <View className="mb-3">
              <Text className="text-xs text-gray-500 font-poppins-regular">Titik Uji/Lokasi</Text>
              <Text className="text-md font-poppins-semibold text-black">{item.lokasi}</Text>
            </View>
            
            <View className="mb-3">
              <Text className="text-xs text-gray-500 font-poppins-regular">Harga</Text>
              <Text className="text-md font-poppins-semibold text-black">{formatCurrency(item.harga)}</Text>
            </View>
          </View>

          {/* Right side - Selection Button */}
          <View className="w-[100px] justify-center items-center">
            <TouchableOpacity
              className={`flex-row items-center justify-center py-2 px-3 rounded-lg w-full
                ${isSelected ? 'bg-indigo-900' : 'bg-gray-100 border border-indigo-900'}`}
              onPress={() => toggleTitikSelection(item)}>
              <Ionicons
                name={isSelected ? "checkmark-circle" : "add-circle-outline"}
                size={24}
                color={isSelected ? "#ffffff" : "#312e81"}
              />
              <Text 
                className={`ml-1 text-sm font-poppins-medium
                  ${isSelected ? 'text-white' : 'text-indigo-900'}`}>
                {isSelected ? 'Dipilih' : 'Pilih'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView className="h-full w-full bg-[#ececec] p-3 py-2">
      <View className="w-full bg-[#f8f8f8] rounded-md px-3 py-4">
        <View className="flex-row items-center space-x-2 mb-10 mt-2">
          <BackButton action={() => navigation.navigate('MultiPayment')} size={26} />
          <View className="absolute left-0 right-2 items-center">
            <Text className="text-[18px] text-black font-poppins-semibold">Buat Multi Payment</Text>
            <View className="h-px w-[120%] bg-gray-200 top-5" />
          </View>
        </View>

        {/* Payment Method Selection */}
        <View>
          <Text className="text-lg text-black mb-4 font-poppins-semibold text-center">
            Metode Pembayaran
          </Text>
          <View style={styles.cardContainer}>
            <TouchableOpacity 
              className="rounded-2xl"
              style={[styles.cardPembayaran, paymentType === "va" ? styles.selectedCard : styles.unselectedCard]}
              onPress={() => {
                setPaymentType('va');
                setValue('type', 'va');
              }}
            >
              <AntDesign name="calculator" size={40} color={paymentType === "va" ? "white" : "black"} />
              <Text className={`mt-2 font-poppins-bold text-center ${paymentType === "va" ? "text-white" : "text-black"}`}>
                Virtual Account
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="rounded-2xl"
              style={[styles.cardPembayaran, paymentType === "qris" ? styles.selectedCard : styles.unselectedCard]}
              onPress={() => {
                setPaymentType('qris');
                setValue('type', 'qris');
              }}
            >
              <AntDesign name="qrcode" size={40} color={paymentType === "qris" ? "white" : "black"} />
              <Text className={`mt-2 font-poppins-bold text-center ${paymentType === "qris" ? "text-white" : "text-black"}`}>
                QRIS
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Selected Points and Total */}
        {paymentType && (
          <View className="mt-6">
            <Text className="text-base text-black mb-2 ml-2 font-poppins-semibold">Titik Permohonan Dipilih</Text>
            <View className="flex-row flex-wrap gap-2 p-4 ml-2 bg-gray-100 rounded-md">
              {selectedTitik && selectedTitik.length > 0 ? (
                selectedTitik.map(item => (
                  <View key={item.uuid} className="bg-blue-100 px-3 py-1 rounded-full">
                    <Text className="text-blue-800">{item.kode}</Text>
                  </View>
                ))
              ) : (
                <View>
                  <Text></Text>
                </View>
              )}
            </View>
            
            <View className="mt-4 ml-2">
              <Text className="text-base text-black mb-2 font-poppins-semibold">Total Harga</Text>
              <Text className="text-base text-black font-poppins-regular">{formatCurrency(calculateTotalHarga())}</Text>
            </View>
          </View>
        )}

        <Paginate
          ref={paginateRef}
          url="/pembayaran/multi-payment/titiks"
          renderItem={renderItem}
          className="mt-5"
        />

        <TouchableOpacity
          className="bg-[#312e81] p-3 rounded mt-6"
          onPress={handleSubmit(onSubmit)}
          disabled={selectedTitik.length === 0}
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
    width: 175,
    height: 140,
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