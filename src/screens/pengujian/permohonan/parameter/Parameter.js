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
  Touchable,
  Dimensions,
  Modal,
  ScrollView,
} from "react-native";
import Checkbox from "@react-native-community/checkbox";
// import IonIcons from "react-native-vector-icons/Ionicons";
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
import { debounce } from "lodash";
import { Skeleton } from "@rneui/themed";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import IonIcons from "react-native-vector-icons/Ionicons";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";

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

    // useEffect(() => {
    //   refetch();
    // }, [search, page, payload]);

    useEffect(() => {
      // Hanya refetch jika payload berubah dan halaman adalah 1
      if (page === 1) {
        refetch();
      }
    }, [JSON.stringify(payload)]);
    useEffect(() => {
      if (!data.data?.length) queryClient.invalidateQueries([url]);
    }, [data]);

    const debouncedSearch = useCallback(
      debounce(value => {
        setSearch(value);
        setPage(1);
      }, 800),
      [],
    );

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
        <View className="mb-1">
          <Controller
            control={control}
            name="search"
            render={({ field: { onChange, value } }) => (
              <View className="relative flex-row items-center">
                <TextInput
                  className="w-full text-base border bg-white px-3 pr-12 border-gray-300 rounded-md text-black"
                  value={value}
                  placeholder="Cari..."
                  placeholderTextColor={"grey"}
                  onChangeText={text => {
                    onChange(text);
                    debouncedSearch(text);
                  }}
                />
                <View className="absolute right-10 h-6 w-px bg-gray-300" />
                <TouchableOpacity
                  className="absolute right-2 p-2 rounded-md justify-center"
                  activeOpacity={0.7}>
                  <Icons name="search" size={18} color={"black"} />
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
        <View>{Plugin && <Plugin />}</View>
      </>
    );

    const ListFooter = () => (
      <View className="flex-row justify-start mt-4 space-x-2 items-center">
        {page > 1 && (
          <>
            <TouchableOpacity
              className="px-3  py-2 rounded-lg border "
              style={{ borderColor: "#252a61" }}
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
                  width={350}
                  LinearGradientComponent={LinearGradient}
                  height={50}
                />
                {/* <Skeleton
                  animation="wave"
                  width={50}
                  LinearGradientComponent={LinearGradient}
                  height={50}
                  style={{ marginLeft: 8 }}
                /> */}
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
            <View className="flex-1 justify-center items-center m-4">
              <Image
                source={require("@/assets/images/datanotfound.png")}
                className="w-60 h-60 opacity-60 "
              />
              <Text className="text-gray-500 font-poppins-regular">
                Data Tidak Tersedia
              </Text>
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
  console.log(route);
  const { uuid, uuidPermohonan } = route.params; // Tangkap kedua parameter
  console.log("UUID Titik Uji:", uuid);
  console.log("UUID Permohonan:", uuidPermohonan);
  const { data: titik, refetchTitik } = useTitikPermohonan(uuid);
  const queryClient = useQueryClient();
  const [selectedView, setSelectedView] = useState("selected");
  const [isLoadingPaket, setIsLoadingPaket] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState([]);
  const [typeModal, setTypeModal] = useState(false);

  // const menuOptions = [
  //   { label: "Parameter Yang Terpilih", value: "selected" },
  //   { label: "Daftar Peraturan", value: "peraturan" },
  //   { label: "Daftar Paket Dan Parameter", value: "paket_parameter" },
  // ];
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
      // queryClient.invalidateQueries([
      //   `/permohonan/titik/${uuid}/parameter`,
      //   { uuid: uuid },
      // ]);
      // queryClient.invalidateQueries([
      //   `/permohonan/titik/${uuid}`
      // ])
      navigation.navigate("TitikUji", { uuid: uuidPermohonan });
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

  const handleFilterPress = () => {
    setTypeModal(true);
  };

  const [type, setType] = useState("selected");
  const TypePicker = ({ visible, onClose, onSelect, selectedType }) => {
    const [tempType, setTempType] = useState(selectedType);

    const menuOptions = [
      { label: "Parameter Yang Terpilih", value: "selected" },
      { label: "Daftar Peraturan", value: "peraturan" },
      { label: "Daftar Paket Dan Parameter", value: "paket_parameter" },
    ];

    useEffect(() => {
      if (visible) {
        setTempType(selectedType);
      }
    }, [visible]);

    const handleConfirm = () => {
      if (tempType) {
        onSelect(tempType);
        onClose();
      }
    };

    const canConfirm = tempType;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}>
        <View style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Tipe</Text>
              <TouchableOpacity onPress={onClose}>
                <MaterialIcons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <View className="">
              <View className="flex-col items-center justify-center">
                <ScrollView className="max-h-64">
                  {menuOptions.map(option => (
                    <TouchableOpacity
                      key={option.value}
                      value={selectedView}
                      className={`mt-2 justify-center items-center ${
                        tempType === option.value
                          ? "bg-[#ececec] p-3 rounded-md"
                          : ""
                      }`}
                      onPress={() => setTempType(option.value)}>
                      <Text className="text-black font-poppins-semibold my-1">
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View className="mt-4 px-4">
              <TouchableOpacity
                className={`py-3 rounded-md ${
                  canConfirm ? "bg-blue-500" : "bg-gray-300"
                }`}
                disabled={!canConfirm}
                onPress={handleConfirm}>
                <Text className="text-white text-center font-poppins-semibold">
                  Terapkan Filter
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const handleTypeChange = newType => {
    setType(newType); // Update type
    setSelectedView(newType); // Update selectedView juga
  };

  const renderPeraturan = ({ item }) => (
    <View
      className="rounded-lg  flex-row p-3 my-1  border "
      style={{ borderColor: item.selected ? "#252a61" : "#9e9e9e" }}>
      <View className="w-full h-full   flex-row  justify-between  ">
        <View className="justify-center   items-center  ">
          {(!titik?.save_parameter || titik.status <= 1) && (
            <Checkbox
              value={item.selected}
              onValueChange={() => {
                if (item.selected) {
                  throttledRemovePeraturan(item.uuid);
                } else {
                  throttledAddPeraturan(item.uuid);
                }
              }}
              tintColors={{ true: "#252a61", false: "#9e9e9e" }}
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                marginRight: 10,
              }}
            />
          )}
        </View>
        <View className="w-64">
          <Text className="text-black text-sm font-poppins-regular ">
            {item.nama}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderParameter = ({ item }) => (
    <View
      style={{
        flexDirection: "row",
        borderColor: "#9e9e9e",
      }}
      className="px-2 py-4 w-full rounded-lg mt-1  border-[1px]  ">
      {/* <View className="justify-center items-center">
        <Image
          source={require("../../../../../assets/images/zat.png")}
          className=" h-24 w-24 rounded-md "
        />
      </View> */}

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

  const renderSelectedParameter = ({ item }) => {
    const isSelected = item.selected !== false;

    return (
      <View
        className="p-3 rounded-lg my-1 flex-row border"
        style={{
          borderColor: isSelected ? "#252a61" : "#9e9e9e",
        }}>
        <View className="w-full h-full flex-row justify-between">
          <View className="justify-center items-center">
            {(!titik?.save_parameter || titik.status <= 1) && (
              <Checkbox
                value={isSelected}
                onValueChange={() => {
                  throttledRemoveParameter(item.uuid);
                }}
                tintColors={{ true: "#252a61", false: "#9e9e9e" }}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  marginRight: 10,
                }}
              />
            )}
          </View>
          <View className="flex-col w-64 justify-start items-start">
            <Text className="text-black text-left font-poppins-regular">
              {item.nama}
            </Text>
            <Text className="text-black text-center">
              {rupiah(item.titik_permohonans[0].pivot.harga)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderSectionHeader = (
    title,
    viewType,
    showFilter = true,
    hideFilter = false,
  ) => (
    <View className="flex-row justify-between items-center px-4 py-2 mt-4">
      <Text className="text-black font-poppins-semibold text-3xl flex-1">
        {title}
      </Text>
      {showFilter && !hideFilter && (
        <View style={{ width: 50, height: 50 }} className="ml-2">
          <TypePicker
            visible={typeModal}
            onClose={() => setTypeModal(false)}
            onSelect={handleTypeChange}
            selectedType={type}
          />
          <TouchableOpacity
            className="flex-row bg-[#f8f8f8] rounded-lg"
            onPress={handleFilterPress}>
            <FontAwesome5Icon
              name="list"
              size={26}
              style={{ color: "black", marginLeft: 15 }}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderPaketSection = () => {
    if (isPaketFetching || loadingPackages.length > 0) {
      return renderLoadingPackages();
    }

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
          className="rounded-lg w-full p-3 flex-row  my-1 border "
          style={{
            borderColor: isSelected ? "#252a61" : "#9e9e9e",
          }}>
          <View className="justify-between w-full h-full flex-row">
            <View className="justify-center items-center">
              <Checkbox
                value={isSelected}
                onValueChange={() => {
                  if (isSelected) {
                    throttledRemoveFromPaket(paket.id);
                  } else {
                    throttledStoreFromPaket(paket.id);
                  }
                }}
                tintColors={{ true: "#252a61", false: "#9e9e9e" }}
                style={{
                  width: 24, // atur ukuran
                  height: 24, // atur ukuran
                  borderRadius: 12, // ini yang membuat rounded/lingkaran
                  marginRight: 10,
                }}
              />
            </View>

            <View className="flex-col gap-y-2 mx-2 w-64">
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
          </View>
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
            <View className="rounded-3xl m-4 ">
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
          <View className="rounded-3xl m-4 ">
            <View>
              {renderSectionHeader(
                "Paket Tersedia",
                "paket",
                selectedView === "paket_parameter" || true,
              )}
              <View className="px-3 py-4">{renderPaketSection()}</View>
            </View>
          </View>
        )}

        {/* Render Available Parameters Section */}
        {shouldRenderView("available") && (
          <View className="rounded-3xl m-4 ">
            <View className="">
              {renderSectionHeader(
                "Parameter Tersedia",
                "available",
                selectedView === "paket_parameter",
                true,
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
          <View className=" m-4 rounded-3xl">
            <View>
              {renderSectionHeader("Parameter Yang Dipilih", "selected")}
              <Paginates
                url={`/permohonan/titik/${uuid}/parameter`}
                renderItem={renderSelectedParameter}
              />
              <Text className="font-poppins-semibold text-black text-base text-center">
                Total Harga: {rupiah(titik?.harga)}
              </Text>
              <View className="m-4">
                {(!titik?.save_parameter || titik.status <= 1) && (
                  <TouchableOpacity
                    className="rounded-3xl p-3 "
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
    <View className="flex-1 bg-[#ececec] w-full h-full p-3">
      <View className="bg-[#f8f8f8] w-full h-full rounded-3xl">
        <View
          className="flex-row  justify-between pt-5 px-4 pb-1"
          // style={{ borderBottomWidth: 0.5 }}
        >
          <IonIcons
            name="chevron-back"
            size={24}
            color={"black"}
            style={{ marginRight: 8 }}
            onPress={() => navigation.navigate("TitikUji", {uuid: uuidPermohonan})}
          />

          <Text className="font-poppins-semibold text-black text-lg text-end ">
            {/* {titik?.lokasi} :  */}
            Pilih Peraturan / Parameter
          </Text>
        </View>
        <View className="pb-8 rounded-3xl">
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
  roundedWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#4946eb",
    alignItems: "center",
    justifyContent: "center",
  },
  checkbox: {
    width: 18,
    height: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: Dimensions.get("window").height * 0.7,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    fontFamily: "Poppins-SemiBold",
  },
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
