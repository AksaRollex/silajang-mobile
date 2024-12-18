import React, { memo, useState, useEffect, forwardRef, useImperativeHandle, useRef, useCallback } from "react";
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
  Image,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/src/libs/axios";
import Icon from "react-native-vector-icons/Feather";
import { Skeleton } from "@rneui/themed";
import LinearGradient from "react-native-linear-gradient";

// Enable LayoutAnimation for Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Skeleton loader for list items
const SkeletonLoader = ({ width, height, style, circle }) => (
  <Skeleton
    animation="wave"
    width={width}
    height={height}
    LinearGradientComponent={LinearGradient}
    style={style}
    circle={circle || false}
  />
);

// Single skeleton item component
const ListItemSkeleton = () => (
  <View
    style={{
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 12,
    }}
  >
    <View>
      <SkeletonLoader
        width={390}
        height={20}
        style={{
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          overflow: "hidden",
        }}
      />
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
      <View
        style={{
          width: "10%",
          position: "absolute",
          justifyContent: "flex-end",
          right: 0,
          top: "40%",
        }}
      >     
      </View>
    </View>
  </View>
);  

// Komponen Pagination Numbers
const PaginationNumbers = ({ currentPage, totalPages, onPageChange }) => {
  const renderPages = () => {
    const pages = [];
    const visiblePages = 5;
    const halfVisiblePages = Math.floor(visiblePages / 2);

    let startPage = Math.max(1, currentPage - halfVisiblePages);
    let endPage = Math.min(totalPages, startPage + visiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <TouchableOpacity
          key={i}
          onPress={() => onPageChange(i)}
          className={`px-3 py-2 mx-1 rounded-md ${currentPage === i ? "bg-[#312e81]" : "bg-gray-200"}`}
        >
          <Text className={`text-sm ${currentPage === i ? "text-white" : "text-gray-700"}`}>{i}</Text>
        </TouchableOpacity>
      );
    }
    return pages;
  };

  return (
    <View className="flex-row items-center">
      {currentPage > 1 && (
        <TouchableOpacity onPress={() => onPageChange(currentPage - 1)} className="mx-2">
          <Icon name="chevron-left" size={20} color="#6B7280" />
        </TouchableOpacity>
      )}
      {renderPages()}
      {currentPage < totalPages && (
        <TouchableOpacity onPress={() => onPageChange(currentPage + 1)} className="mx-2">
          <Icon name="chevron-right" size={20} color="#6B7280" />
        </TouchableOpacity>
      )}
    </View>
  );
};

// Komponen Utama Paginate
const Paginate = forwardRef(({ url, renderItem, payload, style }, ref) => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dataList, setDataList] = useState([]);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const { control, handleSubmit } = useForm();
  const listRef = useRef(null);

  // Query setup
  const { data, isFetching, refetch } = useQuery({
    queryKey: [url, page, search],
    queryFn: () => axios.post(url, { page, search, ...(payload || {}) }).then((res) => res.data),
    placeholderData: { data: [], last_page: 1 },
    onSuccess: (res) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setDataList((prev) => (page === 1 ? res.data : [...prev, ...res.data]));
    },
  });

  useImperativeHandle(ref, () => ({ refetch }));

  const handleLoadMore = () => {
    if (!isFetchingMore && page < data?.last_page) {
      setIsFetchingMore(true);
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (isFetchingMore) {
      refetch().finally(() => setIsFetchingMore(false));
    }
  }, [isFetchingMore]);

  const onSearchSubmit = handleSubmit((data) => {
    setSearch(data.search);
    setPage(1);
  });

  return (
    <View className="flex-1 p-4" style={style}>
      {/* Form Pencarian */}
      <View className="flex-row mb-4 items-center">
        <Controller
          control={control}
          name="search"
          defaultValue=""
          render={({ field: { onChange, value } }) => (
            <TextInput
              className="flex-1 text-base border bg-white px-3 border-gray-300 rounded-md mr-3"
              value={value}
              onChangeText={onChange}
              placeholder="Cari..."
              editable={!isFetching}
            />
          )}
        />
        <TouchableOpacity
          className="bg-[#312e81] p-4 rounded-md justify-center"
          onPress={onSearchSubmit}
          disabled={isFetching}
          style={{ opacity: isFetching ? 0.7 : 1 }}
        >
          <Icon name="search" size={18} color="white" />
        </TouchableOpacity>
      </View>

      {/* List Data */}
      {isFetching && page === 1 ? (
        [1, 2, 3].map((key) => <ListItemSkeleton key={key} />)
      ) : (
        <FlatList
          ref={listRef}
          data={dataList}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${index}`}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => (isFetchingMore ? <ActivityIndicator size="large" color="#312e81" /> : null)}
          ListEmptyComponent={() => (
            <View className="flex-1 items-center mt-4">
              <Image source={require("@/assets/images/notfnd.png")} className="w-60 h-60 opacity-60"/>
              <Text className="text-gray-500">Data Tidak Tersedia</Text>
            </View>
          )}
        />
      )}

      {/* Pagination */}
      <PaginationNumbers currentPage={page} totalPages={data?.last_page || 1} onPageChange={setPage} />
    </View>
  );
});

export default memo(Paginate);
