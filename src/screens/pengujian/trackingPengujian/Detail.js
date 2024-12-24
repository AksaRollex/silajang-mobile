import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import moment from "moment";
import { mapStatusPengujian } from "@/src/libs/utils";
import BackButton from "../../components/Back";
import { Colors } from "react-native-ui-lib";
import { useNavigation } from "@react-navigation/native";

const TrackingList = ({ route, onClose }) => {
  const { selected } = route.params;
  const navigation = useNavigation();

  const getStatusColor = status => {
    switch (status) {
      case -1:
        return "#dc3545"; // Error/rejected
      case 7: // Completed
      case 11:
        return "#28a745"; // Success
      case 8:
        return "#ffc107"; // Payment/financial
      default:
        return "#007bff"; // In progress
    }
  };

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
    <View style={styles.container} className="w-full h-full p-3">
      <ScrollView
        style={styles.scrollView}
        className="rounded-3xl w-full h-full ">
        <View className="flex-row px-4 pt-5 pb-1 justify-between">
          <BackButton
            size={24}
            color="black"
            className="mr-2 "
            action={() => navigation.goBack()}
          />
          <Text className="font-poppins-semibold text-black text-lg text-end">
            {selected?.kode} 
            {/* {selected?.lokasi} */}
          </Text>
        </View>

        <View style={styles.timelineContainer}>
          {selected && selected.trackings && selected.trackings.length > 0 ? (
            selected.trackings.map((tracking, index) => (
              <View key={tracking.id} style={styles.trackingItem}>
                {/* Timeline connector */}
                {index !== selected.trackings.length - 1 && (
                  <View
                    style={[
                      styles.connector,
                      { backgroundColor: getStatusColor(tracking.status) },
                    ]}
                  />
                )}

                {/* Icon container */}
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: `${getStatusColor(tracking.status)}30` },
                  ]}>
                  <Icon
                    name={icon(tracking.status)}
                    size={24}
                    color={getStatusColor(tracking.status)}
                  />
                </View>

                {/* Content container */}
                <View style={styles.contentContainer}>
                  <View className="flex-row gap-x-4 mb-2 justify-between">
                    <Text style={styles.trackingDate}>
                      {moment(tracking.created_at).format("DD MMMM YYYY")}
                    </Text>
                    <Text style={styles.trackingTime}>
                      {moment(tracking.created_at).format("HH:mm")}
                    </Text>
                  </View>
                  <Text style={styles.trackingStatus}>
                    {mapStatusPengujian(tracking.status)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Icon name="inbox" size={48} color="#B5B5C3" />
              <Text style={styles.emptyText}>Tidak ada tracking tersedia</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ececec",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "black",
    marginLeft: 16,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  timelineContainer: {
    padding: 16,
  },
  trackingItem: {
    flexDirection: "row",
    marginBottom: 24,
    position: "relative",
  },
  connector: {
    position: "absolute",
    left: 24,
    top: 50,
    width: 2,
    height: "74%",
    zIndex: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    zIndex: 2,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    elevation: 2,
  },
  trackingDate: {
    fontSize: 14,
    color: "#6c757d",
  },
  trackingTime: {
    fontSize: 12,
    color: "#adb5bd",
  },
  trackingStatus: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#495057",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6c757d",
  },
});

export default TrackingList;
