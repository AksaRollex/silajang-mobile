import { useDelete } from '@/src/hooks/useDelete';
import Paginate from '@/src/screens/components/Paginate';
import { MenuView } from "@react-native-menu/menu";
import { useQueryClient } from "@tanstack/react-query";
import React, { useRef } from "react";
import { Text, View } from "react-native";
import { rupiah } from '@/src/libs/utils';
import Icon from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";
import BackButton from '@/src/screens/components/BackButton';

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

  const dropdownOptions = [
    {
      id: "Edit",
      title: "Edit",
      action: item => navigation.navigate("FormParameter", { uuid: item.uuid }),
      icon: 'edit'
    },
    {
      id: "Hapus",
      title: "Hapus",
      action: item => deleteParameter(`/master/parameter/${item.uuid}`),
    },
  ];

  const renderItem = ({ item }) => (
    <View className="my-2 bg-[#f8f8f8] flex rounded-md 
    border-t-[6px] border-indigo-900 p-5" style={{ elevation: 4 }}>
      <View className="flex-row justify-between items-center">
        <View className="flex-col space-y-4">
          <View className="flex-col justify-between">
            <Text className="text-lg font-poppins-bold text-black">{item.nama}</Text>
            <Text className="text-md font-poppins-semibold text-black">{item.metode}</Text>
          </View>
          <View className="flex-col ">
            <Text className="text-md font-poppins-medium text-black">{item.satuan}</Text>
            <Text className="text-lg font-poppins-semibold text-black">{rupiah(item.harga)}</Text>
            <Text className="text-md font-poppins-medium text-black" >{item.mdl}</Text>
          </View>
        </View>
        <MenuView title="Menu"
        actions={dropdownOptions.map(option => ({
          ...option,
        }))}
        onPressAction={({ nativeEvent }) => {
          const selectedOption = dropdownOptions.find(
            option => option.title === nativeEvent.event,
          );
          if(selectedOption){
            selectedOption.action(item);
          }
        }}
        shouldOpenOnLongPress={false}>
        <View className="flex-col gap-4 items-end">
        <Text className={`text-sm font-poppins-regular p-1 rounded-md ${item.is_akreditasi ? 'bg-green-400' : 'bg-yellow-100'} 
                ${item.is_akreditasi ? 'text-white' : 'text-yellow-400'} ${item.is_akreditasi ? 'mt-[-10px]' : ''}`}> {item.is_akreditasi ? 'Akreditasi' : 'Belum Akreditasi'} </Text>
          <Entypo name="dots-three-vertical" size={17} color="#312e81" style={{ marginTop: -30 }}/>
        </View>
        </MenuView>
      </View>
    </View>
  )

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
      style={{ position: "absolute", bottom: 20, 
      right: 20, backgroundColor: "#312e81", padding: 10, borderRadius: 50 }}
      onPress={() => navigation.navigate("FormParameter")}
      />
      <DeleteConfirmationModal/>
    </View>
  )
}

export default Parameter
