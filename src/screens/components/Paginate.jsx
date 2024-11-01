import React, { memo, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { View, Text, TextInput, FlatList, ActivityIndicator, TouchableOpacity, LayoutAnimation, UIManager, Platform } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/src/libs/axios";
import Icon from 'react-native-vector-icons/Feather';
import { Skeleton } from "@rneui/themed";
import LinearGradient from "react-native-linear-gradient";

// Aktivasi LayoutAnimation di Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SkeletonLoader = ({ width, height, style, circle = false }) => (
  <Skeleton
    animation="wave"
    width={width}
    height={height}
    LinearGradientComponent={LinearGradient}
    style={style}
    circle={circle}
  />
);

const ListItemSkeleton = () => (
  <View style={{ flexDirection: "column", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
    <View>
      <SkeletonLoader width={390} height={20} style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: "hidden" }} />
      <View style={{ width: "90%" }}>
        <SkeletonLoader width={390} height={180} />
        <View style={{ position: "absolute", top: "5%", left: "5%" }}>
          <SkeletonLoader width={150} height={20} />
          <SkeletonLoader width={220} height={55} style={{ marginTop: 10 }} />
          <SkeletonLoader width={160} height={14} style={{ marginTop: 10 }} />
          <SkeletonLoader width={160} height={14} style={{ marginTop: 10 }} />
          <SkeletonLoader width={160} height={14} style={{ marginTop: 10 }} />
        </View>
      </View>
      <View style={{ width: "10%", position: "absolute", justifyContent: "flex-end", right: 0, top: "40%" }}>
        <SkeletonLoader width={6} height={6} circle />
        <SkeletonLoader width={6} height={6} circle style={{ marginVertical: 3 }} />
        <SkeletonLoader width={6} height={6} circle />
      </View>
    </View>
  </View>
);

const Paginate = forwardRef(({ url, payload, renderItem, ...props }, ref) => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dataList, setDataList] = useState([]); 
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const { control, handleSubmit } = useForm();
  const cardData = [1,2,3,4,5]

  const { data, isFetching, refetch } = useQuery({
    queryKey: [url, page, search],
    queryFn: () => axios.post(url, { ...payload, page, search }).then(res => res.data),
    placeholderData: { data: [] },
    onSuccess: (res) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); 
      if (page === 1) {
        setDataList(res.data); 
      } else {
        setDataList((prevData) => [...prevData, ...res.data]); 
      }
    }
  });

  useImperativeHandle(ref, () => ({
    refetch,
  }));

  useEffect(() => {
    setPage(1); 
    refetch();
  }, [search, payload]);

  const handleLoadMore = () => {
    if (!isFetchingMore && page < data?.last_page) {
      setIsFetchingMore(true);
      setPage((prevPage) => prevPage + 1);
    }
  };

  useEffect(() => {
    if (isFetchingMore) {
      refetch().finally(() => setIsFetchingMore(false));
    }
  }, [isFetchingMore]);

  useEffect(() => {
    if(!data.data?.length) queryClient.invalidateQueries([url]);
  }, [data])


  const handleScroll = (event) => {
    // const scrollOffset = event.nativeEvent.contentOffset.y;
    // if (scrollOffset <= 0 && page > 1) {
    //   setPage(1); 
    // }
  };

  const ListHeader = () => (
    <View className="flex-row mb-4 items-center">
      <Controller
        control={control}
        name="search"
        render={({ field: { onChange, value } }) => (
          <TextInput
            className="flex-1 text-base border bg-white px-3 border-gray-300 rounded-md mr-3 font-poppins-regular"
            value={value}
            onChangeText={onChange}
            placeholder="Cari..."
          />
        )}
      />
      <TouchableOpacity
        className="bg-[#312e81] p-4 rounded-md justify-center"
        onPress={handleSubmit((data) => {
          setSearch(data.search);
          setPage(1); 
        })}
      >
        <Icon name="search" size={18} color={"white"} />
      </TouchableOpacity>
    </View>
  );

  const ListFooter = () => (
    <View className="flex-row justify-center mt-4">
      {isFetchingMore && (
        <ActivityIndicator size="large" color="#312e81" style={{ transform: [{ scale: 1.1 }], opacity: isFetchingMore ? 1 : 0.5, transition: 'opacity 0.3s ease' }} />
      )}
    </View>
  );

  if (isFetching && page === 1) {
    return (
      <View className="mt-32">
        {cardData.map((item, index) => (
          <View
            key={index}
            style={{
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 12,
            }}>
            <View>
              <View
                style={{
                  width: 390,
                  height: 10,
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  overflow: "hidden", // Pastikan elemen anak tidak keluar dari radius
                }}>
                <Skeleton
                  animation="wave"
                  width={390}
                  height={20}
                  LinearGradientComponent={LinearGradient}
                />
              </View>
              <View
                LinearGradientComponent={LinearGradient}
                style={{ width: "90%" }}>
                <Skeleton
                  animation="wave"
                  width={390}
                  LinearGradientComponent={LinearGradient}
                  height={180}
                />
                {/* Nested skeleton di dalam skeleton */}
                <View
                  style={{
                    position: "absolute",
                    top: "5%",
                    left: "5%",
                  }}>
                  <Skeleton
                    animation="wave"
                    width={150}
                    height={20}
                    LinearGradientComponent={LinearGradient}
                  />
                  <Skeleton
                    animation="wave"
                    width={220}
                    height={55}
                    LinearGradientComponent={LinearGradient}
                    style={{ marginTop: 10 }}
                  />
                  <Skeleton
                    animation="wave"
                    width={160}
                    height={14}
                    LinearGradientComponent={LinearGradient}
                    style={{ marginTop: 10 }}
                  />
                  <Skeleton
                    animation="wave"
                    width={160}
                    height={14}
                    LinearGradientComponent={LinearGradient}
                    style={{ marginTop: 10 }}
                  />
                  <Skeleton
                    animation="wave"
                    width={160}
                    height={14}
                    LinearGradientComponent={LinearGradient}
                    style={{ marginTop: 10 }}
                  />
                </View>
              </View>
              <View
                LinearGradientComponent={LinearGradient}
                style={{
                  width: "10%",
                  position: "absolute",
                  justifyContent: "flex-end",
                  right: 0,
                  top: "40%",
                }}>
                <Skeleton
                  animation="wave"
                  circle
                  width={6}
                  height={6}
                  LinearGradientComponent={LinearGradient}
                />
                <Skeleton
                  animation="wave"
                  circle
                  width={6}
                  height={6}
                  LinearGradientComponent={LinearGradient}
                  style={{ marginVertical: 3 }}
                />
                <Skeleton
                  animation="wave"
                  circle
                  width={6}
                  height={6}
                  LinearGradientComponent={LinearGradient}
                />
              </View>
            </View>
          </View>
        ))}
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
        removeClippedSubviews={false}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center"> 
            <Text className="text-gray-500 font-poppins-regular">Data Tidak Tersedia</Text>
          </View>
          )}
      />
    </View>
  );
});

export default memo(Paginate);