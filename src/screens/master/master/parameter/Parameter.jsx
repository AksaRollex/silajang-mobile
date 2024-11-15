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

const Parameter = ({ navigation }) => {
  const queryClient = useQueryClient()
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
    <View className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5" 
      style={{ elevation: 4 }}>
      <View>
        <View className="flex items-end mb-2">
          <Text className={`text-sm font-poppins-regular p-1 rounded-md ${
            item.is_akreditasi ? 'bg-green-200 text-green-500' : 'bg-yellow-100 text-yellow-400'
          }`}>
            {item.is_akreditasi ? 'Akreditasi' : 'Belum Akreditasi'}
          </Text>
        </View>

        <View className="flex-col space-y-4">
          <View className="flex-col justify-between">
            <Text className="text-lg font-poppins-bold text-black">{item.nama}</Text>
            <Text className="text-md font-poppins-semibold text-black">{item.metode}</Text>
          </View>
          <View className="flex-col">
            <Text className="text-md font-poppins-medium text-black">{item.satuan}</Text>
            <Text className="text-lg font-poppins-semibold text-black">{rupiah(item.harga)}</Text>
            <Text className="text-md font-poppins-medium text-black">{item.mdl}</Text>
          </View>
        </View>

        <View className="h-[1px] bg-gray-300 my-3" />
        
        <View className="flex-row justify-end gap-2">
          <TouchableOpacity 
            onPress={() => navigation.navigate("FormParameter", { uuid: item.uuid })}
            className="flex-row items-center bg-[#312e81] px-2 py-2 rounded"
          >
            <IonIcon name="pencil" size={14} color="#fff" />
            <Text className="text-white ml-1 text-xs font-poppins-medium">Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => deleteParameter(`/master/parameter/${item.uuid}`)}
            className="flex-row items-center bg-red-600 px-2 py-2 rounded"
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
      <View className="flex-row items-center justify-center mt-4">
        <View className="absolute left-4">
          <BackButton action={() => navigation.goBack()} size={26} />
        </View>
        <Text className="text-[20px] font-poppins-semibold text-black">Parameter</Text>
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
        className="absolute bottom-5 right-5 bg-[#312e81] p-2 rounded-full"
        onPress={() => navigation.navigate("FormParameter")}
      />
      <DeleteConfirmationModal/>
    </View>
  );
};

export default Parameter;