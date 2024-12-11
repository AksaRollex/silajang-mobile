import { Text, View, TouchableOpacity } from "react-native";
import React, { useRef } from "react";
import { useDelete } from "@/src/hooks/useDelete";
import Paginate from "@/src/screens/components/Paginate";
import { useQueryClient } from "@tanstack/react-query";
import Icon from "react-native-vector-icons/AntDesign";
import IonIcon from "react-native-vector-icons/Ionicons"; // Ionicon import
import BackButton from "@/src/screens/components/BackButton";

const KotaKab = ({ navigation }) => {
    const queryClient = useQueryClient();
    const paginateRef = useRef();

    const { delete: deleteKotaKab, DeleteConfirmationModal } = useDelete({
        onSuccess: () => {
            queryClient.invalidateQueries(['/master/kota-kabupaten']);
            paginateRef.current?.refetch()
        },
        onError: () => {
            console.log('Delete error:', error);
        }
    });

    const renderItem = ({ item }) => {
        return (
            <View
                className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
                style={{
                    elevation: 4,
                }}
            >
                <View>
                    <Text className="text-xs font-poppins-regular text-gray-500 mb-1">Nama</Text>
                    <Text className="text-md font-poppins-medium text-black">{item.nama}</Text>

                    {/* Horizontal separator */}
                    <View className="h-[1px] bg-gray-300 my-3" />

                    {/* Buttons positioned at the bottom-right */}
                    <View className="flex-row justify-end gap-2">
                        <TouchableOpacity
                            onPress={() => navigation.navigate("FormKotaKab", { uuid: item.uuid })}
                            className="flex-row items-center bg-indigo-500 px-2 py-2 rounded"
                        >
                            <IonIcon name="pencil" size={14} color="#fff" />
                            <Text className="text-white ml-1 text-xs font-poppins-medium">Edit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => deleteKotaKab(`/master/kota-kabupaten/${item.uuid}`)}
                            className="flex-row items-center bg-red-500 px-2 py-2 rounded"
                        >
                            <IonIcon name="trash" size={14} color="#fff" />
                            <Text className="text-white ml-1 text-xs font-poppins-medium">Hapus</Text>
                        </TouchableOpacity>
                    </View>
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
                <Text className="text-[20px] font-poppins-semibold text-black">Kota & Kabupaten</Text>
            </View>

            <Paginate
                ref={paginateRef}
                url="/master/kota-kabupaten"
                payload={{}}
                renderItem={renderItem}
            />

            <Icon
                name="plus"
                size={28}
                color="#fff"
                style={{
                    position: "absolute",
                    bottom: 20,
                    right: 20,
                    backgroundColor: "#312e81",
                    padding: 10,
                    borderRadius: 50,
                }}
                onPress={() => navigation.navigate("FormKotaKab")}
            />

            <DeleteConfirmationModal />
        </View>
    );
};

export default KotaKab;
