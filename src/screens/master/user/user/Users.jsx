import {  View,  Text, Alert, ActivityIndicator, Dimensions, SafeAreaView, ScrollView, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import React, {useRef, useState} from "react";
import { useDelete } from "@/src/hooks/useDelete";
import Paginate from "@/src/screens/components/Paginate";
import { MenuView } from "@react-native-menu/menu";
import { useQueryClient } from "@tanstack/react-query";
import Icon from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";
import BackButton from "@/src/screens/components/BackButton";
import { HorizontalAlignment } from 'react-native-ui-lib/src/components/gridListItem';
import HorizontalScrollMenu from '@nyashanziramasanga/react-native-horizontal-scroll-menu';
import IndexMaster from '../../../masterdash/IndexMaster';


const Users = ({ navigation }) => {
    const Options = [
        { id: 2, name: "Dinas Internal" },
        { id: 1, name: "Customer" },
      ];
    const [selectedMenu, setSelectedMenu] = useState(2);
    const paginateRef = useRef();
    const queryClient = useQueryClient();
    const { delete: deleteMetode, DeleteConfirmationModal } = useDelete({
        onSuccess: () => {
          queryClient.invalidateQueries(['/master/user']);
          paginateRef.current?.refetch()
        },
        onError: (error) => {
          console.error('Delete error:', error);
        }
      });

    const dropdownOptions = [
        { id: "Parameter", title: "Parameter", action: item => navigation.navigate("Parameter", { uuid: item.uuid })},
        { id: "Edit", title: "Edit", action: item => navigation.navigate("FormUsers", { uuid: item.uuid })},
        { id: "Delete", title: "Delete", action: item => deleteMetode(`/master/user/${item.uuid}`)},
    ]

    const renderItem = ({ item }) => {
      return (
        <View
          className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"  
          style={{ elevation: 4 }}
        >
          <View className="flex-row justify-between">
            <View>
              <Text className="text-[16px] font-poppins-semibold text-black">{item.nama}</Text>
              <Text className="text-[14px] font-poppins-medium text-black">{item.email}</Text>
              <Text className="text-[14px] font-poppins-medium text-black mb-2">{item.phone}</Text>
              <Text className="text-[16px] font-poppins-semibold text-black">{item.detail?.instansi}</Text>
              <Text className="text-[14px] font-poppins-medium text-black">{item.role?.full_name}</Text>
              <Text className="text-[14px] font-poppins-medium text-black">{item.golongan?.nama}</Text>
            </View>
            <View className="my-2 ml-10">
            <MenuView
              title="dropdownOptions"
              actions={dropdownOptions.map(option => ({
                ...option,
              }))}
              onPressAction={({ nativeEvent }) => {
                const selectedOption = dropdownOptions.find(
                  option => option.title === nativeEvent.event,
                );
                const sub = dropdownOptions.find(
                  option => option.subactions && option.subactions.some(
                    suboption => suboption.title === nativeEvent.event
                  )
                )
                if (selectedOption) {
                  selectedOption.action(item);
                }

                if(sub){
                  const selectedSub = sub.subactions.find(sub => sub.title === nativeEvent.event);
                  if(selectedSub){
                    selectedSub.action(item);
                  }
                }
              
              }}
              shouldOpenOnLongPress={false}
            >
              <View>
                <Entypo name="dots-three-vertical" size={18} color="#312e81" />
              </View>
            </MenuView>
            </View>
          </View> 
        </View>
      );
    }


    return (
        <SafeAreaView className="flex-1 bg-[#ececec]">
            <View className="flex-row items-center justify-center mt-4 mb-2">
                <View className="absolute left-4">
                    <BackButton action={() => navigation.goBack()} size={26} />
                </View>
                <Text className="text-[20px] font-poppins-semibold text-black">User</Text>
            </View>
            <View className="flex-row justify-center">
          <View className="mt-3 ml-[-10] mr-2"> 
          <HorizontalScrollMenu
              textStyle={{ fontFamily: 'Poppins-Medium', fontSize: 12 }}
              items={Options}
              selected={selectedMenu}
              onPress={(item) => setSelectedMenu(item.id)}
              itemWidth={190}
                  scrollAreaStyle={{ height: 30, justifyContent: 'flex-start' }}
                  activeBackgroundColor={"#312e81"}
                  buttonStyle={{ marginRight: 10, borderRadius: 20, backgroundColor: "white" }}
              itemRender={(item) => (
                <View
                  style={{
                    borderColor: '#312e81',
                  }}>
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 12,
                    }}>
                    {item.name}
                  </Text>
                </View>
              )}
            />
          </View>
        </View>
            <Paginate
                ref={paginateRef}
                url="/master/user"
                payload={{
                    golongan_id: selectedMenu,
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
                onPress={() => navigation.navigate("FormJenisSampel")}
            />
            <DeleteConfirmationModal />
        </SafeAreaView>
    )
}

export default Users