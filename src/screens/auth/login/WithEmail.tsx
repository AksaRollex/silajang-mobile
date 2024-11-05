import { memo, useState } from "react";
import { Button, Colors, Text, TextField, View, Image } from "react-native-ui-lib";

import { useForm, Controller } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/src/libs/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import Ionicons from "react-native-vector-icons/Ionicons";
import { TouchableOpacity } from "react-native-ui-lib";


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
      onSuccess: async (res) => {
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
        <Text marginB-5 style={{ fontFamily: "Poppins-Regular" }}>Email</Text>
        <Controller
          control={control}
          name="identifier"
          rules={{ required: "Email tidak boleh kosong" }}
          render={({ field: { onChange, value } }) => (
            <TextField
            style={{ fontFamily: "Poppins-Regular" }}
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
        <Text marginB-5 style={{ fontFamily: "Poppins-Regular" }}>Password</Text>
        <Controller
          control={control}
          name="password"
          rules={{ required: "Password tidak boleh kosong" }}
          render={({ field: { onChange, value } }) => (
            <View> 
              <TextField
                style={{ fontFamily: "Poppins-Regular" }}
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
                }}
              >
                <Ionicons
                  name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
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
        labelStyle={{ fontFamily: "Poppins-Medium" }}
        label="Login"
        backgroundColor={'#312e81'}
        paddingV-12
        borderRadius={5}
        onPress={handleSubmit(login)}
        disabled={isLoading || isSuccess}></Button>
    </View>
  );
});
