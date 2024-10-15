import React, {
  memo,
  useState,
  useMemo,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/src/libs/axios";
import Icon from "react-native-vector-icons/Feather";
import Back from "./Back";
import { useNavigation } from "@react-navigation/native";

const Paginate = forwardRef(
  (
    {
      url,
      queryKey,
      payload,
      renderItem,
      showLoading = true,
      Plugin,
      ...props
    },
    ref,
  ) => {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const { control, handleSubmit } = useForm();

    const navigation = useNavigation();

    const { data, isFetching, refetch } = useQuery({
      queryKey: queryKey ? queryKey : [url],
      queryFn: () =>
        axios.post(url, { ...payload, page, search }).then(res => {
          // console.log(res.data.data)
          return res.data;
        }),
      placeholderData: { data: [] },
      onError: error => console.error(error.response?.data),
    });

    useImperativeHandle(ref, () => ({
      refetch,
    }));

    // useEffect(() => {
    //   console.log({url})
    // }, [url])

    useEffect(() => {
      refetch();
    }, [search, page, payload]);

    useEffect(() => {
      if (!data.data?.length) queryClient.invalidateQueries([url]);
    }, [data]);

    const pagination = useMemo(() => {
      const totalPages = data.last_page || 1;
      const currentPage = data.current_page || 1;
      const pagesToShow = 5;

      let startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
      let endPage = Math.min(totalPages, startPage + pagesToShow - 1);

      if (endPage - startPage + 1 < pagesToShow) {
        startPage = Math.max(1, endPage - pagesToShow + 1);
      }

      return Array.from(
        { length: endPage - startPage + 1 },
        (_, i) => startPage + i,
      );
    }, [data.current_page, data.last_page]);
    const ListHeader = () => (
      <>
        <View className="flex-row mb-1 items-center">
          {/* <Back size={24} action={() => navigation.goBack()} className="mr-2" color={"black"} /> */}
          <Controller
            control={control}
            name="search"
            render={({ field: { onChange, value } }) => (
              <TextInput
                className="flex-1 text-base border bg-white px-3 border-gray-300 rounded-md mr-3 text-black"
                value={value}
                onChangeText={onChange}
                placeholder="Cari..."
              />
            )}
          />
          <TouchableOpacity
            className="bg-[#312e81] p-4 rounded-md justify-center"
            onPress={handleSubmit(data => setSearch(data.search))}>
            <Icon name="search" size={18} color={"white"} />
          </TouchableOpacity>
        </View>
        <View>{Plugin && <Plugin />}</View>
      </>
    );

    const ListFooter = () => (
      <View className="flex-row justify-start mt-4 space-x-2 items-center">
        {page > 1 && (
          <>
            <TouchableOpacity
              className="px-3  py-2 rounded-md border border-indigo-900"
              onPress={() => setPage(1)}>
              <Icon name="chevrons-left" size={18} color="#312e81" />
            </TouchableOpacity>
            {/* <TouchableOpacity
              className="px-3 py-2 rounded-md border border-indigo-900"
              onPress={() => setPage(prev => prev - 1)}>
              <Icon name="chevron-left" size={18} color="#312e81" />
            </TouchableOpacity> */}
          </>
        )}

        {pagination.map(i => (
          <TouchableOpacity
            key={i}
            className={`px-3 py-2 rounded-md border ${
              i == data.current_page
                ? "bg-indigo-900 border-indigo-900"
                : "border-indigo-900"
            }`}
            onPress={() => setPage(i)}>
            <Text
              className={`${
                i == data.current_page ? "text-white" : "text-indigo-900"
              } font-semibold`}>
              {i}
            </Text>
          </TouchableOpacity>
        ))}

        {page < data.last_page && (
          <>
            {/* <TouchableOpacity
              className="px-3 mx-2 py-2 rounded-md border border-indigo-900"
              onPress={() => setPage(prev => prev + 1)}>
              <Icon name="chevron-right" size={18} color="#312e81" />
            </TouchableOpacity> */}
            <TouchableOpacity
              className="px-3 py-2 mx-2 rounded-md border border-indigo-900"
              onPress={() => setPage(data.last_page)}>
              <Icon name="chevrons-right" size={18} color="#312e81" />
            </TouchableOpacity>
          </>
        )}
      </View>
    );

    if (isFetching && showLoading) {
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
  },
);

export default memo(Paginate);
