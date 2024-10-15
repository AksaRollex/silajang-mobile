import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "@/src/libs/axios";
import { Colors } from "react-native-ui-lib";
import Back from "@/src/screens/components/Back";
import Paginate from "@/src/screens/components/Paginate";
import { useTitikPermohonan } from "@/src/services/useTitikPermohonan";
import { rupiah } from "@/src/libs/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useSendParameter } from "@/src/hooks/useSendParameter";
import Icon from "react-native-vector-icons/AntDesign";

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
  console.log(titik)
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
    throttle(uuid => addPeraturan.mutate(uuid), 1000),
    [addPeraturan],
  );

  const throttledRemovePeraturan = useCallback(
    throttle(uuid => removePeraturan.mutate(uuid), 1000),
    [removePeraturan],
  );

  const throttledAddParameter = useCallback(
    throttle(uuid => addParameter.mutate(uuid), 1000),
    [addParameter],
  );

  const throttledRemoveParameter = useCallback(
    throttle(uuid => removeParameter.mutate(uuid), 1000),
    [removeParameter],
  );

  const throttledStoreFromPaket = useCallback(
    throttle(id => storeFromPaket.mutate(id), 1000),
    [storeFromPaket],
  );

  const throttledRemoveFromPaket = useCallback(
    throttle(id => removeFromPaket.mutate(id), 1000),
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
                <Paginate
                  url={`/permohonan/titik/${uuid}/peraturan`}
                  renderItem={renderPeraturan}
                  showLoading={false}
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
                    onPress={() =>
                      titik?.pakets?.find(p => p.id == paket.id)
                        ? throttledStoreFromPaket.mutate(paket.id)
                        : throttledRemoveFromPaket.mutate(paket.id)
                    }>
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
              <Paginate
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
              <Paginate
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
