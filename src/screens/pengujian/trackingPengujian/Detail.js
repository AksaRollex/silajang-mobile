import React from "react";
import { View, Text, ScrollView, Animated } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import moment from "moment";
import { mapStatusPengujian } from "@/src/libs/utils";
import BackButton from "../../components/Back";
import { useNavigation } from "@react-navigation/native";

const TrackingList = ({ route, onClose }) => {
  const { selected } = route.params;
  const navigation = useNavigation();

  const getStatusColor = status => {
    switch (status) {
      case -1:
        return "#FF4B55"; // Error/rejected
      case 7: // Completed
      case 11:
        return "#00C853"; // Success
      case 8:
        return "#FFB300"; // Payment
      default:
        return "#2196F3"; // In progress
    }
  };

  const getStatusBgColor = status => {
    switch (status) {
      case -1:
        return "bg-red-50";
      case 7:
      case 11:
        return "bg-green-50";
      case 8:
        return "bg-yellow-50";
      default:
        return "bg-blue-50";
    }
  };

  const icon = status => {
    switch (status) {
      case -1:
        return "times-circle";
      case 0:
        return "envelope";
      case 1:
        return "inbox";
      case 2:
        return "folder-open";
      case 3:
        return "tint";
      case 4:
        return "book";
      case 5:
        return "file-text";
      case 6:
        return "clipboard";
      case 7:
        return "check-circle";
      case 8:
        return "credit-card";
      case 9:
        return "print";
      case 10:
        return "tablet";
      case 11:
        return "check-circle";
      default:
        return "circle";
    }
  };

  // Reverse the tracking array to show newest first
  const sortedTrackings = selected?.trackings
    ? [...selected.trackings].reverse()
    : [];

  return (
    <View className="w-full h-full bg-[#ececec] p-3">
      <View className="rounded-3xl bg-[#fff] w-full h-full">
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

        <ScrollView className="flex-1 mt-4" showsVerticalScrollIndicator={false}>
          <View className=" mx-2">
            {sortedTrackings.length > 0 ? (
              sortedTrackings.map((tracking, index) => (
                <Animated.View
                  key={tracking.id}
                  className="flex-row mb-7 relative">
                  {index !== sortedTrackings.length - 1 && (
                    <View
                      className="absolute left-10 top-12 w-0.5 h-full z-0"
                      style={{
                        backgroundColor  : '#bbdefb'
                        // backgroundColor: getStatusColor(tracking.status),
                      }}
                    />
                  )}

                  <View className="bg-[#f8f8f8] flex-row flex w-full p-3 rounded-lg relative z-10">
                    <View
                      className={`w-14 h-14  justify-center items-center mr-4  bg-blue-100 rounded-full relative  z-20
                    
                    `}>
                      <Icon
                        name={icon(tracking.status)}
                        size={22}
                        color={getStatusColor(tracking.status)}
                      />
                    </View>

                    <View className="flex-1 z-0">
                      <View className="flex-row justify-between items-center mb-2">
                        <View className="gap-x-2 flex-row w-full">
                          <Text className="text-base  font-poppins-medium text-gray-700 ">
                            {moment(tracking.created_at).format("DD MMMM YYYY")}
                          </Text>
                          <Text className="text-base font-poppins-medium text-gray-700">
                        :
                          </Text>
                          <Text className="text-base font-poppins-medium text-gray-700">
                            {moment(tracking.created_at).format("HH:mm")}
                          </Text>
                        </View>
                        {/* <View className="flex-row items-center bg-gray-100 px-2 py-1 rounded-full">
                        <Icon
                          name="clock-o"
                          size={12}
                          className="text-gray-500"
                        />
                   
                      </View> */}
                      </View>
                      <Text className="text-base font-poppins-light text-gray-800">
                        {mapStatusPengujian(tracking.status)}
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              ))
            ) : (
              <View className="items-center justify-center p-10 bg-gray-50 rounded-2xl mt-5">
                <Icon name="inbox" size={56} className="text-gray-300" />
                <Text className="mt-4 text-base font-medium text-gray-700">
                  Tidak ada tracking tersedia
                </Text>
                <Text className="mt-2 text-sm text-gray-500 text-center">
                  Tracking akan muncul setelah pengujian dimulai
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default TrackingList;
