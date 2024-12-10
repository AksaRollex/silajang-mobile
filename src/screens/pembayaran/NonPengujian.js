import React, { useState, useCallback, useRef } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { MenuView } from "@react-native-menu/menu";
import BackButton from "@/src/screens/components/BackButton";
import Paginate from "@/src/screens/components/Paginate";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { rupiah } from "@/src/libs/utils";
import { useDelete } from '@/src/hooks/useDelete';
import { useQueryClient } from "@tanstack/react-query";

const rem = multiplier => 16 * multiplier;

const NonPengujian = ({ navigation }) => {
  const queryClient = useQueryClient();
  const [refreshKey, setRefreshKey] = useState(0);
  const paginateRef = useRef();
  const [tahun, setTahun] = useState(2024);
  const [bulan, setBulan] = useState("-");
  const [type, setType] = useState("va");

  const { delete: deleteNonPengujian, DeleteConfirmationModal } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries(['/pembayaran/non-pengujian']);
      paginateRef.current?.refetch();
    },
    onError: (error) => {
      console.error('Delete error:', error);
      // Optionally add error handling toast or alert
    }
  });

  const tahuns = Array.from(
    { length: new Date().getFullYear() - 2021 },
    (_, i) => ({
      id: 2022 + i,
      text: `${2022 + i}`,
    }),
  );

  const bulans = [
    { id: 1, text: "Januari" },
    { id: 2, text: "Februari" },
    { id: 3, text: "Maret" },
    { id: 4, text: "April" },
    { id: 5, text: "Mei" },
    { id: 6, text: "Juni" },
    { id: 7, text: "Juli" },
    { id: 8, text: "Agustus" },
    { id: 9, text: "September" },
    { id: 10, text: "Oktober" },
    { id: 11, text: "November" },
    { id: 12, text: "Desember" },
  ];

  const metodes = [
    { id: "va", text: "Virtual Account" },
    { id: "qris", text: "QRIS" },
  ];

  const handleYearChange = useCallback(({ nativeEvent: { event: selectedId } }) => {
    setTahun(parseInt(selectedId));
    paginateRef.current?.refetch();
  }, []);

  const handleBulanChange = useCallback(({ nativeEvent: { event: selectedId } }) => {
    setBulan(parseInt(selectedId));
    paginateRef.current?.refetch();
  }, []);

  const handleMetodeChange = useCallback(({ nativeEvent: { event: selectedId } }) => {
    setType(selectedId);
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
        width: 187,
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

  const cardNonPengujian = ({ item }) => {
    const getStatusStyle = (status) => {
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
        default:
          return {
            text: "text-red-700",
            background: "bg-red-100",
            border: "border-red-200",
          };
      }
    };

    const getStatusText = (item) => {
      if (item.is_expired) {
        return "Kedaluwarsa";
      } else {
        const status = item.status;
        switch (status) {
          case "pending":
            return "pending";
          case "success":
            return "success";
          default:
            return "failed";
        }
      }
    };

    const getMetodeStyle = (metode) => {
      switch (metode) {
        case 'va':
          return {
            text: "text-green-600",
            background: "bg-green-100",
            border: "border-green-100",
          };
        default:
          return {
            text: "text-blue-700",
            background: "bg-blue-50",
            border: "border-blue-50",
          };
      }
    };

    const statusStyle = getStatusStyle(item.status || 'failed');
    const statusText = getStatusText(item);
    const metodeStyle = getMetodeStyle(item.type);

    return (
      <View
        className="my-3 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-6"
        style={{
          elevation: 4,
        }}>
        <View className="absolute top-[2px] right-1.5 p-2">
          <View className={`rounded-md px-2 py-1 border ${statusStyle.background} ${statusStyle.border}`}>
            <Text
              className={`text-[11px] font-bold text-right ${statusStyle.text}`}
              numberOfLines={2}
              ellipsizeMode="tail">
              {statusText}
            </Text>
          </View>
        </View>

        <View className="space-y-4">
          <View className="flex-row justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-xs font-poppins-regular text-gray-500 mb-1">Nama</Text>
              <Text className="text-md font-poppins-semibold text-black">
                {item.nama}
              </Text>
            </View>

            <View className="flex-1">
              <Text className="text-xs font-poppins-regular text-gray-500 mb-1">Metode</Text>
              <View className={`rounded-md px-2 py-1.5 border self-start ${metodeStyle.background} ${metodeStyle.border}`}>
                <Text
                  className={`text-[11px] font-bold ${metodeStyle.text}`}
                  numberOfLines={2}
                  ellipsizeMode="tail">
                  {(item.type || '').toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row">
            <View className="flex-1 pr-4">
              <Text className="text-xs font-poppins-regular text-gray-500 mb-1">Jumlah Nominal</Text>
              <Text className="text-md font-poppins-semibold text-black">
                {rupiah(item.jumlah || 0)}
              </Text>
            </View>

            <View className="flex-1">
              <Text className="text-xs font-poppins-regular text-gray-500 mb-1">Tanggal Kedaluwarsa</Text>
              <Text className="text-md font-poppins-semibold text-black">
                {item.tanggal_exp_indo || '-'}
              </Text>
            </View>
          </View>

          <View className="h-[1px] bg-gray-300 my-2" />

          <View className="flex-row justify-end space-x-3">
            <TouchableOpacity
              onPress={() => {/* Implement detail view if needed */}}
              className="bg-indigo-500 px-3 py-2.5 rounded-md flex-row items-center">
              <Ionicons name="eye-outline" size={15} color="white" />
              <Text className="text-white text-xs ml-2 font-poppins-medium">
                Detail
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => deleteNonPengujian(`/pembayaran/non-pengujian/${item.uuid}`)}
              className="bg-red-600 px-3 py-2.5 rounded-md flex-row items-center">
              <Ionicons name="ban-outline" size={15} color="white" />
              <Text className="text-white text-xs ml-2 font-poppins-medium">
                Batal
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="bg-[#ececec] w-full h-full">
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center flex-1">
            <BackButton action={() => navigation.goBack()} size={26} />
            <Text className="text-[20px] font-poppins-semibold text-black mx-auto self-center">
              Non Pengujian
            </Text>
          </View>
        </View>

        <View className="flex-row ml-2">
          <MenuView
            title="Pilih Tahun"
            onPressAction={handleYearChange}
            actions={tahuns.map(option => ({
              id: option.id.toString(),
              title: option.text,
            }))}>
            <View style={{ marginEnd: 8 }}>
              <PickerButton
                label="Tahun"
                value={tahun}
              />
            </View>
          </MenuView>

          <TouchableOpacity
            onPress={() => navigation.navigate("FormNonPengujian")}
            className="bg-[#312e81] px-14 py-1.5 rounded-md flex-row items-center ml-2"
            style={{ height: 49.5, marginTop: 10.8, bottom: 10 }}
          >
            <Ionicons name="add" size={20} color="white" style={{ right: 6 }} />
            <Text className="text-white ml-2 font-poppins-medium right-2">
              Buat
            </Text>
          </TouchableOpacity>
        </View>

        <MenuView
          title="Pilih Metode"
          onPressAction={handleMetodeChange}
          actions={metodes.map(option => ({
            id: option.id,
            title: option.text,
          }))}>
          <View style={{ marginStart: 8, width: 250, marginTop: 10 }}>
            <PickerButton
              label="Metode"
              value={metodes.find(m => m.id === type)?.text}
              style={{ width: 380 }}
            />
          </View>
        </MenuView>
      </View>

      <Paginate
        ref={paginateRef}
        url="/pembayaran/non-pengujian"
        payload={{
          tahun: tahun,
          bulan: bulan,
          type: type,
          page: 1,
          per: 10,
        }}
        renderItem={cardNonPengujian}
        className="px-4 mb-12"
      />

      <TouchableOpacity
        // onPress={handlePreviewReport}
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

      <DeleteConfirmationModal />
    </View>
  );
};

export default NonPengujian;