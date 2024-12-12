import { View, Text, TouchableOpacity } from "react-native";
import React, { useRef } from "react";
import { useDelete } from "@/src/hooks/useDelete";
import Paginate from "@/src/screens/components/Paginate";
import { useQueryClient } from "@tanstack/react-query";
import Icon from "react-native-vector-icons/AntDesign";
import IonIcon from "react-native-vector-icons/Ionicons"; // Change from Entypo to Ionicons
import BackButton from "@/src/screens/components/BackButton";

const Jabatan = ({ navigation }) => {
  const queryClient = useQueryClient();
  const paginateRef = useRef();

  const { delete: deleteJabatan, DeleteConfirmationModal } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries(["/master/jabatan"]);
      paginateRef.current?.refetch();
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const renderItem = ({ item }) => {
    return (
      <View
        className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
        style={{
          elevation: 4,
        }}
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-col space-y-1">
            <Text className="text-xs font-poppins-regular text-gray-500">Nama</Text>
          <Text className="text-md font-poppins-medium text-black">{item.full_name}</Text>
        </View>
      </View>

        {/* Separator line above buttons */}
        <View className="h-[1px] bg-gray-300 my-3" />

        {/* Action buttons for Edit and Hapus */}
        <View className="flex-row justify-end gap-2">
          <TouchableOpacity
            onPress={() => navigation.navigate("FormJabatan", { name: item.name })}
            className="flex-row items-center bg-indigo-500 px-2 py-2 rounded"
          >
            <IonIcon name="pencil" size={14} color="#fff" />
            <Text className="text-white ml-1 text-xs font-poppins-medium">Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => deleteJabatan(`/master/jabatan/${item.name}`)}
            className="flex-row items-center bg-red-500 px-2 py-2 rounded"
          >
            <IonIcon name="trash" size={14} color="#fff" />
            <Text className="text-white ml-1 text-xs font-poppins-medium">Hapus</Text>
          </TouchableOpacity>
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
        <Text className="text-[20px] font-poppins-semibold text-black">Jabatan</Text>
      </View>

      <Paginate
        ref={paginateRef}
        url="/master/jabatan"
        payload={{}}
        renderItem={renderItem}
      />

      <Icon
        name="plus"
        size={28}
        color="#fff"
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          backgroundColor: "#312e81",
          padding: 10,
          borderRadius: 50,
        }}
        onPress={() => navigation.navigate("FormJabatan")}
      />

      <DeleteConfirmationModal />
    </View>
  );
};

export default Jabatan;
