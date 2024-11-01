import { useDelete } from '@/src/hooks/useDelete';
import Paginate from '@/src/screens/components/Paginate';
import { MenuView } from "@react-native-menu/menu";
import { useQueryClient } from "@tanstack/react-query";
import React, { useRef } from "react";
import { Text, View } from "react-native";
import Icon from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";
import BackButton from "@/src/screens/components/BackButton";

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

  const dropdownOptions = [
    {
      id: "Edit",
      title: "Edit",
      action: item => navigation.navigate("FormMetode", { uuid: item.uuid }),
    },
    { id: "Hapus", title: "Hapus", action: item => deleteMetode(`/master/acuan-metode/${item.uuid}`) },
  ];



  const renderItem = ({ item }) => {
    return (
      <View
        className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
        style={{
          elevation: 4,
        }}>
        <View className="flex-row justify-between items-center">
          <Text className="text-[18px] font-poppins-semibold text-black">{item.nama}</Text>
          <MenuView
            title="Menu Title"
            actions={dropdownOptions.map(option => ({
              ...option,
            }))}
            onPressAction={({ nativeEvent }) => {
              const selectedOption = dropdownOptions.find(
                option => option.title === nativeEvent.event,
              );
              if (selectedOption) {
                selectedOption.action(item);
              }
            }}
            shouldOpenOnLongPress={false}>
            <View>
              <Entypo name="dots-three-vertical" size={18} color="#312e81" />
            </View>
          </MenuView>
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
        className="absolute bottom-5 right-5 bg-[#312e81] p-2 rounded-full"
        onPress={() => navigation.navigate("FormMetode")}
      />
      <DeleteConfirmationModal />
    </View>
  );  
};

export default Metode;

