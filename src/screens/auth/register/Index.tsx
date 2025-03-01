import { If } from "@/src/libs/component";
import React, { memo } from "react";
import { ScrollView } from "react-native";
import { Assets, Button, Colors, Image, Text, View } from "react-native-ui-lib";
import ParallaxScroll from "@monterosa/react-native-parallax-scroll";

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
    <ParallaxScroll
      renderParallaxBackground={({ animatedValue }) => (
        <Image
          source={require("@/assets/images/background.png")}
          animatedValue={animatedValue}
          style={{ width: "100%", height: 300 }}
        />
      )}>
      <View
        backgroundColor={Colors.white}
        paddingH-20
        paddingV-10
        style={{
          flex: 1,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}>
        <View style={{ flex: 1 }} padding-20>
          <Text h2 color={Colors.brand} marginB-5 className="font-poppins-semibold">
            Daftar Akun Baru
          </Text>
          <Text color={Colors.grey30} marginB-40 className="font-poppins-regular">
            Isi formulir di bawah ini untuk membuat akun baru dan mulai
            menikmati layanan kami.
          </Text>

          <If isTrue={index === 0}>
            <Credential />
          </If>
          <If isTrue={index === 1}>
            <OtpEmail />
          </If>

          <Button
            labelStyle={{ fontFamily: "Poppins-Regular" }}
            size="small"
            label="Sudah Memiliki Akun? Masuk"
            paddingV-12
            marginT-10
            // iconOnRight
            // iconSource={Assets.getAssetByPath("icons.chevronRight")}
            // iconStyle={{ width: 20, height: 28 }}
            color={'#312e81'}
            hyperlink
            onPress={() => navigation.navigate("login")}></Button>
        </View>
      </View>
    </ParallaxScroll>
  );
});
