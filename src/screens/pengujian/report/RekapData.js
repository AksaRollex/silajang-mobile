import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import axios from '@/src/libs/axios';
import { useDownloadPdf } from './libs/hooks';
import { currency } from '@/src/libs/utils';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

const RekapData = () => {
  const [date, setDate] = useState({
    start: moment().startOf('month').format('YYYY-MM-DD'),
    end: moment().format('YYYY-MM-DD'),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState('start');
  const [isMandiri, setIsMandiri] = useState('-');
  const [golonganId, setGolonganId] = useState('-');
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const tipeMandiris = [
    { id: '-', text: 'Semua' },
    { id: '0', text: 'Diambil Petugas' },
    { id: '1', text: 'Dikirim Mandiri' },
  ];

  const golongans = [
    { id: '-', text: 'Semua' },
    { id: '1', text: 'Customer' },
    { id: '2', text: 'Dinas Internal' },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/report/rekap', {
        start: date.start,
        end: date.end,
        is_mandiri: isMandiri,
        golongan_id: golonganId,
      });
  
      setData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error(error);
      setData([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [date, isMandiri, golonganId]);

  const renderDatePicker = () => (
    <View className="flex-row justify-between mb-4">
      <TouchableOpacity 
        className="p-3 bg-gray-100 rounded-lg flex-[0.48]"
        onPress={() => {
          setDatePickerMode('start');
          setShowDatePicker(true);
        }}
      >
        <Text className="text-gray-800 font-poppins-semibold">Start: {date.start}</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        className="p-3 bg-gray-100 rounded-lg flex-[0.48]"
        onPress={() => {
          setDatePickerMode('end');
          setShowDatePicker(true);
        }}
      >
        <Text className="text-gray-800 font-poppins-semibold">End: {date.end}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={new Date(datePickerMode === 'start' ? date.start : date.end)}
          mode="date"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setDate(prev => ({
                ...prev,
                [datePickerMode]: moment(selectedDate).format('YYYY-MM-DD')
              }));
            }
          }}
        />
      )}
    </View>
  );

  const renderSampelPermohonan = () => (
    <ScrollView className="flex-1">
      {Array.isArray(data) && data.map((item) => (
        <View 
          key={item.uuid} 
          className="my-4 bg-gray-50 rounded-lg p-5 shadow-md border-t-4 border-indigo-900"
        >
          <View className="w-11/12">
            <View className="mb-2">
              <Text className="text-sm font-bold text-black mb-0.5">Tanggal Masuk:</Text>
              <Text className="text-xs font-semibold text-black">{item.tanggal_diterima || '-'}</Text>
            </View>

            <View className="mb-2">
              <Text className="text-sm font-bold text-black mb-0.5">Tanggal Selesai:</Text>
              <Text className="text-xs font-semibold text-black">{item.tanggal_selesai || '-'}</Text>
            </View>

            <View className="mb-2">
              <Text className="text-sm font-bold text-black mb-0.5">Pelanggan:</Text>
              <Text className="text-xs font-semibold text-black" numberOfLines={2}>
                {item.permohonan?.user?.nama}
              </Text>
            </View>

            <View className="mb-2">
              <Text className="text-sm font-bold text-black mb-0.5">Lokasi:</Text>
              <Text className="text-xs font-semibold text-black" numberOfLines={2}>
                {item.lokasi}
              </Text>
            </View>

            <View className="mb-2">
              <Text className="text-sm font-bold text-black mb-0.5">Status:</Text>
              <View className="bg-blue-50 px-2 py-1 rounded self-start">
                <Text className="text-blue-600 text-xs font-semibold">{item.text_status}</Text>
              </View>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderTotalBiaya = () => (
    <ScrollView className="flex-1">
      {data.map((item) => (
        <View 
          key={item.uuid} 
          className="my-4 bg-gray-50 rounded-lg p-5 shadow-md border-t-4 border-indigo-900"
        >
          <View className="w-11/12">
            <View className="mb-2">
              <Text className="text-sm font-bold text-black mb-0.5">Tanggal Masuk:</Text>
              <Text className="text-xs font-semibold text-black">{item.tanggal_diterima || '-'}</Text>
            </View>

            <View className="mb-2">
              <Text className="text-sm font-bold text-black mb-0.5">Tanggal Selesai:</Text>
              <Text className="text-xs font-semibold text-black">{item.tanggal_selesai || '-'}</Text>
            </View>

            <View className="mb-2">
              <Text className="text-sm font-bold text-black mb-0.5">Pelanggan:</Text>
              <Text className="text-xs font-semibold text-black" numberOfLines={2}>
                {item.permohonan?.user?.nama}
              </Text>
            </View>

            <View className="mb-2">
              <Text className="text-sm font-bold text-black mb-0.5">Lokasi:</Text>
              <Text className="text-xs font-semibold text-black" numberOfLines={2}>
                {item.lokasi}
              </Text>
            </View>

            <View className="mb-2">
              <Text className="text-sm font-bold text-black mb-0.5">Harga:</Text>
              <Text className="text-xs font-semibold text-black">
                {item.permohonan.user.golongan_id == 1 ? currency(item.harga) : '-'}
              </Text>
            </View>

            <View className="mb-2">
              <Text className="text-sm font-bold text-black mb-0.5">Jasa Pengambilan:</Text>
              <Text className="text-xs font-semibold text-black">
                {(item.permohonan.jasa_pengambilan?.harga && item.permohonan.user.golongan_id == 1) 
                  ? currency(item.permohonan.jasa_pengambilan.harga) 
                  : '-'}
              </Text>
            </View>

            <View className="mb-2">
              <Text className="text-sm font-bold text-black mb-0.5">Total Biaya:</Text>
              <Text className="text-xs font-semibold text-black">
                {item.permohonan.user.golongan_id == 1 
                  ? currency(item.harga + (item.permohonan.jasa_pengambilan?.harga || 0))
                  : '-'}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderScene = SceneMap({
    sampel: renderSampelPermohonan,
    biaya: renderTotalBiaya,
  });

  return (
    <View className="flex-1 p-4 bg-white">
      <Text className="text-2xl font-bold mb-4">Rekap Data</Text>
      
      {renderDatePicker()}

      <View className="mb-4">
        <View className="mb-3">
          <Text className="text-sm mb-1 text-gray-600 font-poppins-semibold">Tipe Pengambilan/Pengiriman</Text>
          <View className="bg-gray-100 rounded-lg">
            <Picker
              selectedValue={isMandiri}
              className="h-12"
              onValueChange={setIsMandiri}
            >
              {tipeMandiris.map(item => (
                <Picker.Item key={item.id} label={item.text} value={item.id} />
              ))}
            </Picker>
          </View>
        </View>

        <View className="mb-3">
          <Text className="text-sm mb-1 text-gray-600 font-poppins-semibold">Tipe User</Text>
          <View className="bg-gray-100 rounded-lg">
            <Picker
              selectedValue={golonganId}
              className="h-12"
              onValueChange={setGolonganId}
            >
              {golongans.map(item => (
                <Picker.Item className="font-poppins-semibold text-black" key={item.id} label={item.text} value={item.id} />
              ))}
            </Picker>
          </View>
        </View>
      </View>

      <TabView
        navigationState={{
          index: tabIndex,
          routes: [
            { key: 'sampel', title: 'Sampel Permohonan' },
            { key: 'biaya', title: 'Total Biaya' },
          ],
        }}
        renderScene={renderScene}
        onIndexChange={setTabIndex}
        renderTabBar={props => (
          <TabBar
            {...props}
            className="bg-white"
            indicatorClassName="bg-blue-600"
            labelStyle={{ color: '#000' }}
          />
        )}
      />

      {loading && (
        <View className="absolute inset-0 items-center justify-center bg-black/50">
          <ActivityIndicator size="large" color="#1976d2" />
        </View>
      )}
    </View>
  );
};

export default RekapData;