import { useDelete } from '@/src/hooks/useDelete';
import Paginate from '@/src/screens/components/Paginate';
import { useQueryClient } from "@tanstack/react-query";
import React, { useRef } from "react";
import { Text, View, TouchableOpacity, ScrollView } from "react-native";
import { rupiah } from '@/src/libs/utils';
import Icon from "react-native-vector-icons/AntDesign";
import BackButton from '@/src/screens/components/BackButton';
import IonIcon from "react-native-vector-icons/Ionicons";

const Parameter = ({ navigation }) => {
  const queryClient = useQueryClient();
  const paginateRef = useRef();
  const { delete: deleteParameter, DeleteConfirmationModal } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries(["/master/parameter"]);
    },
    onError: error => {
      console.error("Delete error:", error);
    },
  });

  const renderItem = ({ item }) => (
    <View 
      className="my-2 mx-4 bg-white rounded-lg shadow-md overflow-hidden border border-gray-100"
    >
      {/* Header Section */}
      <View className="px-4 pt-4 flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-lg font-poppins-bold text-gray-800">{item.nama}</Text>
          {item.keterangan && (
            <Text className="text-sm font-poppins-regular text-gray-600 mt-1">
              ({item.keterangan})
            </Text>
          )}
        </View>
        <View className="ml-2">
          <Text 
            className={`px-3 py-1 rounded-full text-xs font-poppins-medium ${
              item.is_akreditasi 
                ? 'bg-green-100 text-green-600' 
                : 'bg-yellow-100 text-yellow-600'
            }`}
          >
            {item.is_akreditasi ? 'Akreditasi' : 'Belum Akreditasi'}
          </Text>
        </View>
      </View>

      {/* Jenis Parameter */}
      {item.jenis_parameter && (
        <Text className="px-4 mt-1 text-sm font-poppins-regular text-gray-500">
          {item.jenis_parameter.nama}
        </Text>
      )}

      {/* Details Grid */}
      <View className="p-4 mt-2">
        <View className="flex-row flex-wrap">
          <View className="w-1/2 mb-3">
            <Text className="text-sm font-poppins-medium text-gray-500">Metode</Text>
            <Text className="text-base font-poppins-semibold text-gray-800">{item.metode}</Text>
          </View>
          <View className="w-1/2 mb-3">
            <Text className="text-sm font-poppins-medium text-gray-500">Satuan</Text>
            <Text className="text-base font-poppins-semibold text-gray-800">{item.satuan}</Text>
          </View>
          <View className="w-1/2 mb-3">
            <Text className="text-sm font-poppins-medium text-gray-500">Harga</Text>
            <Text className="text-base font-poppins-semibold text-gray-800">{rupiah(item.harga)}</Text>
          </View>
          <View className="w-1/2 mb-3">
            <Text className="text-sm font-poppins-medium text-gray-500">MDL</Text>
            <Text className="text-base font-poppins-semibold text-gray-800">{item.mdl}</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row justify-end gap-2 px-4 py-3 bg-gray-50">
        <TouchableOpacity 
          onPress={() => navigation.navigate("FormParameter", { uuid: item.uuid })}
          className="flex-row items-center bg-blue-600 px-3 py-2 rounded-md"
        >
          <IonIcon name="pencil" size={16} color="#fff" />
          <Text className="text-white ml-2 text-sm font-poppins-medium">Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => deleteParameter(`/master/parameter/${item.uuid}`)}
          className="flex-row items-center bg-red-600 px-3 py-2 rounded-md"
        >
          <IonIcon name="trash" size={16} color="#fff" />
          <Text className="text-white ml-2 text-sm font-poppins-medium">Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="flex-row items-center justify-center py-4 bg-white shadow-sm">
        <View className="absolute left-4">
          <BackButton action={() => navigation.goBack()} size={26} />
        </View>
        <Text className="text-xl font-poppins-semibold text-gray-800">Parameter</Text>
      </View>

      {/* Content */}
      <Paginate
        ref={paginateRef}
        url="/master/parameter"
        payload={{}}
        renderItem={renderItem}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => navigation.navigate("FormParameter")}
        className="absolute bottom-6 right-6 bg-blue-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
      >
        <Icon name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      <DeleteConfirmationModal/>
    </View>
  );
};

export default Parameter;