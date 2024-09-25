import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { TextInput } from "react-native-paper";
import { Colors, Button, TextField } from "react-native-ui-lib";
import { useForm, Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import axios from "@/src/libs/axios";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 
rem = multiplier => baseRem * multiplier;
const baseRem = 16;
const Keamanan = () => {
  const { handleSubmit, control, formState: { errors }, reset } = useForm();
  const navigation = useNavigation();
  
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const updateKeamanan = useMutation(
    (data) => axios.put("/user/updateKeamanan", data),
    {
      onSuccess: () => {
        Toast.show({
          type: "success",
          text1: "Password berhasil diperbarui",
        });
        reset(); 
        navigation.navigate("Profile"); 
      },
      onError: (error) => {
        console.error(error.response.data);
        Toast.show({
          type: "error",
          text1: error.response.data.message || "Gagal memperbarui password",
        });
      },
    }
  );

  const onSubmit = (data) => {
    if (data.password !== data.password_confirmation) {
      Toast.show({
        type: "error",
        text1: "Konfirmasi password tidak cocok",
      });
      return;
    }
    updateKeamanan.mutate(data);
  };

  return (
    <View style={styles.container}>
      <Text style={{ color: "black" }}>Password Lama</Text>
      <Controller
        control={control}
        name="old_password"
        rules={{ required: "Password Lama Harus Diisi" }}
        render={({ field: { onChange, value } }) => (
          <TextField
            mode="outlined"
            secureTextEntry={!showOldPassword}
            fieldStyle={styles.textInput}
            onChangeText={onChange}
            value={value}
            error={!!errors.old_password}
            right={
              <TextInput.Icon
                name={showOldPassword ? "eye-off" : "eye"}
                render={() => (
                  <Icon
                    name={showOldPassword ? "eye-off" : "eye"}
                    size={24}
                    color="black"
                    onPress={() => setShowOldPassword(!showOldPassword)}
                  />
                )}
              />
            }
          />
        )}
      />
      {errors.old_password && (
        <Text style={styles.errorText}>{errors.old_password.message}</Text>
      )}

      <Text style={{ color: "black" }}>Password Baru</Text>
      <Controller
        control={control}
        name="password"
        rules={{ required: "Password Baru Harus Diisi", minLength: { value: 12, message: "Password minimal 12 karakter" } }}
        render={({ field: { onChange, value } }) => (
          <TextField
            mode="outlined"
            secureTextEntry={!showNewPassword}
            fieldStyle={styles.textInput}
            onChangeText={onChange}
            value={value}
            error={!!errors.password}
            right={
              <TextInput.Icon
                name={showNewPassword ? "eye-off" : "eye"}
                render={() => (
                  <Icon
                    name={showNewPassword ? "eye-off" : "eye"}
                    size={24}
                    color="black"
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  />
                )}
              />
            }
          />
        )}
      />
      {errors.password && (
        <Text style={styles.errorText}>{errors.password.message}</Text>
      )}

      <Text style={{ color: "black" }}>Konfirmasi Password Baru</Text>
      <Controller
        control={control}
        name="password_confirmation"
        rules={{ required: "Konfirmasi Password Baru Harus Diisi" }}
        render={({ field: { onChange, value } }) => (
          <TextField
            mode="outlined"
            secureTextEntry={!showConfirmPassword}
            fieldStyle={styles.textInput}
            onChangeText={onChange}
            value={value}
            error={!!errors.password_confirmation}
            right={
              <TextInput.Icon
                name={showConfirmPassword ? "eye-off" : "eye"}
                render={() => (
                  <Icon
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={24}
                    color="black"
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                )}
              />
            }
          />
        )}
      />
      {errors.password_confirmation && (
        <Text style={styles.errorText}>{errors.password_confirmation.message}</Text>
      )}
   
      <Button
        label="Perbarui"
        style={{ marginBottom: 40 }}
        backgroundColor={Colors.brand}
        borderRadius={5}
        onPress={handleSubmit(onSubmit)}
        disabled={updateKeamanan.isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  textInput: {
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    color: "black",
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom : rem(1.5)
  },
  icon: {
    width: 24,
    height: 24,
  },
  errorText: {
    color: 'red',
  },
});

export default Keamanan;
