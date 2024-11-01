import { View, Text } from 'react-native'
import React, { useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useDelete } from '@/src/hooks/useDelete'
import { MenuView } from '@react-native-menu/menu'
import  Icon  from 'react-native-vector-icons/AntDesign'
import Paginate from '@/src/screens/components/Paginate'
import Entypo from 'react-native-vector-icons/Entypo'
import BackButton from '@/src/screens/components/BackButton'

const JenisWadah = ({ navigation }) => {
  const queryClient = useQueryClient();
  const paginateRef = useRef();

  const { delete: deleteJenisWadah, DeleteConfirmationModal } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries(["/master/jenis-wadah"]);
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
      action: item => navigation.navigate("FormJenisWadah", { uuid: item.uuid }),
    },
    {
      id: "Hapus",
      title: "Hapus",
      action: item => deleteJenisWadah(`/master/jenis-wadah/${item.uuid}`),
    }
  ];

const renderJenisWadah = ({ item }) => (
  <View
  className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
  style={{  
    elevation: 4 
  }}>
    <View className="flex-row justify-between items-center">
      <View className="flex-col space-y-2">
        <Text className="text-base font-poppins-semibold text-black">{item.nama}</Text>
        <Text className="text-base font-poppins-medium text-black">{item.keterangan}</Text>
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
    <View className="flex-row items-center justify-center mt-4">
        <View className="absolute left-4">
          <BackButton action={() => navigation.goBack()} size={26} />
        </View>
        <Text className="text-[20px] font-poppins-semibold text-black">Jenis Wadah</Text>
      </View>
    <Paginate
      ref={paginateRef}
      url="/master/jenis-wadah"
      payload={{}}
      renderItem={renderJenisWadah}
    />

    <Icon
      name="plus"
      size={28}
      color="#fff"
      style={{ position: "absolute", bottom: 20, padding: 10, right: 20, backgroundColor: "#312e81", borderRadius: 50 }}
      onPress={() => navigation.navigate("FormJenisWadah")}
    />
    <DeleteConfirmationModal/>
  </View>
  );
};

export default JenisWadah;