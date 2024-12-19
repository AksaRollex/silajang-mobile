import React, { useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView ,
  ScrollView
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/src/libs/axios';
import Icon from 'react-native-vector-icons/FontAwesome6';
import BackButton from "@/src/screens/components/BackButton";
import Paginate from "@/src/screens/components/Paginate";
import IonIcon from "react-native-vector-icons/Ionicons";


const ParameterPaket = ({ navigation, route }) => {
  const { selected } = route.params;
  const queryClient = useQueryClient();
  const paginateSelectedRef = React.useRef()
  const paginateRef = React.useRef()

  const { data: selectedParameters } = useQuery({
    queryKey: ["selectedParameters", selected],
    queryFn: () =>
      axios
        .get(`/master/paket/${selected}/parameter`)
        .then(res => res.data.data),
  })


  React.useEffect(() => console.log(selectedParameters), [selectedParameters])

  const { mutate: addParameter, isLoading: isAdding } = useMutation({
    mutationFn: (uuid) => 
      axios.post(`/master/paket/${selected}/parameter/store`, { uuid }),
    onSuccess: () => {
      paginateRef.current.refetch();
      paginateSelectedRef.current.refetch()
    },
    onError: (error) => {
      console.error('Add Parameter Error:', error);
    }
  });

  const { mutate: removeParameter, isLoading: isRemoving } = useMutation({
    mutationFn: (uuid) => 
      axios.post(`/master/paket/${selected}/parameter/destroy`, { uuid }),
    onSuccess: () => {
      paginateRef.current.refetch();
      paginateSelectedRef.current.refetch()
    },
    onError: (error) => {
      console.error('Remove Parameter Error:', error);
    }
  });

  const renderParameterItem = useCallback(({ item }) => (
    <View className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5">
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-base font-poppins-medium text-black">
            {item.nama} {item.keterangan ? `(${item.keterangan})` : ''}
          </Text>
          <Text className="text-base font-poppins-medium text-black">
            {new Intl.NumberFormat('id-ID', { 
              style: 'currency', 
              currency: 'IDR' 
            }).format(item.harga)}
          </Text>
        </View>
        <TouchableOpacity 
          className="bg-[#312e81] rounded-md p-2"
          onPress={() => !isAdding && addParameter(item.uuid)}
          disabled={isAdding}
        >
          <IonIcon name="add" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  ), [addParameter, isAdding]);

  const renderSelectedParameterItem = useCallback(({ item }) => (
    <View className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5">
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-base font-poppins-medium text-black">
            {item.nama} {item.keterangan ? `(${item.keterangan})` : ''}
          </Text>
          <Text className="text-base font-poppins-medium text-black">
            {new Intl.NumberFormat('id-ID', { 
              style: 'currency', 
              currency: 'IDR' 
            }).format(item.harga)}
          </Text>
        </View>
        <TouchableOpacity 
          className="bg-red-600 rounded-md p-2"
          onPress={() => !isRemoving && removeParameter(item.uuid)}
          disabled={isRemoving}
        >
          <IonIcon name="trash" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  ), [removeParameter, isRemoving]);

  return (
    <ScrollView className="flex-1">
       <View
        className="flex-row items-center justify-between py-3.5 px-4 border-b border-gray-300"
        style={{ backgroundColor: "#fff" }}>
          <IonIcon
            name="arrow-back-outline"
            onPress={() => navigation.goBack()}
            size={25}
            color="#312e81"
          />
          <Text className="text-lg font-poppins-semibold ml-3 text-black">
            Parameter
          </Text>
      </View>

      <View className="flex-1 p-3">
      <View className="bg-white rounded-md shadow-md">
        <Text className="text-[16px] font-poppins-semibold text-black ml-4 mt-4">
          Parameter yang Dipilih
        </Text>
        <View className="h-[1px] bg-gray-100 my-3" />
      <View style={{ maxHeight: 500 }}>
        <ScrollView nestedScrollEnabled>
        <Paginate
          url={`/master/paket/${selected}/parameter`}
          renderItem={renderSelectedParameterItem}
          ref={paginateSelectedRef}
        />
        </ScrollView>
        </View>
        </View>
      </View>

      <View className="flex-1 p-3">
        <View className="bg-white rounded-md shadow-md">
          <Text className="text-[16px] font-poppins-semibold text-black ml-4 mt-4">
            Parameter Tersedia
          </Text>
          <View className="h-[1px] bg-gray-100 my-3" />
        <View style={{ maxHeight: 500 }}>
          <ScrollView nestedScrollEnabled>
          <Paginate
            url="/master/parameter"
            payload={{ except: selectedParameters }}
            renderItem={renderParameterItem}
            ref={paginateRef}
          />
          </ScrollView>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default ParameterPaket;
