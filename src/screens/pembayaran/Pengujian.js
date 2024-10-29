import React, { useRef, useState, useEffect } from "react";
import { Text, View, StyleSheet, TextInput, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Button } from "react-native-ui-lib";
import BackButton from "../components/BackButton";
import Paginate from '@/src/screens/components/Paginate';


const Pengujian = () => {
    const navigation = useNavigation();
    const [search, setSearch] = useState("");
    const paginateRef = useRef();


    const [searchQuery, setSearchQuery] = React.useState("");


    const renderItem = ({ item }) => {

    return(
        <View
        className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
        style={{
          elevation: 4,
        }}>
        <View className="flex-row justify-between items-center p-2 relative">
          <View className="flex-shrink mr-20">
            <Text className="text-[18px] font-poppins-semibold mb-1">{item.kode}</Text>
            <Text className="text-[18px] font-poppins-semibold mb-3">{item.permohonan.industri}</Text>
            <Text className="text-[14px] mb-2">{item.lokasi}</Text>
            <Text className="text-[14px] mb-2">{item.harga}</Text>
            <Text className="text-[14px] mb-2">{item.harga}</Text>
          </View>
        </View>
        </View>

    
       
    );
    };


    return (
        <View className="bg-[#ececec] w-full h-full">
          <View className=" p-3">
            <View className="flex-row items-center space-x-2">
              <View className="flex-col w-full">
    
                <View className="flex-row items-center space-x-2">
                  <BackButton action={() => navigation.goBack()} size={26} />
                  <View className="absolute left-0 right-2 items-center">
                    <Text className="text-[20px] font-poppins-semibold">Menunggu Pembayaran</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <Paginate
            ref={paginateRef}
            url="/pembayaran/pengujian"
            payload={{
            // status: 1,
            // tahun: selectedYear,
            page: 1,
            per: 10,
            }}
            renderItem={renderItem}
            className="mb-12"
        />


        </View>
      );    
}; 


export default Pengujian;
