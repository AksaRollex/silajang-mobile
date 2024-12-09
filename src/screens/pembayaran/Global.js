import React, { useState, useCallback, useRef } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { MenuView } from "@react-native-menu/menu";
import BackButton from "@/src/screens/components/BackButton";
import Paginate from "@/src/screens/components/Paginate";
import RNPickerSelect from "react-native-picker-select";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Feather from "react-native-vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { APP_URL } from "@env";
import Pdf from "react-native-pdf";
import RNFS from "react-native-fs";
import Toast from "react-native-toast-message";
import { rupiah } from "@/src/libs/utils";

const rem = multiplier => 16 * multiplier;

const Global = ({ navigation }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedStatus, setSelectedStatus] = useState("-");
  const paginateRef = useRef();
  const [modalVisible, setModalVisible] = useState(false);
  const [reportUrl, setReportUrl] = useState("");

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

  const statusOptions = [
    { id: "-", title: "Semua" },
    { id: "pending", title: "Pending" },
    { id: "success", title: "Sukses" },
    { id: "failed", title: "Gagal" },
  ];

  const handleYearChange = useCallback(({ nativeEvent: { event: selectedId } }) => {
    setSelectedYear(parseInt(selectedId));
    paginateRef.current?.refetch();
  }, []);

  const handleStatusChange = useCallback(({ nativeEvent: { event: selectedId } }) => {
    setSelectedStatus(selectedId);
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

  const downloadReport = async () => {
    try {
      const authToken = await AsyncStorage.getItem("@auth-token");
      const fileName = `Laporan_Pembayaran_${selectedYear}_${selectedStatus}_${Date.now()}.xlsx`;
      
      const downloadUrl = `${APP_URL}/pembayaran/global/report?tahun=${selectedYear}&status=${selectedStatus}`;
      
      const downloadPath =
        Platform.OS === "ios"
          ? `${RNFS.DocumentDirectoryPath}/${fileName}`
          : `${RNFS.DownloadDirectoryPath}/${fileName}`;

      const options = {
        fromUrl: downloadUrl,
        toFile: downloadPath,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      };

      const result = await RNFS.downloadFile(options).promise;

      if (result.statusCode === 200) {
        if (Platform.OS === "android") {
          await RNFS.scanFile(downloadPath);
        }

        Toast.show({
          type: "success",
          text1: "Success",
          text2: `Laporan Berhasil Diunduh. ${
            Platform.OS === "ios"
              ? "You can find it in the Files app."
              : `Saved as ${fileName} in your Downloads folder.`
          }`,
        });
      } else {
        throw new Error("Download failed");
      }
    } catch (error) {
      console.error("Download error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: `Laporan gagal diunduh: ${error.message}`,
      });
    }
  };

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
  
  const getStatusText = status => {
    switch (status) {
      case "pending":
        return "pending";
      case "success":
        return "success";
      case "failed":
        return "failed";
      default:
        return "Status Tidak Diketahui";
    }
  };

  const renderItem = ({ item }) => {
    const statusStyle = getStatusStyle(item.status);
    const statusText = getStatusText(item.status);

    return (
      <View
      className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
      style={{
        elevation: 4,
      }}>
      <View className="flex-row justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-xs font-poppins-regular text-gray-500">Virtual Account</Text>
          <Text className="text-md font-poppins-semibold text-black mb-4">
            {item.va_number || "Nomor VA Kosong"}
          </Text>

          <View className="flex-row justify-between mb-2">
            <View className="flex-1 pr-5">
              <Text className="text-xs font-poppins-regular text-gray-500">Nama</Text>
              <Text className="text-md font-poppins-semibold text-black">
                {item.nama || "-"}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs font-poppins-regular text-gray-500">Jumlah Nominal</Text>
              <Text className="text-md font-poppins-semibold text-black">
                {rupiah(item.jumlah)}
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between mb-2">
            <View className="flex-1 pr-3">
              <Text className="text-xs font-poppins-regular text-gray-500">Tanggal Dibuat</Text>
              <Text className="text-md font-poppins-semibold text-black">
                {item.tanggal_dibuat}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-xs font-poppins-regular text-gray-500">Tanggal Kedaluwarsa</Text>
              <Text className="text-md font-poppins-semibold text-black">
                {item.tanggal_exp_indo || "-"}
              </Text>
              {item.is_expired && (
                <View className="bg-yellow-100 px-1.5 py-0.5 rounded-md mt-1 self-start">
                  <Text className="text-[11px] font-bold text-yellow-500">
                    Kedaluwarsa
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
        
        <View className="flex-shrink-0 items-end">
          <View className={`rounded-md px-1.5 py-1 border ${statusStyle.background} ${statusStyle.border}`}>
            <Text
              className={`text-[11px] font-bold text-right ${statusStyle.text}`}
              numberOfLines={2}
              ellipsizeMode="tail">
              {statusText}
            </Text>
          </View>
        </View>
      </View>
    </View>
    );
  };

  const pickerStyle = {
    inputIOS: {
      paddingHorizontal: rem(1),
      paddingVertical: rem(0.75),
      borderWidth: 1,
      borderColor: "#E5E7EB",
      borderRadius: 8,
      color: "black",
      backgroundColor: "white",
    },
    inputAndroid: {
      paddingHorizontal: rem(1),
      paddingVertical: rem(0.75),
      borderWidth: 1,
      borderColor: "#E5E7EB",
      borderRadius: 8,
      color: "black",
      backgroundColor: "white",
    },
    iconContainer: {
      top: 12,
      right: 12,
    },
  };

  return (
    <View className="bg-[#ececec] w-full h-full">
    <View className="p-4">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center flex-1">
          <BackButton action={() => navigation.goBack()} size={26} />
          <Text className="text-[20px] font-poppins-semibold text-black mx-auto self-center" >
            Global
          </Text>
        </View>
        
      </View>

        <View className="flex-row space-x-2 ">
          <MenuView
            title="Pilih Tahun"
            onPressAction={handleYearChange}
            actions={generateYears().map(option => ({
              id: option.id.toString(),
              title: option.title,
            }))}>
            <View style={{ marginEnd: 8 }}>
              <PickerButton
                label="Tahun"
                value={selectedYear}
              />
            </View>
          </MenuView>

          <MenuView
            title="Pilih Status"
            onPressAction={handleStatusChange}
            actions={statusOptions.map(option => ({
              id: option.id,
              title: option.title,
            }))}>
            <View style={{ marginEnd: 8 }}>
            <PickerButton
                label="Status"
                value={statusOptions.find(opt => opt.id === selectedStatus)?.title}
              />
            </View>
          </MenuView>
        </View>
      </View>

      <Paginate
        ref={paginateRef}
        url="/pembayaran/global"
        payload={{
          status: selectedStatus,
          tahun: selectedYear,
          page: 1,
          per: 10,
        }}
        renderItem={renderItem}
        className="px-4 mb-12"
      />

    <TouchableOpacity
        onPress={downloadReport}
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
        
      </TouchableOpacity>


    </View>
  );
};

export default Global;