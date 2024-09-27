import React, { memo, useState, useMemo, useEffect, forwardRef, useImperativeHandle } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/src/libs/axios";
import Icon from 'react-native-vector-icons/Feather'
import BackButton from "./BackButton";
import { useNavigation } from "@react-navigation/native";

const Paginate = forwardRef(({ url, queryKey, payload, renderItem, ...props }, ref) => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { control, handleSubmit } = useForm();

  const navigation = useNavigation()

  const { data, isFetching, refetch } = useQuery({
    queryKey: queryKey ? queryKey :  [url],
    queryFn: () => axios.post(url, { ...payload, page, search}).then(res => {
      // console.log(res.data)
      return res.data
    }),
    placeholderData: {data: []},
    onError: error => console.error(error.response?.data),
  });

  useImperativeHandle(ref, () => ({
    refetch,
  }))

  // useEffect(() => {
  //   console.log({url})
  // }, [url])

  useEffect(() => {
    console.log({search, page, payload})
    refetch();
  }, [search, page, payload]);

  useEffect(() => {
    if(!data.data?.length) queryClient.invalidateQueries([url]);
  }, [data])

  const pagination = useMemo(() => {
    let limit = data.last_page <= page + 1 ? 5 : 2;
    return Array.from({ length: data.last_page }, (_, i) => i + 1).filter(
      i => 
        i >= (page < 3 ? 3 : page) - limit &&
        i <= (page < 3 ? 3 : page) + limit,
    );
  }, [data.current_page, data.last_page])
  const ListHeader = () => (
    <View className="flex-row mb-4 items-center">
      {/* <BackButton size={24} action={() => navigation.goBack()} className="mr-2" /> */}
      <Controller
        control={control}
        name="search"
        render={({ field: { onChange, value } }) => (
          <TextInput
            className="flex-1 text-base border bg-white px-3 border-gray-300 rounded-md mr-3"
            value={value}
            onChangeText={onChange}
            placeholder="Cari..."
          />
        )}
      />
      <TouchableOpacity
        className="bg-[#312e81] p-4 rounded-md justify-center"
        onPress={handleSubmit(data => setSearch(data.search))}
      >
        <Icon name="search" size={18} color={"white"} />
      </TouchableOpacity>
    </View>
  );

  const ListFooter = () => (
    <View className="flex-row justify-center mt-4 space-x-2">
      {pagination.map(i => (
        <TouchableOpacity
          key={i}
          className={`px-3 py-2 rounded-md border ${
            i == data.current_page
              ? "bg-indigo-900 border-indigo-900"
              : "border-indigo-900"
          }`}
          onPress={() => setPage(i)}
        >
          <Text
            className={`${
              i == data.current_page ? "text-white" : "text-indigo-900"
            } font-semibold`}
          >
            {i}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (isFetching) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#312e81" />
      </View>
    );
  }

  return (
    <View className="flex-1 p-4" {...props}>
      <ListHeader />
      <FlatList
        data={data.data}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500">Data kosong</Text>
          </View>
        )}
      />
      <ListFooter />
    </View>
  );
});

export default memo(Paginate);