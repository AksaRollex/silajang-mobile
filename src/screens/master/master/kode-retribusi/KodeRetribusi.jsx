import { View, Text } from 'react-native'
import React, { useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useDelete } from '@/src/hooks/useDelete'
import { MenuView } from '@react-native-menu/menu'
import Paginate from '@/src/screens/components/Paginate'
import Icon from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'

const KodeRetribusi = ({ navigation }) => {
  const queryClient = useQueryClient();
  const paginateRef = useRef();

  const { delete: deleteKodeRetribusi, DeleteConfirmationModal } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries(['kode-retribusi']);
      paginateRef.current?.refetch();
    },
    onError: (error) => {
      console.error('Delete error:', error);
    }
  });

  const dropdownOptions = [
    {
      id: "Edit",
      title: "Edit",
      action: item => navigation.navigate("FormKodeRetribusi", { uuid: item.uuid}),
    },
    {
      id: "Hapus",
      title: "Hapus",
      action: item => deleteKodeRetribusi(`/master/kode-retribusi/${item.uuid}`),
    }
  ];

  const renderItem = ({ item }) => {
    return (
      <View className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
      style={{  elevation: 4, }}>
        <View className="flex-row justify-between items-center">
          <View className="flex-col space-y-3">
            <Text className="text-[18px] font-extrabold">{item.kode}</Text>
            <Text className="text-12 font-semibold">{item.nama}</Text>
          </View>
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
              <View className="ml-2">
                <Entypo name="dots-three-vertical" size={18} color="#312e81" />
              </View>
          </MenuView>
        </View>
      </View>
    )
  }

  return (
    <View className="bg-[#ececec] w-full h-full">
      <Paginate
        ref={paginateRef}
        url="/master/kode-retribusi"
        payload={{}}
        renderItem={renderItem}
      />
      <Icon
        name="plus"
        size={28}
        color="#fff"
        style={{ position: "absolute", bottom: 20, right: 20, backgroundColor: "#312e81", padding: 10, borderRadius: 50 }}
        onPress={() => navigation.navigate("FormKodeRetribusi")}
      />
      <DeleteConfirmationModal />
    </View>
  );
};

export default KodeRetribusi