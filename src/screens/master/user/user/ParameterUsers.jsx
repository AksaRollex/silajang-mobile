import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import axios from "@/src/libs/axios";
import FontAwesome6Icon from "react-native-vector-icons/FontAwesome6";
import BackButton from "@/src/screens/components/BackButton";
import Paginate from "@/src/screens/components/Paginate";
import IonIcons from "react-native-vector-icons/Ionicons";

interface Parameter {
  uuid: string;
  nama: string;
  metode: string;
  harga: number;
  satuan: string;
  jenis_parameter: {
    nama: string,
  };
}

const ParameterUsers = ({ navigation, route }) => {
  const { selected } = route.params;
  const paginateParameterRef = useRef(null);
  const paginateSelectedParameterRef = useRef(null);
  const queryClient = useQueryClient();
  const paginateRef = React.useRef();

  const { data: selectedParameter, refetch: refetchSelectedParameter } =
    useQuery({
      queryKey: ["selectedParameter", selected],
      queryFn: () =>
        axios
          .get(`/master/user/${selected}/parameter`)
          .then(res => res.data.data),
      cacheTime: 0,
    });

  const { mutate: addParameter, isLoading: isAdding } = useMutation({
    mutationFn: uuid =>
      axios.post(`/master/user/${selected}/parameter/store`, { uuid }),
    onSuccess: () => {
      refetchSelectedParameter();
      paginateRef.current.refetch();
      paginateSelectedRef.current.refetch();
    },
    onError: error => {
      console.error("Add Parameter Error:", error);
    },
  });

  const { mutate: removeParameter, isLoading: isRemoving } = useMutation({
    mutationFn: uuid =>
      axios.post(`/master/user/${selected}/parameter/destroy`, { uuid }),
    onSuccess: () => {
      refetchSelectedParameter();
      paginateRef.current.refetch();
      paginateSelectedRef.current.refetch();
    },
    onError: error => {
      console.error("Remove Parameter Error:", error);
    },
  });

  const renderAvailableItem = ({ item }: { item: Parameter }) => {
    return (
      <View
        className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
        style={{ elevation: 4 }}>
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-sm mb-2 font-poppins-medium text-black">
              {item.nama} {item.keterangan ? `(${item.keterangan})` : ""}
            </Text>
            <Text className="text-xs mb-2 text-muted font-poppins-medium">
              {item.jenis_parameter.nama}
            </Text>
            <Text className="text-sm font-poppins-medium text-black">
              {item.metode}
            </Text>
          </View>
          <TouchableOpacity
            className="bg-[#312e81] rounded-md p-2"
            onPress={() => addParameter(item.uuid)}>
            <IonIcons name="add" size={18} color={"#fff"} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSelectedItem = ({ item }: { item: Parameter }) => {
    return (
      <View
        className="my-2 bg-[#f8f8f8] flex rounded-md border-t-[6px] border-indigo-900 p-5"
        style={{ elevation: 4 }}>
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-sm mb-2 font-poppins-medium text-black">
              {item.nama} {item.keterangan ? `(${item.keterangan})` : ""}
            </Text>
            <Text className="text-xs mb-2 text-muted font-poppins-medium">
              {item.jenis_parameter.nama}
            </Text>
            <Text className="text-sm font-poppins-medium text-black">
              {item.metode}
            </Text>
          </View>
          <TouchableOpacity
            className="bg-[#dc2626] rounded-md p-2"
            onPress={() => removeParameter(item.uuid)}>
            <IonIcons name="trash-outline" size={18} color={"#fff"} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScrollView className="flex-1 bg-[#ececec]">
      <View
        className="flex-row items-center justify-between py-3.5 px-4 border-b border-gray-300"
        style={{ backgroundColor: "#fff" }}>
        <IonIcons
          name="arrow-back-outline"
          onPress={() => navigation.goBack()}
          size={25}
          color="#312e81"
        />
        <Text className="text-lg font-poppins-semibold ml-3 text-black">
          Parameter
        </Text>
      </View>

      {/* Parameter yang Dipilih */}
      <View className="flex-1 p-3">
        <View className="bg-white rounded-md shadow-md">
          <Text className="text-[16px] font-poppins-semibold text-black ml-4 mt-4 ">
            Parameter yang Dipilih
          </Text>
          <View className="h-[1px] bg-gray-100 my-3" />
          <View style={{ maxHeight: 500 }}>
            <ScrollView nestedScrollEnabled>
              <Paginate
                ref={paginateSelectedParameterRef}
                url={`/master/user/${selected}/parameter`}
                payload={{ except: selectedParameter }}
                renderItem={renderSelectedItem}
              />
            </ScrollView>
          </View>
        </View>
      </View>

      {/* Parameter Tersedia */}
      <View className="flex-1 p-3">
        <View className="bg-white rounded-md shadow-md">
          <Text className="text-[16px] font-poppins-semibold text-black ml-4 mt-4 ">
            Parameter Tersedia
          </Text>
          <View className="h-[1px] bg-gray-100 my-3" />
          <View style={{ maxHeight: 500 }}>
            <ScrollView nestedScrollEnabled>
              <Paginate
                ref={paginateParameterRef}
                url="/master/parameter"
                payload={{ except: selectedParameter }}
                renderItem={renderAvailableItem}
              />
            </ScrollView>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default ParameterUsers;
