import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator
} from "react-native";
import { Colors } from "react-native-ui-lib";
import Icon from "react-native-vector-icons/Feather";
import axios from "@/src/libs/axios";
import { API_URL } from "@env";

const TopCard = ({ kode, onGoBack }) => {
  return (
    <View style={styles.topCard}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
          <Icon name="arrow-left" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.kode}>{kode || ""}</Text>
      </View>
    </View>
  );
};

const ParameterCard = ({ parameter, onSubmit }) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.parameterHeader}>
        <View style={styles.headerTitleContainer}>
          {parameter.pivot.acc_analis ? (
            <Icon
              name="check-circle"
              size={24}
              color="#312e81"
              style={styles.checkIcon}
            />
          ) : null}
          <View>
            <Text style={styles.parameterTitle}>
              {parameter.nama}{" "}
              {parameter.keterangan ? `(${parameter.keterangan})` : ""}
            </Text>
            <Text style={styles.parameterType}>
              {parameter.jenis_parameter.nama}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.parameterContent}>
        <View style={styles.infoRow}>
          <View style={styles.infoColumn}>
            <Text style={styles.label}>Satuan</Text>
            <Text style={styles.value}>{parameter.pivot.satuan || "-"}</Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.label}>Baku Mutu</Text>
            <Text style={styles.value}>{parameter.pivot.baku_mutu || "-"}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoColumn}>
            <Text style={styles.label}>MDL</Text>
            <Text style={styles.value}>{parameter.pivot.mdl || "-"}</Text>
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>Hasil Uji <Text className="text-red-500">*</Text></Text>
          <TextInput
            style={styles.input}
            value={parameter.pivot.hasil_uji}
            onChangeText={value => {
              onSubmit(parameter.uuid, {
                hasil_uji: value,
                keterangan: parameter.pivot.keterangan,
              });
            }}
            placeholder="Hasil Uji"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>Keterangan</Text>
          <TextInput
            style={styles.input}
            value={parameter.pivot.keterangan}
            onChangeText={value => {
              onSubmit(parameter.uuid, {
                hasil_uji: parameter.pivot.hasil_uji,
                keterangan: value,
              });
            }}
            placeholder="Keterangan"
            placeholderTextColor="#999"
          />
        </View>
      </View>
    </View>
  );
};

export default function HasilUji({ route, navigation }) {
  const { uuid } = route.params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/verifikasi/analis/${uuid}`);
        console.log("Response data:", response.data);
        setData(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [uuid]);

  const handleParameterSubmit = async (parameterUuid, formData) => {
    try {
      const response = await axios.post(
        `/verifikasi/analis/${uuid}/fill-parameter`,
        {
          parameter_uuid: parameterUuid,
          ...formData,
        },
      );

      setData(prevData => ({
        ...prevData,
        parameters: prevData.parameters.map(p =>
          p.uuid === parameterUuid ? response.data.data : p,
        ),
      }));
    } catch (error) {
      console.error("Error updating parameter:", error);
    }
  };

  if (loading) {
    return (
      <View className="h-full flex justify-center"><ActivityIndicator size={"large"} color={"#312e81"} /></View>
    );
  }

  if (!data) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Data not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollViewContainer}
      showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        {/* Top Card */}
        <TopCard kode={data.kode} onGoBack={() => navigation.goBack()} />

        {/* Parameters List */}
        <View style={styles.parametersContainer}>
          {data.parameters
            .filter(param => param.is_dapat_diuji)
            .map(parameter => (
              <ParameterCard
                key={parameter.uuid}
                parameter={parameter}
                onSubmit={handleParameterSubmit}
              />
            ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollViewContainer: {
    flexGrow: 1,
    padding: 16,
  },
  container: {
    flex: 1,
    marginBottom: 50,
    width: "100%",
  },
  topCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    elevation: 3,
    marginBottom: 16,
  },
  parametersContainer: {
    gap: 16,
  },
  cardContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    elevation: 3,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    backgroundColor: "#ef4444",
    width: 55,
    height: 45,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  kode: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 23,
    color: Colors.black,
    marginLeft: 20,
  },
  parameterHeader: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkIcon: {
    marginRight: 8,
  },
  parameterTitle: {
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
    color: Colors.black,
  },
  parameterType: {
    fontSize: 12,
    color: Colors.grey40,
    marginTop: 2,
    fontFamily: "Poppins-SemiBold",
  },
  parameterContent: {
    paddingTop: 12,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  infoColumn: {
    flex: 1,
  },
  inputSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: Colors.grey40,
    marginBottom: 4,
    fontFamily: "Poppins-SemiBold",
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.black,
    fontFamily: "Poppins-Regular",
  },
  input: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.black,
    fontFamily: "Poppins-Regular",
  },
});
