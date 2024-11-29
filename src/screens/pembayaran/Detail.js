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
    // Implement QRIS download logic for mobile
    Alert.alert('Download', 'QRIS download functionality to be implemented');
  };

  const renderPaymentDetails = () => {
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

    return (
      <View className="space-y-4">
        {formData.payment.is_expired && (
          <View className="bg-blue-100 p-3 rounded-lg items-center">
            <Text className="text-sm text-gray-700 font-poppins-regular">
              Lakukan pembayaran sebelum:
              <Text className="font-poppins-semibold">{countdown}</Text>
            </Text>
          </View>
        )}

        {formData.payment.status === 'success' && (
          <View className="bg-green-500 p-4 rounded-lg items-center">
          <Text className="text-sm text-white font-poppins-regular">
            Pembayaran berhasil dilakukan pada:
            <Text className="font-poppins-semibold">
               {moment(formData.payment.tanggal_bayar).format('DD-MM-YYYY')}
            </Text>
          </Text>
        </View>
        )}

        <View className="bg-white rounded-lg p-4 shadow-md">
          <Text className="text-base font-poppins-semibold mb-3">
            {formData.payment.type === 'va' ? 'Virtual Account' : 'QRIS'}
          </Text>
          
          {formData.payment?.type == 'va' && (
            <View className="flex-row items-center space-x-3">
              <Image 
                source={require('../../../assets/images/bank-jatim.png')} 
                className="w-[75px] h-[30px]" 
              />
              <Text className="flex-1 text-lg font-poppins-regular text-blue-600">
                {formData.payment.va_number}
              </Text>
              <TouchableOpacity 
                onPress={() => copyToClipboard(formData.payment.va_number)}
                disabled={formData.payment.is_expired}
              >
                <Text className="text-green-600 font-poppins-semibold">Salin</Text>
              </TouchableOpacity>
            </View>
          )}

          {formData.payment.type === 'qris' && (
            <View className="items-center space-y-4">
              <QRCode 
                value={formData.payment.qris_value}
                size={250}
              />
              <TouchableOpacity 
                onPress={downloadQris}
                disabled={formData.payment.is_expired}
              >
                <Text className="text-blue-600 font-poppins-semibold">Unduh QRIS</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View className="bg-white rounded-lg p-4 shadow-md">
          <Text className="text-base font-poppins-semibold mb-3">Nominal Pembayaran</Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-xl text-blue-600 font-poppins-medium">
              {formatCurrency(formData.payment.jumlah)}
            </Text>
            <TouchableOpacity 
              onPress={() => copyToClipboard(formData.payment.jumlah)}
              disabled={formData.payment.is_expired}
            >
              <Text className="text-green-600 font-poppins-semibold">Salin</Text>
            </TouchableOpacity>
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
          <AntDesign name="arrowleft" size={20} color="white"/>
        </TouchableOpacity>
        <Text className="top-2 text-xl ml-2 font-poppins-semibold text-black">
          {formData?.kode || 'Detail Pembayaran'}
        </Text>
      </View>
      
      <ScrollView>
        <View className="p-4">
          <View className="flex-row justify-between mb-4">
            <View className="flex-1">
              <Text className="text-sm text-gray-600 mb-1 font font-poppins-regular">Harga</Text>
              <Text className="text-base font-poppins-semibold">
                {formatCurrency(formData?.harga || 0)}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-sm text-gray-600 mb-1 font-poppins-regular">Atas Nama</Text>
              <Text className="text-base font-poppins-semibold">
                {formData?.permohonan?.user?.nama || '-'}
              </Text>
            </View>
          </View>

          {renderPaymentDetails()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Detail;