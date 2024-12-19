import React, { useState, useRef, useCallback, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MenuView } from "@react-native-menu/menu";
import BackButton from "@/src/screens/components/BackButton";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useQueryClient } from "@tanstack/react-query";
import { Navigation } from "lucide-react-native";

const MultiPayment = ({ navigation }) => {
  const queryClient = useQueryClient();
  const paginateRef = useRef();
  const [tahun, setTahun] = useState(2024);
const [bulan, setBulan] = useState("-");
  const [type, setType] = useState("va");

//   const { delete: deleteMultiPayment, DeleteConfirmationModal } = useDelete({
//     onSuccess: () => {
//       queryClient.invalidateQueries(["/pembayaran/non-pengujian"]);
//       paginateRef.current?.refetch();
//     },
//     onError: error => {
//       console.error("Delete error:", error);
//       // Optionally add error handling toast or alert
//     },
//   });

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

  const handleYearChange = useCallback(
    ({ nativeEvent: { event: selectedId } }) => {
      setTahun(selectedId);
      paginateRef.current?.refetch();
    },
    [],
  );

//   const handleBulanChange = useCallback(
//     ({ nativeEvent: { event: selectedId } }) => {
//       setBulan(selectedId);
//       paginateRef.current?.refetch();
//     },
//     [],
//   );

  useEffect(() => {
    const currentMonthId = new Date().getMonth() + 1;
    setBulan(currentMonthId);
  }, [])

  const handleMetodeChange = useCallback(
    ({ nativeEvent: { event: selectedId } }) => {
      setType(selectedId);
      paginateRef.current?.refetch();
    },
    [],
  );

  const PickerButton = ({ label, value, style }) => (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "white",
          padding: 12,
          borderRadius: 8,
          width: 187,
          borderColor: "#d1d5db",
          borderWidth: 1,
        },
        style,
      ]}>
      <Text
        style={{
          color: "black",
          flex: 1,
          textAlign: "center",
          fontFamily: "Poppins-SemiBold",
        }}>
        {label} : {value}
      </Text>
      <MaterialIcons name="arrow-drop-down" size={24} color="black" />
    </View>
  );

  return (
    <View className="bg-[#ececec] w-full h-full items-center">
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center flex-1">
            <BackButton action={() => navigation.goBack()} size={26} />
            <Text className="text-[20px] font-poppins-semibold text-black mx-auto self-center">
              MultiPayment
            </Text>
          </View>
        </View>


            
        <View className="flex-row">
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

            <MenuView 
            title="Pilih Bulan"
            actions={bulans.map(bulan => ({
                id: bulan.id.toString(),
                title: bulan.text,
            }))}
            onPressAction={({ nativeEvent }) => {
                const bulanId = parseInt(nativeEvent.event);
                setBulan(bulanId);
            }}
            shouldOpenOnLongPress={false}
            >
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
                        marginBottom: 15,
                    }}>
                   <Text style={{ color: "black", flex: 1, textAlign: "center" , fontFamily: "Poppins-SemiBold"}}>
                    {`Bulan: ${bulans.find(m => m.id === bulan)?.text || 'Pilih'}`}
                    </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color="black" />
                </View>
            </View>
          </MenuView>
        </View>
         
       
        <MenuView
          title="Pilih Metode"
          onPressAction={handleMetodeChange}
          actions={metodes.map(option => ({
            id: option.id,
            title: option.text,
          }))}>
          <View style={{ marginStart: 3, width: 250, marginTop: 7 }}>
            <PickerButton
              label="Metode"
              value={metodes.find(m => m.id === type)?.text}
              style={{ width: 380 }}
            />
          </View>
        </MenuView>
      </View>

            <TouchableOpacity 
            onPress={() => navigation.navigate("#")}
            className="bg-[#312e81] px-14 py-1.5 rounded-md flex-row items-center ml-2 justify-center"
            style={{  height: 49.5, marginTop: 10.8, bottom: 10, width: 380, marginStart: 9 }}
            >
              <MaterialIcons name="add" size={25} color="white" style={{ right: 6 }}/>
              <Text className="text-white ml-2 font-poppins-medium right-2 text-lg">
               Buat
              </Text>
            </TouchableOpacity>
    </View>
  );
};

export default MultiPayment;
