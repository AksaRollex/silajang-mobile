import { Text, View } from "react-native";
import React, { useRef } from "react";
import { useDelete } from "@/src/hooks/useDelete";
import Paginate from "@/src/screens/components/Paginate";
import { useQueryClient } from "@tanstack/react-query";
import { MenuView } from "@react-native-menu/menu";
import Icon from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";

const Kelurahan = ({ navigation }) => {
    const queryClient = useQueryClient();
    const paginateRef = useRef();

    const { delete: deleteKelurahan, DeleteConfirmationModal } = useDelete({
        onSuccess: () => {
            queryClient.invalidateQueries(['/master/kelurahan']);
            paginateRef.current?.refetch();
        },
        onError: () => {
            console.log('Delete error:', error);
        }
    });

    const dropdownOptions = [
        {
            id: 'Edit',
            title: 'Edit',
            action: item => navigation.navigate("FormKelurahan", {uuid: item.uuid}),
        },
        {
            id: "Hapus",
            title: "Hapus",
            action: item => deleteKelurahan(`/master/kelurahan/${item.uuid}`),
        }
    ]

    const renderItem = ({ item }) => {
        return (
            <View className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5" 
            style={{ 
                elevation: 4, 
            }}>
                <View className="flex-row justify-between items-center">
                    <View className="flex-col space-y-2">
                        <Text className="text-[20px] font-poppins-bold">{item.nama}</Text>
                        <Text className="text-[15px] font-poppins-regular">{item.kecamatan.nama} - { item.kecamatan.kab_kota.nama } </Text>
                    </View>
                    <MenuView 
                        title="Menu"
                        actions={dropdownOptions.map(option => ({
                            ...option,
                        }))}
                        onPressAction={({ nativeEvent }) => {
                            const selectedOption = dropdownOptions.find(
                                option => option.title === nativeEvent.event);
                            if (selectedOption) {
                                selectedOption.action(item);
                            }
                        }}
                        shouldOpenOnLongPress={false}>
                        <View>
                            <Entypo name="dots-three-vertical" size={18} color="#312e81"/>
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
                url="/master/kelurahan"
                renderItem={renderItem}
                payload={{  }}
            />
            <Icon
                name="plus"
                size={28}
                color={'#fff'}
                style={{ position: 'absolute', bottom: 20, right: 20, backgroundColor: '#16247d', borderRadius: 50, padding: 10 }}
                onPress={() => navigation.navigate('FormKelurahan')}
            />
            <DeleteConfirmationModal />
        </View>
    )
}

export default Kelurahan;
