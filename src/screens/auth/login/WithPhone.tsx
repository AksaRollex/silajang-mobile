import { memo } from "react";
import { Button, Colors, Text, TextField, View } from "react-native-ui-lib";

import { useForm, Controller } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/src/libs/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

export default memo(function WithPhone() {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  const queryClient = useQueryClient();

  const {
    mutate: login,
    isLoading,
    isSuccess,
  } = useMutation(
    data => axios.post("/auth/secure/login", { data, type: "phone" }),
    {
      onSuccess: async ({ headers: { authorization } }) => {
        await AsyncStorage.setItem("@auth-token", authorization);
        queryClient.invalidateQueries({
          queryKey: ["auth", "user"],
        });
      },
      onError: error => {
        console.error(error.response.data);
        Toast.show({
          type: "error",
          text1: "Email atau password salah!",
        });
      },
    },
  );

  return (
    <View width={"100%"} paddingV-20 paddingH-10>
      <View marginB-20>
        <Text marginB-5>No. Telepon</Text>
        <Controller
          control={control}
          name="identifier"
          rules={{ required: "No. Telepon harus diisi" }}
          render={({ field: { onChange, onBlur, value } }) => (
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
        {errors.identifier && (
          <Text color={Colors.red30} body>
            {errors.identifier.message}
          </Text>
        )}
      </View>
      <Button
        label="Dapatkan OTP"
        backgroundColor={Colors.brand}
        paddingV-12
        borderRadius={5}
        onPress={handleSubmit(login)}
        disabled={isLoading || isSuccess}></Button>
    </View>
  );
});
