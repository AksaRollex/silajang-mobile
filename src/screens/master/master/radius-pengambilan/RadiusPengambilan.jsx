import { View, Text, TouchableOpacity } from 'react-native';
import React, { useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDelete } from '@/src/hooks/useDelete';
import Paginate from '@/src/screens/components/Paginate';
import Icon from 'react-native-vector-icons/AntDesign';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { rupiah } from '@/src/libs/utils';
import BackButton from '@/src/screens/components/BackButton';

const RadiusPengambilan = ({ navigation }) => {
  const queryClient = useQueryClient();
  const paginateRef = useRef();

  const { delete: deleteRadiusPengambilan, DeleteConfirmationModal } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries(['radius-pengambilan']);
      paginateRef.current?.refetch();
    },
    onError: (error) => {
      console.error('Delete error:', error);
    },
  });

  const renderItem = ({ item }) => (
    <View
      className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
      style={{
        elevation: 4,
      }}
    >
      <View className="flex-col space-y-3">
        <Text className="text-[18px] font-poppins-semibold text-black">{item.radius} meter</Text>
        <Text className="text-12 font-poppins-medium text-black">{item.nama}</Text>
        <Text className="text-12 font-poppins-medium text-black">{rupiah(item.harga)}</Text>
      </View>

      {/* Separator line */}
      <View className="h-[1px] bg-gray-300 my-3" />

      {/* Edit and Delete Buttons */}
      <View className="flex-row justify-end gap-2">
        <TouchableOpacity
          onPress={() => navigation.navigate('FormRadiusPengambilan', { uuid: item.uuid })}
          className="flex-row items-center bg-[#312e81] px-2 py-2 rounded"
        >
          <IonIcon name="pencil" size={14} color="#fff" />
          <Text className="text-white ml-1 text-xs font-poppins-medium">Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => deleteRadiusPengambilan(`/master/radius-pengambilan/${item.uuid}`)}
          className="flex-row items-center bg-red-600 px-2 py-2 rounded"
        >
          <IonIcon name="trash" size={14} color="#fff" />
          <Text className="text-white ml-1 text-xs font-poppins-medium">Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="bg-[#ececec] w-full h-full">
      <View className="flex-row items-center justify-center mt-4">
        <View className="absolute left-4">
          <BackButton action={() => navigation.goBack()} size={26} />
        </View>
        <Text className="text-[20px] font-poppins-semibold text-black">Radius Pengambilan</Text>
      </View>

      <Paginate ref={paginateRef} url="/master/radius-pengambilan" payload={{}} renderItem={renderItem} />

      <Icon
        name="plus"
        size={28}
        color="#fff"
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          backgroundColor: '#312e81',
          padding: 10,
          borderRadius: 50,
        }}
        onPress={() => navigation.navigate('FormRadiusPengambilan')}
      />
      <DeleteConfirmationModal />
    </View>
  );
};

export default RadiusPengambilan;
