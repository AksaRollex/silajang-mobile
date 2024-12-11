import { useDelete } from '@/src/hooks/useDelete';
import Paginate from '@/src/screens/components/Paginate';
import { useQueryClient } from "@tanstack/react-query";
import React, { useRef } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/AntDesign";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import BackButton from "@/src/screens/components/BackButton";
import IonIcon from "react-native-vector-icons/Ionicons";

const Metode = ({ navigation }) => {
  const queryClient = useQueryClient();
  const paginateRef = useRef();

  const { delete: deleteMetode, DeleteConfirmationModal } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries(['/master/acuan-metode']);
      paginateRef.current?.refetch()
    },
    onError: (error) => {
      console.error('Delete error:', error);
    }
  });

  const renderItem = ({ item }) => {
    return (
      <View
        className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
        style={{
          elevation: 4,
        }}>
        <View>
          <Text className="text-[13px] font-poppins-regular text-gray-500">Nama</Text>
          <Text className="text-[15px] font-poppins-semibold text-black mb-2">{item.nama}</Text>
          
          <View className="h-[1px] bg-gray-300 my-3" />
          
          <View className="flex-row justify-end gap-2">
            <TouchableOpacity 
              onPress={() => navigation.navigate("FormMetode", { uuid: item.uuid })}
              className="flex-row items-center bg-indigo-500 px-2 py-2 rounded"
            >
              <IonIcon name="pencil" size={16} color="#fff" />
              <Text className="text-white ml-1 text-xs font-poppins-medium">Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => deleteMetode(`/master/acuan-metode/${item.uuid}`)}
              className="flex-row items-center bg-red-500 px-2 py-2 rounded"
            >
              <IonIcon name="trash" size={16} color="#fff" />
              <Text className="text-white ml-1 text-xs font-poppins-medium">Hapus</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="bg-[#ececec] w-full h-full">
      <View className="flex-row items-center justify-center mt-4">
        <View className="absolute left-4">
          <BackButton action={() => navigation.goBack()} size={26} />
        </View>
        <Text className="text-[20px] font-poppins-semibold text-black">Metode</Text>
      </View>
      <Paginate
        ref={paginateRef}
        url="/master/acuan-metode"
        payload={{}}
        renderItem={renderItem}
      />
       <Icon
        name="plus"
        size={28}
        color="#fff"
        style={{ position: "absolute", bottom: 20, right: 20, backgroundColor: "#312e81", padding: 10, borderRadius: 50 }}
        onPress={() => navigation.navigate("FormMetode")}
      />
      <DeleteConfirmationModal />
    </View>
  );  
};

export default Metode;