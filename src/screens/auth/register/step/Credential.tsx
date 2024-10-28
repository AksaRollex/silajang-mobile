import axios from "@/src/libs/axios";
import { useMutation } from "@tanstack/react-query";
import { memo } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Assets,
  Button,
  Colors,
  Text,
  TextField,
  View,
} from "react-native-ui-lib";
import { API_URL } from "@env";
import { useFormStep, useFormStore } from "../Index";
import Toast from "react-native-toast-message";

export default memo(function Credential() {
  const { setCredential } = useFormStore();
  const { nextStep, setIndex } = useFormStep();
  const {
    handleSubmit,
    control,
    formState: { errors },
    getValues,
  } = useForm();

  const {
    mutate: getEmailOtp,
    isLoading,
    isSuccess,
  } = useMutation(
    data =>
      axios.post(`/auth/register/get/email/otp`, data).then(res => res.data),
    {
      onSuccess: data => {
        setCredential(getValues());
        nextStep();
        Toast.show({
          type: "success",
          text1: "Kode OTP Berhasil",
          text2: "Kode OTP dikirim ke email anda",
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
          name="email"
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
        {errors.email && (
          <Text color={Colors.red30} body>
            {errors.email.message}
          </Text>
        )}
      </View>
      <View marginB-20>
        <Text marginB-5>No. Telepon</Text>
        <Controller
          control={control}
          name="phone"
          rules={{ required: "No. Telepon tidak boleh kosong" }}
          render={({ field: { onChange, value } }) => (
            <TextField
              keyboardType="phone-pad"
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
        {errors.phone && (
          <Text color={Colors.red30} body>
            {errors.phone.message}
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
