import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { CheckCircle, XCircle } from "lucide-react-native";
import axios from "@/src/libs/axios";
import { API_URL } from "@env";

const ParameterCard = ({ param, uuid }) => {
  const pivotData = param.pivot;

  const [satuan, setSatuan] = useState("");
  const [bakuMutu, setBakuMutu] = useState("");
  const [mdl, setMdl] = useState("");
  const [hasilUji, setHasilUji] = useState("");
  const [hasilUjiPembulatan, setHasilUjiPembulatan] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [keteranganHasil, setKeteranganHasil] = useState("");

  useEffect(() => {
    if (pivotData) {
      setSatuan(pivotData.satuan || "");
      setBakuMutu(pivotData.baku_mutu || "");
      setMdl(pivotData.mdl || "");
      setHasilUji(pivotData.hasil_uji || "");
      setHasilUjiPembulatan(pivotData.hasil_uji_pembulatan || "");
      setKeterangan(pivotData.keterangan || "");
      setKeteranganHasil(pivotData.keterangan_hasil || "");
    }
  }, [pivotData]);

  const handleParameterUpdate = async (updatedData) => {
    try {
      const updatePayload = {
        id: param.id,
        pivot: updatedData,
      };
      await axios.post(`${API_URL}/verifikasi/koordinator-teknis/${uuid}/fill-parameter`, {
        parameters: [updatePayload],
      });
      console.log("Parameter updated successfully", updatedData);
    } catch (error) {
      console.error("Error updating parameter:", error);
    }
  };

  return (
    <View style={styles.parameterCard}>
      {/* Parameter Header */}
      <View style={styles.parameterHeader}>
        <View style={styles.parameterTitleContainer}>
          {keteranganHasil === "Memenuhi" && <CheckCircle color="#4CAF50" size={20} />}
          {keteranganHasil === "Tidak Memenuhi" && <XCircle color="#D32F2F" size={20} />}
          <Text style={styles.parameterTitle}>
            {param.nama} {param.keterangan ? `(${param.keterangan})` : ""}
          </Text>
        </View>
        <Text style={styles.parameterType}>{param.jenis_parameter.nama}</Text>
        {!param.is_dapat_diuji && (
          <View style={styles.subkontrakBadge}>
            <Text style={styles.subkontrakText}>Subkontrak</Text>
          </View>
        )}
      </View>

      {/* Parameter Form */}
      <View style={styles.parameterForm}>
        <View style={styles.formRow}>
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Satuan *</Text>
            <TextInput
              style={styles.input}
              value={satuan}
              onChangeText={text => {
                setSatuan(text);
                handleParameterUpdate({ satuan: text });
              }}
              placeholder="Satuan"
            />
          </View>
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Baku Mutu *</Text>
            <TextInput
              style={styles.input}
              value={bakuMutu}
              onChangeText={text => {
                setBakuMutu(text);
                handleParameterUpdate({ baku_mutu: text });
              }}
              placeholder="Baku Mutu"
            />
          </View>
        </View>

        <View style={styles.formField}>
          <Text style={styles.fieldLabel}>MDL</Text>
          <TextInput
            style={styles.input}
            value={mdl}
            onChangeText={text => {
              setMdl(text);
              handleParameterUpdate({ mdl: text });
            }}
            placeholder="MDL"
          />
        </View>

        <View style={styles.formRow}>
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Hasil Uji (Analis) *</Text>
            <TextInput
              style={styles.input}
              value={hasilUji}
              onChangeText={text => {
                setHasilUji(text);
                handleParameterUpdate({ hasil_uji: text });
              }}
              placeholder="Hasil Uji"
            />
          </View>
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Hasil Uji (Pembulatan) *</Text>
            <TextInput
              style={styles.input}
              value={hasilUjiPembulatan}
              onChangeText={text => {
                setHasilUjiPembulatan(text);
                handleParameterUpdate({ hasil_uji_pembulatan: text });
              }}
              placeholder="Hasil Uji Pembulatan"
            />
          </View>
        </View>

        <View>
          <Text style={styles.fieldLabel}>Keterangan</Text>
          <TextInput
            style={styles.input}
            value={keterangan}
            onChangeText={text => {
              setKeterangan(text);
              handleParameterUpdate({ keterangan: text });
            }}
            placeholder="Keterangan"
          />
        </View>

        {pivotData.acc_analis && (
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[
                styles.resultButton,
                styles.failButton,
                keteranganHasil === "Tidak Memenuhi" && styles.failButtonActive,
              ]}
              onPress={() => {
                setKeteranganHasil("Tidak Memenuhi");
                handleParameterUpdate({ keterangan_hasil: "Tidak Memenuhi" });
              }}
            >
              <Text style={styles.buttonText}>Tidak Memenuhi</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.resultButton,
                styles.passButton,
                keteranganHasil === "Memenuhi" && styles.passButtonActive,
              ]}
              onPress={() => {
                setKeteranganHasil("Memenuhi");
                handleParameterUpdate({ keterangan_hasil: "Memenuhi" });
              }}
            >
              <Text style={styles.buttonText}>Memenuhi</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default ParameterCard;

const styles = StyleSheet.create({
  parameterCard: { marginBottom: 20, padding: 15, backgroundColor: "#fff", borderRadius: 10 },
  parameterHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  parameterTitleContainer: { flexDirection: "row", alignItems: "center" },
  parameterTitle: { fontSize: 16, fontWeight: "bold", marginLeft: 8 },
  parameterType: { fontSize: 14, color: "#666" },
  subkontrakBadge: { backgroundColor: "#ff9800", padding: 5, borderRadius: 5 },
  subkontrakText: { color: "#fff", fontWeight: "bold" },
  formRow: { flexDirection: "row", justifyContent: "space-between" },
  formField: { flex: 1, marginHorizontal: 5 },
  fieldLabel: { fontWeight: "bold", marginBottom: 5 },
  input: { borderWidth: 1, borderColor: "#ddd", padding: 10, borderRadius: 5, marginBottom: 10 },
  buttonGroup: { flexDirection: "row", justifyContent: "space-around", marginTop: 10 },
  resultButton: { padding: 10, borderRadius: 5, flex: 1, marginHorizontal: 5 },
  failButton: { backgroundColor: "#D32F2F" },
  passButton: { backgroundColor: "#4CAF50" },
  failButtonActive: { backgroundColor: "#FFCDD2" },
  passButtonActive: { backgroundColor: "#C8E6C9" },
  buttonText: { textAlign: "center", color: "#fff" },
});
