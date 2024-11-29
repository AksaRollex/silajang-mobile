import React, {
  memo,
  useState,
  useEffect,
  useCallback,
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
  Image,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/src/libs/axios";
import { Skeleton } from "@rneui/themed";
import LinearGradient from "react-native-linear-gradient";
import { debounce } from "lodash";
import Icons from "react-native-vector-icons/Feather";

// Aktivasi LayoutAnimation di Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Paginate = forwardRef(
  ({ url, payload, renderItem, Plugin, Year, ...props }, ref) => {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [dataList, setDataList] = useState([]);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const { control, handleSubmit } = useForm();
    const cardData = [1, 2, 3, 4];

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

    useEffect(() => {
      if (!data.data?.length) queryClient.invalidateQueries([url]);
      console.log(payload)
    }, [data]);

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

    const debouncedSearch = useCallback(
      debounce(value => {
        setSearch(value);
        setPage(1);
      }, 800),
      [],
    );

    useEffect(() => {
      if (isFetchingMore) {
        refetch().finally(() => setIsFetchingMore(false));
      }
    }, [isFetchingMore]);

    // useEffect(() => {
    //   if(!data.data?.length) queryClient.invalidateQueries([url]);
    // }, [data])

    const handleScroll = event => {
      const scrollOffset = event.nativeEvent.contentOffset.y;
      if (scrollOffset <= 0 && page > 1) {
        setPage(1);
      }
    };

    const ListHeader = () => (
      <>
        <View className=" mb-1 ">
          <Controller
            control={control}
            name="search"
            render={({ field: { onChange, value } }) => (
              <View className={`relative ${Boolean(props.plugan) ? "flex-col justify-center" : "flex-row items-center"}`}>
                <View className={props.plugan ? "" : 'flex-1 relative'}>
                  <TextInput
                    className="w-full text-base border bg-white pr-12 text-black border-gray-300 rounded-md px-3"
                    value={value}
                    placeholderTextColor={"grey"}
                    placeholder="Cari..."
                    onChangeText={text => {
                      onChange(text);
                      debouncedSearch(text);
                    }}
                  />
                  {/* Button Search */}
                  <TouchableOpacity
                    className="absolute right-2 top-2 -translate-y-1/2 p-2 rounded-md"
                    activeOpacity={0.7}>
                    <Icons name="search" size={18} color={"black"} />
                  </TouchableOpacity>
                </View>

                {/* Plugin Section */}
                <View style={Plugin ? { marginTop: 5 } : {}}>
                  {Plugin && <Plugin />}
                </View>
              </View>
            )}
          />
        </View>
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
        <View className="mt-5 items-center">
          <View
            className="flex-row justify-between items-center"
            LinearGradientComponent={LinearGradient}
            style={{
              width: "93%", // Slightly smaller to allow padding space
            }}>
            <Skeleton
              animation="wave"
              width={220}
              LinearGradientComponent={LinearGradient}
              height={53}
            />
            <Skeleton
              animation="wave"
              width={75}
              LinearGradientComponent={LinearGradient}
              height={53}
            />
            <Skeleton
              animation="wave"
              width={75}
              LinearGradientComponent={LinearGradient}
              height={53}
            />
          </View>

          {cardData.map((item, index) => (
            <View
              key={index}
              style={{
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center", // Center items vertically
                marginTop: 12,
                width: "90%", // Keeps everything centered
              }}>
              <View className="items-center">
                <View
                  LinearGradientComponent={LinearGradient}
                  style={{
                    width: "100%",
                    alignItems: "center", // Centers skeletons horizontally
                  }}>
                  <Skeleton
                    animation="wave"
                    width={390}
                    LinearGradientComponent={LinearGradient}
                    height={180}
                  />

                  <View
                    style={{
                      position: "absolute",
                      top: "5%",
                      left: "5%",
                    }}>
                    <Skeleton
                      animation="wave"
                      width={80}
                      height={30}
                      LinearGradientComponent={LinearGradient}
                    />
                    <Skeleton
                      animation="wave"
                      width={150}
                      height={32.5}
                      LinearGradientComponent={LinearGradient}
                      style={{ marginTop: 10 }}
                    />
                    <Skeleton
                      animation="wave"
                      width={80}
                      height={30}
                      LinearGradientComponent={LinearGradient}
                      style={{ marginTop: 10 }}
                    />
                    <Skeleton
                      animation="wave"
                      width={150}
                      height={32.5}
                      LinearGradientComponent={LinearGradient}
                      style={{ marginTop: 10 }}
                    />
                  </View>

                  <View
                    style={{
                      position: "absolute",
                      top: "5%",
                      left: "50%",
                    }}>
                    <Skeleton
                      animation="wave"
                      width={80}
                      height={30}
                      LinearGradientComponent={LinearGradient}
                    />
                    <Skeleton
                      animation="wave"
                      width={150}
                      height={32.5}
                      LinearGradientComponent={LinearGradient}
                      style={{ marginTop: 10 }}
                    />
                    <Skeleton
                      animation="wave"
                      width={80}
                      height={30}
                      LinearGradientComponent={LinearGradient}
                      style={{ marginTop: 10 }}
                    />
                    <Skeleton
                      animation="wave"
                      width={150}
                      height={32.5}
                      LinearGradientComponent={LinearGradient}
                      style={{ marginTop: 10 }}
                    />
                  </View>
                </View>

                <View
                  LinearGradientComponent={LinearGradient}
                  style={{
                    width: "5%",
                    position: "absolute",
                    right: 0,
                    top: "80%",
                    alignItems: "center", // Center circles vertically
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
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.5}
          ListFooterComponent={ListFooter}
          ListEmptyComponent={() => (
            <View className="flex-1 justify-center items-center mt-20">
              <Image
                source={require("@/assets/images/pulu.png")}
                className="w-60 h-60 opacity-60 "
              />
              <Text className="text-gray-500 font-poppins-regular ">
                Data Tidak Tersedia
              </Text>
            </View>
          )}
        />
      </View>
    );
  },
);

export default memo(Paginate);
