// nimport {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   Image,
// } from "react-native";
// import { useState, useEffect } from "react";
// import { Picker } from "react-native-ui-lib";
// import { Colors } from "react-native-ui-lib";
// import { useNavigation } from "@react-navigation/native";
// import axios from "@/src/libs/axios";

// export default function TrackingPengujian() {
//   const [trackingData, setTrackingData] = useState([]);
//   const [filteredData, setFilteredData] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(5);
//   const [yearFilter, setYearFilter] = useState("");
//   const [monthFilter, setMonthFilter] = useState("");
//   const navigation = useNavigation();

//   useEffect(() => {
//     axios
//       .get("/tracking/get")
//       .then(response => {
//         setTrackingData(response.data);
//         setFilteredData(response.data);
//       })
//       .catch(error => console.error("Error fetching data:", error));
//   }, []);

//   useEffect(() => {
//     filterData();
//   }, [yearFilter, monthFilter]);

//   const filterData = () => {
//     let data = trackingData;

//     if (yearFilter) {
//       data = data.filter(item => item.created_at.startsWith(yearFilter));
//     }

//     if (monthFilter) {
//       data = data.filter(item => {
//         const itemMonth = new Date(item.created_at).getMonth() + 1;
//         return itemMonth.toString() === monthFilter;
//       });
//     }

//     setFilteredData(data);
//     setCurrentPage(1);
//   };

//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

//   const handlePageChange = direction => {
//     if (
//       direction === "next" &&
//       currentPage < Math.ceil(filteredData.length / itemsPerPage)
//     ) {
//       setCurrentPage(currentPage + 1);
//     } else if (direction === "prev" && currentPage > 1) {
//       setCurrentPage(currentPage - 1);
//     }
//   };
//   const handleTrackingPress = id => {
//     navigation.navigate("TrackingList", { id }); // Make sure 'TrackingList' is correctly spelled and matches your navigator
//   };

//   const renderCard = ({ item }) => (
//     <View style={[styles.CardContainer, { backgroundColor: 'white' }]}>
//       <View style={styles.CardContent}>
//       <View style={styles.status}>

// <Text style={styles.CardText}>Belum Selesai {item.status}</Text>
// </View>
//         <Text style={[styles.CardText, { fontSize : 20, fontWeight : 'bold'}]}>CD234BB</Text>
//         <Text style={styles.CardText}>Surabaya, Jawa Timur {item.lokasi}</Text>
//         <Text style={styles.CardText}>
//           Tanggal Dibuat : {item.tanggal_dibuat} 
//         </Text>
//         <Text style={styles.CardText}>
//           Tanggal Diterima : {item.tanggal_diterima}
//         </Text>
//         <Text style={styles.CardText}>
//           Tanggal Selesai : {item.tanggal_selesai}
//         </Text>
      
//       </View>
//         <View style={styles.action}>
//           <TouchableOpacity
//             style={[
//               styles.buttonTracking,
//               { backgroundColor: Colors.yellow10 },
//             ]}
//             onPress={() => handleTrackingPress(item.id)}>
//             <Text style={styles.textButtonTracking}>Tracking</Text>
//             <Image
//               source={require("@/assets/images/double-right.png")}
//               style={styles.iconStyle}
//             />
//           </TouchableOpacity>
//         </View>
//     </View>
//   );

//   return (
//     <View style={styles.Container}>


//       {/* Pagination Data */}
//       <FlatList
//         data={currentData}
//         renderItem={renderCard}
//         keyExtractor={(item, index) =>
//           item.id ? item.id.toString() : index.toString()
//         }
//       />

//       {/* Pagination Controls */}
//       {/* <View style={styles.pagination}>
//         {currentPage > 1 && (
//           <TouchableOpacity onPress={() => handlePageChange("prev")}>
//             <Text style={styles.pageButton}>Previous</Text>
//           </TouchableOpacity>
//         )}
//         <Text style={styles.pageNumber}>{currentPage}</Text>
//         {currentPage < Math.ceil(filteredData.length / itemsPerPage) && (
//           <TouchableOpacity onPress={() => handlePageChange("next")}>
//             <Text style={styles.pageButton}>Next</Text>
//           </TouchableOpacity>
//         )}
//       </View> */}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   Container: {
//     flex: 1,
//     alignItems: "center",
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "black",
//     marginVertical: 10,
//   },

//   CardContainer: {
//     width: 360,
//     marginVertical: 10,
//     borderRadius: 15,
//     padding: 20,
//     backgroundColor: "#fff",
//     flexDirection: "row",
//     borderTopColor: Colors.brand,
//     flexDirection :'row',
//     borderTopWidth: 7,
//     display : "flex",
//     alignItems : "center",
//     justifyContent : 'center'
//   },
//   CardContent: {
//     borderRadius: 10,
//     padding: 10,
//     width: "70%",
//     marginBottom: 10,

//   },
//   CardText: {
//     color: "black",
//     marginBottom: 5,
//   },
//   status : {
//     paddingVertical : 10,

//   },  
//   buttonTracking: {
//     paddingHorizontal: 14,
//     paddingVertical : 10,
//     borderRadius: 5,
//     backgroundColor: "#4682B4", // Warna untuk tombol Detail
//     justifyContent: "center",
//     alignItems: "center",
//     flexDirection: "row", // Menyusun elemen secara horizontal
//   },
//   textButtonTracking: {
//     color: "white",
//     fontSize: 14,
//     fontWeight: "bold",
//     marginLeft: 5,
//   },
//   iconStyle: {
//     tintColor: "white",
//     width: 20,
//     height: 20,
//     marginLeft: 5,
//   },
//   action: {
//     width: "30%",
//   },
//   pagination: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginTop: 20,
//   },
//   pageButton: {
//     fontSize: 16,
//     color: Colors.brand,
//     fontWeight: "bold",
//   },
//   pageNumber: {
//     fontSize: 16,
//     fontWeight: "bold",
//   },
// });
