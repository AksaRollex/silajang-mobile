import { Text, View, TouchableOpacity } from "react-native";
import React, { useRef } from "react";
import { useDelete } from "@/src/hooks/useDelete";
import Paginate from "@/src/screens/components/Paginate";
import { useQueryClient } from "@tanstack/react-query";
import Icon from "react-native-vector-icons/AntDesign";
import IonIcon from "react-native-vector-icons/Ionicons";
import BackButton from "@/src/screens/components/BackButton";
import { useHeaderStore } from "@/src/screens/main/Index";

const Kelurahan = ({ navigation }) => {
    const queryClient = useQueryClient();
    const paginateRef = useRef();
    const { setHeader } = useHeaderStore();
          
        React.useLayoutEffect(() => {
          setHeader(false)
      
          return () => setHeader(true)
        }, [])

    const { delete: deleteKelurahan, DeleteConfirmationModal } = useDelete({
        onSuccess: () => {
            queryClient.invalidateQueries(['/master/kelurahan']);
            paginateRef.current?.refetch();
        },
        onError: () => {
            console.log('Delete error:', error);
        }
    });

    const renderItem = ({ item }) => {
        return (
            <View className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5" style={{ elevation: 4 }}>
                <View className="flex-row justify-between items-center">
                    <View className="flex-col">
                        <Text className="text-xs font-poppins-regular text-gray-500">Nama</Text>
                        <Text className="text-md font-poppins-semibold text-black mb-4">{item.nama}</Text>

                        <Text className="text-xs font-poppins-regular text-gray-500">Kecamatan</Text>
                        <Text className="text-md font-poppins-medium text-black mb-4">{item.kecamatan.nama}</Text>

                        <Text className="text-xs font-poppins-regular text-gray-500">Kota/Kabupaten</Text>
                        <Text className="text-md font-poppins-medium text-black">{item.kecamatan.kab_kota.nama}</Text>
                    </View>
                </View>

                {/* Horizontal Separator */}
                <View className="h-[1px] bg-gray-300 my-3" />

                {/* Action Buttons */}
                <View className="flex-row justify-end gap-2">
                    <TouchableOpacity 
                        onPress={() => navigation.navigate("FormKelurahan", { uuid: item.uuid })}
                        className="flex-row items-center bg-indigo-500 px-3 py-2 rounded"
                    >
                        <IonIcon name="pencil" size={14} color="#fff" />
                        <Text className="text-white ml-1 text-xs font-poppins-medium">Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={() => deleteKelurahan(`/master/kelurahan/${item.uuid}`)}
                        className="flex-row items-center bg-red-500 px-3 py-2 rounded"
                    >
                        <IonIcon name="trash" size={14} color="#fff" />
                        <Text className="text-white ml-1 text-xs font-poppins-medium">Hapus</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View className="bg-[#ececec] w-full h-full">
             <View
               className="flex-row items-center justify-between py-3.5 px-4 border-b border-gray-300"
               style={{ backgroundColor: '#fff' }}
             >
               <View className="flex-row items-center">
                 <IonIcon name="arrow-back-outline" onPress={() => navigation.goBack()} size={25} color="#312e81" />
                 <Text className="text-[20px] font-poppins-medium text-black ml-4">Kelurahan</Text>
               </View>
               <View className="bg-yellow-400 rounded-full">
                 <IonIcon name="home" size={18} color={'white'} style={{ padding: 5 }} />
               </View>
             </View>
            <Paginate
                ref={paginateRef}
                url="/master/kelurahan"
                renderItem={renderItem}
                payload={{}}
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
    );
}

export default Kelurahan;
