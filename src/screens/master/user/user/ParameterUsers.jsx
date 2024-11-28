import React, { useRef, useState } from "react";
import {  View,  Text,  TouchableOpacity,  SafeAreaView,  ScrollView
} from 'react-native';
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import axios from 'axios'; // Ensure you have axios configured
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6';
import BackButton from "@/src/screens/components/BackButton";
import Paginate from "@/src/screens/components/Paginate";

interface Parameter {
  uuid: string;
  nama: string;
  metode: string;
  harga: number;
  satuan: string;
  jenis_parameter: {
    nama: string;
  };
}

const ParameterUsers = ({ navigation, route }) => {
  const { selected } = route.params;
  const paginateParameterRef = useRef(null);
  const paginateSelectedParameterRef = useRef(null);
  const queryClient = useQueryClient();


  const { data: selectedParameter, refetch: refetchSelectedParameter } = useQuery({
    queryKey: ['selectedParameter', selected],
    queryFn: () => axios.get(`/master/user/${selected}/parameter`).then(res => res.data.data),
    cacheTime: 0,
  });


  const { mutate: addParameter } = useMutation(
    (uuid: string) => axios.post(`/master/user/${selected}/parameter/store`, { uuid }),
    {
      onSuccess: () => {
        refetchSelectedParameter();
        paginateParameterRef.current?.refetch();
        paginateSelectedParameterRef.current?.refetch();
      },
      onError: (error) => {
        console.error('Add parameter error:', error);
      }
    }
  );
  
  const { mutate: removeParameter } = useMutation(
    (uuid: string) => axios.post(`/master/user/${selected}/parameter/destroy`, { uuid }),
    {
      onSuccess: () => {
        refetchSelectedParameter();
        paginateParameterRef.current?.refetch();
        paginateSelectedParameterRef.current?.refetch();
      },
      onError: (error) => {
        console.error('Remove parameter error:', error);
      }
    }
  );

  const renderAvailableItem = ({ item }: { item: Parameter }) => {
    return (
      <View
        className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"  
        style={{ elevation: 4 }}
      >
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-base font-poppins-medium text-black">
              {item.nama} {item.keterangan ? `(${item.keterangan})` : ''}
            </Text>
            <Text className="text-base text-muted font-poppins-medium">
              {item.jenis_parameter.nama}
            </Text>
            <Text className="text-base font-poppins-medium text-black">{item.metode}</Text>
          </View>
          <TouchableOpacity 
            className="bg-[#312e81] rounded-md p-2"
            onPress={() => addParameter(item.uuid)}
          >
            <FontAwesome6Icon name="plus" size={18} color={"#fff"} />
          </TouchableOpacity>
        </View> 
      </View>
    );
  }

  const renderSelectedItem = ({ item }: { item: Parameter }) => {
    return (
      <View
        className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"  
        style={{ elevation: 4 }}
      >
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-base font-poppins-medium text-black">
              {item.nama} {item.keterangan ? `(${item.keterangan})` : ''}
            </Text>
            <Text className="text-base text-muted font-poppins-medium">
              {item.jenis_parameter.nama}
            </Text>
            <Text className="text-base font-poppins-medium text-black">{item.metode}</Text>
          </View>
          <TouchableOpacity 
            className="bg-[#dc2626] rounded-md p-2"
            onPress={() => removeParameter(item.uuid)}
          >
            <FontAwesome6Icon name="trash" size={18} color={"#fff"} />
          </TouchableOpacity>
        </View> 
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#ececec]">
  <View className="items-center justify-center mt-4 mb-2">
    <View className="absolute left-4">
      <BackButton action={() => navigation.goBack()} size={26} />
    </View>
    <Text className="text-[20px] font-poppins-semibold text-black">Parameter User</Text>
  </View>
  
  {/* Parameter yang Dipilih */}
  <View className="flex-1 p-3">
    <View className="bg-white rounded-md shadow-md">
    <Text className="text-[16px] font-poppins-semibold text-black ml-4 mt-4 self-center" >
        Parameter yang Dipilih
      </Text>
      <View className="h-[1px] bg-gray-100 my-3" />
      <Paginate
        ref={paginateSelectedParameterRef}
        url={`/master/user/${selected}/parameter`}
        payload={{ except: selectedParameter }}
        renderItem={renderSelectedItem}
      />
    </View>
  </View>
  
  {/* Parameter Tersedia */}
  <View className="flex-1 p-3">
    <View className="bg-white rounded-md shadow-md">
      <Text className="text-[16px] font-poppins-semibold text-black ml-4 mt-4 self-center" >
        Parameter Tersedia
      </Text>
      <View className="h-[1px] bg-gray-100 my-3" />
      <View style={{ maxHeight: 500 }}>
        <ScrollView nestedScrollEnabled>
          <Paginate
            ref={paginateParameterRef}
            url="/master/parameter"
            payload={{ }}
            renderItem={renderAvailableItem}
          />
        </ScrollView>
      </View>
    </View>
  </View>
</ScrollView>

  )
}

export default ParameterUsers;