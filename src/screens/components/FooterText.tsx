import { View, Text, StyleSheet } from "react-native";
import React from "react";

export default function FooterText() {
  return (  
    <View style={styles.Container} >

    <View style={styles.footer}>
      <Text style={styles.footerText}>
        {
          "2024 ©SI-LAJANG v.3 \nSistem Informasi Laboratorium Lingkungan Jombang"
        }
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
  },
});