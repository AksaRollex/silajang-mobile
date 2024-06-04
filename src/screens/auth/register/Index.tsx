import { If } from "@/src/libs/component";
import React, { memo } from "react";
import { ScrollView } from "react-native";
import { Assets, Button, Colors, Image, Text, View } from "react-native-ui-lib";

import { create } from "zustand";
import Credential from "./step/Credential";
import OtpEmail from "./step/OtpEmail";

export const useFormStore = create(set => ({
  credential: {
    name: "",
    phone: "",
    email: "",
  },
  otp: {
    email: "",
    phone: "",
  },
  password: {
    password: "",
    password_confirmation: "",
  },
  setCredential: credential => set(state => ({ credential })),
  setOtp: otp => set(state => ({ otp })),
  setPassword: password => set(state => ({ password })),
}));

export const useFormStep = create(set => ({
  index: 0,
  nextStep: () => set(state => ({ index: state.index + 1 })),
  prevStep: () => set(state => ({ index: state.index - 1 })),
  setIndex: index => set(state => ({ index })),
}));

export default memo(function Login({ navigation }): React.JSX.Element {
  const { index } = useFormStep();

  return (
    <ScrollView style={{ backgroundColor: Colors.white }}>
      <View style={{ flex: 1 }} padding-20>
        <Image
          source={require("@/assets/images/logo.png")}
          style={{ width: 30, height: 50 }}
        />

        <Text h2 color={Colors.brand} marginT-50 marginB-5>
          Daftar Akun Baru
        </Text>
        <Text color={Colors.grey30} marginB-40>
          Isi formulir di bawah ini untuk membuat akun baru dan mulai menikmati
          layanan kami.
        </Text>

        <If isTrue={index === 0}>
          <Credential />
        </If>
        <If isTrue={index === 1}>
          <OtpEmail />
        </If>

        <Button
          size="small"
          label="Sudah Memiliki Akun? Masuk"
          paddingV-12
          marginT-50
          // iconOnRight
          // iconSource={Assets.getAssetByPath("icons.chevronRight")}
          // iconStyle={{ width: 20, height: 28 }}
          color={Colors.brand}
          hyperlink
          onPress={() => navigation.navigate("login")}></Button>
      </View>
    </ScrollView>
  );
});
