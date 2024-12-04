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
import { Controller, useForm } from "react-hook-form";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react-native";
import axios from "@/src/libs/axios";
import { API_URL } from "@env";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useMutation } from "@tanstack/react-query";

const HasilUjis = ({ route, navigation }) => {
  const { uuid } = route.params;
  const [formData, setFormData] = useState({
    kode: "",
    keterangan_revisi: "",
    memenuhi_hasil_pengujian: null,
    parameters: [],
  });
  const [loading, setLoading] = useState(true);

  const { mutate: updateParam } = useMutation({
    mutationFn: async param => {
      const response = await axios.post(
        `/verifikasi/koordinator-teknis/${uuid}/fill-parameter`,
        {
          parameter_uuid: param.uuid,
          satuan: param.satuan,
          baku_mutu: param.baku_mutu,
          mdl: param.mdl,
          hasil_uji_pembulatan: param.hasil_uji_pembulatan,
          keterangan: param.keterangan,
          keterangan_hasil: param.keterangan_hasil,
          acc_manager: param.acc_manager,
        },
      );
      return response.data.data;
    },
    onSuccess: updatedParam => {
      setFormData(prevData => {
        const updatedParameters = prevData.parameters.map(param =>
          param.uuid === updatedParam.uuid ? updatedParam : param,
        );
        return { ...prevData, parameters: updatedParameters };
      });
    },
    onError: err => {
      console.error(err.response);
    },
  });

  const { handleSubmit, watch, control, setValue } = useForm();
  // Simplified mock data fetch
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Set loading menjadi true sebelum mengambil data
      try {
        const response = await axios.get(
          `/verifikasi/koordinator-teknis/${uuid}`,
        );
        // console.log("Response data:", response.data);
        setFormData(response.data.data);

        console.log(formData.parameters, 8898);
        formData.parameters.map(item => {
          setValue("satuan", item.pivot.satuan);
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        Alert.alert("Error", "Failed to fetch data."); // Tampilkan alert jika gagal
      } finally {
        setLoading(false); // Set loading menjadi false setelah pengambilan data selesai
      }
    };
    fetchData();
  }, [uuid]);

  useEffect(() => {
    if (formData?.parameters) {
      formData.parameters.forEach((item, index) => {
        setValue(`satuan.${index}`, item.pivot.satuan);
        setValue(`baku_mutu.${index}`, item.pivot.baku_mutu);
        setValue(`mdl.${index}`, item.pivot.mdl);
        setValue(
          `hasil_uji_pembulatan.${index}`,
          item.pivot.hasil_uji_pembulatan,
        );
        setValue(`keterangan.${index}`, item.pivot.keterangan);
        setValue(`keterangan_hasil.${index}`, item.pivot.keterangan_hasil);
      });
    }
  }, [formData]);

  const handleUpdate = (index, updatedFields) => {
    const param = formData.parameters[index];
    updateParam({ ...param, ...updatedFields });
  };

  if (loading) {
    return (
      <View className="h-full flex justify-center">
        <ActivityIndicator size={"large"} color={"#312e81"} />
      </View>
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

  const onSubmit = data => {
    updateParam(data);
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
                    <Text style={styles.radioText}>Memenuhi Persyaratan</Text>
                  </TouchableOpacity>
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
                    <Text style={styles.radioText}>
                      Tidak Memenuhi Persyaratan
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Parameter Cards */}
              {formData.parameters.map((param, index) => (
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
                        <Text style={styles.fieldLabel}>Satuan <Text className="text-red-500">*</Text></Text>
                        <Controller
                          control={control}
                          name={`satuan.${index}`}
                          render={({ field: { onChange, value } }) => (
                            <TextInput
                              style={styles.input}
                              value={value}
                              onChangeText={value => onChange(value)}
                              placeholder="Satuan"
                            />
                          )}
                        />
                      </View>
                      <View style={styles.formField}>
                        <Text style={styles.fieldLabel}>Baku Mutu <Text className="text-red-500">*</Text></Text>
                        <Controller
                          control={control}
                          name={`baku_mutu.${index}`}
                          render={({ field: { onChange, value } }) => (
                            <TextInput
                              style={styles.input}
                              value={value}
                              onChangeText={value => onChange(value)}
                              placeholder="Baku Mutu"
                            />
                          )}
                        />
                      </View>
                    </View>
                    <View style={styles.formField}>
                      <Text style={styles.fieldLabel}>MDL</Text>
                      <Controller
                        control={control}
                        name={`mdl.${index}`}
                        render={({ field: { onChange, value } }) => (
                          <TextInput
                            style={styles.inputMdl}
                            value={value}
                            onChangeText={value => onChange(value)}
                            placeholder="MDL"
                          />
                        )}
                      />
                    </View>
                    <View style={styles.formRow} className="mt-2">
                      <View style={styles.formField}>
                        <Text style={styles.fieldLabel}>
                          Hasil Uji (Analis) <Text className="text-red-500">*</Text>
                        </Text>
                        <Controller
                          control={control}
                          name={`hasil_uji.${index}`}
                          render={({ field: { onChange, value } }) => (
                            <TextInput
                              style={styles.input}
                              value={value}
                              onChangeText={value => onChange(value)}
                              placeholder="MDL"
                            />
                          )}
                        />
                      </View>
                      <View style={styles.formField}>
                        <Text style={styles.fieldLabel}>
                          Hasil Uji (Pembulatan) <Text className="text-red-500">*</Text>
                        </Text>
                        <Controller
                          control={control}
                          name={`hasil_uji_pembulatan.${index}`}
                          render={({ field: { onChange, value } }) => (
                            <TextInput
                              style={styles.input}
                              value={value}
                              onChangeText={value => onChange(value)}
                              placeholder="Hasil Uji"
                            />
                          )}
                        />
                      </View>
                    </View>

                    <View>
                      <Text style={styles.fieldLabel}>
                        Keterangan
                      </Text>
                      <Controller
                        control={control}
                        name={`keterangan.${index}`}
                        render={({ field: { onChange, value } }) => (
                          <TextInput
                            style={styles.input}
                            value={value}
                            onChangeText={value => onChange(value)}
                            placeholder="Keterangan"
                          />
                        )}
                      />
                    </View>

                    {param.pivot.acc_analis && (
                      <Controller
                        control={control}
                        name={`keterangan_hasil.${index}`}
                        defaultValue=""
                        render={({ field: { onChange, value } }) => (
                          <View style={styles.buttonGroup}>
                            <TouchableOpacity
                              style={[
                                styles.resultButton,
                                styles.failButton,
                                value === "Tidak Memenuhi" && styles.failButtonActive,
                              ]}
                              onPress={() =>
                                handleUpdate(index, {
                                  keterangan_hasil: "Tidak Memenuhi",
                                  satuan: watch(`satuan.${index}`),
                                  baku_mutu: watch(`baku_mutu.${index}`),
                                  mdl: watch(`mdl.${index}`),
                                  hasil_uji_pembulatan: watch(
                                    `hasil_uji_pembulatan.${index}`,
                                  ),
                                  keterangan: watch(`keterangan.${index}`),
                                })
                              }>
                              <Text
                                style={[
                                  styles.buttonText,
                                  value === "Tidak Memenuhi"
                                    ? styles.failButtonTextActive
                                    : styles.failButtonText,
                                ]}>
                                Tidak Memenuhi
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[
                                styles.resultButton,
                                styles.passButton,
                                value === "Memenuhi" && styles.passButtonActive,
                              ]}
                              onPress={() =>
                                handleUpdate(index, {
                                  keterangan_hasil: "Memenuhi",
                                  satuan: watch(`satuan.${index}`),
                                  baku_mutu: watch(`baku_mutu.${index}`),
                                  mdl: watch(`mdl.${index}`),
                                  hasil_uji_pembulatan: watch(
                                    `hasil_uji_pembulatan.${index}`,
                                  ),
                                  keterangan: watch(`keterangan.${index}`),
                                })
                              }>
                              <Text
                                style={[
                                  styles.buttonText,
                                  value === "Memenuhi"
                                    ? styles.passButtonTextActive
                                    : styles.passButtonText,
                                ]}>
                                Memenuhi
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      />
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
    fontFamily: "Poppins-SemiBold",
    fontSize: 23,
    color: "black",
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
    fontFamily: "Poppins-SemiBold",
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
    fontSize: 12,
    fontFamily: "Poppins-Regular",
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
    fontFamily: "Poppins-SemiBold",
  },
  parameterType: {
    fontSize: 12,
    color: "#B5B5C3",
    marginTop: 4,
    fontFamily: "Poppins-Regular",
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
    fontFamily: "Poppins-Regular",
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
    fontFamily: "Poppins-Medium",
  },
  inputMdl: {
    borderWidth: 1,
    borderColor: "#E4E6EF",
    borderRadius: 8,
    padding: 12,
    width: "48%",
    backgroundColor: "#F5F8FA",
    fontFamily: "Poppins-Medium",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E4E6EF",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#F5F8FA",
    fontFamily: "Poppins-Medium",
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
    borderWidth: 1.5,
  },
  failButton: {
    backgroundColor: "white",
    borderColor: "#F64E60",
  },
  failButtonActive: {
    backgroundColor: "#F64E60",
    color: "white",
  },
  passButton: {
    backgroundColor: "white",
    borderColor: "#32b857",
  },
  passButtonActive: {
    backgroundColor: "#32b857",
    color: "white",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Poppins-Medium",
  },
  failButtonText: {
    color: "#F64E60",
  },
  failButtonTextActive: {
    color: "white",
  },
  passButtonText: {
    color: "#32b857",
  },
  passButtonTextActive: {
    color: "white",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    fontFamily: "Poppins-Medium",
  },
});

export default HasilUjis;
