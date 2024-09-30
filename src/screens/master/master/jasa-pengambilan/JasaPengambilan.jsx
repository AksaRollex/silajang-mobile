import { View, Text } from 'react-native'
import React, { useRef } from 'react'
import  { useQueryClient } from '@tanstack/react-query'
import { useDelete } from '@/src/hooks/useDelete'
import { MenuView } from '@react-native-menu/menu'
import Icon from 'react-native-vector-icons/AntDesign'
import Paginate from '@/src/screens/components/Paginate'
import Entypo from 'react-native-vector-icons/Entypo'
import { rupiah } from '@/src/libs/utils'

const JasaPengambilan = ({ navigation }) => {
  const queryClient = useQueryClient();
  const paginateRef = useRef();

  const { delete: deleteJasaPengambilan, DeleteConfirmationModal } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries(["/master/jasa-pengambilan"]);
      paginateRef.current?.refetch();
    },
    onError: (error) => {
      console.error("Delete error:", error);
    },
  });

  const dropdownOptions = [
    {
      id: "Edit",
      title: "Edit",
      action: item => navigation.navigate("FormJasaPengambilan", { uuid: item.uuid }),
    },
    {
      id: "Hapus",
      title: "Hapus",
      action: item => deleteJasaPengambilan(`/master/jasa-pengambilan/${item.uuid}`),
    }
  ];

  const renderJasaPengambilan = ({ item }) => (
    <View
      className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
      style={{ elevation: 4 }}
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-col space-y-3">
            <Text className="text-base font-poppins-semibold">{item.wilayah}</Text>
            <Text className="text-base font-poppins-semibold">{rupiah(item.harga)}</Text>
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
            <Entypo name="dots-three-vertical" size={18} color="#312e81" />
          </MenuView>
        </View>
      </View>
  );

  return (
    <View className="bg-[#ececec] w-full h-full">
      <Paginate
      ref={paginateRef}
      url="/master/jasa-pengambilan"
      renderItem={renderJasaPengambilan}
      />

      <Icon
      name='plus'
      size={28}
      color="#fff"
      style={{ position: "absolute", bottom: 20, padding: 10, right: 20, backgroundColor: "#312e81", borderRadius: 50 }}
      onPress={() => navigation.navigate("FormJasaPengambilan")}
      />
      <DeleteConfirmationModal />
    </View>
  )
}

export default JasaPengambilan;