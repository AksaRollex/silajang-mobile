import { useDelete } from '@/src/hooks/useDelete';
import Paginate from '@/src/screens/components/Paginate';
import { useQueryClient } from "@tanstack/react-query";
import React, { useRef } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { rupiah } from '@/src/libs/utils';
import Icon from "react-native-vector-icons/AntDesign";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import BackButton from '@/src/screens/components/BackButton';
import IonIcon from "react-native-vector-icons/Ionicons";
import { useHeaderStore } from '@/src/screens/main/Index';

const Parameter = ({ navigation }) => {
  const queryClient = useQueryClient()
  const paginateRef = useRef();
  const { setHeader } = useHeaderStore();

  React.useLayoutEffect(() => {
    setHeader(false)

    return () => setHeader(true)
  }, [])

  const { delete: deleteParameter, DeleteConfirmationModal } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries(["/master/parameter"]);
    },
    onError: error => {
      console.error("Delete error:", error);
    },
  });

  const renderItem = ({ item }) => (
    <View className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
      style={{ elevation: 4 }}>
      <View>
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            {item.is_akreditasi ? (
              <MaterialIcons name="verified" size={20} color="#16a34a" />
            ) : null}
          </View>
          <View className={`rounded-md ${item.is_akreditasi ? 'bg-green-200' : 'bg-yellow-100'
            }`}>
            <Text className={`text-xs font-poppins-semibold px-2 py-1 ${item.is_akreditasi ? 'text-green-600' : 'text-yellow-400'
              }`}>
              {item.is_akreditasi ? 'Akreditasi' : 'Belum Akreditasi'}
            </Text>
          </View>
        </View>

        <View className="mb-4">
          <View className="flex-row items-center flex-wrap mb-1">
            <Text className="text-lg font-poppins-bold text-black">{item.nama}</Text>
            {item.keterangan ? (
              <Text className="text-sm font-poppins-regular text-gray-600 ml-2">
                ({item.keterangan})
              </Text>
            ) : null}
          </View>
          {item.jenis_parameter ? (
            <Text className="text-sm font-poppins-regular text-gray-500">
              {item.jenis_parameter.nama}
            </Text>
          ) : null}
        </View>

        <View className="flex-row flex-wrap mb-4">
          <View className="w-1/2 mb-3 pr-4">
            <Text className="text-xs font-poppins-regular text-gray-500">Metode</Text>
            <Text className="text-md font-poppins-semibold text-black mt-1">{item.metode}</Text>
          </View>
          <View className="w-1/2 mb-3 pl-4">
            <Text className="text-xs font-poppins-regular text-gray-500">Satuan</Text>
            <Text className="text-md font-poppins-medium text-black mt-1">{item.satuan}</Text>
          </View>
          <View className="w-1/2 pr-4">
            <Text className="text-xs font-poppins-regular text-gray-500">Harga</Text>
            <Text className="text-md font-poppins-semibold text-black mt-1">{rupiah(item.harga)}</Text>
          </View>
          <View className="w-1/2 pl-4">
            <Text className="text-xs font-poppins-regular text-gray-500">MDL</Text>
            <Text className="text-md font-poppins-medium text-black mt-1">{item.mdl}</Text>
          </View>
        </View>

        <View className="h-[1px] bg-gray-300" />

        <View className="flex-row justify-end gap-2 mt-3">
          <TouchableOpacity
            onPress={() => navigation.navigate("FormParameter", { uuid: item.uuid })}
            className="flex-row items-center bg-indigo-500 px-2 py-2 rounded"
          >
            <IonIcon name="pencil" size={14} color="#fff" />
            <Text className="text-white ml-1 text-xs font-poppins-medium">Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => deleteParameter(`/master/parameter/${item.uuid}`)}
            className="flex-row items-center bg-red-500 px-2 py-2 rounded"
          >
            <IonIcon name="trash" size={14} color="#fff" />
            <Text className="text-white ml-1 text-xs font-poppins-medium">Hapus</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View className="bg-[#ececec] w-full h-full">
      <View
        className="flex-row items-center justify-between py-3.5 px-4 border-b border-gray-300"
        style={{ backgroundColor: '#fff' }}
      >
        <View className="flex-row items-center">
          <IonIcon name="arrow-back-outline" onPress={() => navigation.goBack()} size={25} color="#312e81" />
          <Text className="text-[20px] font-poppins-medium text-black ml-3">Parameter</Text>
        </View>
        <View className="bg-purple-500 rounded-full">
          <IonIcon name="filter" size={18} color={'white'} style={{ padding: 5 }} />
        </View>
      </View>
      <Paginate
        ref={paginateRef}
        url="/master/parameter"
        payload={{}}
        renderItem={renderItem}
      />
      <Icon
        name="plus"
        size={28}
        color="#fff"
        style={{ position: "absolute", bottom: 20, right: 20, backgroundColor: "#312e81", padding: 10, borderRadius: 50 }}
        onPress={() => navigation.navigate("FormParameter")}
      />
      <DeleteConfirmationModal />
    </View>
  );
};

export default Parameter;