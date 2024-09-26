import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity } from "react-native";

const Parameter = ({ selectedParameter }) => {
  console.log({ selectedParameter });
  const [personel, setPersonel] = useState(false);
  const [metode, setMetode] = useState(false);
  const [peralatan, setPeralatan] = useState(false);
  const [reagen, setReagen] = useState(false);
  const [akomodasi, setAkomodasi] = useState(false);
  const [bebanKerja, setBebanKerja] = useState(false);

  useEffect(() => {
    if (selectedParameter) {
      setPersonel(selectedParameter.personel === 1);
      setMetode(selectedParameter.metode === 1);
      setPeralatan(selectedParameter.peralatan === 1);
      setReagen(selectedParameter.reagen === 1);
      setAkomodasi(selectedParameter.akomodasi === 1);
      setBebanKerja(selectedParameter.beban_kerja === 1);
    }
  }, [selectedParameter]);

  const checkAllSwitches = () => {
    setPersonel(true);
    setMetode(true);
    setPeralatan(true);
    setReagen(true);
    setAkomodasi(true);
    setBebanKerja(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Hasil Kaji Ulang Parameter : {selectedParameter.nama}
      </Text>

      {/* Button Check Semua */}
      <TouchableOpacity style={styles.checkAllButton} onPress={checkAllSwitches}>
        <Text style={styles.checkAllText}>Check Semua</Text>
      </TouchableOpacity>

      {/* Parameter List */}
      <View style={styles.item}>
        <Text style={styles.label}>Personel (Mampu)</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#312e81" }}
          thumbColor={personel ? "#312e81" : "#f4f3f4"}
          value={selectedParameter.personel}
          onValueChange={() => setPersonel(!personel)}
        />
      </View>

      <View style={styles.item}>
        <Text style={styles.label}>Metode (Sesuai)</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#312e81" }}
          thumbColor={metode ? "#312e81" : "#f4f3f4"}
          value={metode}
          onValueChange={() => setMetode(!metode)}
        />
      </View>

      <View style={styles.item}>
        <Text style={styles.label}>Peralatan (Lengkap)</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#312e81" }}
          thumbColor={peralatan ? "#312e81" : "#f4f3f4"}
          value={peralatan}
          onValueChange={() => setPeralatan(!peralatan)}
        />
      </View>

      <View style={styles.item}>
        <Text style={styles.label}>Reagen (Lengkap)</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#312e81" }}
          thumbColor={reagen ? "#312e81" : "#f4f3f4"}
          value={reagen}
          onValueChange={() => setReagen(!reagen)}
        />
      </View>

      <View style={styles.item}>
        <Text style={styles.label}>Akomodasi (Baik)</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#312e81" }}
          thumbColor={akomodasi ? "#312e81" : "#f4f3f4"}
          value={akomodasi}
          onValueChange={() => setAkomodasi(!akomodasi)}
        />
      </View>

      <View style={styles.item}>
        <Text style={styles.label}>Beban Kerja (Over)</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#312e81" }}
          thumbColor={bebanKerja ? "#312e81" : "#f4f3f4"}
          value={bebanKerja}
          onValueChange={() => setBebanKerja(!bebanKerja)}
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
