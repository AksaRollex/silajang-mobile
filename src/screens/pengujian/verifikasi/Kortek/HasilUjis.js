import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react-native";
import axios from "@/src/libs/axios";
import { API_URL } from "@env";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const HasilUjis = ({ route, navigation }) => {
  const { uuid } = route.params;
  const [formData, setFormData] = useState();
  const [loading, setLoading] = useState(true);

  // Simplified mock data fetch
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Set loading menjadi true sebelum mengambil data
      try {
        const response = await axios.get(
          `/verifikasi/koordinator-teknis/${uuid}`,
        );
        console.log("Response data:", response.data);
        setFormData(response.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        Alert.alert("Error", "Failed to fetch data."); // Tampilkan alert jika gagal
      } finally {
        setLoading(false); // Set loading menjadi false setelah pengambilan data selesai
      }
    };
    fetchData();
  }, [uuid]);

  if (loading) {
    return (
      <View className="h-full flex justify-center"><ActivityIndicator size={"large"} color={"#312e81"} /></View>
    );
  }

  if (!formData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Data not found</Text>
      </View>
    );
  }

  const handleInterpretasi = async () => {
    console.log("Data yang dikirim:", formData); // Menampilkan data sebelum mengirim
    try {
      const response = await axios.post(
        `${API_URL}/administrasi/penerima-sample/${uuid}/update`,
        {
          ...formData,
        },
      );
      console.log("Response:", response.data);
      // Handle the response as needed
    } catch (error) {
      console.error("Error updating data:", error);
      // Handle error as needed
    }
  };

  const handleParameterUpdate = async (paramUuid, updatedData) => {
    try {
      // Memperbarui data lokal
      const updatedParameters = formData.parameters.map(param => {
        if (param.uuid === paramUuid) {
          return {
            ...param,
            pivot: {
              ...param.pivot,
              ...updatedData,
            },
          };
        }
        return param;
      });
  
      // Mengupdate state formData
      setFormData(prevState => ({
        ...prevState,
        parameters: updatedParameters,
      }));
  
      // Mengirim permintaan API untuk memperbarui data
      const response = await axios.post(`${API_URL}/verifikasi/koordinator-teknis/${uuid}/fill-parameter`, {
        parameters: updatedParameters.map(param => ({
          uuid: param.uuid,
          ...param.pivot, // Kirim hanya data yang ada di pivot
        })),
      });
  
      // Menangani respon dari server
      if (response.status === 200) {
        Alert.alert('Success', 'Data berhasil diperbarui');
      } else {
        Alert.alert('Error', 'Gagal memperbarui data');
      }
    } catch (error) {
      console.error('Error updating parameter:', error);
      Alert.alert('Error', 'Terjadi kesalahan saat memperbarui data');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {formData ? (
          <>
            {/* Header */}
            <View style={styles.cardContainer}>
              <View style={{ flexDirection: "row" }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: "#ef4444",
                    width: 55,
                    height: 45,
                    borderRadius: 15,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onPress={() => navigation.goBack()}>
                  <Icon name="arrow-left" size={20} color="white" />
                </TouchableOpacity>
                <View>
                  <Text style={styles.kode}>{formData?.kode || ""}</Text>
                </View>
              </View>
            </View>

            {/* Test Results Interpretation */}
            <View>
              <View style={styles.parameterCard}>
                <Text style={styles.sectionTitle} className="mx-5">
                  Interpretasi Hasil Pengujian
                </Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity
                    style={[
                      styles.radioButton,
                      formData.memenuhi_hasil_pengujian === 1 &&
                        styles.radioButtonSelected,
                    ]}
                    onPress={() => {
                      setFormData(prev => ({
                        ...prev,
                        memenuhi_hasil_pengujian: 1,
                      }));
                      handleInterpretasi(); // Panggil fungsi setelah mengupdate formData
                    }}>
                    <Text style={styles.radioText}>Memenuhi Persyaratan</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.radioButton,
                      formData.memenuhi_hasil_pengujian === 0 &&
                        styles.radioButtonSelected,
                    ]}
                    onPress={() => {
                      setFormData(prev => ({
                        ...prev,
                        memenuhi_hasil_pengujian: 0,
                      }));
                      handleInterpretasi(); // Panggil fungsi setelah mengupdate formData
                    }}>
                    <Text style={styles.radioText}>
                      Tidak Memenuhi Persyaratan
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Parameter Cards */}
              {formData.parameters.map(param => (
                <View key={param.uuid} style={styles.parameterCard}>
                  {/* Parameter Header */}
                  <View style={styles.parameterHeader}>
                    <View style={styles.parameterTitleContainer}>
                      {param.pivot.keterangan_hasil === "Memenuhi" && (
                        <CheckCircle color="#4CAF50" size={20} />
                      )}
                      {param.pivot.keterangan_hasil === "Tidak Memenuhi" && (
                        <XCircle color="#D32F2F" size={20} />
                      )}
                      <Text style={styles.parameterTitle}>
                        {param.nama}{" "}
                        {param.keterangan ? `(${param.keterangan})` : ""}
                      </Text>
                    </View>
                    <Text style={styles.parameterType}>
                      {param.jenis_parameter.nama}
                    </Text>
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
                          value={param.pivot.satuan}
                          onChangeText={text =>
                            handleParameterUpdate(param.uuid, { satuan: text })
                          }
                          placeholder="Satuan"
                        />
                      </View>
                      <View style={styles.formField}>
                        <Text style={styles.fieldLabel}>Baku Mutu *</Text>
                        <TextInput
                          style={styles.input}
                          value={param.pivot.baku_mutu}
                          onChangeText={text =>
                            handleParameterUpdate(param.uuid, { baku_mutu: text })
                          }
                          placeholder="Baku Mutu"
                        />
                      </View>
                    </View>
                      <View style={styles.formField}>
                        <Text style={styles.fieldLabel}>MDL</Text>
                        <TextInput
                          style={styles.inputMdl}
                          value={param.pivot.mdl}
                          onChangeText={text =>
                            handleParameterUpdate(param.uuid, { mdl: text })
                          }
                          placeholder="MDL"
                        />
                      </View>

                    <View style={styles.formRow} className="mt-2">
                      <View style={styles.formField}>
                        <Text style={styles.fieldLabel}>Hasil Uji (Analis) *</Text>
                        <TextInput
                          style={styles.input}
                          value={param.pivot.hasil_uji}
                          onChangeText={text =>
                            handleParameterUpdate(param.uuid, { hasil_uji: text })
                          }
                          placeholder="MDL"
                        />
                      </View>
                      <View style={styles.formField}>
                        <Text style={styles.fieldLabel}>
                          Hasil Uji (Pembulatan) *
                        </Text>
                        <TextInput
                          style={styles.input}
                          value={param.pivot.hasil_uji_pembulatan}
                          onChangeText={text =>
                            handleParameterUpdate(param.uuid, {
                              hasil_uji_pembulatan: text,
                            })
                          }
                          placeholder="Hasil Uji"
                        />
                      </View>
                    </View>

                    <View>
                      <Text style={styles.fieldLabel}>Keterangan</Text>
                      <TextInput
                        style={styles.input}
                        value={param.pivot.keterangan}
                        onChangeText={text =>
                          handleParameterUpdate(param.uuid, { keterangan: text })
                        }
                        placeholder="Keterangan"
                      />
                    </View>

                    {param.pivot.acc_analis && (
                      <View style={styles.buttonGroup}>
                        <TouchableOpacity
                          style={[
                            styles.resultButton,
                            styles.failButton,
                            param.pivot.keterangan_hasil === "Tidak Memenuhi" &&
                              styles.failButtonActive,
                          ]}
                          onPress={() =>
                            handleParameterUpdate(param.uuid, {
                              keterangan_hasil: "Tidak Memenuhi",
                            })
                          }>
                          <Text style={styles.buttonText}>Tidak Memenuhi</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.resultButton,
                            styles.passButton,
                            param.pivot.keterangan_hasil === "Memenuhi" &&
                              styles.passButtonActive,
                          ]}
                          onPress={() =>
                            handleParameterUpdate(param.uuid, {
                              keterangan_hasil: "Memenuhi",
                            })
                          }>
                          <Text style={styles.buttonText}>Memenuhi</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : (
          <Text style={styles.loading}>Loading...</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    width: "92%",
    elevation: 3,
    marginVertical: 10,
    // display: "flex",
    // justifyContent: "center",
    // alignItems: "center",
    marginLeft: 16,
  },
  kode: {
    fontWeight: "bold",
    fontSize: 23,
    color: "balck",
    marginLeft: 20,
    marginTop: 5,
  },
  container: {
    flex: 1,
    marginBottom: 55,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E4E6EF",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  revisionCard: {
    margin: 16,
    padding: 16,
    backgroundColor: "#FFF4DE",
    borderLeftWidth: 5,
    borderLeftColor: "#FFA800",
    borderRadius: 8,
  },
  revisionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  revisionText: {
    color: "#666666",
  },
  interpretationSection: {
    padding: 16,
    backgroundColor: "white",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 12,
  },
  radioGroup: {
    flexDirection: "column",
    gap: 12,
    marginHorizontal: 18,
    marginBottom: 20,
  },
  radioButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E4E6EF",
  },
  radioButtonSelected: {
    backgroundColor: "#E1F0FF",
    borderColor: "#3699FF",
  },
  radioText: {
    fontSize: 14,
  },
  parameterCard: {
    backgroundColor: "white",
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 13,
    elevation: 3,
  },
  parameterHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E4E6EF",
  },
  parameterTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  parameterTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  parameterType: {
    fontSize: 12,
    color: "#B5B5C3",
    marginTop: 4,
  },
  subkontrakBadge: {
    backgroundColor: "#FFF4DE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  subkontrakText: {
    color: "#FFA800",
    fontSize: 12,
  },
  parameterForm: {
    padding: 16,
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  formField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    color: "#B5B5C3",
    marginBottom: 4,
  },
  inputMdl: {
    borderWidth: 1,
    borderColor: "#E4E6EF",
    borderRadius: 8,
    padding: 12,
    width: '48%',
    backgroundColor: "#F5F8FA",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E4E6EF",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#F5F8FA",
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  resultButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  failButton: {
    backgroundColor: "#FFE2E5",
  },
  failButtonActive: {
    backgroundColor: "#F64E60",
  },
  passButton: {
    backgroundColor: "#B5E6E5",
  },
  passButtonActive: {
    backgroundColor: "#32b857",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
  },
});

export default HasilUjis;
