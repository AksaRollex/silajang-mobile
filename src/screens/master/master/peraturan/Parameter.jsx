import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native'
import React, { useEffect, useState, memo, useRef } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import Toast from 'react-native-toast-message'
import axios from '@/src/libs/axios'
import Paginate from '@/src/screens/components/Paginate'
import FontAwesome6Icon from 'react-native-vector-icons/FontAwesome6'

export default memo (function Parameter({ route, navigation }) {
  const { uuid } = route.params || {}
  const queryClient = useQueryClient()
  const paginateParameterRef = useRef()

  const { selectedParameter, isLoading: isLoadingParameter } = useQuery(
    ['selectedParameter'], 
    () => uuid ? axios.get(`/master/peraturan/${uuid}/parameter`).then(res => res.data.data) : null,
    {
      onError: error => {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: `Failed to fetch data ${error}`
        })
      }
    }
  )

  const renderItemParameter = ({ item }) => (
    <View className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5" style={{ elevation: 4 }}>
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-lg font-poppins-medium">{item.nama}</Text>
          <Text className="text-lg font-poppins-medium">{item.harga}</Text>
        </View>
        <TouchableOpacity className="bg-blue-600 rounded-md p-2">
          <FontAwesome6Icon name="plus" size={18} color={"#fff"} />
        </TouchableOpacity>
      </View>
    </View>
  ) 

  if(isLoadingParameter){
    return <View><ActivityIndicator /></View>
  }

  return (
    <View className="bg-[#ececec] w-full h-full">
      <Paginate 
        ref={paginateParameterRef}
        url="/master/parameter"
        payload={{ except: selectedParameter }}
        renderItem={renderItemParameter}
      />
    </View>
  )
})
