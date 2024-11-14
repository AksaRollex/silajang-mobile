import { memo } from "react";
import { Button, Colors, Text, TextField, View } from "react-native-ui-lib";

import { useForm, Controller } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/src/libs/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { If } from "@/src/libs/component";
import OTPInputView from "@twotalltotems/react-native-otp-input";

export default memo(function WithPhone() {
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm();

  const queryClient = useQueryClient();

  const {
    mutate: login,
    isLoading,
    isSuccess,
  } = useMutation(
    data =>
      axios.post("/auth/secure/login", { data, type: "phone", remember_me: 1 }),
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

  const {
    mutate: getOtp,
    status: statusOtp,
    reset,
  } = useMutation(
    data => axios.post("/auth/getOtp", data).then(res => res.data),
    {
      onSuccess: data => {
        Toast.show({
          type: "success",
          text1: "Kode OTP berhasil dikirim ke No. Telepon Anda'",
        });
      },
      onError: error => {
        console.error(error.response.data);
        Toast.show({
          type: "error",
          text1: error.response.data.message,
        });
      },
    },
  );

  return (
    <View width={"100%"} paddingV-20 paddingH-10>
      <If isTrue={statusOtp !== "success"}>
        <View marginB-20>
          <Text marginB-5>No. Telepon</Text>
          <Controller
            control={control}
            name="identifier"
            rules={{ required: "No. Telepon tidak boleh kosong" }}
            render={({ field: { onChange, value } }) => (
              <TextField
                keyboardType="phone-pad"
                placeholder={"No. Telepon"}
                enableErrors
                fieldStyle={{
                  paddingVertical: 8,
                  paddingHorizontal: 15,
                  borderRadius: 16,
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
          borderRadius={56}
          onPress={handleSubmit(getOtp)}
          disabled={statusOtp === "loading"}></Button>
      </If>

      <If isTrue={statusOtp === "success"}>
        <View marginB-10>
          <Text>Masukkan Kode OTP yang dikirimkan ke No. Telepon Anda</Text>
          <Text color={Colors.blue40}>{watch("identifier")}</Text>
        </View>
        <View marginB-20>
          <Text marginB-5>Kode OTP</Text>
          <Controller
            control={control}
            name="otp"
            rules={{ required: "Kode OTP tidak boleh kosong" }}
            render={({ field: { onChange, value } }) => (
              <OTPInputView
                style={{ width: "100%", height: 60 }}
                codeInputFieldStyle={{ color: Colors.brand }}
                pinCount={6}
                code={value}
                onCodeChanged={code => onChange(code)}
                autoFocusOnLoad
                onCodeFilled={handleSubmit(data =>
                  login({ ...data, otp: watch("otp") }),
                )}
              />
            )}
          />
          {errors.otp && (
            <Text color={Colors.red30} body>
              {errors.otp.message}
            </Text>
          )}
        </View>
        <Button
          label="Login"
          backgroundColor={Colors.brand}
          paddingV-12
          marginB-10
          borderRadius={5}
          onPress={handleSubmit(login)}
          disabled={isLoading || isSuccess}></Button>
        <Button
          label="Ganti No. Telepon"
          paddingV-12
          borderRadius={5}
          outline
          outlineColor={Colors.brand}
          onPress={reset}></Button>
      </If>
    </View>
  );
});
