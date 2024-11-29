import React, { useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/src/libs/axios';
import Icon from 'react-native-vector-icons/FontAwesome6';
import BackButton from "@/src/screens/components/BackButton";
import Paginate from "@/src/screens/components/Paginate";

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
          <Icon name="plus" size={18} color="#fff" />
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
          <Icon name="trash" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  ), [removeParameter, isRemoving]);

  return (
    <SafeAreaView className="flex-1 bg-[#ececec]">
      <View className="items-center justify-center mt-4 mb-2">
        <View className="absolute left-4">
          <BackButton action={() => navigation.goBack()} size={26} />
        </View>
        <Text className="text-[20px] font-poppins-semibold text-black">
          Parameter Paket
        </Text>
      </View>

      <View className="flex-1 bg-white">
        <Text className="text-[16px] font-poppins-semibold text-black ml-4 mt-4">
          Parameter yang Dipilih
        </Text>
        <Paginate
          url={`/master/paket/${selected}/parameter`}
          renderItem={renderSelectedParameterItem}
          ref={paginateSelectedRef}
        />
      </View>

      <View className="flex-1 bg-white">
        <Text className="text-[16px] font-poppins-semibold text-black ml-4 mt-4">
          Parameter Tersedia
        </Text>
        <Paginate
          url="/master/parameter"
          payload={{ except: selectedParameters }}
          renderItem={renderParameterItem}
          ref={paginateRef}
        />
      </View>
    </SafeAreaView>
  );
};

export default ParameterPaket;
