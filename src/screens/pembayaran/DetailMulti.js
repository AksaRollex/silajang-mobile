import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import moment from 'moment';
import axios from '@/src/libs/axios';
import BackButton from '../components/BackButton';
import { TextFooter } from '../components/TextFooter';
import QRCode from 'react-native-qrcode-svg';
import { useQuery } from '@tanstack/react-query';

const DetailMulti = ({ route, navigation }) => {
  const { selected } = route.params;

  const [countdown, setCountdown] = useState('');
  const [qrValue, setQrValue] = useState('');

  const currency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(value);
  };

  const getExpiredCountdown = useCallback(() => {
    if (!formData?.tanggal_exp && !formData?.qris_expired) return '';

    const expDate = moment(formData.type === 'qris' ? formData.qris_expired : formData.tanggal_exp);
    const now = moment();

    const days = expDate.diff(now, 'days');
    const hours = expDate.diff(now, 'hours') % 24;
    const minutes = expDate.diff(now, 'minutes') % 60;
    const seconds = expDate.diff(now, 'seconds') % 60;

    return `${days.toString().padStart(2, '0')}H : ${hours.toString().padStart(2, '0')}J : ${minutes.toString().padStart(2, '0')}M : ${seconds.toString().padStart(2, '0')}D`;
  }, [formData]);

  const { data: formData, refetch, isLoading } = useQuery({
    queryKey: ['formData', selected],
    queryFn: () => axios.get(`/pembayaran/multi-payment/${selected}`).then(res => res.data.data),
    onSuccess: res => console.log(res),
    onError: err => Alert.alert('Error', err.response?.data?.message || 'Terjadi kesalahan'),
    enabled: !!selected
  })

  const saveQRCode = async () => {
    if (!qrValue) return;
    
    try {
      let svg = null;
      const getDataURL = () => {
        return new Promise((resolve) => {
          svg?.toDataURL(callback);
          function callback(dataURL) {
            resolve(dataURL);
          }
        });
      };

      const dataURL = await getDataURL();
      const filepath = `${FileSystem.documentDirectory}QRIS_${formData.kode}.png`;
      await FileSystem.writeAsStringAsync(filepath, dataURL.split(',')[1], {
        encoding: FileSystem.EncodingType.Base64,
      });

      await Sharing.shareAsync(filepath);
    } catch (error) {
      Alert.alert('Error', 'Gagal menyimpan QRIS');
    }
  };

  const handleSwitchPayment = async () => {
    try {
      await axios.post(`/pembayaran/multi-payment/${selected}/switch`);
      Alert.alert('Success', 'Berhasil mengubah metode pembayaran');
      refetch();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePayment = async () => {
    try {
      const endpoint = formData.type === 'va' ? 'va' : 'qris';
      await axios.post(`/pembayaran/multi-payment/${selected}/${endpoint}`);
      Alert.alert('Success', 'Berhasil membuat pembayaran baru');
      refetch();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckPayment = async () => {
    try {
      await axios.post(`/pembayaran/multi-payment/${selected}/check`);
      Alert.alert('Success', 'Status pembayaran berhasil diperbarui');
      refetch();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPayment = () => {
    Alert.alert(
      'Batalkan Pembayaran?',
      'Apakah anda yakin ingin membatalkan pembayaran ini?',
      [
        { text: 'Tidak', style: 'cancel' },
        {
          text: 'Ya, Batalkan',
          onPress: async () => {
            try {
              await axios.post(`/pembayaran/multi-payment/${selected}/cancel`);
              Alert.alert('Success', 'Pembayaran berhasil dibatalkan');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Terjadi kesalahan');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    refetch();
  }, [selected]);

  useEffect(() => {
    if (formData?.status === 'pending' && !formData?.is_expired) {
      const interval = setInterval(() => {
        setCountdown(getExpiredCountdown());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [formData, getExpiredCountdown]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }
  
  

  return (
    <ScrollView className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <BackButton action={() => navigation.navigate('MultiPayment')} size={22} />
        <Text className="text-lg ml-3 text-black font-bold">{formData?.kode}</Text>
      </View>

      <View className="p-4">
        {/* Selected Points */}
        <View className="mb-4">
          <Text className="text-base font-semibold ml-2 text-black mb-4">Titik Permohonan Dipilih</Text>
          <View className="flex-row flex-wrap gap-2 p-3 ml-0.5 bg-white rounded-lg">
            {formData?.multi_payments?.map(item => (
              <View key={item.titik_permohonan.uuid} className="bg-blue-100 px-3 py-1.5 mb-2 rounded-full">
                <Text className="text-blue-700 text-sm">{item.titik_permohonan.kode}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Payment Status */}
        {/* {formData.status === 'success' ? (
          <View className="bg-green-500 p-3 rounded-lg mb-4">
            <Text className="text-white text-center">
              Pembayaran berhasil dilakukan pada: {moment(formData.tanggal_bayar).format('DD-MM-YYYY')}
            </Text>
          </View>
        ) : formData.is_expired === false ? (
          <View className="bg-blue-500 p-3 rounded-lg mb-4">
            <Text className="text-white text-center">
              Lakukan pembayaran sebelum: {countdown}
            </Text>
          </View>
        ) : (
          <View className="bg-red-500 p-3 rounded-lg mb-4">
            <Text className="text-white text-center">
              {formData.type === 'va' ? 'VA Pembayaran telah kedaluwarsa' : 'QRIS telah kedaluwarsa'}
            </Text>
          </View>
        )}

        {(formData.va_number || formData.qris_value) && (
          <View className="bg-white rounded-lg mb-4 shadow-sm">
            <View className="p-4 border-b border-gray-200 flex-row justify-between items-center">
              <Text className="text-lg font-semibold text-black">
                {formData.type === 'va' ? 'Virtual Account' : 'QRIS'}
              </Text>
              {formData.status !== 'success' && (
                <TouchableOpacity
                  onPress={handleSwitchPayment}
                  className="bg-blue-100 px-3 py-2 rounded-lg">
                  <Text className="text-blue-700">
                    Ganti ke {formData.type === 'va' ? 'QRIS' : 'VA'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <View className="p-4">
              {formData.type === 'va' ? (
                <View className="bg-gray-50 p-4 rounded-lg">
                  <Image
                    // source={require('@/assets/bank-jatim.png')}
                    className="w-20 h-10 mb-3"
                    resizeMode="contain"
                  />
                  <Text className="text-2xl text-blue-600 font-bold mb-2">{formData.va_number}</Text>
                  {formData.status !== 'success' && (
                    <TouchableOpacity onPress={() => copyToClipboard(formData.va_number)}>
                      <Text className="text-green-600">Salin</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View className="bg-gray-50 p-4 rounded-lg items-center">
                  <Text className="text-sm text-gray-600 mb-4">
                    {formData.status !== 'success' ? 'Scan QR dibawah ini untuk melakukan pembayaran' : ''}
                  </Text>
                  <View className="bg-white p-4 rounded-lg mb-4">
                    <Text className="text-center font-bold mb-2">SILAJANG JOMBANG</Text>
                    <Text className="text-center text-sm mb-4">NMID : ID2024341624664</Text>
                    <QRCode
                      value={qrValue}
                      size={200}
                      getRef={(ref) => (svg = ref)}
                    />
                  </View>
                  {formData.status !== 'success' && (
                    <TouchableOpacity onPress={saveQRCode}>
                      <Text className="text-green-600">Unduh QRIS</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          </View>
        )} */}

        {/* Amount Card */}
        <View className="bg-white rounded-lg mb-4 shadow-sm">
          <View className="p-4 border-b border-gray-200">
            <Text className="text-lg font-semibold text-black">Nominal Pembayaran : </Text>
          </View>
          <View className="p-4 bg-gray-50 rounded-b-lg">
            <Text className="text-sm font-semibold text-black">
              {formData?.multi_payments?.[0]?.titik_permohonan?.permohonan?.user?.nama}
            </Text>
            <View className="flex-row justify-between items-center mt-3">
              <Text className="text-xl font-bold text-blue-600">
                {currency(formData?.jumlah)}
              </Text>
            </View>
            <View className=" mt-5 p-4 border-t border-gray-200">
              <View className="bg-indigo-100 border border-indigo-400 rounded-md items-center justify-center">
              {formData?.type === 'va' ? (
                <Text className="mb-2 text-lg font-poppins-semibold text-black items-center">VA pembayaran belum dibuat</Text>
              ) : formData?.type === 'qris' ? (
                <Text className="mb-2 text-lg font-poppins-semibold text-black items-center">Qris Belum dibuat</Text>
              ) : null}
              
              {formData?.type === 'va' ? (
                <Text className="text-sm text-gray-600">Silahkan klik tombol di bawah Membuat VA pembayaran</Text>
              ) : formData?.type === 'qris' ? (
                <Text className="text-sm text-gray-600">Silahkan klik tombol di bawah untuk Membuat QRIS</Text>
              ) : null}
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        {formData?.status !== 'success' && (
          <View className="flex-row justify-end gap-x-3 mb-4">
            {formData?.status === 'pending' && !formData?.is_expired && (formData?.va_number || formData?.qris_value) ? (
              <>
                <TouchableOpacity
                  onPress={handleCancelPayment}
                  className="bg-red-100 px-4 py-2 rounded-lg">
                  <Text className="text-red-700">Batalkan</Text>
                </TouchableOpacity>
                {formData?.type === 'va' && (
                  <TouchableOpacity
                    onPress={handleCheckPayment}
                    className="bg-blue-100 px-4 py-2 rounded-lg">
                    <Text className="text-blue-700">Cek Status</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <>
                <TouchableOpacity
                  onPress={handleSwitchPayment}
                  className="bg-blue-100 px-4 py-2 rounded-lg">
                  <Text className="text-indigo-700">
                    Ganti ke {formData?.type === 'va' ? 'QRIS' : 'VA'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleGeneratePayment}
                  className="bg-indigo-700 px-4 py-2 rounded-lg">
                  <Text className="text-white">
                    Buat {formData?.type === 'va' ? 'VA Pembayaran' : 'QRIS'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>
      
      <View className="mt-96">
        <TextFooter />
      </View>
    </ScrollView>
  );
};

export default DetailMulti;