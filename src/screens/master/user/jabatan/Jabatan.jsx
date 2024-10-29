import {View, Text} from "react-native";
import React, { useRef } from "react";
import { useDelete } from "@/src/hooks/useDelete";
import Paginate from "@/src/screens/components/Paginate";
import { MenuView } from "@react-native-menu/menu";
import { useQueryClient } from "@tanstack/react-query";
import Icon from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";

const Jabatan = ({ navigation }) => {
    const queryClient = useQueryClient();
    const paginateRef = useRef();

    const { delete: deleteJabatan, DeleteConfirmationModal } = useDelete({
        onSuccess: () => {
            queryClient.invalidateQueries(["/master/jabatan"]);
            paginateRef.current?.refetch();
        },
        onError: (error) => {
            console.error(error);
        }
    })

    const dropdownOptions = [
        {
            id: "Edit",
            title: "Edit",
            action: item => navigation.navigate("FormJabatan", { name: item.name })
        },
        {
            id: "Hapus",
            title: "Hapus",
            action: item => deleteJabatan(`/master/jabatan/${item.name}`)
        }
    ]

    const renderItem = ({ item }) => {
      return (
        <View
            className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
            style={{ 
                elevation: 4,
             }}>
            <View className="flex-row justify-between items-center">
                <Text className="text-[16px] font-poppins-medium">{item.full_name}</Text>
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
                    <View>
                        <Entypo name="dots-three-vertical" size={18} color="#312e81" />
                    </View>
                    </MenuView>
            </View>
        </View>
      );
    };
    return (
        <View className="bg-[#ececec] w-full h-full">
            <Paginate
                ref={paginateRef}
                url="/master/jabatan"
                payload={{}}
                renderItem={renderItem}
            />
            <Icon
                name="plus"
                size={28}
                color="#fff"
                style={{ position: "absolute", bottom: 20, right: 20, backgroundColor: "#312e81", padding: 10, borderRadius: 50 }}
                onPress={() => navigation.navigate('FormJabatan')}
            />
            <DeleteConfirmationModal/>
        </View>
    );
};

export default Jabatan;