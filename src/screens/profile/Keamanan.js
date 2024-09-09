import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { TextInput } from "react-native-paper";
import { Colors, Button } from "react-native-ui-lib";
import { useForm, Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import axios from "@/src/libs/axios";
import { TextField } from "react-native-ui-lib";

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
        reset(); // Reset form setelah berhasil
        navigation.navigate("Profile"); // Navigasi kembali untuk refresh halaman
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
      <Text style={{  color : "black" }}>Password Lama</Text>
      <Controller
        control={control}
        name="old_password"
        rules={{ required: "Password Lama Harus Diisi" }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Password Lama"
            mode="outlined"
            secureTextEntry={!showOldPassword}
            style={styles.textInput}
            onChangeText={onChange}
            value={value}
            error={!!errors.old_password}
            right={
              <TextInput.Icon
                name={showOldPassword ? "eye-off" : "eye"}
                onPress={() => setShowOldPassword(!showOldPassword)}
              />
            }
          />
        )}
      />
      {errors.old_password && (
        <Text style={styles.errorText}>{errors.old_password.message}</Text>
      )}
      <Text style={{  color : "black" }}>Password Baru</Text>
      
      <Controller
        control={control}
        name="password"
        rules={{ required: "Password Baru Harus Diisi", minLength: { value: 12, message: "Password minimal 12 karakter" } }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Password Baru"
            mode="outlined"
            secureTextEntry={!showNewPassword}
            style={styles.textInput}
            onChangeText={onChange}
            value={value}
            error={!!errors.password}
            right={
              <TextInput.Icon
                name={showNewPassword ? "eye-off" : "eye"}
                onPress={() => setShowNewPassword(!showNewPassword)}
              />
            }
          />
        )}
      />
      {errors.password && (
        <Text style={styles.errorText}>{errors.password.message}</Text>
      )}
      <Text style={{  color : "black" }}>Konfirmasi Password Baru</Text>
      
      <Controller
        control={control}
        name="password_confirmation"
        rules={{ required: "Konfirmasi Password Baru Harus Diisi" }}
        render={({ field: { onChange, value } }) => (
          <TextInput
            label="Konfirmasi Password Baru"
            mode="outlined"
            secureTextEntry={!showConfirmPassword}
            style={styles.textInput}
            onChangeText={onChange}
            value={value}
            error={!!errors.password_confirmation}
            right={
              <TextInput.Icon
                name={showConfirmPassword ? "eye-off" : "eye"}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
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
    marginBottom: 16, // Adds space between each TextInput
  },
  submitButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4682B4",
    marginVertical: 7,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Keamanan;
