import React, { useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  TextInput
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '@/src/libs/axios';
import Icon from 'react-native-vector-icons/FontAwesome6';
import BackButton from "@/src/screens/components/BackButton";
import Paginate from "@/src/screens/components/Paginate";
import IonIcons from "react-native-vector-icons/Ionicons";


const ParameterPeraturan = ({ navigation, route }) => {
  const { selected } = route.params;
  const queryClient = useQueryClient();
  const paginateSelectedRef = React.useRef()
  const paginateRef = React.useRef()

  const { data: selectedParameters } = useQuery({
    queryKey: ["selectedParameters", selected],
    queryFn: () =>
      axios
        .get(`/master/peraturan/${selected}/parameter`)
        .then(res => res.data.data),
  })

  const { mutate: addParameter, isLoading: isAdding } = useMutation({
    mutationFn: (uuid) => 
      axios.post(`/master/peraturan/${selected}/parameter/store`, { uuid }),
    onSuccess: () => {
      paginateRef.current.refetch();
      paginateSelectedRef.current.refetch()
    },
    onError: (error) => {
      console.error('Add Parameter Error:', error);
    }
  });

  const { mutate: updateParameter, isLoading: isUpdating } = useMutation({
    mutationFn: (data) => 
      axios.post(`/master/peraturan/${selected}/parameter/update`, data),
    onSuccess: () => {
      paginateSelectedRef.current.refetch()
    },
    onError: (error) => {
      console.error('Update Parameter Error:', error);
    }
  });

  const { mutate: removeParameter, isLoading: isRemoving } = useMutation({
    mutationFn: (uuid) => 
      axios.post(`/master/peraturan/${selected}/parameter/destroy`, { uuid }),
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
          <IonIcons name="add" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  ), [addParameter, isAdding]);

  const renderSelectedParameterItem = useCallback(({ item }) => {
    const bakuMutu = item.peraturans?.[0]?.pivot?.baku_mutu || '';

    return (
      <View className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5">
        <View>
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
              <IonIcons name="trash" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View className="mt-2">
            <Text className="text-sm font-poppins-medium text-gray-600 mb-1">
              Baku Mutu
            </Text>
            <TextInput
              className="border border-gray-300 rounded-md p-2 text-black font-poppins-medium text-sm"
              value={bakuMutu}
              onChangeText={(text) => 
                updateParameter({ 
                  uuid: item.uuid, 
                  baku_mutu: text 
                })
              }
              placeholder="Masukkan Baku Mutu"
            />
          </View>
        </View>
      </View>
    );
  }, [removeParameter, updateParameter, isRemoving]);

  return (
    <ScrollView className="flex-1">
      <View className="items-center justify-center mt-4 mb-2">
        <View className="absolute left-4">
          <BackButton action={() => navigation.goBack()} size={26} />
        </View>
        <Text className="text-[20px] font-poppins-semibold text-black">
          Parameter Peraturan
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
                url={`/master/peraturan/${selected}/parameter`}
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

export default ParameterPeraturan;