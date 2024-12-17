import { View, Text, TouchableOpacity } from 'react-native';
import React, { useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDelete } from '@/src/hooks/useDelete';
import Icon from 'react-native-vector-icons/AntDesign';
import IonIcon from 'react-native-vector-icons/Ionicons';
import Paginate from '@/src/screens/components/Paginate';
import BackButton from '@/src/screens/components/BackButton';
import { rupiah } from '@/src/libs/utils';
import { useHeaderStore } from '@/src/screens/main/Index';

const JasaPengambilan = ({ navigation }) => {
  const queryClient = useQueryClient();
  const paginateRef = useRef();
  const { setHeader } = useHeaderStore();
        
      React.useLayoutEffect(() => {
        setHeader(false)
    
        return () => setHeader(true)
      }, [])

  const { delete: deleteJasaPengambilan, DeleteConfirmationModal } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries(["/master/jasa-pengambilan"]);
      paginateRef.current?.refetch();
    },
    onError: (error) => {
      console.error("Delete error:", error);
    },
  });

  const renderJasaPengambilan = ({ item }) => (
    <View
      className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
      style={{ elevation: 4 }}
    >
      <View className="flex-col space-y-1">
        <Text className="text-xs font-poppins-regular text-gray-500">Wilayah</Text>
        <Text className="text-md font-poppins-semibold text-black mb-3">{item.wilayah}</Text>

        <Text className="text-xs font-poppins-regular text-gray-500">Harga</Text>
        <Text className="text-md font-poppins-medium text-black">
          {item.harga === 0 ? `Rp. ${rupiah(item.harga)}` : rupiah(item.harga)}
        </Text>
      </View>

      {/* Horizontal separator */}
      <View className="h-[1px] bg-gray-300 my-3" />

      {/* Action buttons */}
      <View className="flex-row justify-end gap-2">
        <TouchableOpacity
          onPress={() => navigation.navigate("FormJasaPengambilan", { uuid: item.uuid })}
          className="flex-row items-center bg-indigo-500 px-2 py-2 rounded"
        >
          <IonIcon name="pencil" size={14} color="#fff" />
          <Text className="text-white ml-1 text-xs font-poppins-medium">Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => deleteJasaPengambilan(`/master/jasa-pengambilan/${item.uuid}`)}
          className="flex-row items-center bg-red-500 px-2 py-2 rounded"
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
        <Text className="text-[20px] font-poppins-semibold text-black">Jasa Pengambilan</Text>
      </View>
      <Paginate
        ref={paginateRef}
        url="/master/jasa-pengambilan"
        renderItem={renderJasaPengambilan}
      />
      <Icon
        name="plus"
        size={28}
        color="#fff"
        style={{ position: "absolute", bottom: 20, padding: 10, right: 20, backgroundColor: "#312e81", borderRadius: 50 }}
        onPress={() => navigation.navigate("FormJasaPengambilan")}
      />
      <DeleteConfirmationModal />
    </View>
  );
};

export default JasaPengambilan;
