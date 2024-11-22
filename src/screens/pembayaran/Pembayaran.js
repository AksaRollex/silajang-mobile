import React from "react";
import axios from "@/src/libs/axios";
import {
  View,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Colors, Button } from "react-native-ui-lib";
import { useNavigation } from "@react-navigation/native";
import { List } from "react-native-paper";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import FontAwesome6Icon from "react-native-vector-icons/FontAwesome6";
import { TextFooter } from "../components/TextFooter";

const Pembayaran = () => {
  const navigation = useNavigation();

  const Pengujian = () => {
    navigation.navigate("Pengujian");
  };

  const NonPengujian = () => {
    navigation.navigate("NonPengujian");
  };

  const Global = () => {
    navigation.navigate("Global");
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <List.Item
          title="Pembayaran Dengan Pengujian"
          left={props => (
            <FontAwesome5Icon {...props} name="wallet" size={22} />
          )}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          className="bg-[#ffffff] border-black p-2"
          onPress={Pengujian}
        />
        <List.Item
          title="Pembayaran Non Pengujian"
          left={props => (
            <FontAwesome5Icon {...props} name="credit-card" size={22} />
          )}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          className="bg-[#ffffff] border-black p-2"
          onPress={NonPengujian}
        />
        <List.Item
          title="Pembayaran Global"
          left={props => (
            <FontAwesome6Icon {...props} name="building-columns" size={22} />
          )}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          className="bg-[#ffffff] border-black p-2"
          onPress={Global}
        />
        <TextFooter />
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ececec",
    justifyContent: "flex-start", 
  },
  headerContainer: {
    width: "100%",
    paddingVertical: 10,
    backgroundColor: Colors.brand, 
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    elevation: 4,
  },
  logo: {
    width: 40,
    height: 40,
    marginTop: 8,
  },
  search: {
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "white",
    borderRadius: 10,
    marginVertical: 10,
    width: "85%",
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
  },
  searchIcon: {
    width: 24,
    height: 24,
  },
  headerText: {
    fontSize: 22,
    color: "white",
    fontWeight: "bold",
    marginLeft: 10,
    alignSelf: "center",
  },

  scrollViewContent: {
    flexGrow: 1, 
    paddingBottom: 100, 
  },
  judul: {
    fontSize: 17,
    color: "black",
    alignSelf: "center",
    fontWeight: "bold",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },

  card: {
    width: 360,
    marginVertical: 10,
    borderRadius: 15,
    padding: 20,
    backgroundColor: "#fff",
    flexDirection: "row",
    borderTopColor: Colors.brand,
    borderTopWidth: 7,
  },
  cards: {
    borderRadius: 10,
    width: "70%",
    marginBottom: 4,
  },
  cards2: {
    borderRadius: 10,
    width: "30%",
    marginBottom: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  cardTexts: {
    fontSize: 15,
    color: "black",
  },

  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center", 
    marginTop: 20,
    marginBottom: 40,
  },
  paginationButton: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
    paddingVertical: 10,
    width: 100,
    backgroundColor: "#6b7fde",
    borderRadius: 10,
    marginHorizontal: 10, 
    textAlign: "center", 
  },
  paginationText: {
    fontSize: 16,
    color: "black",
    fontWeight: "bold",
    marginHorizontal: 10,
  },

  ButtonDetail: {
    paddingHorizontal: 14,
    borderRadius: 5,
    marginVertical: 5,
    backgroundColor: "#4682B4",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row", 
  },
  TextButton: {
    color: "white",
    fontSize: 12,
    paddingVertical: 7,
    fontWeight: "bold",
  },
  pending: {
    color: "white",
    backgroundColor: "green",
    paddingVertical: 5,
    borderRadius: 5,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  pendingText: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: "white",
  },
  disabledButton: {
    color: "#ccc",
  },
  paginationNumber: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    marginBottom: 80,
  },
});

export default Pembayaran;
