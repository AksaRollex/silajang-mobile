import React, { useState } from "react";
import { View, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import { Colors, Button } from "react-native-ui-lib";
import { useForm, Controller } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import axios from "@/src/libs/axios";
import Ionicons from "react-native-vector-icons/Ionicons";

const Keamanan = ({ onCancel }) => {
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
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              onChangeText={onChange}
              value={value}
              secureTextEntry={!showOldPassword}
            />
            <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)}>
              <Ionicons
                name={showOldPassword ? "eye-outline" : "eye-off-outline"}
                size={19}
                color="gray"
              />
            </TouchableOpacity>
          </View>
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
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              onChangeText={onChange}
              value={value}
              secureTextEntry={!showNewPassword}
            />
            <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
              <Ionicons
                name={showNewPassword ? "eye-outline" : "eye-off-outline"}
                size={19}
                color="gray"
              />
            </TouchableOpacity>
          </View>
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
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              onChangeText={onChange}
              value={value}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons
                name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                size={19}
                color="gray"
              />
            </TouchableOpacity>
          </View>
        )}
      />
      {errors.password_confirmation && (
        <Text style={styles.errorText}>{errors.password_confirmation.message}</Text>
      )}

      <View style={styles.buttonContainer}>
        <Button
          label="Simpan"
          backgroundColor={Colors.brand}
          borderRadius={5}
          style={styles.button}
          onPress={handleSubmit(onSubmit)}
          disabled={updateKeamanan.isLoading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.grey40,
    borderRadius: 5,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 42,
    paddingVertical: 8,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    width: "100%",
    marginBottom: 10,
  },
  errorText: {
    color: "red",
    marginBottom: 16,
  },
});

export default Keamanan;
