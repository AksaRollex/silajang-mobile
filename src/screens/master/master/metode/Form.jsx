import { View, Text, Button, TextField } from 'react-native-ui-lib'
import { useForm, Controller } from 'react-hook-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ScrollView } from 'react-native-gesture-handler'
import React, { memo } from 'react'
import axios from '@/src/libs/axios'
import Toast from 'react-native-toast-message'
import BackButton from '@/src/screens/components/BackButton'

export default memo(function Form({ route, navigation }) {
  const { uuid } = route.params || {}
  const { handleSubmit, control, formState: { errors }, setValue } = useForm()

    const { data, isLoading: isLoadingData } = useQuery(['metode', uuid], () =>
      uuid ? axios.get(`/master/acuan-metode/${uuid}/edit`).then(res => res.data.data) : null
    , {
      enabled: !!uuid,
      onSuccess: (data) => {
        if (data) {
          setValue('nama', data.nama)
        }
    },
    onError: (error) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load data'
      })
      console.error(error)
    }
  })

  const { mutate: update, isLoading: isUpdating } = useMutation(
    (data) => axios.post(`/master/acuan-metode/${uuid}/update`, data),
    {
      onSuccess: () => {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Data updated successfully'
        })
        navigation.navigate("Metode")
      },
      onError: (error) => {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to update data'
        })
        console.error(error.response?.data || error)
      }
    }
  )

  const { mutate: create, isLoading: isCreating } = useMutation(
    (data) => axios.post(`/master/acuan-metode/store`, data),
    {
      onSuccess: () => {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Data created successfully'
        })
        navigation.navigate("Metode")
      },
      onError: (error) => {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to create data'
        })
        console.error(error.response?.data || error)
      }
    }
  )

  

  return (
    <ScrollView className="bg-[#ececec] h-full">
      <View className="bg-white m-3">
        <View className=" flex-row mx-3 mt-4">
          <BackButton action={() => navigation.goBack()} size={26} />
          <Text className="text-xl font-bold ml-20 flex-1">{ data ? "Edit Metode" : "Tambah Metode" }</Text>
        </View>
        <View className="p-5">
          <Text className="mb-3 text-lg font-semibold">Nama</Text>
          <Controller 
            control={control}
            name="nama"
            rules={{ required: 'Nama is required' }}
            render={({ field: { onChange, value } }) => (
              <TextField
                placeholder="Masukkan Nama Metode"
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
          <Button
            label="Simpan" 
            loading={isUpdating} 
            onPress={handleSubmit(update)}
            className="rounded-md bg-indigo-800 mt-4"
            disabled={isLoadingData || isUpdating}
          />
        </View>
      </View>
    </ScrollView>
  )
})