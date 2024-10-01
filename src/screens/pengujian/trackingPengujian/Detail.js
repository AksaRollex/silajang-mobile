import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";
import moment from "moment";
import { mapStatusPengujian } from "@/src/libs/utils";
import Header from "../../components/Header";
import BackButton from "../../components/Back";
import { useNavigation } from "@react-navigation/native";

const TrackingList = ({ route, onClose }) => {
  const {selected} = route.params
  const navigation = useNavigation()
  const icon = status => {
    switch (status) {
      case -1:
        return "exclamation-circle";
      case 0:
        return "envelope-square";
      case 1:
        return "archive";
      case 2:
        return "folder-open";
      case 3:
        return "folder-open";
      case 4:
        return "book";
      case 5:
        return "file-text";
      case 6:
        return "clipboard";
      case 7:
        return "check-circle";
      case 8:
        return "dollar";
      case 9:
        return "print";
      case 10:
        return "tablet";
      case 11:
        return "check-double";
      default:
        return "question-circle";
    }
  };

  return (
    <>
      <Header navigate={() => navigation.navigate("Profile")} />
      <View style={styles.card} className="mb-56">
        <View style={styles.cardHeader}>
          <View style={styles.headerContent}>
            <View className="flex-row justify-between items-center px-2">
            <BackButton action={() => navigation.goBack()} size={25}/>  
            <Text className="my-2 font-bold text-xl text-center text-black ">
              ({selected?.kode}) {selected?.lokasi}
            </Text>
            </View>
          </View>
        </View>
        <ScrollView style={styles.cardBody}>
          {selected && selected.trackings && selected.trackings.length > 0 ? (
            selected.trackings.map(tracking => (
              <View key={tracking.id} style={styles.trackingItem}>
                <View style={styles.iconContainer}>
                  <Icon
                    name={icon(tracking.status)}
                    size={24}
                    color="#007bff"
                  />
                </View>
                <View style={styles.trackingInfo}>
                  <Text style={styles.trackingDate}>
                    {moment(tracking.created_at).format("DD MMMM YYYY, HH:mm")}
                  </Text>
                  <Text style={styles.trackingStatus}>
                    {mapStatusPengujian(tracking.status)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text>No trackings available</Text>
          )}
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  cardHeader: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#E4E6EF",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3F4254",
  },
  cardBody: {
    padding: 16,
    backgroundColor: "#ffffff",
  },
  trackingItem: {
    flexDirection: "row",
    marginBottom: 20,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E1F0FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  trackingContent: {
    flex: 1,
  },
  trackingDate: {
    fontSize: 14,
    color: "#B5B5C3",
    marginBottom: 4,
  },
  trackingStatus: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3F4254",
  },
  verticalLine: {
    position: "absolute",
    left: 24,
    top: 50,
    bottom: -20,
    width: 2,
    backgroundColor: "#E4E6EF",
  },
});

export default TrackingList;
