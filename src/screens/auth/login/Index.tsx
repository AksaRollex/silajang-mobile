import React, { memo, useState } from "react";
import {
  Assets,
  Button,
  Colors,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native-ui-lib";

import WithEmail from "./WithEmail";
import WithPhone from "./WithPhone";
import { If } from "@/src/libs/component";
import { ScrollView } from "react-native";
import ParallaxScroll from "@monterosa/react-native-parallax-scroll";

export default memo(function Login({ navigation }): React.JSX.Element {
  const [activeTab, setActiveTab] = useState(1);

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
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
          paddingV-30
          style={{
            flex: 1,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Image
              source={require("@/assets/images/logo.png")}
              style={{ width: 60, height: 80, marginTop: 8 }}
            />
            <View style={{ flexShrink: 1 }}>
              <Text h1 color={Colors.brand} style={{ fontSize: 30, color: "#312e81" }} className="font-poppins-semibold">
                SELAMAT DATANG
              </Text>
              <Text className="font-poppins-regular">Sistem Informasi Laboratorium Lingkungan Jombang</Text>
            </View>
          </View>

          <View
            marginT-20
            style={{
              flexDirection: "row",
              borderBottomWidth: 1,
              borderBottomColor: Colors.grey40,
            }}>
            <View
              padding-10
              width="50%"
              style={{
                borderBottomWidth: activeTab === 1 ? 3 : 0,
                borderBottomColor: "#312e81",
              }}>
              <TouchableOpacity onPress={() => setActiveTab(1)}>
                <Text
                  color={activeTab === 1 ? Colors.brand : Colors.dark}
                  style={{
                    textAlign: "center",
                    fontFamily: activeTab === 1 ? "Poppins-SemiBold" : "Poppins-Regular",
                    color: activeTab === 1 ? "#312e81" : "black",
                  }}>
                  EMAIL
                </Text>
              </TouchableOpacity>
            </View>
            <View
              padding-10
              width="50%"
              style={{
                borderBottomWidth: activeTab === 2 ? 3 : 0,
                borderBottomColor: "#312e81",
              }}>
              <TouchableOpacity onPress={() => setActiveTab(2)}>
                <Text
                  color={activeTab === 2 ? Colors.brand : Colors.dark}
                  style={{
                    textAlign: "center",
                    fontFamily: activeTab === 1 ? "Poppins-Regular" : "Poppins-SemiBold",
                    color: activeTab === 1 ? "black" : "#312e81",
                  }}>
                  NO. TELEPON
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <If isTrue={activeTab === 1}>
            <WithEmail />
          </If>
          <If isTrue={activeTab === 2}>
            <WithPhone />
          </If>
        </View>

        <View style={{ flex: 1, justifyContent: "flex-end", alignItems: "center", paddingVertical: 20, backgroundColor: Colors.white }}>
          <Image
            source={require("@/assets/images/bse.png")}
            style={{ width: "60%", height: undefined, aspectRatio: 3 / 1, resizeMode: "contain" }}
          />
        </View>
      </ParallaxScroll>
    </ScrollView>
  );
});