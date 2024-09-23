import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { TextInput } from "react-native-paper";
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

  const renderPasswordField = (label, fieldName, value, onChange, showPassword, togglePasswordVisibility, error) => (
    <View style={styles.inputContainer}>
      <TextInput
        label={label}
        mode="outlined"
        secureTextEntry={!showPassword}
        style={styles.textInput}
        onChangeText={onChange}
        value={value}
        error={!!error}
        right={
          <TextInput.Icon
            name={() => (
              <TouchableOpacity onPress={togglePasswordVisibility}>
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={Colors.red}
                />
              </TouchableOpacity>
            )}
          />
        }
      />
      {error && <Text style={styles.errorText}>{error.message}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name="old_password"
        rules={{ required: "Password Lama Harus Diisi" }}
        render={({ field: { onChange, value } }) =>
          renderPasswordField(
            "Password Lama",
            "old_password",
            value,
            onChange,
            showOldPassword,
            () => setShowOldPassword(!showOldPassword),
            errors.old_password
          )
        }
      />

      <Controller
        control={control}
        name="password"
        rules={{ required: "Password Baru Harus Diisi", minLength: { value: 12, message: "Password minimal 12 karakter" } }}
        render={({ field: { onChange, value } }) =>
          renderPasswordField(
            "Password Baru",
            "password",
            value,
            onChange,
            showNewPassword,
            () => setShowNewPassword(!showNewPassword),
            errors.password
          )
        }
      />

      <Controller
        control={control}
        name="password_confirmation"
        rules={{ required: "Konfirmasi Password Baru Harus Diisi" }}
        render={({ field: { onChange, value } }) =>
          renderPasswordField(
            "Konfirmasi Password Baru",
            "password_confirmation",
            value,
            onChange,
            showConfirmPassword,
            () => setShowConfirmPassword(!showConfirmPassword),
            errors.password_confirmation
          )
        }
      />

      <View style={styles.buttonContainer}>
        <Button
          label="Batal"
          backgroundColor="#fca5a5"
          borderRadius={5}
          style={styles.button}
          onPress={onCancel}
        />
        <Button
          label="Perbarui"
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
    marginBottom: 16,
  },
  textInput: {
    marginBottom: 16,
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
