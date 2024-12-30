import { View, Text, StyleSheet } from "react-native";
import React from "react";

export default function FooterText() {
  return (
    <View>
      <View style={styles.footer}>
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
    paddingVertical: 10,
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
});
