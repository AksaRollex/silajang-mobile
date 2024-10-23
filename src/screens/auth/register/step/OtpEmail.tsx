import OTPInputView from "@twotalltotems/react-native-otp-input";
import { memo } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  Colors,
  Text,
  TouchableOpacity,
  View,
} from "react-native-ui-lib";
import { useFormStep, useFormStore } from "../Index";
import { useMutation } from "@tanstack/react-query";
import axios from "@/src/libs/axios";
import Toast from "react-native-toast-message";

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
        .post("/auth/register/check/email/otp", {
          email: credential.email,
          otp: data.otp,
        })
        .then(res => res.data),
    {
      onSuccess: (data, ctx) => {
        console.log(ctx)
        setOtp({
          ...otp,
          email: ctx.otp,
        })
        Toast.show({
          type: "success",
          text1: "Kode OTP Berhasil Diverifikasi",
        });
        console.log(otp);
        nextStep();
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

  const { mutate: getEmailOtp, status: statusOtp } = useMutation(
    data =>
      axios
        .post("/auth/register/get/email/otp", { email: credential.email })
        .then(res => res.data),
    {
      onSuccess: data => {
        Toast.show({
          type: "success",
          text1: "Kode OTP Berhasil",
          text2: "Kode OTP dikirim ke Email Anda",
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
        label="Submit"
        backgroundColor={Colors.brand}
        paddingV-12
        marginB-10
        borderRadius={5}
        onPress={handleSubmit(verify)}
        disabled={statusVerif == "loading" || statusOtp == "loading"}></Button>
      <Button
        label="Kembali"
        paddingV-12
        borderRadius={5}
        outline
        outlineColor={Colors.brand}
        onPress={() => setIndex(0)}></Button>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginTop: 10,
        }}>
        <Text style={{ alignSelf: "center" }}>
          Tidak Menerima menerima Kode OTP?
        </Text>
        <TouchableOpacity onPress={getEmailOtp}>
          <Text
            style={{
              color: "#3b82f6",
              fontWeight: "bold",
              fontSize: 14,
              marginHorizontal: 5,
            }}>
            Kirim Ulang
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});
