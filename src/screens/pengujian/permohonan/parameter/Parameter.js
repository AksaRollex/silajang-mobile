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
  ActivityIndicator,
} from "react-native";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import axios from "@/src/libs/axios";
import { Colors } from "react-native-ui-lib";
import Back from "@/src/screens/components/Back";
import { useTitikPermohonan } from "@/src/services/useTitikPermohonan";
import { rupiah } from "@/src/libs/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useSendParameter } from "@/src/hooks/useSendParameter";
import Icon from "react-native-vector-icons/AntDesign";
import Icons from "react-native-vector-icons/Feather";

import { useNavigation } from "@react-navigation/native";

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
              <Icons name="chevrons-right" size={18} color="#312e81" />
            </TouchableOpacity>
          </>
        )}
      </View>
    );

    if (isFetching && showLoading) {
      return (
        <View className="flex-1 justify-center items-center my-2">
          <Text className="text-gray-500 text-sm">
            Loading... Harap Bersabar
          </Text>
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
// Fungsi throttle untuk membatasi frekuensi pemanggilan fungsi
const throttle = (func, limit) => {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

const Parameter = ({ route, navigation }) => {
  const { uuid } = route.params;
  const { data: titik, refetchTitik } = useTitikPermohonan(uuid);
  console.log(titik);
  const [showPeraturan, setShowPeraturan] = useState(false);
  const [showPaket, setShowPaket] = useState(false);

  const queryClient = useQueryClient();
  const invalidateQueries = () => {
    queryClient.invalidateQueries(`/permohonan/titik/${uuid}/parameter`);
  };

  const { Save: SaveParameter, SaveConfirmationModal } = useSendParameter({
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
  const { data: pakets = [] } = useQuery({
    queryKey: ["pakets"],
    queryFn: () => axios.get("/master/paket").then(res => res.data.data),
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
      onSuccess: () => {
        invalidateQueries();
      },
    },
  );

  const removeFromPaket = useMutation(
    paketId =>
      axios.post(`/permohonan/titik/${uuid}/parameter/destroy/paket`, {
        paket_id: paketId,
      }),
    {
      onSuccess: () => {
        invalidateQueries();
      },
    },
  );

  // Menggunakan useCallback dan throttle untuk membatasi frekuensi pemanggilan
  const throttledAddPeraturan = useCallback(
    throttle(uuid => addPeraturan.mutate(uuid), 1500),
    [addPeraturan],
  );

  const throttledRemovePeraturan = useCallback(
    throttle(uuid => removePeraturan.mutate(uuid), 1500),
    [removePeraturan],
  );

  const throttledAddParameter = useCallback(
    throttle(uuid => addParameter.mutate(uuid), 1500),
    [addParameter],
  );

  const throttledRemoveParameter = useCallback(
    throttle(uuid => removeParameter.mutate(uuid), 1500),
    [removeParameter],
  );

  const throttledStoreFromPaket = useCallback(
    throttle(id => storeFromPaket.mutate(id), 1500),
    [storeFromPaket],
  );

  const throttledRemoveFromPaket = useCallback(
    throttle(id => removeFromPaket.mutate(id), 1500),
    [removeFromPaket],
  );

  const renderPeraturan = ({ item }) => (
    <View
      className="rounded-sm flex-row p-2 justify-between bg-[#ececec] drop-shadow-md mt-1"
      style={{ borderWidth: 0.5 }}>
      <View className="w-80">
        <Text className="text-black text-left text-sm">{item.nama}</Text>
      </View>
      <View className="">
        {(!titik?.save_parameter || titik.status <= 1) && (
          <TouchableOpacity
            className="justify-end items-center "
            onPress={() =>
              item.selected
                ? throttledRemovePeraturan(item.uuid)
                : throttledAddPeraturan(item.uuid)
            }>
            <Text
              style={{
                color: item.selected ? "red" : "white",
                backgroundColor: Colors.brand,
              }}
              className="p-2 rounded-sm font-sans text-bold ">
              {item.selected ? "-" : "+"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderParameter = ({ item }) => (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        borderWidth: 0.5,
      }}
      className="bg-[#ececec] p-3 rounded-sm mt-1 items-center">
      <Text className="text-black text-center">{item.nama}</Text>
      <Text className="text-black text-left">{rupiah(item.harga)}</Text>
      {(!titik?.save_parameter || titik.status <= 1) && (
        <TouchableOpacity onPress={() => throttledAddParameter(item.uuid)}>
          <Text
            style={{ backgroundColor: Colors.brand }}
            className="font-bold text-white p-2 rounded-sm font-sans">
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
        justifyContent: "space-between",
        borderWidth: 0.5,
      }}
      className="bg-[#ececec] p-3 rounded-sm mt-1 items-center">
      <Text className="text-black text-left">{item.nama}</Text>
      <Text className="text-black text-center">
        {rupiah(item.titik_permohonans[0].pivot.harga)}
      </Text>
      {(!titik?.save_parameter || titik.status <= 1) && (
        <TouchableOpacity
          onPress={() => throttledRemoveParameter(item.uuid)}
          className="text-white p-2 rounded-sm font-sans"
          style={{ backgroundColor: Colors.brand }}>
          <Text style={{ color: "white" }}>-</Text>
        </TouchableOpacity>
      )}
    </View>
  );
  return (
    <View style={{ flex: 1 }}>
      <View className="w-full">
        <View
          className="flex-row p-3 justify-between"
          style={{ backgroundColor: Colors.brand }}>
          <Back size={24} color="white" action={() => navigation.goBack()} />
          <Text className="font-bold text-white text-xs mt-1">
            {titik?.lokasi} : Pilih Peraturan / Parameter
          </Text>
        </View>
      </View>
      <FlatList
        data={[1]}
        renderItem={() => (
          <View className="bg-[#f8f8f8] py-2 px-3 rounded-md mb-4">
            <View className="bg-[#ececec] ">
              <TouchableOpacity
                onPress={() => setShowPeraturan(!showPeraturan)}
                style={{ padding: 8, backgroundColor: Colors.brand }}>
                <View className="flex-row justify-between">
                  <Text className="text-white text-center font-bold font-sans">
                    Pilih berdasarkan Peraturan
                  </Text>
                  <Icon
                    name={showPeraturan ? "up" : "down"}
                    size={18}
                    color={"white"}
                    className=""
                  />
                </View>
              </TouchableOpacity>
              {showPeraturan && (
                <Paginates
                  url={`/permohonan/titik/${uuid}/peraturan`}
                  renderItem={renderPeraturan}
                  // showLoading={false}
                />
              )}
            </View>

            <TouchableOpacity
              onPress={() => setShowPaket(!showPaket)}
              style={{ padding: 8, backgroundColor: Colors.brand }}
              className="mt-2">
              <View className="flex-row justify-between">
                <Text className="text-white text-center font-bold font-sans">
                  Pilih berdasarkan Paket
                </Text>
                <Icon
                  name={showPaket ? "up" : "down"}
                  size={18}
                  color={"white"}
                  className=""
                />
              </View>
            </TouchableOpacity>
            {showPaket && (
              <View
                style={{ flexDirection: "row", flexWrap: "wrap" }}
                className="drop-shadow-md p-2 bg-[#ececec]">
                {pakets.map(paket => (
                  <TouchableOpacity
                    key={paket.id}
                    style={{
                      width: "100%",
                      padding: 10,
                      borderWidth: 1,
                      borderColor: titik?.pakets?.find(p => p.id == paket.id)
                        ? "blue"
                        : "gray",
                    }}
                    className="bg-[#ececec]"
                    onPress={() => {
                      const isPaketSelected = titik?.pakets?.some(
                        p => p.id === paket.id,
                      );
                      if (isPaketSelected) {
                        throttledRemoveFromPaket(paket.id);
                      } else {
                        throttledStoreFromPaket(paket.id);
                      }
                    }}>
                    <Text className="text-black">{paket.nama}</Text>
                    <Text className="text-black">{rupiah(paket.harga)}</Text>
                    <Text className="text-black">
                      {paket.parameters.map(param => param.nama).join(", ")}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={{ flex: 1 }} className="bg-[#ececec] my-2">
              <View
                className="rounded-sm flex-1 p-2"
                style={{ backgroundColor: Colors.brand }}>
                <View className="flex-row justify-between">
                  <Text className="text-white text-center font-bold font-sans">
                    Parameter Tersedia
                  </Text>
                </View>
              </View>
              <Paginates
                url="/master/parameter"
                renderItem={renderParameter}
                payload={{ except: selectedParameter }}
                showLoading={false}
              />
            </View>

            <View style={{ flex: 1 }} className="bg-[#ececec]">
              <View
                className="rounded-sm p-2"
                style={{ backgroundColor: Colors.brand }}>
                <View className="flex-row justify-between">
                  <Text className="text-white text-center font-bold font-sans">
                    Parameter yang Dipilih
                  </Text>
                </View>
              </View>
              <Paginates
                url={`/permohonan/titik/${uuid}/parameter`}
                renderItem={renderSelectedParameter}
              />
            </View>

            <Text className="font-sans text-black font-bold my-3 text-center">
              Total Harga : {rupiah(titik?.harga)}
            </Text>

            {(!titik?.save_parameter || titik.status <= 1) && (
              <TouchableOpacity
                style={{
                  backgroundColor: Colors.brand,
                  padding: 10,
                  alignItems: "center",
                }}
                onPress={handleSave}>
                <Text className="font-bold font-sans text-base text-white">
                  Simpan & Kirim
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        keyExtractor={() => "main"}
        contentContainerStyle={{ flexGrow: 1 }}
      />
      <SaveConfirmationModal />
    </View>
  );
};

export default Parameter;
