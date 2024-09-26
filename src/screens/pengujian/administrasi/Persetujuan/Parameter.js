import React, { useState } from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity } from "react-native";

const Parameter = ({ selectedParameter }) => {
  console.log({ selectedParameter });
  const [switchStates, setSwitchStates] = useState({
    personel: false,
    metode: false,
    peralatan: false,
    reagen: false,
    akomodasi: false,
    bebanKerja: false,
  });

  const toggleSwitch = key => {
    setSwitchStates(prevState => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };

  const handleCheckAll = () => {
    const allTrue = Object.values(switchStates).every(state => state);
    setSwitchStates({
      personel: !allTrue,
      metode: !allTrue,
      peralatan: !allTrue,
      reagen: !allTrue,
      akomodasi: !allTrue,
      bebanKerja: !allTrue,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Hasil Kaji Ulang Parameter : {selectedParameter.nama}
      </Text>

      {/* Button Check Semua */}
      <TouchableOpacity onPress={handleCheckAll} style={styles.checkAllButton}>
        <Text style={styles.checkAllText}>Check Semua</Text>
      </TouchableOpacity>

      {/* Parameter List */}
      <View style={styles.item}>
        <Text style={styles.label}>Personel (Mampu)</Text>
        <Switch
          value={switchStates.personel}
          onValueChange={() => toggleSwitch("personel")}
          trackColor={{ false: "#767577", true: "#312e81" }}
          thumbColor={switchStates.personel ? "#312e81" : "#f4f3f4"}
        />
      </View>

      <View style={styles.item}>
        <Text style={styles.label}>Metode (Sesuai)</Text>
        <Switch
          value={switchStates.metode}
          onValueChange={() => toggleSwitch("metode")}
          trackColor={{ false: "#767577", true: "#312e81" }}
          thumbColor={switchStates.metode ? "#312e81" : "#f4f3f4"}
        />
      </View>

      <View style={styles.item}>
        <Text style={styles.label}>Peralatan (Lengkap)</Text>
        <Switch
          value={switchStates.peralatan}
          onValueChange={() => toggleSwitch("peralatan")}
          trackColor={{ false: "#767577", true: "#312e81" }}
          thumbColor={switchStates.peralatan ? "#312e81" : "#f4f3f4"}
        />
      </View>

      <View style={styles.item}>
        <Text style={styles.label}>Reagen (Lengkap)</Text>
        <Switch
          value={switchStates.reagen}
          onValueChange={() => toggleSwitch("reagen")}
          trackColor={{ false: "#767577", true: "#312e81" }}
          thumbColor={switchStates.reagen ? "#312e81" : "#f4f3f4"}
        />
      </View>

      <View style={styles.item}>
        <Text style={styles.label}>Akomodasi (Baik)</Text>
        <Switch
          value={switchStates.akomodasi}
          onValueChange={() => toggleSwitch("akomodasi")}
          trackColor={{ false: "#767577", true: "#312e81" }}
          thumbColor={switchStates.akomodasi ? "#312e81" : "#f4f3f4"}
        />
      </View>

      <View style={styles.item}>
        <Text style={styles.label}>Beban Kerja (Over)</Text>
        <Switch
          value={switchStates.bebanKerja}
          onValueChange={() => toggleSwitch("bebanKerja")}
          trackColor={{ false: "#767577", true: "#312e81" }}
          thumbColor={switchStates.bebanKerja ? "#312e81" : "#f4f3f4"}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    backgroundColor: "white",
  },
  title: {
    fontWeight: "bold",
    marginBottom: 20,
  },
  checkAllButton: {
    alignSelf: "center",
    padding: 10,
    backgroundColor: "#dbeafe",
    borderRadius: 5,
    marginBottom: 20,
  },
  checkAllText: {
    color: "#312e81",
    fontWeight: "bold",
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
  },
});

export default Parameter;
