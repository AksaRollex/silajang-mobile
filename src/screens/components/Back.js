// import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
// import React from "react";
// import { Colors } from "react-native-ui-lib";
// import { useNavigation } from "@react-navigation/native";

// export default function Back() {
//   const navigation = useNavigation();

//   return (
//     <View style={styles.container}>
//       <TouchableOpacity
//         style={[styles.backButton, { backgroundColor: Colors.brand }]}
//         onPress={() => navigation.goBack()}>
//         <Image
//           source={require("../../../assets/images/backss.png")}
//           style={{ height: 20, width: 20, tintColor: "white" }}></Image>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   backButton: {
//     padding: 4,
//     backgroundColor: "#6b7fde",
//     borderRadius: 5,
//     alignItems: "center",
//     width: "10%",
//   },
// });

import { View } from 'react-native'
import { Button } from 'react-native-ui-lib'
import React from 'react'
import IonIcons from 'react-native-vector-icons/Ionicons'

const BackButton = ({ action, style, size,  color}) => {
  return (
    <View style={style}>
        <IonIcons name="arrow-back-outline" size={size} color={color} onPress={action} />
    </View>
  )
}

export default BackButton