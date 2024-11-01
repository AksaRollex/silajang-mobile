import { View, Text } from 'react-native'
import React, { useRef} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useDelete } from '@/src/hooks/useDelete'
import { MenuView } from '@react-native-menu/menu'
import Paginate from '@/src/screens/components/Paginate'
import Icon from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'
import { rupiah } from '@/src/libs/utils'
import BackButton from '@/src/screens/components/BackButton'


const RadiusPengambilan = ({ navigation }) => {
  const queryClient = useQueryClient();
  const paginateRef = useRef();
 
  const { delete: deleteRadiusPengambilan, DeleteConfirmationModal } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries(['radius-pengambilan']);
      paginateRef.current?.refetch()
    },
    onError: (error) => {
      console.error('Delete error:', error);
    },
  });

  const dropdownOptions = [
    {
      id: "Edit",
      title: "Edit",
      action: item => navigation.navigate("FormRadiusPengambilan", { uuid: item.uuid }),
    },
    {
      id: "Hapus",
      title: "Hapus",
      action: item => deleteRadiusPengambilan(`/master/radius-pengambilan/${item.uuid}`),
    }
  ];

  const renderItem = ({ item }) => {
    return (
      <View
        className = "my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
        style={{ 
          elevation: 4,
         }}>
          <View className="flex-row justify-between items-center">
            <View className="flex-col space-y-3">
              <Text className="text-[18px] font-poppins-semibold text-black">{item.radius} meter</Text>
              <Text className="text-12 font-poppins-medium text-black">{item.nama}</Text>
              <Text className="text-12 font-poppins-medium text-black">{rupiah(item.harga)}</Text>
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
    );
  };

  return (
    <View className="bg-[#ececec] w-full h-full">
      <View className="flex-row items-center justify-center mt-4">
        <View className="absolute left-4">
          <BackButton action={() => navigation.goBack()} size={26} />
        </View>
        <Text className="text-[20px] font-poppins-semibold text-black">Radius Pengambilan</Text>
      </View>
      <Paginate
        ref={paginateRef}
        url="/master/radius-pengambilan"
        payload={{}}
        renderItem={renderItem}
      />
      <Icon
      name="plus"
      size={28}
      color="#fff"
      style={{ position: "absolute", bottom: 20, right: 20, backgroundColor: "#312e81", padding: 10, borderRadius: 50 }}
      onPress={() => navigation.navigate("FormRadiusPengambilan")}
    />
    <DeleteConfirmationModal/>
    </View>
  );
};

export default RadiusPengambilan;