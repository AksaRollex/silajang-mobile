import { StyleSheet, Text, TextInput, View } from "react-native";
import React, { useEffect } from "react";
import { Controller, set, useForm } from "react-hook-form";
import { TextField } from "react-native-ui-lib";
import Select2 from "../components/Select2";
import { useKodeRetribusi } from "@/src/services/useKodeRetribusi";
import axios from "axios";

export default function FormNonPengujian() {
  const [kodeRetribusi, setKodeRetribusi] = React.useState([]);

  useEffect(() => {
    axios
      .get("/master/kode-retribusi")
      .then(res => {
        const formattedKodeRetribusi = resposne.data.data.map(item => ({
          label: item.nama,
          value: item.id,
        }));
        setKodeRetribusi(formattedKodeRetribusi);
      })
      .catch(err => {
        console.log(err);
      });
  }, []);

  const { control } = useForm();
  return (
    <View className="h-full w-full bg-[#ececec] px-3 py-2">
      <View className=" w-full bg-[#f8f8f8] px-3 py-4">
        <Controller
          control={control}
          name="kode_retribusi_id"
          render={({ field: { onChange, value } }) => (
            <View>
              <Text className="font-sans font-bold text-black">
                Kode Retribusi
              </Text>
              <Select2
                placeholder="Pilih Kode Retribusi"
                value={value}
                onChange={value}></Select2>
            </View>
          )}></Controller>
        <Controller
          control={control}
          name="kode_retribusi_id"
          render={({ field: { onChange, value } }) => (
            <View>
              <Text className="font-sans font-bold text-black">Atas Nama</Text>
              <TextField
                className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-sans"
                value={value}
                keyboardType="default"
                onChangeText={onChange}></TextField>
            </View>
          )}></Controller>
        <Controller
          control={control}
          name="kode_retribusi_id"
          render={({ field: { onChange, value } }) => (
            <View>
              <Text className="font-sans font-bold text-black">Nominal</Text>
              <TextField
                className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-sans"
                value={value}
                keyboardType="phone-pad"
                onChangeText={onChange}></TextField>
            </View>
          )}></Controller>
        <Controller
          control={control}
          name="kode_retribusi_id"
          render={({ field: { onChange, value } }) => (
            <View>
              <Text className="font-sans font-bold text-black">
                Tanggal Kedaluwarsa
              </Text>
              <TextField
                className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-sans"
                value={value}
                onChangeText={onChange}></TextField>
            </View>
          )}></Controller>
        <Controller
          control={control}
          name="kode_retribusi_id"
          render={({ field: { onChange, value } }) => (
            <View>
              <Text className="font-sans font-bold text-black">Berita 1</Text>
              <TextField
                className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-sans"
                value={value}
                keyboardType="default"
                onChangeText={onChange}></TextField>
            </View>
          )}></Controller>
        <Controller
          control={control}
          name="kode_retribusi_id"
          render={({ field: { onChange, value } }) => (
            <View>
              <Text className="font-sans font-bold text-black">Berita 2</Text>
              <TextField
                className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-sans"
                value={value}
                keyboardType="default"
                onChangeText={onChange}></TextField>
            </View>
          )}></Controller>
        <Controller
          control={control}
          name="kode_retribusi_id"
          render={({ field: { onChange, value } }) => (
            <View>
              <Text className="font-sans font-bold text-black">Berita 3</Text>
              <TextField
                className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-sans"
                value={value}
                keyboardType="default"
                onChangeText={onChange}></TextField>
            </View>
          )}></Controller>
        <Controller
          control={control}
          name="kode_retribusi_id"
          render={({ field: { onChange, value } }) => (
            <View>
              <Text className="font-sans font-bold text-black">Berita 4</Text>
              <TextField
                className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-sans"
                value={value}
                keyboardType="default"
                onChangeText={onChange}></TextField>
            </View>
          )}></Controller>
        <Controller
          control={control}
          name="kode_retribusi_id"
          render={({ field: { onChange, value } }) => (
            <View>
              <Text className="font-sans font-bold text-black">Berita 5</Text>
              <TextField
                className="p-2 bg-[#fff] rounded-sm border-stone-300 border font-sans"
                value={value}
                keyboardType="default"
                onChangeText={onChange}></TextField>
            </View>
          )}></Controller>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({});
