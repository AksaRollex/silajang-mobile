import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  Image,
} from "react-native";
import IonIcons from "react-native-vector-icons/Ionicons";
import RNPickerSelect from "react-native-picker-select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import axios from "@/src/libs/axios";
import { Colors } from "react-native-ui-lib";
import Back from "@/src/screens/components/Back";
import { useTitikPermohonan } from "@/src/services/useTitikPermohonan";
import { rupiah } from "@/src/libs/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useSendParameter } from "@/src/hooks/useSendParameter";
import Icons from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import { Skeleton } from "@rneui/themed";

// PAGINATE
const Paginates = forwardRef(
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
    const cardData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

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
            <Icons name="search" size={18} color={"white"} />
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
              <Icons name="chevrons-left" size={18} color="#312e81" />
            </TouchableOpacity>
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
            <TouchableOpacity
              className="px-3 py-2 mx-2 rounded-md border border-indigo-900"
              onPress={() => setPage(data.last_page)}>
              <Icons name="chevrons-right" size={18} color="#312e81" />
            </TouchableOpacity>
          </>
        )}
      </View>
    );

    if (isFetching && showLoading) {
      return (
        <View className="mt-4 mb-10">
          <View>
            <View LinearGradientComponent={LinearGradient}>
              <View className="flex-row flex justify-center items-center">
                <Skeleton
                  animation="wave"
                  width={290}
                  LinearGradientComponent={LinearGradient}
                  height={50}
                />
                <Skeleton
                  animation="wave"
                  width={50}
                  LinearGradientComponent={LinearGradient}
                  height={50}
                  style={{ marginLeft: 8 }}
                />
              </View>
            </View>
          </View>

          {/* Bagian yang ter-looping menggunakan cardData.map() */}
          {cardData.map((item, index) => (
            <View
              key={index}
              style={{
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 4,
              }}>
              <View>
                <View className=" ">
                  <View LinearGradientComponent={LinearGradient}>
                    <Skeleton
                      animation="wave"
                      width={350}
                      LinearGradientComponent={LinearGradient}
                      height={150}
                    />
                    <View
                      style={{
                        position: "absolute",
                        top: "5%",
                        left: "5%",
                      }}>
                      <View className="flex-row">
                        <Skeleton
                          animation="wave"
                          width={120}
                          LinearGradientComponent={LinearGradient}
                          height={120}
                        />
                        <Skeleton
                          animation="wave"
                          width={150}
                          LinearGradientComponent={LinearGradient}
                          height={70}
                          style={{ marginLeft: 8 }}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      );
    }

    return (
      <View className="flex-1 p-4 " {...props}>
        <ListHeader />
        <FlatList
          data={data.data}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={() => (
            <View className="flex-1 justify-center items-center mx-2">
              <Text className="text-gray-500 font-poppins-regular">Data Tidak Tersedia</Text>
            </View>
          )}
        />
        <ListFooter />
      </View>
    );
  },
);

const renderLoadingPackages = () => {
  return Array(1)
    .fill(0)
    .map((_, index) => (
      <View
        key={`loading-${index}`}
        style={{
          marginVertical: 4,
          padding: 8,
        }}>
        <View LinearGradientComponent={LinearGradient}>
          <Skeleton
            animation="wave"
            width={350}
            LinearGradientComponent={LinearGradient}
            height={150}
          />
          <View
            style={{
              position: "absolute",
              top: "5%",
              left: "5%",
            }}>
            <View className="flex-row">
              <Skeleton
                animation="wave"
                width={120}
                LinearGradientComponent={LinearGradient}
                height={120}
              />
              <View className="ml-2">
                <Skeleton
                  animation="wave"
                  width={150}
                  LinearGradientComponent={LinearGradient}
                  height={20}
                  style={{ marginBottom: 8 }}
                />
                <Skeleton
                  animation="wave"
                  width={100}
                  LinearGradientComponent={LinearGradient}
                  height={20}
                  style={{ marginBottom: 8 }}
                />
                <Skeleton
                  animation="wave"
                  width={130}
                  LinearGradientComponent={LinearGradient}
                  height={20}
                />
              </View>
            </View>
          </View>
        </View>
      </View>
    ));
};
const throttle = (func, limit) => {
  let lastRun = 0;
  let timeout = null;

  return function (...args) {
    const context = this;
    const now = Date.now();

    // Clear existing timeout
    if (timeout) {
      clearTimeout(timeout);
    }

    // If it's first run or enough time has elapsed
    if (!lastRun || now - lastRun >= limit) {
      func.apply(context, args);
      lastRun = now;
    } else {
      // Schedule next execution
      timeout = setTimeout(() => {
        func.apply(context, args);
        lastRun = Date.now();
        timeout = null;
      }, limit - (now - lastRun));
    }
  };
};

const Parameter = ({ route, navigation }) => {
  const { uuid } = route.params;
  console.log("cihuy: ", uuid);
  const { data: titik, refetchTitik } = useTitikPermohonan(uuid);
  const queryClient = useQueryClient();
  const [selectedView, setSelectedView] = useState("selected");
  const [isLoadingPaket, setIsLoadingPaket] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState([]);

  const menuOptions = [
    { label: "Parameter Yang Terpilih", value: "selected" },
    { label: "Daftar Peraturan", value: "peraturan" },
    // { label: "Pilih Paket", value: "paket" },
    // { label: "Parameter Tersedia", value: "available" },
    { label: "Daftar Paket Dan Parameter", value: "paket_parameter" },
  ];
  const shouldRenderView = viewType => {
    if (selectedView === "paket_parameter") {
      return viewType === "paket" || viewType === "available";
    }
    return selectedView === viewType;
  };

  const invalidateQueries = () => {
    queryClient.invalidateQueries(`/permohonan/titik/${uuid}/parameter`);
  };

  const {
    Save: SaveParameter,
    SaveConfirmationModal,
    SuccessOverlayModal,
    FailedOverlayModal,
  } = useSendParameter({
    onSuccess: () => {
      queryClient.invalidateQueries([
        `/permohonan/titik/${uuid}/parameter`,
        { uuid: uuid },
      ]);
    },
    onError: error => {
      console.log("Save error : ", error);
    },
  });

  const handleSave = () => {
    SaveParameter(`/permohonan/titik/${uuid}/save-parameter`);
  };

  const { data: selectedParameter } = useQuery({
    queryKey: ["selectedParameter", uuid],
    queryFn: () =>
      axios
        .get(`/permohonan/titik/${uuid}/parameter`)
        .then(res => res.data.data),
  });

  // GET PAKET
  const { data: pakets = [], isFetching: isPaketFetching } = useQuery({
    queryKey: ["pakets"],
    queryFn: async () => {
      try {
        const response = await axios.get("/master/paket");
        // Pastikan selalu mengembalikan array
        const responseData = response.data?.data;
        return Array.isArray(responseData) ? responseData : [];
      } catch (error) {
        console.error("Error fetching pakets:", error);
        return [];
      }
    },
    // Tambahkan initial data untuk memastikan selalu ada nilai default
    initialData: [],
  });

  const addPeraturan = useMutation(
    peraturanUuid =>
      axios.post(`/permohonan/titik/${uuid}/peraturan/store`, {
        uuid: peraturanUuid,
      }),
    {
      onSuccess: () => {
        invalidateQueries();
      },
    },
  );

  const removePeraturan = useMutation(
    peraturanUuid =>
      axios.post(`/permohonan/titik/${uuid}/peraturan/destroy`, {
        uuid: peraturanUuid,
      }),
    {
      onSuccess: () => {
        invalidateQueries();
      },
    },
  );

  const addParameter = useMutation(
    parameterUuid =>
      axios.post(`/permohonan/titik/${uuid}/parameter/store`, {
        uuid: parameterUuid,
      }),
    {
      onSuccess: () => {
        invalidateQueries();
      },
    },
  );

  const removeParameter = useMutation(
    parameterUuid =>
      axios.post(`/permohonan/titik/${uuid}/parameter/destroy`, {
        uuid: parameterUuid,
      }),
    {
      onSuccess: () => {
        invalidateQueries();
      },
    },
  );

  const storeFromPaket = useMutation(
    paketId =>
      axios.post(`/permohonan/titik/${uuid}/parameter/store/paket`, {
        paket_id: paketId,
      }),
    {
      onMutate: paketId => {
        // Start loading state
        setLoadingPackages(prev => [...prev, paketId]);

        // Simpan state sebelumnya
        const previousPakets = queryClient.getQueryData(["pakets"]);

        // Update cache dengan tetap mempertahankan struktur array
        queryClient.setQueryData(["pakets"], old => {
          if (Array.isArray(old)) {
            return old.map(paket => ({
              ...paket,
              isLoading: paket.id === paketId,
            }));
          }
          return old;
        });

        return { previousPakets };
      },
      onError: (err, paketId, context) => {
        // Kembalikan ke state sebelumnya jika error
        queryClient.setQueryData(["pakets"], context.previousPakets);
        setLoadingPackages(prev => prev.filter(id => id !== paketId));
      },
      onSettled: async (data, error, paketId) => {
        setLoadingPackages(prev => prev.filter(id => id !== paketId));

        // Refresh data
        await queryClient.invalidateQueries(["pakets"]);
        await queryClient.invalidateQueries(
          `/permohonan/titik/${uuid}/parameter`,
        );
      },
    },
  );

  const removeFromPaket = useMutation(
    paketId =>
      axios.post(`/permohonan/titik/${uuid}/parameter/destroy/paket`, {
        paket_id: paketId,
      }),
    {
      onMutate: paketId => {
        setLoadingPackages(prev => [...prev, paketId]);

        // Set loading state untuk paket
        queryClient.setQueryData(["pakets"], old => ({
          ...old,
          isFetching: true,
        }));

        // Set loading state untuk parameter
        queryClient.setQueryData(
          [`/permohonan/titik/${uuid}/parameter`],
          old => ({
            ...old,
            isFetching: true,
          }),
        );
      },
      onSettled: async (data, error, paketId) => {
        await new Promise(resolve => setTimeout(resolve, 800));

        setLoadingPackages(prev => prev.filter(id => id !== paketId));

        // Invalidate dan refresh queries
        await Promise.all([
          queryClient.invalidateQueries(["pakets"]),
          queryClient.invalidateQueries(`/permohonan/titik/${uuid}/parameter`),
        ]);

        await Promise.all([
          queryClient.refetchQueries(["pakets"]),
          queryClient.refetchQueries([`/permohonan/titik/${uuid}/parameter`]),
        ]);
      },
    },
  );

  const throttledAddPeraturan = useCallback(
    throttle(uuid => {
      if (!addPeraturan.isLoading) {
        addPeraturan.mutate(uuid, {
          onSuccess: () => {
            console.log("Peraturan added successfully");
          },
          onError: error => {
            console.error("Error adding peraturan:", error);
          },
        });
      }
    }, 1500),
    [addPeraturan],
  );

  const throttledRemovePeraturan = useCallback(
    throttle(uuid => {
      if (!removePeraturan.isLoading) {
        removePeraturan.mutate(uuid, {
          onSuccess: () => {
            console.log("Peraturan removed successfully");
          },
          onError: error => {
            console.error("Error removing peraturan:", error);
          },
        });
      }
    }, 1500),
    [removePeraturan],
  );

  const throttledAddParameter = useCallback(
    throttle(uuid => {
      if (!addParameter.isLoading) {
        addParameter.mutate(uuid, {
          onSuccess: () => {
            console.log("Parameter added successfully");
          },
          onError: error => {
            console.error("Error adding parameter:", error);
          },
        });
      }
    }, 1500),
    [addParameter],
  );

  const throttledRemoveParameter = useCallback(
    throttle(uuid => {
      if (!removeParameter.isLoading) {
        removeParameter.mutate(uuid, {
          onSuccess: () => {
            console.log("Parameter removed successfully");
          },
          onError: error => {
            console.error("Error removing parameter:", error);
          },
        });
      }
    }, 1500),
    [removeParameter],
  );

  const throttledStoreFromPaket = useCallback(
    throttle(uuid => {
      if (!storeFromPaket.isLoading) {
        storeFromPaket.mutate(uuid, {
          onSuccess: () => {
            console.log("Package added successfully");
          },
          onError: error => {
            console.error("Error adding package:", error);
          },
        });
      }
    }, 1500),
    [storeFromPaket],
  );

  const throttledRemoveFromPaket = useCallback(
    throttle(async id => {
      if (!isLoadingPaket.includes(id)) {
        try {
          await removeFromPaket.mutateAsync(id);
        } catch (error) {
          console.error("Error removing package:", error);
          // Remove loading state in case of error
          setIsLoadingPaket(prev => prev.filter(loadingId => loadingId !== id));
        }
      }
    }, 1500),
    [removeFromPaket, isLoadingPaket],
  );

  const renderPeraturan = ({ item }) => (
    <View
      className="rounded-sm flex-row px-2 py-4   mt-1"
      style={{
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        flexDirection: "row",
        shadowRadius: 3.84,
        backgroundColor: item.selected ? "#fbcfe8" : "#c7d2fe",
      }}>
      <View
        style={[
          item.selected
            ? styles.roundedBackgroundSelected
            : styles.roundedBackgrounds,
        ]}
      />

      <View className="justify-center items-center">
        <Image
          source={require("../../../../../assets/images/peraturan.png")}
          className=" h-24 w-24 rounded-md "
        />
      </View>
      <View className="w-52 mx-2 flex justify-start items-start">
        <Text className="text-black text-left text-sm font-poppins-regular">
          {item.nama}
        </Text>
      </View>
      {(!titik?.save_parameter || titik.status <= 1) && (
        <TouchableOpacity
          className="text-white px-1 rounded-md absolute bottom-4 right-1"
          onPress={() =>
            item.selected
              ? throttledRemovePeraturan(item.uuid)
              : throttledAddPeraturan(item.uuid)
          }>
          <Text
            style={{
              color: item.selected ? "white" : "white",
              backgroundColor: Colors.brand,
            }}
            className="px-2 py-1 rounded-md font-poppins-semibold  ">
            {item.selected ? "-" : "+"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderParameter = ({ item }) => (
    <View
      style={{
        flexDirection: "row",
      }}
      className="bg-[#c7d2fe] px-2 py-4 w-full rounded-md mt-1 ">
      <View style={styles.roundedBackgrounds}></View>
      <View className="justify-center items-center">
        <Image
          source={require("../../../../../assets/images/zat.png")}
          className=" h-24 w-24 rounded-md "
        />
      </View>
      <View className="flex-col gap-y-2 mx-2">
        <Text className="text-black justify-center items-start font-poppins-regular">
          {item.nama}
        </Text>
        <Text className="text-black font-poppins-regular">
          {rupiah(item.harga)}
        </Text>
      </View>
      {(!titik?.save_parameter || titik.status <= 1) && (
        <TouchableOpacity
          onPress={() => throttledAddParameter(item.uuid)}
          className="   rounded-md absolute bottom-5 right-2">
          <Text
            style={{ backgroundColor: Colors.brand }}
            className="text-white text-lg px-2 rounded-md font-poppins-semibold ">
            +
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderSelectedParameter = ({ item }) => (
    <View
      style={{
        flexDirection: "row",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
      }}
      className="bg-[#fbcfe8]  px-2 py-4 rounded-lg mt-1 flex ">
      <View style={styles.roundedBackgroundSelected} />

      <View className="justify-center items-center">
        <Image
          source={require("../../../../../assets/images/zat.png")}
          className=" h-24 w-24 rounded-md "
        />
      </View>
      <View className="flex-col gap-y-2  justify-start items-start mx-2">
        <Text className="text-black text-left font-poppins-regular ">
          {item.nama}
        </Text>
        <Text className="text-black text-center">
          {rupiah(item.titik_permohonans[0].pivot.harga)}
        </Text>
      </View>

      {(!titik?.save_parameter || titik.status <= 1) && (
        <TouchableOpacity
          onPress={() => throttledRemoveParameter(item.uuid)}
          className=" px-2  rounded-md absolute bottom-5 right-2"
          style={{ backgroundColor: Colors.brand }}>
          <Text
            style={{ color: "white" }}
            className="text-lg font-poppins-regular">
            -
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderSectionHeader = (title, viewType, showFilter = true) => (
    <View className="flex-row justify-between items-center px-4 py-2 mt-4">
      <Text className="text-black font-poppins-semibold text-3xl flex-1">
        {title}
      </Text>
      {showFilter && (
        <View style={{ width: 50, height: 50 }} className="ml-2">
          <RNPickerSelect
            items={menuOptions}
            useNativeAndroidPickerStyle={false} // Menonaktifkan ikon default pada Android
            value={selectedView}
            onValueChange={value => setSelectedView(value)}
            style={{
              inputIOS: {
                fontSize: 16,
                height: 70,
                width: 70,
                color: "black",
              },
              inputAndroid: {
                fontSize: 16,
                color: "#e2e8f0",
                height: 70,
                width: 70,
                marginTop: -15,
              },
            }}
            Icon={() => (
              <IonIcons
                name="filter"
                size={30}
                color="black"
                // style={{ marginTop: 12, marginRight: 12 }}
              />
            )}
          />
        </View>
      )}
    </View>
  );

  const renderPaketSection = () => {
    if (isPaketFetching || loadingPackages.length > 0) {
      return renderLoadingPackages();
    }

    // Pastikan pakets selalu array
    const paketsArray = Array.isArray(pakets) ? pakets : [];

    if (paketsArray.length === 0) {
      return (
        <View className="p-4">
          <Text className="text-black text-center">
            Tidak ada paket tersedia
          </Text>
        </View>
      );
    }

    return pakets.map(paket => {
      const isSelected = !!titik?.pakets?.find(p => p.id === paket.id);
      return (
        <View
          key={paket.id}
          className="rounded-md w-full px-2 flex-row py-4 mt-1"
          style={{
            elevation: 5,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.8,
            shadowRadius: 2,
            backgroundColor: isSelected ? "#fbcfe8" : "#c7d2fe",
          }}>
          <View
            style={
              isSelected
                ? styles.roundedBackgroundSelected
                : styles.roundedBackgrounds
            }
          />
          <View className="justify-center items-center">
            <Image
              source={require("../../../../../assets/images/bundle.png")}
              className="h-24 w-24 rounded-md"
            />
          </View>
          <View className="flex-col gap-y-2 mx-2 w-3/5">
            <Text className="text-black font-poppins-regular">
              {paket.nama}
            </Text>
            <Text className="text-black font-poppins-regular">
              {rupiah(paket.harga)}
            </Text>
            <Text className="text-black font-poppins-regular">
              {paket.parameters?.map(param => param.nama)?.join(", ") || ""}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              { backgroundColor: Colors.brand },
              { position: "absolute", bottom: 20, right: 8 },
            ]}
            className="px-2 rounded-md"
            onPress={() => {
              if (isSelected) {
                throttledRemoveFromPaket(paket.id);
              } else {
                throttledStoreFromPaket(paket.id);
              }
            }}>
            <Text className="text-lg text-white font-poppins-semibold">
              {isSelected ? "-" : "+"}
            </Text>
          </TouchableOpacity>
        </View>
      );
    });
  };

  const renderContent = () => {
    return (
      <View className="rounded-md">
        {/* Render Peraturan Section */}
        {shouldRenderView("peraturan") && (
          <>
            <View
              className="rounded-md m-4 bg-[#f8f8f8]"
              style={{
                elevation: 5,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.8,
                shadowRadius: 2,
              }}>
              <View style={styles.roundedBackground}></View>
              <View className="">
                {renderSectionHeader(
                  "Pilih Berdasarkan Peraturan",
                  "peraturan",
                )}
                <Paginates
                  url={`/permohonan/titik/${uuid}/peraturan`}
                  renderItem={renderPeraturan}
                />
              </View>
            </View>
          </>
        )}

        {/* Render Paket Section */}
        {shouldRenderView("paket") && (
          <View
            className="rounded-md m-4 bg-[#f8f8f8]"
            style={{
              elevation: 5,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.8,
              shadowRadius: 2,
            }}>
            <View style={styles.roundedBackground} />
            <View>
              {renderSectionHeader(
                "Paket Tersedia",
                "paket",
                selectedView !== "paket_parameter" || true,
              )}
              <View className="px-3 py-4">{renderPaketSection()}</View>
            </View>
          </View>
        )}

        {/* Render Available Parameters Section */}
        {shouldRenderView("available") && (
          <View
            className="rounded-md  m-4 bg-[#f8f8f8]"
            style={{
              elevation: 5,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.8,
              shadowRadius: 2,
            }}>
            <View style={styles.roundedBackground}></View>

            <View className="">
              {renderSectionHeader(
                "Parameter Tersedia",
                "available",
                selectedView !== "paket_parameter",
              )}
              <View className=" rounded-md">
                <Paginates
                  url="/master/parameter"
                  renderItem={renderParameter}
                  payload={{ except: selectedParameter }}
                />
              </View>
            </View>
          </View>
        )}

        {/* Render Selected Parameters Section */}
        {shouldRenderView("selected") && (
          <View
            className="rounded-md bg-[#ececec] m-4"
            style={{
              elevation: 5,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
            }}>
            <View style={styles.roundedBackground}></View>
            <View>
              {renderSectionHeader("Parameter Yang Dipilih", "selected")}
              <Paginates
                url={`/permohonan/titik/${uuid}/parameter`}
                renderItem={renderSelectedParameter}
              />
              <Text className="font-poppins-semibold text-black  text-center">
                Total Harga: {rupiah(titik?.harga)}
              </Text>
              <View className="m-4">
                {(!titik?.save_parameter || titik.status <= 1) && (
                  <TouchableOpacity
                    className="rounded-md p-3 "
                    style={{
                      backgroundColor: Colors.brand,
                      alignItems: "center",
                    }}
                    onPress={handleSave}>
                    <Text className="font-poppins-semibold text-base text-white">
                      SIMPAN & KIRIM
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-[#ececec] p-3">
      <View className="bg-[#f8f8f8] w-full h-full rounded-md">
        <View
          className=" px-2 pt-4 bg-[#f8f8f8] flex-row flex items-center justify-between flex-wrap "
          // style={{ borderBottomWidth: 0.5 }}
        >
          <Back
            size={24}
            color="black"
            action={() => navigation.goBack()}
            style={{ marginLeft: 12 }}
          />

          <Text className="font-poppins-semibold text-black text-base ">
            {titik?.lokasi} : Pilih Peraturan / Parameter
          </Text>
        </View>
        <View className="h-full w-full bg-[#f8f8f8] pb-8 rounded-md">
          <FlatList
            data={[1]}
            renderItem={() => <View className="">{renderContent()}</View>}
            keyExtractor={() => "main"}
            contentContainerStyle={{ flexGrow: 1 }}
          />
        </View>
      </View>
      <SaveConfirmationModal />
      <FailedOverlayModal />
      <SuccessOverlayModal />
    </View>
  );
};

const styles = StyleSheet.create({
  roundedBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#e2e8f0", // Background color
    borderBottomRightRadius: 100, // Adjust as needed
    zIndex: -1, // Ensure background is behind the content
  },
  roundedBackgrounds: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#eef2ff", // Background color
    borderBottomRightRadius: 100, // Adjust as needed
    zIndex: -1, // Ensure background is behind the content
  },
  roundedBackgroundSelected: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fce7f3", // Background color
    borderBottomRightRadius: 100, // Adjust as needed
    zIndex: -1, // Ensure background is behind the content
  },
  roundedBackgroundReady: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#ddead1", // Background color
    borderBottomRightRadius: 100, // Adjust as needed
    zIndex: -1, // Ensure background is behind the content
  },
});

export default Parameter;
