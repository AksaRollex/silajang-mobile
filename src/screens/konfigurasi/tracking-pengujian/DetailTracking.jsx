import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import moment from 'moment';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from "react-native-ui-lib";

const mapStatusPengujian = (status) => {
  const statusPengujian = {
    "-1": "Revisi",
    0: "Mengajukan Permohonan",
    1: "Menyerahkan Sampel",
    2: "Menyerahkan Surat Perintah Pengujian",
    3: "Menyerahkan sampel untuk Proses Pengujian",
    4: "Menyerahkan RDPS",
    5: "Menyerahkan RDPS untuk Pengetikan LHU",
    6: "Menyerahkan LHU untuk Diverifikasi",
    7: "Mengesahkan LHU",
    8: "Pembayaran",
    9: "Penyerahan LHU",
    10: "Penyerahan LHU Amandemen (Jika ada)",
    11: "Selesai"
  };
  return statusPengujian[status] || "Sedang Diproses";
};

const getIconName = (status) => {
  const iconMap = {
    [-1]: 'alert-circle',
    0: 'mail',
    1: 'archive',
    2: 'folder-open',
    3: 'flask',
    4: 'clipboard-check',
    5: 'file-document',
    6: 'pencil',
    7: 'check-decagram',
    8: 'wallet',
    9: 'printer',
    10: 'tablet',
    11: 'check-all'
  };
  return iconMap[status] || 'help-circle';
};

const DetailTracking = ({ route, navigation }) => {
  const { selected } = route.params;

  const renderBadge = (isPositive) => (
    <View className={`px-2 py-1 rounded ${
      isPositive 
        ? 'bg-green-100 ' 
        : 'bg-yellow-100 '
    }`}>
      <Text className={`text-xs font-poppins-semibold ${
        isPositive 
          ? 'text-green-500'
          : 'text-yellow-500'
      }`}>
        {isPositive ? 'Sudah Diuji' : 'Belum Dilakukan'}
      </Text>
    </View>
  );

  return (
    <ScrollView className="flex-1" style={{ backgroundColor:  Colors.grey80 }} >
      <View className="flex-1"> 
        <View className="mx-2 my-3 rounded-xl bg-white elevation">
          <View className="flex-row items-center p-4">
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              className="p-3 mr-4 bg-[#ef4444] rounded-xl" 
            >
              <AntDesign name="arrowleft" size={20} color="white" />
            </TouchableOpacity>
            <Text className="flex-1 text-lg font-semibold text-black">
              ({selected?.kode}) {selected?.lokasi}
            </Text>
          </View>
        </View>
  
        <View className="mx-2 mb-3 p-4 rounded-xl bg-white elevation">
          {selected?.trackings?.map((tracking, index) => (
            <View key={tracking.id} className="flex-row mb-6 relative">
              {index !== selected.trackings.length - 1 && (
                <View className="absolute left-[21px] top-[50px] w-1 h-full bg-indigo-50 z-10" />
              )}
  
              <View className="w-11 h-11 rounded-full bg-indigo-50 justify-center items-center mr-4 z-20">
                <MaterialCommunityIcons 
                  name={getIconName(tracking.status)} 
                  size={24} 
                  color="#4338ca" 
                />
              </View>
  
              <View className="flex-1">
                <Text className="text-xs text-gray-400 mb-1 font-semibold">
                  {moment(tracking.created_at).format('DD MMMM YYYY, HH:mm')}
                </Text>
                <Text className="text-base font-semibold text-black mb-2">
                  {mapStatusPengujian(tracking.status)}
                </Text>
  
                {tracking.status === 3 && selected.parameters && (
                  <View className="mt-2">
                    {selected.parameters
                      .filter(param => param.is_dapat_diuji)
                      .map(param => (
                        <View key={param.id} className="flex-row justify-between items-center mb-2 pr-2">
                          <Text className="flex-1 text-xs text-black mr-2 font-semibold">
                            {param.nama} {param.keterangan ? `(${param.keterangan})` : ''}
                          </Text>
                          {renderBadge(param.pivot?.acc_analis)}
                        </View>
                      ))}
                  </View>
                )}
  
                {tracking.status === 7 && (
                  <View className="mt-2 bg-gray-50 p-3 rounded-lg">
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-xs text-gray-700">Cetak LHU</Text>
                      {renderBadge(selected.sertifikat)}
                    </View>
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-xs text-gray-700">Verifikasi LHU</Text>
                      {renderBadge(selected.verifikasi_lhu)}
                    </View>
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-xs text-gray-700">Tanda Tangan TTE</Text>
                      {renderBadge(selected.status_tte)}
                    </View>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default DetailTracking;