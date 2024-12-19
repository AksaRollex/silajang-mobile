import React, { useState, useCallback, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { MenuView } from "@react-native-menu/menu";
import axios from "@/src/libs/axios";
import BackButton from "@/src/screens/components/BackButton";
import Paginate from "@/src/screens/components/Paginate";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { rupiah } from "@/src/libs/utils";

const MultiPayment = ({ navigation }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedType, setSelectedType] = useState("va");
  const paginateRef = useRef();
  const [modalVisible, setModalVisible] = useState(false);
  const [authToken, setAuthToken] = useState('');

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('@auth-token');
      setAuthToken(token);
    })();
  }, []);

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = 2022; year <= currentYear; year++) {
      years.push({
        id: year,
        title: year.toString(),
      });
    }
    return years;
  };

  const handlePreviewReport = async () => {
    try {
      const authToken = await AsyncStorage.getItem("@auth-token");
      const baseUrl = `/api/v1/report/pembayaran/pengujian`;
      const reportUrl = `${APP_URL}${baseUrl}?tahun=${tahun}&bulan=${bulan}&type=${type}&token=${authToken}`;

      setReportUrl(reportUrl);
      setModalVisible(true);
    } catch (error) {
      console.error("Preview Report error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Gagal memuat laporan",
      });
    }
  };


  const months = [
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

  const types = [
    { id: "va", title: "Virtual Account" },
    { id: "qris", title: "QRIS" },
  ];

  const handleYearChange = useCallback(({ nativeEvent: { event: selectedId } }) => {
    setSelectedYear(parseInt(selectedId));
    paginateRef.current?.refetch();
  }, []);

  const handleMonthChange = useCallback(({ nativeEvent: { event: selectedId } }) => {
    setSelectedMonth(parseInt(selectedId));
    paginateRef.current?.refetch();
  }, []);

  const handleTypeChange = useCallback(({ nativeEvent: { event: selectedId } }) => {
    setSelectedType(selectedId);
    paginateRef.current?.refetch();
  }, []);

  const PickerButton = ({ label, value, style }) => (
    <View
      style={[{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        padding: 12,
        borderRadius: 8,
        width: 185,
        borderColor: "#d1d5db",
        borderWidth: 1
      }, style]}>
      <Text style={{
        color: "black",
        flex: 1,
        textAlign: "center",
        fontFamily: "Poppins-SemiBold"
      }}>
        {label}: {value}
      </Text>
      <MaterialIcons name="arrow-drop-down" size={24} color="black" />
    </View>
  );

  const getStatusStyle = status => {
    switch (status) {
      case "pending":
        return {
          text: "text-blue-700",
          background: "bg-blue-50",
          border: "border-blue-50",
        };
      case "success":
        return {
          text: "text-green-600",
          background: "bg-green-100",
          border: "border-green-100",
        };
      case "failed":
        return {
          text: "text-red-700",
          background: "bg-red-100",
          border: "border-red-100",
        };
      default:
        return {
          text: "text-gray-700",
          background: "bg-gray-100",
          border: "border-gray-200",
        };
    }
  };

  const renderItem = ({ item }) => {
    const statusStyle = getStatusStyle(item.status);

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('MultiPaymentDetail', { uuid: item.uuid })}
        className="my-2 bg-white rounded-md border-t-[6px] border-indigo-900 p-5"
        style={{ elevation: 4 }}>
        <View className="flex-row justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-xs font-poppins-regular text-gray-500">Kode</Text>
            <Text className="text-md font-poppins-semibold text-black mb-4">
              {item.multi_payments?.map(mp => mp.titik_permohonan.kode).join(', ') || "-"}
            </Text>

            <View className="flex-row justify-between mb-2">
              <View className="flex-1 pr-5">
                <Text className="text-xs font-poppins-regular text-gray-500">Pelanggan</Text>
                <Text className="text-md font-poppins-semibold text-black">
                  {item.multi_payments?.[0]?.titik_permohonan?.permohonan?.user?.nama || "-"}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs font-poppins-regular text-gray-500">Total</Text>
                <Text className="text-md font-poppins-semibold text-black">
                  {rupiah(item.jumlah)}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between mb-2">
              <View className="flex-1 pr-3">
                <Text className="text-xs font-poppins-regular text-gray-500">Metode</Text>
                <Text className="text-md font-poppins-semibold text-black">
                  {item.type === 'va' ? 'Virtual Account' : 'QRIS'}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs font-poppins-regular text-gray-500">Tanggal Bayar</Text>
                <Text className="text-md font-poppins-semibold text-black">
                  {item.tanggal_bayar || "-"}
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-shrink-0 items-end">
            <View className={`rounded-md px-1.5 py-1 border ${statusStyle.background} ${statusStyle.border}`}>
              <Text
                className={`text-[11px] font-bold text-right ${statusStyle.text}`}
                numberOfLines={2}
                ellipsizeMode="tail">
                {item.is_expired ? 'Kedaluwarsa' : item.status.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const downloadReport = async () => {
    try {
      const response = await axios.get(`/pembayaran/multi-payment/report?tahun=${selectedYear}&bulan=${selectedMonth}&type=${selectedType}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        responseType: 'arraybuffer',
      });
      
      // Handle download success
      setModalVisible(false);
      Toast.show({
        type: 'success',
        text1: 'Berhasil!',
        text2: 'Laporan berhasil diunduh',
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      Toast.show({
        type: 'error',
        text1: 'Gagal!',
        text2: 'Tidak dapat mengunduh laporan',
      });
    }
  };

  return (
    <View className="bg-[#ececec] w-full h-full">
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center flex-1">
            <BackButton action={() => navigation.goBack()} size={26} />
            <Text className="text-[20px] font-poppins-semibold text-black mx-auto self-center">
              Multi Payment
            </Text>
          </View>
        </View>

        <View className="flex-row space-x-5 mb-3 ">
          <MenuView
            title="Pilih Tahun"
            onPressAction={handleYearChange}
            actions={generateYears().map(option => ({
              id: option.id.toString(),
              title: option.title,
            }))}>
            <PickerButton
              label="Tahun"
              value={selectedYear}
            />
          </MenuView>

          <MenuView
            title="Pilih Bulan"
            onPressAction={handleMonthChange}
            actions={months.map(option => ({
              id: option.id.toString(),
              title: option.title,
            }))}>
            <PickerButton
              label="Bulan"
              value={months.find(m => m.id === selectedMonth)?.title}
            />
          </MenuView>
        </View>

        <MenuView
          title="Pilih Metode"
          onPressAction={handleTypeChange}
          actions={types.map(option => ({
            id: option.id,
            title: option.title,
          }))}>
          <PickerButton
            label="Metode"
            value={types.find(t => t.id === selectedType)?.title}
            style={{ width: '100%' }}
          />
        </MenuView>

          <TouchableOpacity
            onPress={() => navigation.navigate("FormMulti")}
            className="bg-[#312e81] px-14 py-1.5 rounded-md flex-row items-center mt-3 mb-3 justify-center"
            style={{ height: 49 }}
          >
            <MaterialIcons name="add" size={20} color="white" style={{ marginRight: 7 }} />
            <Text className="text-white font-poppins-medium text-base">
              Buat
            </Text>
          </TouchableOpacity>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="w-80 bg-white rounded-2xl p-6 items-center shadow-2xl">
            <View className="w-20 h-20 rounded-full bg-green-100 justify-center items-center mb-4">
              <FontAwesome5 size={40} color="#177a44" name="file-pdf" />
            </View>

            <Text className="text-xl font-poppins-semibold text-black mb-3">
              Konfirmasi Download
            </Text>

            <View className="w-full h-px bg-gray-200 mb-4" />

            <Text className="text-md text-center text-gray-600 mb-6 font-poppins-regular">
              Apakah Anda yakin ingin Mengunduh Report?
            </Text>

            <View className="flex-row w-full justify-between">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="flex-1 mr-3 bg-gray-100 py-3 rounded-xl items-center"
              >
                <Text className="text-gray-700 font-poppins-medium">Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={downloadReport}
                className="flex-1 ml-3 bg-green-500 py-3 rounded-xl items-center"
              >
                <Text className="text-white font-poppins-medium">Ya, Download</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Paginate
        ref={paginateRef}
        url="/pembayaran/multi-payment"
        payload={{
          type: selectedType,
          tahun: selectedYear,
          bulan: selectedMonth,
          page: 1,
          per: 10,
        }}
        renderItem={renderItem}
        className="px-4 mb-20"
      />
      {/* <TouchableOpacity
              onPress={handlePreviewReport}
              className="absolute bottom-20 right-4 bg-red-500 px-4 py-3 rounded-full flex-row items-center"
              style={{
                position: 'absolute',
                bottom: 75,
                right: 20,
                backgroundColor: '#dc2626',
                borderRadius: 50,
                width: 55,
                height: 55,
                justifyContent: 'center',
                alignItems: 'center',
                elevation: 5,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                zIndex: 1000
              }}>
              <FontAwesome5 name="file-pdf" size={19} color="white" />
      
            </TouchableOpacity> */}
    </View>
  );
};

export default MultiPayment;