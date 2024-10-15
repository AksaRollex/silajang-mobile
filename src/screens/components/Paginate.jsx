import React, {
  memo,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  Platform,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/src/libs/axios";
import Icon from "react-native-vector-icons/Feather";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import LinearGradient from "react-native-linear-gradient";

// Aktivasi LayoutAnimation di Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Paginate = forwardRef(
  ({ url, payload, renderItem, Plugin, ...props }, ref) => {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [dataList, setDataList] = useState([]);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const { control, handleSubmit } = useForm();

    const { data, isFetching, refetch } = useQuery({
      queryKey: [url, page, search],
      queryFn: () =>
        axios.post(url, { ...payload, page, search }).then(res => res.data),
      placeholderData: { data: [] },
      onSuccess: res => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (page === 1) {
          setDataList(res.data);
        } else {
          setDataList(prevData => [...prevData, ...res.data]);
        }
      },
    });

    useImperativeHandle(ref, () => ({
      refetch,
    }));

    useEffect(() => {
      setPage(1);
      refetch();
    }, [search, payload]);

    const handleLoadMore = () => {
      if (!isFetchingMore && page < data.last_page) {
        setIsFetchingMore(true);
        setPage(prevPage => prevPage + 1);
      }
    };

    useEffect(() => {
      if (isFetchingMore) {
        refetch().finally(() => setIsFetchingMore(false));
      }
    }, [isFetchingMore]);

    const handleScroll = event => {
      const scrollOffset = event.nativeEvent.contentOffset.y;
      if (scrollOffset <= 0 && page > 1) {
        setPage(1);
      }
    };

    const SkeletonLoader = () => (
      <SkeletonPlaceholder backgroundColor="#e0e0e0" highlightColor="#f5f5f5">
        <View
          style={{
            flexDirection: "column",
            alignItems: "center",
            padding: 15,
            width: "100%",
            marginTop: rem(8),
          }}>
          {[...Array(5)].map((_, index) => (
            <View key={index} style={{ marginVertical: 10 }}>
              <View
                style={{
                  flexDirection: "row",
                  padding: 10,
                  borderRadius: 15,
                  borderTopWidth: 7,
                  borderTopColor: "#e0e0e0",
                }}>
                <View style={{ width: "90%", padding: 10 }}>
                  {/* Individual skeleton items */}
                  <View
                    style={{
                      width: 100,
                      height: 16,
                      borderRadius: 4,
                      backgroundColor: "#e0e0e0",
                    }}
                  />
                  <View
                    style={{
                      marginTop: 8,
                      width: 200,
                      height: 24,
                      borderRadius: 4,
                      backgroundColor: "#e0e0e0",
                    }}
                  />
                  <View
                    style={{
                      marginTop: 8,
                      width: 150,
                      height: 20,
                      borderRadius: 4,
                      backgroundColor: "#e0e0e0",
                    }}
                  />
                  <View
                    style={{
                      marginTop: 8,
                      width: 180,
                      height: 20,
                      borderRadius: 4,
                      backgroundColor: "#e0e0e0",
                    }}
                  />
                  <View
                    style={{
                      marginTop: 8,
                      width: 250,
                      height: 16,
                      borderRadius: 4,
                      backgroundColor: "#e0e0e0",
                    }}
                  />
                </View>
                <View
                  style={{
                    width: "10%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}>
                  <View
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: 20,
                    }}></View>
                  <View
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: 20,
                      marginVertical: 1,
                    }}></View>
                  <View
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: 20,
                    }}></View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </SkeletonPlaceholder>
    );

    const ListHeader = () => (
      <>
        <View className="flex-row mb-1 items-center">
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
            onPress={handleSubmit(data => {
              setSearch(data.search);
              setPage(1);
            })}>
            <Icon name="search" size={18} color={"white"} />
          </TouchableOpacity>
        </View>
        <View className="mb-1">{Plugin && <Plugin />}</View>
      </>
    );

    const ListFooter = () => (
      <View className="flex-row justify-center mt-4">
        {isFetchingMore && (
          <ActivityIndicator
            size="large"
            color="#312e81"
            style={{
              transform: [{ scale: 1.1 }],
              opacity: isFetchingMore ? 1 : 0.5,
              transition: "opacity 0.3s ease",
            }}
          />
        )}
      </View>
    );

    if (isFetching && page === 1) {
      return (
        <View className="flex-1">
          <SkeletonLoader />
        </View>
      );
    }

    return (
      <View className="flex-1 p-4" {...props}>
        <ListHeader />
        <FlatList
          data={dataList}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          onScroll={handleScroll}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={ListFooter}
          ListEmptyComponent={() => (
            <View className="flex-1 justify-center items-center">
              <Text className="text-gray-500">Data Tidak Tersedia</Text>
            </View>
          )}
        />
      </View>
    );
  },
);

export default memo(Paginate);
