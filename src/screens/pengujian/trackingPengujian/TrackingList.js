import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import moment from "moment";
import { mapStatusPengujian } from "@/src/libs/utils";
import Header from "../../components/Header";
import { TouchableOpacity } from "react-native-ui-lib";

const TrackingList = ({ route, selected, onClose }) => {
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
        return "prescription-bottle";
      case 4:
        return "clipboard-check";
      case 5:
        return "file-alt";
      case 6:
        return "pen-nib";
      case 7:
        return "spell-check";
      case 8:
        return "wallet";
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
      <Header />
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="arrow-left" size={20} color="#dc3545" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              ({selected?.kode}) {selected?.lokasi}
            </Text>
          </View>
        </View>
        <ScrollView style={styles.cardBody}>
          {selected.tracking.map(tracking => (
            <View key={tracking.id} style={styles.trackingItem}>
              <View style={styles.iconContainer}>
                <Icon name={icon(tracking.status)} size={24} color="#007bff" />
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
          ))}
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
