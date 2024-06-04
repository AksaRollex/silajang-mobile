import OTPInputView from "@twotalltotems/react-native-otp-input";
import { memo } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, Colors, Text, Toast, View } from "react-native-ui-lib";
import { useFormStep, useFormStore } from "../Index";
import { useMutation } from "@tanstack/react-query";
import axios from "@/src/libs/axios";

export default memo(function OtpEmail() {
  const { otp, setOtp, credential } = useFormStore();
  const { nextStep, setIndex } = useFormStep();
  const {
    handleSubmit,
    control,
    formState: { errors },
    getValues,
  } = useForm();

  const { mutate: verify, status: statusVerif } = useMutation(
    data =>
      axios
        .post("/auth/register/get/phone/otp", { phone: credential.phone })
        .then(res => res.data),
    {
      onSuccess: data => {
        getPhoneOtp();
        Toast.show({
          type: "success",
          text1: "Kode OTP Berhasil Diverifikasi",
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

  const { mutate: getPhoneOtp, status: statusOtp } = useMutation(
    data =>
      axios
        .post("/auth/register/get/phone/otp", { phone: credential.phone })
        .then(res => res.data),
    {
      onSuccess: data => {
        nextStep();
        Toast.show({
          type: "success",
          text1: "Kode OTP Berhasil",
          text2: "Kode OTP dikirim ke No. Telepon anda",
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
    <View>
      <View marginB-10>
        <Text>Masukkan Kode OTP yang dikirimkan ke Email Anda</Text>
        <Text color={Colors.blue40}>{credential.email}</Text>
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
        onPress={handleSubmit(verify)}
        disabled={statusVerif == "loading" || statusOtp == "loading"}></Button>
      <Button
        label="Ganti Email"
        paddingV-12
        borderRadius={5}
        outline
        outlineColor={Colors.brand}
        onPress={() => setIndex(0)}></Button>
    </View>
  );
});
