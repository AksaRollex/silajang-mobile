import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity } from "react-native";
import axios from "@/src/libs/axios";

const Parameter = ({ selectedParameter, uuid }) => {
  const params = { selectedParameter };
  const pivotData = params.selectedParameter.pivot;
  
  const [personel, setPersonel] = useState(0);
  const [metode, setMetode] = useState(0);
  const [peralatan, setPeralatan] = useState(0);
  const [reagen, setReagen] = useState(0);
  const [akomodasi, setAkomodasi] = useState(0);
  const [bebanKerja, setBebanKerja] = useState(0);

  useEffect(() => {
    if (pivotData) {
      setPersonel(pivotData.personel);
      setMetode(pivotData.metode);
      setPeralatan(pivotData.peralatan);
      setReagen(pivotData.reagen);
      setAkomodasi(pivotData.akomodasi);
      setBebanKerja(pivotData.beban_kerja);
    }
  }, [pivotData]);

  const handleSwitchChange = async (name, value) => {
    const updatedValue = value ? 1 : 0;

    // Update state locally first
    if (name === "personel") setPersonel(updatedValue);
    if (name === "metode") setMetode(updatedValue);
    if (name === "peralatan") setPeralatan(updatedValue);
    if (name === "reagen") setReagen(updatedValue);
    if (name === "akomodasi") setAkomodasi(updatedValue);
    if (name === "beban_kerja") setBebanKerja(updatedValue);

    // Prepare data for API request
    const updateData = {
      id: params.selectedParameter.id, // assuming the parameter has an ID
      pivot: {
        [name]: updatedValue
      }
    };

    // Make API request to update the pivot data
    await axios.post(`/administrasi/pengambil-sample/${uuid}/update`, {
      parameters: [updateData],
    });

    console.log("Parameter Terupdate", updateData);
};


  const checkAllSwitches = async () => {
    const updatedValues = {
      personel: 1,
      metode: 1,
      peralatan: 1,
      reagen: 1,
      akomodasi: 1,
      beban_kerja: 1,
    };
  
    // Update state locally
    setPersonel(updatedValues.personel);
    setMetode(updatedValues.metode);  
    setPeralatan(updatedValues.peralatan);
    setReagen(updatedValues.reagen);
    setAkomodasi(updatedValues.akomodasi);
    setBebanKerja(updatedValues.beban_kerja);
  
    // Prepare data for API request
    const updateData = {
      id: params.selectedParameter.id, // assuming the parameter has an ID
      pivot: updatedValues,
    };
  
      // Make API request to update the pivot data
      await axios.post(`/administrasi/pengambil-sample/${uuid}/update`, {
        parameters: [updateData],
      });
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Hasil Kaji Ulang Parameter: {selectedParameter.nama}
      </Text>

      <TouchableOpacity style={styles.checkAllButton} onPress={checkAllSwitches}>
        <Text style={styles.checkAllText}>Check Semua</Text>
      </TouchableOpacity>

      {/* Personel Switch */}
      <View style={styles.item}>
        <Text style={styles.label}>Personel (Mampu)</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#312e81" }}
          thumbColor={personel ? "#f4f3f4" : "#f4f3f4"}
          value={Boolean(personel)}
          onValueChange={(value) => handleSwitchChange("personel", value)}
        />
      </View>

      {/* Metode Switch */}
      <View style={styles.item}>
        <Text style={styles.label}>Metode (Sesuai)</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#312e81" }}
          thumbColor={metode ? "#f4f3f4" : "#f4f3f4"}
          value={Boolean(metode)}
          onValueChange={(value) => handleSwitchChange("metode", value)}
        />
      </View>

      {/* Peralatan Switch */}
      <View style={styles.item}>
        <Text style={styles.label}>Peralatan (Lengkap)</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#312e81" }}
          thumbColor={peralatan ? "#f4f3f4" : "#f4f3f4"}
          value={Boolean(peralatan)}
          onValueChange={(value) => handleSwitchChange("peralatan", value)}
        />
      </View>

      {/* Reagen Switch */}
      <View style={styles.item}>
        <Text style={styles.label}>Reagen (Lengkap)</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#312e81" }}
          thumbColor={reagen ? "#f4f3f4" : "#f4f3f4"}
          value={Boolean(reagen)}
          onValueChange={(value) => handleSwitchChange("reagen", value)}
        />
      </View>

      {/* Akomodasi Switch */}
      <View style={styles.item}>
        <Text style={styles.label}>Akomodasi (Baik)</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#312e81" }}
          thumbColor={akomodasi ? "#f4f3f4" : "#f4f3f4"}
          value={Boolean(akomodasi)}
          onValueChange={(value) => handleSwitchChange("akomodasi", value)}
        />
      </View>

      {/* Beban Kerja Switch */}
      <View style={styles.item}>
        <Text style={styles.label}>Beban Kerja (Over)</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#312e81" }}
          thumbColor={bebanKerja ? "#f4f3f4" : "#f4f3f4"}
          value={Boolean(bebanKerja)}
          onValueChange={(value) => handleSwitchChange("beban_kerja", value)}
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
    fontFamily: "Poppins-SemiBold",
    marginBottom: 20,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: "Poppins-Medium",
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
    fontFamily : "Poppins-SemiBold",
  },
});

export default Parameter;
