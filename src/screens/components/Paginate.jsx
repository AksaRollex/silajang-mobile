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
  Dimensions,
  StyleSheet,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/src/libs/axios";
import { Skeleton } from "@rneui/themed";
import LinearGradient from "react-native-linear-gradient";
import { debounce } from "lodash";
import Icons from "react-native-vector-icons/Feather";
import FooterText from "./FooterText";
const windowWidth = Dimensions.get("window").width;
// Aktivasi LayoutAnimation di Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Paginate = forwardRef(
  (
    { url, payload, renderItem, Plugin, isExternalLoading = false, ...props },
    ref,
  ) => {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [dataList, setDataList] = useState([]);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const { control, handleSubmit } = useForm();
    const cardData = [1, 2, 3];

    const { data, isFetching, refetch, isLoading } = useQuery({
      queryKey: [url, page, search, payload],
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
      console.log(payload);
    }, [data]);

    useEffect(() => {
      console.log("Payload changed:", payload);
      refetch();
    }, [JSON.stringify(payload)]);

    useImperativeHandle(ref, () => ({
      refetch,
    }));

    useEffect(() => {
      // Hanya refetch jika payload berubah dan halaman adalah 1
      if (page === 1) {
        refetch();
      }
    }, [JSON.stringify(payload)]);

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

    const handleScroll = event => {
      const scrollOffset = event.nativeEvent.contentOffset.y;
      if (scrollOffset <= 0 && page > 1) {
        setPage(1);
      }
    };

    const handleSearch = query => {
      setSearch(query);

      // Reset halaman ke 1 agar data baru dimuat dari awal
      setPage(1);

      // Refetch data dengan query baru
      refetch();
    };

    const ListHeader = () => (
      <>
        <View className=" mb-1 ">
          <Controller
            control={control}
            name="search"
            render={({ field: { onChange, value } }) => (
              <View
                className={`relative ${
                  Boolean(props.plugan)
                    ? "flex-col justify-center"
                    : "flex-row items-center"
                }`}>
                <View className={props.plugan ? "" : "flex-1 relative"}>
                  <TextInput
                    className="w-full text-base border bg-white pr-12 text-black border-gray-300 rounded-md px-4 "
                    value={value}
                    placeholderTextColor={"grey"}
                    placeholder="Cari..."
                    onChangeText={text => {
                      onChange(text);
                    }}
                    onSubmitEditing={() => {
                      // Panggil fungsi pencarian ketika Enter ditekan
                      handleSearch(value);
                    }}
                  />
                  {/* Button Search */}
                  <TouchableOpacity
                    className="absolute right-2 top-2 -translate-y-1/2 p-2 rounded-md"
                    activeOpacity={0.7}
                    onPress={() => handleSearch(value)}>
                    <Icons name="search" size={18} color={"black"} />
                  </TouchableOpacity>
                </View>
                {/* Plugin Section */}
                <View style={Plugin ? { marginLeft: 10 } : {}}>
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

    const Footer = () => (
      <View style={styles.footer}>
        <View
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}>
          <Text style={styles.footerText}>
            {new Date().getFullYear()} © SI-LAJANG v.3
          </Text>
          <Text style={styles.footerTexts}>UPT LABORATORIUM LINGKUNGAN</Text>
        </View>
        <Text style={styles.footerText}>
          DINAS LINGKUNGAN HIDUP KAB.JOMBANG
        </Text>
      </View>
    );

    // Combine external loading state with internal loading state
    const shouldShowLoading = isExternalLoading || (isFetching && page === 1);

    if (shouldShowLoading) {
      return (
        <View className="mt-5 items-center ">
          {/* search */}
          <View
            className="flex-row justify-between items-center"
            LinearGradientComponent={LinearGradient}
            style={{
              width: "90%",
            }}>
            {!Plugin ? (
              <Skeleton
                animation="wave"
                width={350}
                LinearGradientComponent={LinearGradient}
                height={53}
              />
            ) : (
              <Skeleton
                animation="wave"
                width={210}
                LinearGradientComponent={LinearGradient}
                height={53}
              />
            )}
            {Plugin ? (
              <Skeleton
                animation="wave"
                width={130}
                LinearGradientComponent={LinearGradient}
                height={53}
              />
            ) : null}
          </View>
          {/* card */}
          {cardData.map((item, index) => (
            <View
              key={index}
              style={{
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 12,
              }}>
              <View className="items-center">
                <View LinearGradientComponent={LinearGradient}>
                  <Skeleton
                    animation="wave"
                    width={windowWidth - 60}
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
                source={require("@/assets/images/datanotfound.png")}
                className="w-60 h-60 opacity-60 "
              />
              <Text className="text-gray-500 font-poppins-regular ">
                Data Tidak Tersedia
              </Text>
            </View>
          )}
        />
        <View style={styles.footer}>
          <View
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}>
            <Text style={styles.footerText}>
              {new Date().getFullYear()} © SI-LAJANG v.3
            </Text>
            <Text style={styles.footerTexts}>UPT LABORATORIUM LINGKUNGAN</Text>
          </View>
          <Text style={styles.footerText}>
            DINAS LINGKUNGAN HIDUP KAB.JOMBANG
          </Text>
        </View>
      </View>
    );
  },
);

export default memo(Paginate);
const styles = StyleSheet.create({
  footer: {
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    alignSelf: "center",
    color: "grey",
    fontSize: 10,
    fontFamily: "Poppins-Regular",
  },
  footerTexts: {
    alignSelf: "center",
    color: "grey",
    fontSize: 10,
    fontFamily: "Poppins-Bold",
  },
});
