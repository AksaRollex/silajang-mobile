import { View, Text, StyleSheet, Image } from "react-native";
import React from "react";
import { useSetting } from "@/src/services";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";

export default function FooterLanding() {
  const { data: dataSetting } = useSetting();
  return (
    <View>
      {/* <View style={styles.footer}>
        <View className="flex-row  w-full py-5 justify-center items-center">
          <Image
            source={require("@/assets/images/logo.png")}
            style={{ width: 80, height: 80 }}
          />
          <Image
            source={require("@/assets/images/bse.png")}
            style={{ width: 140, height: 70 }}
          />
        </View>
        <View
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}>
          <View className=" mb-3">
            <Text style={styles.footerTextss}>
              {new Date().getFullYear()} © SI-LAJANG v.3
            </Text>
            <Text style={styles.footerTextss}>
              Sistem Informasi Laboratorium Lingkungan Jombang
            </Text>
          </View>
          <View className="p-3 my-3 gap-y-1 border-slate-100 bg-[#ececec] rounded-lg flex-col justify-center items-center">
            <View className="flex-row gap-x-2">
              <MaterialCommunityIcons name="phone" size={20} color="black" />
              <Text style={styles.footerTextss}>Telepon</Text>
            </View>
            <Text style={styles.footerTextss}>{dataSetting?.telepon}</Text>
            <View className="flex-row gap-x-2 ">
              <MaterialCommunityIcons name="email" size={20} color="black" />
              <Text style={styles.footerTextss}>Email</Text>
            </View>
            <Text style={styles.footerTextss}>{dataSetting?.email} </Text>
            <View className="flex-row gap-x-2">
              <FontAwesome6 name="map-location" size={20} color="black" />
              <Text style={styles.footerTextss}>Alamat</Text>
            </View>
            <Text style={styles.footerTextss}>{dataSetting?.alamat}</Text>
          </View>
        </View>
      </View> */}
      <View style={styles.footer} className="my-5">
        <View
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}>
          <Text style={styles.footerText}>
            {new Date().getFullYear()} © SI-LAJANG v.3
          </Text>
          <Text style={styles.footerTexts}>UPT LABORATORIUM LINGKUNGAN</Text>
        </View>
        <Text style={styles.footerText}>
          DINAS LINGKUNGAN HIDUP KAB.JOMBANG
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flex: 1,
    paddingHorizontal: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    alignSelf: "center",
    color: "grey",
    fontSize: 10,
    fontFamily: "Poppins-Regular",
  },
  footerTexts: {
    alignSelf: "center",
    color: "grey",
    fontSize: 10,
    fontFamily: "Poppins-Bold",
  },
  footerTextss: {
    alignSelf: "center",
    color: "black",
    fontSize: 10,
    fontFamily: "Poppins-Bold",
  },
});
