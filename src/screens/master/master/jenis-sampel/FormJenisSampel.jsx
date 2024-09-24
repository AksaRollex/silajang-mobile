import { View, Text, Button, TextField } from 'react-native-ui-lib'
import React, { memo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { ActivityIndicator } from 'react-native-paper'
import axios from '@/src/libs/axios'
import Toast from 'react-native-toast-message'
import BackButton from '@/src/screens/components/BackButton'

export default memo(function FormJenisSampel({ route, navigation }) {
  const { uuid } = route.params || uuid;
  const { hendleSubmit, control, formState: {errors}, setValue } = useForm();

  const { data, isLoading: isLoadingData } = useQuery(["jenis-sampel", uuid], () =>
    uuid ? axios.get(`/master/jenis-sampel/${uuid}/edit`).then(res => res.data.data) : null,
  {
    enabled: !!uuid,
    onSuccess: data => {
      if (data) {
        setValue("nama", data.nama);
        setValue("kode", data.kode);
      }
    },
    onError: (errors) => {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load data",
      })
      console.error(error)
    }
  });

  const queryClient = useQueryClient()

  const { mutate: createOrUpdate, isLoading } = useMutation(
    (data) => axios.post(uuid ? `/master/jenis-sampel/${uuid}` : '/master/jenis-sampel/store', data),
    {
      onSuccess: () => {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: uuid ? 'Success update data' : 'Success create data'
        })
        queryClient.invalidateQueries(["/master/jenis-sampel"])
        navigation.navigate("JenisSampel")
      },
      onError: (error) => {
        Toast.show({
          type: 'error',
          text1 : 'Error',
          text2: uuid ? 'Failed update data' : 'Failed create data'
        })
        console.error(error)
      }
    }
  )

  const onSubmit = (data) => {
    createOrUpdate(data)
  }

  if(isLoadingData && uuid){
    return <View className="h-full flex justify-center"><ActivityIndicator size={"large"} color='#312e81' /></View>
  }

  return (
    <View className="bg-[#ececec] h-full">
      <View className="bg-white rounded m-3">
        <View className="flex-row justify-between mx-3 mt-4">
          <BackButton action={() => navigation.goBack()} size={26} />
          <Text className="text-base font-poppins-semibold">{data ? 'Edit Jenis Sampel' : 'Tambah Jenis Sampel'}</Text>
        </View>
        <View className="p-5">
          <Text className="mb-3 text-lg font-semibold">Nama</Text>
          <Controller 
            control={control}
            name="nama"
            rules={{ required: 'Nama is required' }}
            render={({ field: { onChange, value } }) => (
              <TextField
                placeholder="Masukkan Nama Jenis Sampel"
                enableErrors
                className="py-3 px-5 rounded border-[1px] border-gray-700"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.nama && (
            <Text className="text-red-500">
              {errors.nama.message}
            </Text>
          )}
          <Text className="mb-3 text-lg font-semibold">Kode</Text>
          <Controller 
            control={control}
            name="kode"
            rules={{ required: 'Kode is required' }}
            render={({ field: { onChange, value } }) => (
              <TextField
                placeholder="Masukkan Kode Jenis Sampel"
                enableErrors
                className="py-3 px-5 rounded border-[1px] border-gray-700"
                onChangeText={onChange}
                value={value}
              />
            )}
          />
          {errors.kode && (
            <Text className="text-red-500">
              {errors.kode.message}
            </Text>
          )}
          <Button
            label="Simpan" 
            loading={isLoading} 
            onPress={handleSubmit(onSubmit)}
            className="rounded-md bg-indigo-800 mt-4"
            disabled={isLoading}
          />
        </View>
      </View>
    </View>
  )

})