import { memo, useState } from "react";
import { Button, Colors, Text, TextField, View } from "react-native-ui-lib";

import { useForm, Controller } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/src/libs/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { TouchableOpacity } from "react-native";
import IonIcons from "react-native-vector-icons/Ionicons";

export default memo(function WithEmail() {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();

  const queryClient = useQueryClient();
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!isPasswordVisible);
  };

  const {
    mutate: login,
    isLoading,
    isSuccess,
  } = useMutation(
    data =>
      axios.post("/auth/secure/login", {
        ...data,
        type: "email",
        remember_me: 1,
      }),
    {
      onSuccess: async res => {
        console.log(res.data.token);
        await AsyncStorage.setItem("@auth-token", res.data.token);
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
        <Text marginB-5>Email </Text>
        <Controller
          control={control}
          name="identifier"
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
        {errors.identifier && (
          <Text color={Colors.red30} body>
            {errors.identifier.message}
          </Text>
        )}
        
      </View>
      <View marginB-20>
        <Text marginB-5>Password</Text>
        <Controller
          control={control}
          name="password"
          rules={{ required: "Password tidak boleh kosong" }}
          render={({ field: { onChange, value } }) => (
            <View>
              <TextField
                placeholder={"Password"}
                secureTextEntry={!isPasswordVisible}
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
                  position: "relative",
                }}
                onChangeText={onChange}
                value={value}
              />
              <TouchableOpacity
                onPress={togglePasswordVisibility}
                style={{
                  position: "absolute",
                  right: 10,
                  top: 12,
                }}>
                <IonIcons
                  name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={Colors.brand}
                />
              </TouchableOpacity>
            </View>
          )}
        />
        {errors.password && (
          <Text color={Colors.red30} body>
            {errors.password.message}
          </Text>
        )}
      </View>
      <Button
        label="Login"
        backgroundColor={Colors.brand}
        paddingV-12
        borderRadius={5}
        onPress={handleSubmit(login)}
        disabled={isLoading || isSuccess}></Button>
    </View>
  );
});
