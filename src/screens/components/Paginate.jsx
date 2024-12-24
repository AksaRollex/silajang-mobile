import React, { memo, useState, useEffect, forwardRef, useImperativeHandle } from "react";
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
import Ionicons from "react-native-vector-icons/Ionicons";
import { Skeleton } from "@rneui/themed";
import LinearGradient from "react-native-linear-gradient";
import { debounce } from "lodash";

// Enable LayoutAnimation for Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Skeleton loader component for reusability
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



// Search form component
const SearchForm = ({ control, onSubmit, handleSearch }) => (
  <View className="mb-4">
    <Controller
      control={control}
      name="search"
      defaultValue=""
      render={({ field: { onChange, value } }) => (
        <View className="relative">
          <View className="flex-row items-center bg-white rounded-lg border border-gray-200 px-3 shadow-sm">
            <TextInput
              className="flex-1 text-base py-3 text-black font-poppins-regular"
              value={value}
              onChangeText={(text) => {
                onChange(text);
                // Jika input dikosongkan, langsung refetch
                if (text.length === 0) {
                  handleSearch('');
                }
              }}
              placeholderTextColor={"#777"}
              placeholder="Cari..."
              onSubmitEditing={() => {
                handleSearch(value);
              }}
            />
            {value.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  onChange('');
                  handleSearch(''); 
                }}
                className="mr-0.5"
              >
                <Ionicons name="close-circle-outline" size={19} color="#9ca3af" />
              </TouchableOpacity>
            )}
            <View className="h-12 w-[1px] bg-gray-200 mx-2 left-0.5" />
            <TouchableOpacity
              onPress={() => handleSearch(value)}
              className="pl-2"
            >
              <Icon name="search" size={20} color="#312e81" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  </View>
);

// List content component
const ListContent = ({
  isFetching,
  page,
  dataList,
  renderItem,
  handleLoadMore,
  handleScroll,
  cardData,
  isFetchingMore,
}) => {
  if (isFetching && page === 1) {
    return (
      <View className="mt-4">
        {cardData.map((_, index) => (
          <ListItemSkeleton key={index} />
        ))}
      </View>
    );
  }

  return (
    <FlatList
      data={dataList}
      renderItem={renderItem}
      keyExtractor={(item, index) => index.toString()}
      onScroll={handleScroll}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={() => (
        <View className="flex-row justify-center mt-4">
          {isFetchingMore && (
            <ActivityIndicator
              size="large"
              color="#312e81"
              style={{
                transform: [{ scale: 1.1 }],
                opacity: 1,
                transition: "opacity 0.3s ease",
              }}
            />
          )}
        </View>
      )}
      removeClippedSubviews={false}
      ListEmptyComponent={() => (
        <View className="flex-1 items-center justify-center mt-4">
          <Image source={require("@/assets/images/notfnd.png")}
            className="w-60 h-60 opacity-40"
          />
          <Text className="text-gray-500 font-poppins-regular">
            Data Tidak Tersedia
          </Text>
        </View>
      )}
    />
  );
};

// Main Paginate component
const Paginate = forwardRef((props, ref) => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dataList, setDataList] = useState([]);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const { control, handleSubmit } = useForm();
  const cardData = [1, 2, 3, 4, 5];


  const handleSearch = (searchValue) => {
    setSearch(searchValue);
    setPage(1);
    refetch();
    
    if (!searchValue.trim()) {
      console.log("Melakukan refresh data karena pencarian kosong");
    } else {
      console.log(`Pencarian dimulai dengan kata kunci: ${searchValue}`);
    }
  };

  // Query setup
  const { data, isFetching, refetch } = useQuery({
    queryKey: [props.url, page, search],
    queryFn: () =>
      axios.post(props.url, {
        page,
        search,
        ...(props.payload || {})
      }).then((res) => res.data),
    placeholderData: { data: [] },
    onSuccess: (res) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      if (page === 1) {
        setDataList(res.data);
      } else {
        setDataList((prevData) => {
          const newData = [];
          for (let i = 0; i < prevData.length; i++) {
            newData[i] = prevData[i];
          }
          for (let i = 0; i < res.data?.length; i++) {
            newData[prevData.length + i] = res.data[i];
          }
          return newData;
        });
      }
    },
  });

  // Expose refetch method through ref
  useImperativeHandle(ref, () => ({
    refetch: refetch
  }));

  // Reset page and refetch when search or payload changes
  useEffect(() => {
    setPage(1);
    refetch();
  }, [search, props.payload]);

  // Handle loading more data
  const handleLoadMore = () => {
    if (!isFetchingMore && page < data?.last_page) {
      setIsFetchingMore(true);
      setPage((prevPage) => prevPage + 1);
    }
  };

  // Handle loading more effect
  useEffect(() => {
    if (isFetchingMore) {
      refetch().finally(() => setIsFetchingMore(false));
    }
  }, [isFetchingMore]);

  // Invalidate query when data is empty
  useEffect(() => {
    if (!data.data?.length) queryClient.invalidateQueries([props.url]);
  }, [data]);

  // Handle scroll events
  const handleScroll = (event) => {
    // Add scroll handling logic here if needed
  };

  // Handle search submit
  const onSearchSubmit = handleSubmit((data) => {
    setSearch(data.search);
    setPage(1);
  });



  return (
    <View className="flex-1 p-4" style={props.style}>
      <SearchForm
        control={control}
        onSubmit={onSearchSubmit}
        isLoading={isFetching}
        handleSearch={handleSearch} // Pastikan handleSearch diteruskan
      />
      <ListContent
        isFetching={isFetching}
        page={page}
        dataList={dataList}
        renderItem={props.renderItem}
        handleLoadMore={handleLoadMore}
        handleScroll={handleScroll}
        cardData={cardData}
        isFetchingMore={isFetchingMore}
      />
      <View className="mt-2 ">
        <Text className="text-gray-600 text-center font-poppins-regular">
          Menampilkan {data?.from} sampai {data?.to} dari {data?.total} hasil
        </Text>
      </View>
    </View>
  );
});

export default memo(Paginate);