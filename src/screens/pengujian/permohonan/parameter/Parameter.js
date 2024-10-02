import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "@/src/libs/axios";
import { Colors } from "react-native-ui-lib";
import Back from "@/src/screens/components/Back";
import Paginate from "@/src/screens/components/Paginate";
import { useTitikPermohonan } from "@/src/services/useTitikPermohonan";
import { rupiah } from "@/src/libs/utils";
import { useQueryClient } from "@tanstack/react-query";

const Parameter = ({ route, navigation }) => {
  const { uuid } = route.params;
  const { data: titik, refetch } = useTitikPermohonan(uuid);
  const [showPeraturan, setShowPeraturan] = useState(false);
  const [showPaket, setShowPaket] = useState(false);

  const queryClient = useQueryClient();
  const { data: selectedParameter, refetch: refetchSelectedParameter } =
    useQuery({
      queryKey: ["selectedParameter", uuid],
      queryFn: () =>
        axios
          .get(`/permohonan/titik/${uuid}/parameter`)
          .then(res => res.data.data),
    });

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
        refetch();
        queryClient.invalidateQueries(`/permohonan/titik/${uuid}/parameter`);
        refetchSelectedParameter();
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
        refetch();
        refetchSelectedParameter();
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
        refetch();
        queryClient.invalidateQueries(`/permohonan/titik/${uuid}/parameter`);
        refetchSelectedParameter();
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
        refetch();
        queryClient.invalidateQueries(`/permohonan/titik/${uuid}/parameter`);
        refetchSelectedParameter();
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
        refetch();
        queryClient.invalidateQueries(`/permohonan/titik/${uuid}/parameter`);
        refetchSelectedParameter();
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
        refetch();
        refetchSelectedParameter();
      },
    },
  );

  const renderPeraturan = ({ item }) => (
    <View
      className=" rounded-sm flex-row justify-between p-3 bg-[#ececec] drop-shadow-md mt-1"
      style={{ borderWidth: 0.5 }}>
      <Text className="text-black">{item.nama}</Text>
      {(!titik?.save_parameter || titik.status <= 1) && (
        <TouchableOpacity
          onPress={() =>
            item.selected
              ? removePeraturan.mutate(item.uuid)
              : addPeraturan.mutate(item.uuid)
          }>
          <Text
            style={{
              color: item.selected ? "red" : "white",
              backgroundColor: Colors.brand,
            }}
            className=" p-2 rounded-sm font-sans text-bold">
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
        justifyContent: "space-between",
        borderWidth: 0.5,
      }}
      className="bg-[#ececec] p-3 rounded-sm mt-1 items-center">
      <Text className="text-black text-left">{rupiah(item.harga)}</Text>
      <Text className="text-black text-center">{item.nama}</Text>
      {(!titik?.save_parameter || titik.status <= 1) && (
        <TouchableOpacity onPress={() => addParameter.mutate(item.uuid)}>
          <Text
            style={{ backgroundColor: Colors.brand }}
            className=" font-bold text-white p-2 rounded-sm font-sans">
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
          onPress={() => removeParameter.mutate(item.uuid)}
          className=" text-white p-2 rounded-sm font-sans"
          style={{ backgroundColor: Colors.brand }}>
          <Text style={{ color: "white" }}>-</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <>
      <View className="w-full">
        <View
          className="flex-row mb-4 p-3 justify-between"
          style={{ backgroundColor: Colors.brand }}>
          <Back size={24} color="white" action={() => navigation.goBack()} />
          <Text className="font-bold text-white text-xs">
            {titik?.lokasi} {titik?.kode} Pilih Peraturan/Parameter
          </Text>
        </View>
      </View>
      <ScrollView className="bg-[#ececec] w-full h-full px-3 py-1 ">
        <View className="bg-[#f8f8f8] py-4 px-3 rounded-md mb-20">
          <View className="bg-[#ececec]">
            <TouchableOpacity
              onPress={() => setShowPeraturan(!showPeraturan)}
              style={{ padding: 10, backgroundColor: Colors.brand }}
              className="">
              <Text className="text-white text-center font-bold font-sans">
                Pilih berdasarkan Peraturan :
              </Text>
            </TouchableOpacity>
            {showPeraturan && (
              <Paginate
                url={`/permohonan/titik/${uuid}/peraturan`}
                renderItem={renderPeraturan}
              />
            )}
          </View>

          <TouchableOpacity
            onPress={() => setShowPaket(!showPaket)}
            style={{ padding: 10, backgroundColor: Colors.brand }}
            className=" mt-2">
            <Text className="text-white text-center font-bold font-sans">
              Pilih berdasarkan Paket :
            </Text>
          </TouchableOpacity>
          {showPaket && (
            <View
              style={{ flexDirection: "row", flexWrap: "wrap" }}
              className="  drop-shadow-md p-4 bg-[#ececec]">
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
                  className="bg-[#ececec] "
                  onPress={() =>
                    titik?.pakets?.find(p => p.id == paket.id)
                      ? removeFromPaket.mutate(paket.id)
                      : storeFromPaket.mutate(paket.id)
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
              className=" rounded-sm p-4 flex-1"
              style={{ backgroundColor: Colors.brand }}>
              <Text className="text-white text-center font-bold font-sans">
                Parameter Tersedia :
              </Text>
            </View>
            <Paginate
              url="/master/parameter"
              renderItem={renderParameter}
              payload={{ except: selectedParameter }}
            />
          </View>

          <View style={{ flex: 1 }} className="bg-[#ececec] ">
            <View
              className="rounded-sm p-4"
              style={{ backgroundColor: Colors.brand }}>
              <Text className="text-white text-center font-bold font-sans">
                Parameter yang Dipilih :
              </Text>
            </View>
            <Paginate
              url={`/permohonan/titik/${uuid}/parameter`}
              renderItem={renderSelectedParameter}
            />
          </View>

          <Text className="font-sans text-black font-bold my-3 text-center">
            Total Harga: {rupiah(titik?.harga)}
          </Text>

          {(!titik?.save_parameter || titik.status <= 1) && (
            <TouchableOpacity
              style={{
                backgroundColor: Colors.brand,
                padding: 10,
                alignItems: "center",
              }}
              onPress={() => {
                // Implementasikan logika penyimpanan di sini
              }}>
              <Text className="font-bold font-sans text-base text-white">
                Simpan & Kirim
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </>
  );
};

export default Parameter;
