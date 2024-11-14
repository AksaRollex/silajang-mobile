import { View, Text, StyleSheet } from "react-native";
import React from "react";

export default function FooterText() {
  return (
    <View style={styles.Container}>
      <View style={styles.footer}>
        <View style={{  flexDirection : 'row' }}>


        <Text style={styles.footerText}>
          2024 © 
        </Text>
        <Text style={styles.footerTexts} >
          SI-LAJANG 
        </Text>
        </View>
        <Text style={styles.footerText}>
          Sistem Informasi Laboratorium Lingkungan Jombang
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  Container: {
    flex: 1,
  },
  footer: {
    flex: 1,
    paddingVertical: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    alignSelf: "center",
    color: "black",
    fontSize: 12,
    fontFamily: "Poppins-Regular",
  },
  footerTexts: {
    alignSelf: "center",
    color: "black",
    fontSize: 12 ,
    fontFamily: "Poppins-Bold",
  },
});
