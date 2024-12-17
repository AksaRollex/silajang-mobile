import { View, Text, Alert, ActivityIndicator, Dimensions, SafeAreaView, ScrollView, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useRef, useState } from "react";
import { useDelete } from "@/src/hooks/useDelete";
import Paginate from "@/src/screens/components/Paginate";
import { MenuView } from "@react-native-menu/menu";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Icon from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";
import BackButton from "@/src/screens/components/BackButton";
import HorizontalFilterMenu from '@/src/screens/components/HorizontalFilterMenu';
import IndexMaster from '../../../masterdash/IndexMaster';
import IonIcon from "react-native-vector-icons/Ionicons";
import { GestureHandlerRootView, Switch } from 'react-native-gesture-handler';
import axios from '@/src/libs/axios';
import { useHeaderStore } from '@/src/screens/main/Index';

const Users = ({ navigation, route }) => {

  const OptionsMenu = [
    { id: 2, name: "Dinas Internal" },
    { id: 1, name: "Customer" },
  ];

  const { golongan_id } = route.params || 2
  const [selectedMenu, setSelectedMenu] = useState(2);
  const paginateRef = useRef();
  const queryClient = useQueryClient();
  const { setHeader } = useHeaderStore();

  React.useLayoutEffect(() => {
    setHeader(false)

    return () => setHeader(true)
  }, [])

  const { delete: deleteUser, DeleteConfirmationModal } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries(['/master/user']);
      paginateRef.current?.refetch()
    },
    onError: (error) => {
      console.error('Delete error:', error);
    }
  });

  React.useEffect(() => {
    setSelectedMenu(golongan_id ?? 2);
  }, [golongan_id])

  const handleConfirmToggle = (uuid, currentConfirmed) => {
    confirmMutation.mutate({
      uuid,
      confirmed: !currentConfirmed
    });
  };

  const confirmMutation = useMutation(
    (data) => axios.post(`/master/user/${data.uuid}/confirm`, { confirmed: data.confirmed }),
    {
      onSuccess: () => {
        paginateRef.current?.refetch();
        queryClient.invalidateQueries(['/master/user']);
      },
      onError: (error) => {
        console.error('Confirmation error:', error);
        Alert.alert('Error', 'Failed to update user confirmation status');
      }
    }
  );

  const renderItem = ({ item }) => {
    return (
      <View
        className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
        style={{ elevation: 4 }}
      >

        <View className="flex-row justify-between">
          {/* Bagian Data Utama */}
          <View className="flex-1">
            <View className="flex-row justify-between mb-3">
              <View className="flex-1 mr-2">
                <Text className="text-xs text-gray-500 font-poppins-regular">Nama</Text>
                <Text className="text-md text-black font-poppins-semibold">{item.nama}</Text>
              </View>
              <View className="flex-1 mr-2">
                <Text className="text-xs text-gray-500 font-poppins-regular">No. Telepon</Text>
                <Text className="text-md text-black font-poppins-semibold">{item.phone}</Text>
              </View>
            </View>

            <View className="flex-row justify-between mb-3">

              <View className="flex-1">
                <Text className="text-xs text-gray-500 font-poppins-regular">Email</Text>
                <Text className="text-md text-black font-poppins-semibold">{item.email}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-500 font-poppins-regular">Perusahaan</Text>
                <Text className="text-md text-black font-poppins-semibold">
                  {item.detail?.instansi ?? "-"}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between mb-3">
              <View className="flex-1 mr-2">
                <Text className="text-xs text-gray-500 font-poppins-regular">Jabatan</Text>
                <Text className="text-md text-black font-poppins-semibold">
                  {item.role?.full_name}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-500 font-poppins-regular">Jenis</Text>
                <Text className="text-md text-black font-poppins-semibold">
                  {item.golongan?.nama}
                </Text>
              </View>
            </View>
          </View>

          {/* Switch Bagian Kanan */}
          <View className="items-center justify-center">

            <Text className="text-xs text-black font-poppins-semibold mb-2">Konfirmasi</Text>
            <Switch
              value={item.confirmed === 1}
              onValueChange={() => handleConfirmToggle(item.uuid, item.confirmed === 1)}
              trackColor={{ false: "#767577", true: "#312e81" }}
              thumbColor={item.confirmed === 1 ? "#f4f3f4" : "#f4f3f4"}
            />
          </View>
        </View>


        <View className="h-[1px] bg-gray-300 my-3" />

        <View className="flex-row justify-end gap-2">
          {selectedMenu !== 1 && (
            <TouchableOpacity
              onPress={() => navigation.navigate("ParameterUsers", { uuid: item.uuid })}
              className="flex-row items-center bg-green-500 px-2 py-2 rounded"
            >
              <IonIcon name="filter" size={14} color="#fff" />
              <Text className="text-white ml-1 text-xs font-poppins-medium">Parameter</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => navigation.navigate("FormUsers", { uuid: item.uuid })}
            className="flex-row items-center bg-indigo-500 px-2 py-2 rounded"
          >
            <IonIcon name="pencil" size={14} color="#fff" />
            <Text className="text-white ml-1 text-xs font-poppins-medium">Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => deleteUser(`/master/user/${item.uuid}`)}
            className="flex-row items-center bg-red-500 px-2 py-2 rounded"
          >
            <IonIcon name="trash" size={14} color="#fff" />
            <Text className="text-white ml-1 text-xs font-poppins-medium">Hapus</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }


  return (
    <GestureHandlerRootView className="flex-1 bg-[#ececec]">
      <View
        className="flex-row items-center justify-between py-3.5 px-4 border-b border-gray-300"
        style={{ backgroundColor: '#fff' }}
      >
        <View className="flex-row items-center">
          <IonIcon name="arrow-back-outline" onPress={() => navigation.goBack()} size={25} color="#312e81" />
          <Text className="text-[19px] font-poppins-medium text-black ml-4">User</Text>
        </View>
        <View className="bg-blue-600 rounded-full">
          <IonIcon name="person" size={17} color={'white'} style={{ padding: 5 }} />
        </View>
      </View>
      <View className="flex-row justify-center mt-4">
        <HorizontalFilterMenu
          items={OptionsMenu}
          selected={selectedMenu}
          onPress={(item) => setSelectedMenu(item.id)}
        />
      </View>
      <Paginate
        ref={paginateRef}
        url="/master/user"
        payload={{
          golongan_id: selectedMenu ?? golongan_id,
          page: 1,
          per: 10,
        }}
        renderItem={renderItem}
      />
      <Icon
        name="plus"
        size={28}
        color="#fff"
        style={{ position: "absolute", bottom: 20, padding: 10, right: 20, backgroundColor: "#312e81", borderRadius: 50 }}
        onPress={() => navigation.navigate("FormUsers")}
      />
      <DeleteConfirmationModal />
    </GestureHandlerRootView>
  )
}

export default Users