import axios from "@/src/libs/axios";
import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, PermissionsAndroid } from "react-native";
import { MenuView } from "@react-native-menu/menu";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import moment from 'moment';
import Paginate from "@/src/screens/components/Paginate";
import {APP_URL} from "@env";

const RegistrasiSampel = ({ navigation }) => {
  const queryClient = useQueryClient();
  const paginateRef = useRef();
  const [isDownloading, setIsDownloading] = useState(false);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString());

  const generateYears = () => {
    let years = [];
    for (let i = currentYear; i >= 2022; i--) {
      years.push({ id: i, title: String(i) });
    }
    return years;
  };

  const monthOptions = [
    { id: 1, title: "Januari" },
    { id: 2, title: "Februari" },
    { id: 3, title: "Maret" },
    { id: 4, title: "April" },
    { id: 5, title: "Mei" },
    { id: 6, title: "Juni" },
    { id: 7, title: "Juli" },
    { id: 8, title: "Agustus" },
    { id: 9, title: "September" },
    { id: 10, title: "Oktober" },
    { id: 11, title: "November" },
    { id: 12, title: "Desember" },
  ];

  const handleYearChange = (event) => {
    setSelectedYear(event.nativeEvent.event);
    paginateRef.current?.refetch();
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.nativeEvent.event);
    paginateRef.current?.refetch();
  };

  useEffect(() => {
    if (paginateRef.current) {
      paginateRef.current.refetch();
    }
  }, [selectedYear, selectedMonth]);

  const handleDownloadExcel = async () => {
    if (isDownloading) return;

    try {
      setIsDownloading(true);
      await downloadExcel('/report/registrasi-sampel', {
        tahun: selectedYear,
        bulan: selectedMonth,
      });
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadExcel = async (url, params) => {
    try {
      // Request permission for Android
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          throw new Error('Storage permission denied');
        }
      }
  
      // Convert params to query string
      const queryString = Object.keys(params)
        .map(key => `${key}=${params[key]}`)
        .join('&');
  
      // Get the full URL
      const fullUrl = `${APP_URL}${url}?${queryString}`;
  
      // Configure headers
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        // Add your authorization header if needed
        // 'Authorization': `Bearer ${your_token_here}`
      };
  
      // Generate filename with timestamp
      const timestamp = new Date().getTime();
      const filename = `report_${timestamp}.xlsx`;
  
      // Configure download path
      const { dirs } = RNFetchBlob.fs;
      const dirToSave = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.DownloadDir;
      const filePath = `${dirToSave}/${filename}`;
  
      // Download file
      const response = await RNFetchBlob.config({
        fileCache: true,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          path: filePath,
          description: 'Downloading Excel Report',
          mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        path: filePath
      }).fetch('GET', fullUrl, headers);
  
      if (Platform.OS === 'ios') {
        // For iOS, we need to share the file
        RNFetchBlob.ios.openDocument(response.path());
      }
  
      return response.path();
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  };

  const CardRegistrasiSampel = ({ item }) => (
    <View
      className="my-4 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
      style={{ elevation: 4 }}>
      <View className="flex-row items-center">
        <View className="" style={{ width: "90%" }}>
          <View className="flex-col space-y-2">
              <View>
                <Text className="text-[14px] font-poppins-bold text-black">Tanggal Masuk:</Text>
                <Text className="text-[12px] font-poppins-semibold text-black">
                  {item.tanggal_diterima || '-'}
                </Text>
              </View>

              <View>
                <Text className="text-[14px] font-poppins-bold text-black">Tanggal Selesai:</Text>
                <Text className="text-[12px] font-poppins-semibold text-black">
                  {item.tanggal_selesai || '-'}
                </Text>
              </View>

            <View>
              <Text className="text-[14px] font-poppins-bold text-black">Pelanggan:</Text>
              <Text className="text-[12px] font-poppins-semibold text-black"
                numberOfLines={2}
                style={{ flexWrap: 'wrap' }}>
                {item.permohonan?.user?.nama}
              </Text>
            </View>

            <View>
              <Text className="text-[14px] font-poppins-bold text-black">Alamat:</Text>
              <Text className="text-[12px] font-poppins-semibold text-black"
                numberOfLines={2}>
                {item.permohonan?.user?.detail?.alamat}
              </Text>
            </View>

            <View>
              <Text className="text-[14px] font-poppins-bold text-black">Lokasi:</Text>
              <Text className="text-[12px] font-poppins-semibold text-black"
                numberOfLines={2}>
                {item.permohonan?.alamat}
              </Text>
            </View>

            <View>
              <Text className="text-[14px] font-poppins-bold text-black">Titik Sampling:</Text>
              <Text className="text-[12px] font-poppins-semibold text-black"
                numberOfLines={2}>
                {item.lokasi}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-100">
      <View className="bg-gray-100 p-4 shadow-sm">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-poppins-bold text-black">Registrasi Sampel</Text>
          <TouchableOpacity
            onPress={handleDownloadExcel}
            disabled={isDownloading}
            className={`flex-row items-center space-x-2 ${
              isDownloading ? 'bg-gray-100' : 'bg-red-50'
            } px-4 py-2 rounded-md`}>
            {isDownloading ? (
              <ActivityIndicator size="small" color="#dc2626" />
            ) : (
              <MaterialIcons name="file-download" size={20} color="#dc2626" />
            )}
            <Text className="text-red-600 font-poppins-semibold">
              {isDownloading ? 'Downloading...' : 'Report Excel'}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-end space-x-3">
          <MenuView
            title="Pilih Tahun"
            onPressAction={handleYearChange}
            actions={generateYears().map(option => ({
              id: option.id.toString(),
              title: option.title,
            }))}>
            <View style={{ marginEnd: 8 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "white",
                  padding: 12,
                  borderRadius: 8,
                  width: 185,
                  borderColor: "#d1d5db",
                  borderWidth: 1
                }}>
                <Text style={{ color: "black", flex: 1, textAlign: "center", fontFamily: "Poppins-SemiBold" }}>
                  {`Tahun: ${selectedYear}`}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color="black" />
              </View>
            </View>
          </MenuView>

          <MenuView
            title="Pilih Bulan"
            onPressAction={handleMonthChange}
            actions={monthOptions.map(option => ({
              id: option.id.toString(),
              title: option.title,
            }))}>
            <View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "white",
                  padding: 12,
                  borderRadius: 8,
                  width: 185,
                  borderColor: "#d1d5db",
                  borderWidth: 1,
                }}>
                <Text style={{ color: "black", flex: 1, textAlign: "center", fontFamily: "Poppins-SemiBold" }}>
                  {`Bulan: ${monthOptions.find(m => m.id.toString() === selectedMonth)?.title || 'Pilih'}`}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color="black" />
              </View>
            </View>
          </MenuView>
        </View>
      </View>

      <Paginate
        ref={paginateRef}
        url="/report/registrasi-sampel"
        payload={{
          tahun: selectedYear,
          bulan: selectedMonth,
          page: 1,
          per: 10,
        }}
        renderItem={CardRegistrasiSampel}
      />
    </View>
  );
};

export default RegistrasiSampel;