import OTPInputView from "@twotalltotems/react-native-otp-input";
import { memo } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  Colors,
  Text,
  Toast,
  TouchableOpacity,
  View,
} from "react-native-ui-lib";
import { useFormStep, useFormStore } from "../Index";
import { useMutation } from "@tanstack/react-query";
import axios from "@/src/libs/axios";

export default memo(function OtpPhone() {
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
        .post("/auth/register/check/phone/otp", { phone: credential.phone })
        .then(res => res.data),
    {
      onSuccess: data => {
nextStep();
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
        <Text>Masukkan Kode OTP yang dikirimkan ke Whatsapp Anda</Text>
        <Text color={Colors.blue40}>{credential.phone}</Text>
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
                verify({ ...data, otp: watch("otp") }),
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
        label="Kembali"
        paddingV-12
        borderRadius={5}
        outline
        outlineColor={Colors.brand}
        onPress={() => setIndex(0)}></Button>
      <View style={{ flexDirection: "row", justifyContent: "center", marginTop  : 10 }}>
        <Text style={{ alignSelf: "center" }}>
          Tidak Menerima menerima Kode OTP?
        </Text>
        <TouchableOpacity onPress={getPhoneOtp}>
          <Text style={{ color: '#3b82f6', fontWeight: 'bold', fontSize : 14, marginHorizontal :5 }}>Kirim Ulang</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});
