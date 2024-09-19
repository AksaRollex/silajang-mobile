import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { Searchbar } from 'react-native-paper';
import { Button } from 'react-native-ui-lib';
import FontIcon from 'react-native-vector-icons/FontAwesome5';
import BackButton from '@/src/screens/components/BackButton';
import { useNavigation } from '@react-navigation/native';

export default function CetakLHU() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={styles.search} className="flex-row w-full items-center space-x-2">
          <BackButton action={() => navigation.goBack()} size={25} />
          <Searchbar
            className="bg-[#f2f2f2] flex-1"
            placeholder="Cari ..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}>
        <View>
          <Text>Laporan Hasil Uji</Text>
          <View style={styles.row}>
            <View style={[styles.card, { marginTop: 25 }]}>
              <View style={styles.cards}>
                <View>
                  <Text style={[styles.cardTexts, { fontSize: 15 }]}>.</Text>
                  <Text style={styles.cardTexts}>.</Text>
                  <Text style={[styles.cardTexts, { fontSize: 15 }]}>.</Text>
                  <Text style={styles.cardTexts}>.</Text>
                  <Text style={[styles.cardTexts, { fontSize: 15 }]}>.</Text>
                  <Text style={styles.cardTexts}>.</Text>
                </View>

                <Button
                  style={[styles.pdf]}
                  onPress={() => setModalVisible(true)}
                >
                  <FontIcon
                    name={"file-pdf"}
                    size={20}
                    style={{ color: "#fff" }}
                  />
                </Button>

                <Modal
                  animationType="fade"
                  transparent={true}
                  visible={modalVisible}
                  onRequestClose={() => setModalVisible(false)}
                >
                  <View style={styles.modalBackground}>
                    <View style={styles.modalmodil}>
                      <Text style={styles.cardTitle}>Preview LHU</Text>
                      <View style={styles.cardDivider} />
                      <Text style={styles.cardContent}>IKI NIATE PDF</Text>
                      <TouchableOpacity
                        style={styles.buttonClose}
                        onPress={() => setModalVisible(false)}
                      >
                        <Text style={styles.textStyle}>Tutup</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "space-around",
    alignItems: "center",
    width: "92%",
    marginStart: "2%",
  },
  searchIcon: {
    width: 24,
    height: 24,
  },
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 5,
    paddingVertical: 0, 
    // backgroundColor: "white",
    borderRadius: 10,
    marginVertical: 5,
    width: "100%",
    marginTop: 10,
  },
  searchbar: {
    flex: 1, 
    backgroundColor: "white",
    borderRadius: 10,
    marginRight: 10,
  },
  buttonSearch: {
    backgroundColor: "#0D47A1", 
    padding: 10,
    borderRadius: 10,
    minWidth: "15%",
  },
  icon: {
    backgroundColor : "black",
    marginTop: 10.5,
  },
  dropdown: {
    position: "absolute",
    top: 60,
    right: 5,
    backgroundColor: "white",
    borderRadius: 8,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: "700%",
    zIndex: 10,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  dropdownText: {
    fontSize: 14,
    color: "black",
  },
  scrollViewContent: {
    flexGrow: 1, 
    marginHorizontal: 20,
    marginVertical: 10,
  },
  card: {
    width: 360,
    marginVertical: 1,
    borderRadius: 15,
    padding: 20,
    backgroundColor: "#fff",
    flexDirection: "row",
    borderTopWidth: 7,
  },
  cards: {
    borderRadius: 10,
    width: "70%",
    marginBottom: 4,
    flexDirection: "row",
    backgroundColor: '#f8f8f8'

  },
  cardTexts: {
    fontSize: 15,
    color: "black",
  },

  pdf: {
    backgroundColor: "#0D47A1",
    marginTop: 40,
    height: 40,
    borderRadius: 10,
    minWidth: 10,
    marginStart: 250,
    position: "absolute",
  },
  yearpick: {
    marginTop: 25,
    // marginStart: 270,/
    backgroundColor: "white",
    height: 31,
    borderRadius: 5,
  },
  pdfButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
  },
  icon: {
    color: '#fff',
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Transparansi untuk modal background
  },
  modalmodil: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: '',
    elevation: 5,
    width: '90%',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'left',
    color: 'black'
  },
  cardDivider: {
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  cardContent: {
    fontSize: 30,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonClose: {
    backgroundColor: '#ececec',
    borderRadius: 5,
    padding: 10,
    elevation: 2,
    color: 'black',
    width: '20%'
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
