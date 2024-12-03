import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Clipboard,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import QRCode from 'react-native-qrcode-svg';
import moment from 'moment';
import axios from '@/src/libs/axios';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const Detail = ({ route, navigation }) => {
  const { uuid } = route.params || {};
  const [formData, setFormData] = useState(null);
  const [qrisImage, setQrisImage] = useState(null);
  const [countdown, setCountdown] = useState('');


  useEffect(() => {
    let intervalId;
    if (formData?.payment?.tanggal_exp) {
      intervalId = setInterval(calculateCountdown, 1000);
      return () => clearInterval(intervalId);
    }
  }, [formData]);

  const fetchPaymentDetails = async () => {
    try {
      const response = await axios.get(`/pembayaran/pengujian/${uuid}`);
      const data = response.data.data;
      setFormData(data);
      console.log(data)

      // Generate QRIS if needed
      if (data.payment?.type === 'qris' && data.payment?.qris_value) {
        QRCode.toDataURL(data.payment.qris_value)
          .then(url => setQrisImage(url))
          .catch(err => console.error(err));
      }
    } catch (error) {
      console.error('Error fetching payment details:', error.response?.data?.message);
      Alert.alert('Error', error.response?.data?.message || 'Failed to fetch details');
    }
  };

  useEffect(() => {
    fetchPaymentDetails();
  }, [uuid]);
  const calculateCountdown = () => {
    if (!formData?.payment?.tanggal_exp) return;

    const exp = moment(formData.payment.tanggal_exp);
    const now = moment();

    const days = exp.diff(now, 'days');
    const hours = exp.diff(now, 'hours') - (days * 24);
    const minutes = exp.diff(now, 'minutes') - (days * 24 * 60) - (hours * 60);
    const seconds = exp.diff(now, 'seconds') - (days * 24 * 60 * 60) - (hours * 60 * 60) - (minutes * 60);

    const formatTime = (time) => time < 10 ? `0${time}` : time;

    setCountdown(`${formatTime(days)}H : ${formatTime(hours)}J : ${formatTime(minutes)}M : ${formatTime(seconds)}D`);
  };

  const copyToClipboard = (text) => {
    Clipboard.setString(text.toString());
  };

  const downloadQris = () => {
    // Implement QRIS download
    Alert.alert('Download', 'QRIS download functionality to be implemented');
  };

  const renderHargaDanAtasNama = () => {
    // Only render if there's no payment data
    if (!formData?.payment) {
      return (
        <View className="flex-row">
          <View className="flex-1 mr-2">
            <Text className="form-label font-poppins-bold text-dark text-sm mb-1">Harga</Text>
            <Text className="text-base font-poppins-semibold">
              {formatCurrency(formData?.harga || 0)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="form-label font-poppins-bold text-dark text-sm mb-1">Atas Nama</Text>
            <Text className="text-base font-poppins-semibold">
              {formData?.permohonan?.user?.nama || '-'}
            </Text>
          </View>
        </View>
      );
    }

    return null;
  };

  const renderNoPaymentAlert = () => {
    if (!formData?.payment) {
      return (
        <View className="bg-blue-100 p-4 rounded-lg items-center">
          <Text className="text-base font-poppins-semibold mb-2">
            {formData?.payment_type === 'va'
              ? 'VA Pembayaran Belum Dibuat'
              : 'QRIS Belum Dibuat'}
          </Text>
          <Text className="text-sm text-gray-700 text-center">
            {formData?.payment_type === 'va'
              ? 'Silahkan klik Tombol Di Bawah untuk Membuat VA Pembayaran'
              : 'Silahkan klik Tombol Di Bawah untuk Membuat QRIS'}
          </Text>
        </View>
      );
    }
    return null;
  };

  const renderPaymentDetails = () => {
    // If no payment data exists, return null
    if (!formData?.payment) {
      return null;
    }

    return (
      <View className="space-y-4">
        <View className="rounded-xl shadow-lg overflow-hidden">
          {formData.payment?.status === 'success' && (
            <View className="bg-green-500 flex-row items-center p-4">
              <MaterialIcons name="check-decagram" size={28} color="white" className="mr-4" />
              <View>
                <Text className="text-white font-poppins-semibold text-base ml-3">
                  Pembayaran Berhasil
                </Text>
                <Text className="text-green-100 font-poppins-regular text-sm mt-1 ml-3">
                  Dilakukan pada: {moment(formData.payment.tanggal_bayar).format('DD-MM-YYYY')}
                </Text>
              </View>
            </View>
          )}

          <View className="bg-white p-5">
            {formData.payment?.is_expired === false && formData.payment?.status !== 'success' && (
              <View className="flex-row items-center mb-4 pb-4 border-b border-gray-100">
                <AntDesign name="clockcircle" size={28} color="#3B82F6" className="mr-4" />
                <View>
                  <Text className="text-blue-800 font-poppins-semibold text-base">
                    Segera Selesaikan Pembayaran
                  </Text>
                  <Text className="text-blue-700 font-poppins-regular text-sm mt-1">
                    Waktu tersisa: {countdown}
                  </Text>
                </View>
              </View>
            )}

            {formData.payment?.is_expired && (
              <View className="flex-row items-center mb-4 pb-4 border-b border-gray-100">
                <AntDesign name="exclamationcircle" size={28} color="#EF4444" className="mr-4" />
                <View>
                  <Text className="text-red-800 font-poppins-semibold text-base">
                    Pembayaran Kedaluwarsa
                  </Text>
                  <Text className="text-red-700 font-poppins-regular text-sm mt-1">
                    {formData.payment?.type === 'va'
                      ? 'Virtual Account telah kedaluwarsa'
                      : 'QRIS telah kedaluwarsa'}
                  </Text>
                </View>
              </View>
            )}

            <View className="flex-row items-center mb-4 pb-4 border-b border-gray-100">
              <View className="flex-1">
                <Text className="text-lg font-poppins-semibold text-gray-800">
                  {formData.payment?.type === 'va' ? 'Virtual Account' : 'QRIS'}
                </Text>
                {formData.payment?.type === 'va' ? (
                 <View className="flex-row items-center">
                 <View className="bg-white p-2 rounded-lg mr-1">
                   <Image 
                     source={require('../../../assets/images/bank-jatim.png')} 
                     className="w-[100px] h-[23px] object-cover"
                   />
                 </View>
                 <Text className="text-blue-600 font-poppins-medium text-base">
                   {formData.payment.va_number}
                 </Text>
               </View>
                ) : (
                  <Text className="text-gray-600 font-poppins-regular mt-2">
                    Gunakan QRIS untuk pembayaran
                  </Text>
                )}
              </View>
              {formData.payment?.type === 'va' && (
                <TouchableOpacity
                  onPress={() => copyToClipboard(formData.payment.va_number)}
                  disabled={formData.payment?.is_expired}
                  className="bg-green-50 p-2 rounded-lg top-2.5"
                >
                  <Text className="text-green-600 font-poppins-semibold">Salin</Text>
                </TouchableOpacity>
              )}
            </View>

            {formData.payment?.type === 'qris' && (
              <View className="items-center mb-4 pb-4 border-b border-gray-100">
                <QRCode
                  value={formData.payment.qris_value}
                  size={200}
                />
                <TouchableOpacity
                  onPress={downloadQris}
                  disabled={formData.payment?.is_expired}
                  className="mt-3 bg-blue-50 px-4 py-2 rounded-lg"
                >
                  <Text className="text-blue-600 font-poppins-semibold">Unduh QRIS</Text>
                </TouchableOpacity>
              </View>
            )}

            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm text-gray-600 font-poppins-regular mb-1">
                  Nominal Pembayaran
                </Text>
                <Text className="text-xl text-blue-600 font-poppins-semibold">
                  {formatCurrency(formData.payment.jumlah)}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => copyToClipboard(formData.payment.jumlah)}
                disabled={formData.payment?.is_expired}
                className="bg-green-50 p-2 rounded-lg"
              >
                <Text className="text-green-600 font-poppins-semibold">Salin</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="flex-row mx-4 my-3 rounded-xl py-4 px-3 bg-white shadow-sm" style={{ elevation: 6, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: 10 }}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Pengujian')}
          className="mr-3 px-4 py-3 bg-red-500 rounded-xl ml-2"
        >
          <AntDesign name="arrowleft" size={20} color="white" />
        </TouchableOpacity>
        <Text className="top-2 text-xl ml-2 font-poppins-semibold text-black">
          {formData?.kode || 'Detail Pembayaran'}
        </Text>
      </View>

      <ScrollView>
        <View className="p-4">
          {renderHargaDanAtasNama()}
          {renderNoPaymentAlert()}
          {renderPaymentDetails()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Detail;