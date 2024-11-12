import {View, Text, Button, TextField } from "react-native-ui-lib";
import React, { memo } from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ScrollView } from "react-native-gesture-handler";
import { ActivityIndicator } from "react-native";
import axios from "@/src/libs/axios";
import Toast from "react-native-toast-message";
import BackButton from "@/src/screens/components/BackButton";

export default memo(function Form({ route, navigation}){
    const { name } = route.params || {}
    const { handleSubmit, control, formState: { errors }, setValue } = useForm()

    const { data, isLoading: isLoadingData } = useQuery(['users', name], () =>
        name ? axios.get(`/master/users/${name}/edit`).then(res => res.data.data) : null,
    {
        enabled: !!name,
        onSuccess: (data) => {
            if (data) {
                setValue('full_name', data.full_name)
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

    const queryClient = useQueryClient()

    const { mutate: createOrUpdate, isLoading } = useMutation(
        (data) => axios.post(name ? `/master/users/${name}/update` : '/master/users/store', data),
        {
            onSuccess: () => {
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: name ? 'Success update data' : 'Success create data'
                });
                queryClient.invalidateQueries(['/master/users']);
                navigation.navigate("Users")
            },
            onError: (error) => {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: name ? 'Failed update data' : 'Failed create data'
                })
                console.error(error)
            }
        }
     )
     
     const onSubmit = (data) => {
        createOrUpdate(data)
     }

     if (isLoadingData && uuid) {
        return (
            <View className="h-full flex justify-center">
                <ActivityIndicator size={"large"} color={"#312e81"} />
            </View>
        );
     }
     return (
        <ScrollView>
        </ScrollView>
     )

})

