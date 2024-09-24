import { View, Text } from 'react-native'
import React, { useRef } from 'react'
import Paginate from '@/src/screens/components/Paginate'
import { useDelete } from '@/src/hooks/useDelete'
import { MenuView } from '@react-native-menu/menu'
import { useQueryClient } from '@tanstack/react-query'
import Icon from "react-native-vector-icons/AntDesign"
import Entypo from "react-native-vector-icons/Entypo"

const Pengawetan = ({ navigation }) => {
  const queryClient = useQueryClient()
  const paginateRef = useRef()
  const { delete: deletePengawetan, DeleteConfirmationModal } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries(["/master/pengawetan"])
    },
    onError: error => {
      console.error("Delete Error:", error)
    }
  });

  const dropdownOptions = [
    {
      id:"Edit",
      title:"Edit",
      action: item => navigation.navigate("FormPengawetan", { uuid: item.uuid }),
    },
    {
      id:"Hapus",
      title:"Hapus",
      action: item => deletePengawetan(`/master/pengawetan/${item.uuid}`)
    }
  ];

  const renderItem = ({ item }) => (
    <View className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5" style={{ elevation: 4 }}>
      <View className="flex-row justify-between items-center">
        <Text className="text-md font-poppins-semibold">{item.nama}</Text>
        <MenuView
          title='Menu Title'
          actions={dropdownOptions.map(option => ({
            ...option
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
          <Entypo name="dots-three-vertical" size={18} color="312e81" />
        </MenuView>
      </View>
    </View>
  )

  return (
    <View className="bg-[#ececec] w-full h-full">
      <Paginate
        ref={paginateRef}
        url="/master/pengawetan"
        payload={{}}
        renderItem={renderItem}
      />

      <Icon 
        name='plus'
        size={28}
        color="#fff"
        style={{ position: 'absolute', bottom: 20, right: 20, backgroundColor: '#312e81', padding: 10, borderRadius: 50 }}
        onPress={() => navigation.navigate("FormPengawetan")}
      />
    </View>
  )
}

export default Pengawetan