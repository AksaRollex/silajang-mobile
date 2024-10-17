import React, { memo } from "react";
import { Button } from "react-native";
import { useMutation } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Toast from "react-native-toast-message";

import { useNavigation } from "@react-navigation/native";
import { useFormStore, useFormStep } from "../Index";
import axios from "@/src/libs/axios";
import { Colors, Text, TextField, View } from "react-native-ui-lib";

const schema = yup
  .object({
    password: yup.string().required("Password tidak boleh kosong"),
    password_confirmation: yup
      .string()
      .oneOf([yup.ref("password")], "Konfirmasi password tidak sesuai"),
  })
  .required();

const Password = memo(() => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const navigation = useNavigation();
  const { mutate: register, status, isLoading, isSuccess } = useMutation({
    mutationFn: data => axios.post("/auth/register", data),
    onSuccess: async data => {
      Toast.show({
        type: "success",
        text1: "Pendaftaran berhasil!",
      });
      navigation.navigate("login", { register: true });
    },
    onError: error => {
      console.error(error.response.data);
      Toast.show({
        type: "error",
        text1: error.response.data.message,
      });
    },
  });

  const { setPassword, credential, otp, password, getEmailOtp } = useFormStore();
  const prevStep = useFormStep(state => state.prevStep);

  const onSubmit = data => {
    setPassword(data);
    console.log({
      ...credential,
      ...otp,
      ...data,
    });
    register({
      ...credential,
      ...otp,
      ...data,
    });
  };

  return (
    <View>
      <View marginB-20>
        <Text marginB-5>Nama</Text>
        <Controller
          control={control}
          name="nama"
          rules={{ required: "Nama tidak boleh kosong" }}
          render={({ field: { onChange, value } }) => (
            <TextField
              placeholder={"Nama"}
              enableErrors
              fieldStyle={{
                paddingVertical: 8,
                paddingHorizontal: 15,
                borderRadius: 5,
                borderWidth: 1,
                borderColor: Colors.grey50,
              }}
              containerStyle={{
                marginBottom: -20,
              }}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.nama && (
          <Text color={Colors.red30} body>
            {errors.nama.message}
          </Text>
        )}
      </View>
      <View marginB-20>
        <Text marginB-5>Email</Text>
        <Controller
          control={control}
          name="password"
          rules={{ required: "Email tidak boleh kosong" }}
          render={({ field: { onChange, value } }) => (
            <TextField
              placeholder={"Email"}
              enableErrors
              fieldStyle={{
                paddingVertical: 8,
                paddingHorizontal: 15,
                borderRadius: 5,
                borderWidth: 1,
                borderColor: Colors.grey50,
              }}
              containerStyle={{
                marginBottom: -20,
              }}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.password && (
          <Text color={Colors.red30} body>
            {errors.password.message}
          </Text>
        )}
      </View>
      <View marginB-20>
        <Text marginB-5>No. Telepon</Text>
        <Controller
          control={control}
          name="password_confirmation"
          rules={{ required: "No. Telepon tidak boleh kosong" }}
          render={({ field: { onChange, value } }) => (
            <TextField
              placeholder={"No. Telepon"}
              enableErrors
              fieldStyle={{
                paddingVertical: 8,
                paddingHorizontal: 15,
                borderRadius: 5,
                borderWidth: 1,
                borderColor: Colors.grey50,
              }}
              containerStyle={{
                marginBottom: -20,
              }}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.password_confirmation && (
          <Text color={Colors.red30} body>
            {errors.password_confirmation.message}
          </Text>
        )}
      </View>
      <Button
        label="Selanjutnya"
        backgroundColor={Colors.brand}
        paddingV-12
        borderRadius={5}
        onPress={handleSubmit(getEmailOtp)}
        iconOnRight
        iconSource={Assets.getAssetByPath("icons.chevronRight")}
        iconStyle={{ width: 20, height: 28 }}
        disabled={isLoading || isSuccess}></Button>
    </View>
  );
});

export default Password;