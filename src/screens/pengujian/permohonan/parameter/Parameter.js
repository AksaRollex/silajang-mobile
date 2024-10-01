import React, { useState, useEffect, useRef } from "react";
import axios from "@/src/libs/axios";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Colors } from "react-native-ui-lib";
import Back from "@/src/screens/components/Back";
import Header from "@/src/screens/components/Header";
import { rupiah } from "@/src/libs/utils";
import Paginate from "@/src/screens/components/Paginate";
import { useTitikPermohonan } from "@/src/services/useTitikPermohonan";

const Parameter = ({ navigation, route }) => {
  const { uuid } = route.params || null;
  const { data: titik } = useTitikPermohonan(uuid);
  console.log(titik);
  const [peraturanData, setPeraturanData] = useState([]);
  const [parameterData, setParameterData] = useState([]);
  const [paketData, setPaketData] = useState([]);
  const [selectedParameters, setSelectedParameters] = useState([]);
  const paginateRef = useRef(false);

  // FETCH DATA PARAMETER
  // useEffect(() => {
  //   axios
  //     .get("/master/parameter")
  //     .then(response => {
  //       console.log("Response Data Parameter:", response.data.parameter);
  //       setParameterData(response.data.parameter);
  //     })
  //     .catch(error => {
  //       console.error("Error fetching data:", error);
  //     });
  // }, []);

  // FETCH DATA PAKET
  // useEffect(() => {
  //   axios
  //     .get("/master/paket")
  //     .then(response => {
  //       console.log("Response Data Paket:", response.data);
  //       setPaketData(response.data.data);
  //     })
  //     .catch(error => {
  //       console.error("Error fetching data:", error);
  //     });
  // }, []);

  // FETCH DATA PERATURAN
  // useEffect(() => {
  //   axios
  //     .get("/master/peraturan/get")
  //     .then(response => {
  //       console.log("Response Data Peraturan:", response.data);
  //       setPeraturanData(response.data.peraturan);
  //     })
  //     .catch(error => {
  //       console.error("Error fetching data:", error);
  //     });
  // }, []);

  const handleAddParameter = parameter => {
    setSelectedParameters(prevSelectedParameters => [
      ...prevSelectedParameters,
      parameter,
    ]);
  };

  const handleRemoveParameter = parameterId => {
    setSelectedParameters(prevSelectedParameters =>
      prevSelectedParameters.filter(item => item.id !== parameterId),
    );
    console.log("Parameter removed:", parameterId);
  };

  const renderItemPeraturan = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.cell}>{item.nama}</Text>
        <Text style={styles.cell}>{rupiah(item.harga)}</Text>
        <Text style={styles.cell}>{item.nomor}</Text>
      </View>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => handleAddParameter(item)}>
        <Text style={styles.actionButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItemPaket = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.cell}>{item.nama}</Text>
        <Text style={styles.cell}>{item.harga}</Text>
      </View>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => handleAddParameter(item)}>
        <Text style={styles.actionButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItemLangsung = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.cell}>{item.nama}</Text>
        <Text style={styles.cell}>{rupiah(item.harga)}</Text>
      </View>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => handleAddParameter(item)}>
        <Text style={styles.actionButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSelectedParameter = ({ item }) => (
    <View style={[styles.card, { marginBottom: 40 }]}>
      <View style={styles.cardContent}>
        <Text style={styles.cell}>{item.nama}</Text>
        <Text style={styles.cell}>{rupiah(item.harga)}</Text>
      </View>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: "#ff5252" }]}
        onPress={() => handleRemoveParameter(item.id)}>
        <Text style={styles.actionButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <Header navigate={() => navigation.navigate("Profile")} />
      <View className="p-7 bg-[#ececec]">
        <Back />
        {titik ? (
          <View>
            <Text className="font-bold text-lg text-black my-2">{titik?.lokasi} {titik?.kode} {"\n"}Pilih Peraturan/Parameter</Text>
          </View>
        ) : (
          <View>
            <Text className="font-bold text-base text-black">Data Belum tersedia</Text>
          </View>
        )}

        <ScrollView>
          {/* Card Peraturan */}
          {/* <View
            style={[
              styles.headerTopBar,
              { backgroundColor: Colors.brand, marginTop: 20 },
            ]}>
            <Text style={styles.headerTopBarText}>
              Pilih Berdasarkan Peraturan
            </Text>
          </View>
          <Paginate
          payload={{ page : 1 , per : 10  }}
          url="`/permohonan/titik/${uuid}/peraturan`"
          ref={paginateRef}
          renderItem={renderItemPeraturan}
          ></Paginate> */}

          {/* Card Paket */}
          {/* <View
            style={[
              styles.headerTopBar,
              { backgroundColor: Colors.brand, marginTop: 20 },
            ]}>
            <Text style={styles.headerTopBarText}>Pilih Berdasarkan Paket</Text>
          </View>
          <FlatList
            data={paketData}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItemPaket}
            scrollEnabled={false}
          /> */}

          {/* Card Parameter Tersedia */}
          {/* <View
            style={[
              styles.headerTopBar,
              { backgroundColor: Colors.brand, marginTop: 20 },
            ]}>
            <Text style={styles.headerTopBarText}>Parameter Tersedia</Text>
          </View>
          <FlatList
            data={parameterData}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItemLangsung}
            scrollEnabled={false}
          /> */}

          {/* Card Parameter Di Pilih */}
          {/* <View
            style={[
              styles.headerTopBar,
              { backgroundColor: Colors.brand, marginTop: 20 },
            ]}>
            <Text style={styles.headerTopBarText}>Parameter Di Pilih</Text>
          </View>
          <FlatList
            data={selectedParameters}
            keyExtractor={item => item.id.toString()}
            renderItem={renderSelectedParameter}
            scrollEnabled={false}
            style={styles.parameterDiPilih}
          /> */}
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  backButton: {
    padding: 4,
    borderRadius: 5,
    alignItems: "center",
    width: "10%",
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  headerTopBar: {
    backgroundColor: "#6ab8e2",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 5,
    elevation: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerTopBarText: {
    color: "#fff",
    fontSize: 16,
  },
  scrollViewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    paddingVertical: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 5,
    elevation: 2,
    marginVertical: 5,
    marginHorizontal: 2,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardContent: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-between",
  },
  cell: {
    flex: 1,
    paddingHorizontal: 10,
    color: "black",
  },
  actionButton: {
    backgroundColor: "#2196f3",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 3,
    elevation: 2,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  parameterDiPilih: {
    paddingBottom: 20,
  },
});

export default Parameter;
