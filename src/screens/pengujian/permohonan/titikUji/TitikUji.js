import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
} from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/src/libs/axios";
import { Colors } from "react-native-ui-lib";
import Header from "@/src/screens/components/Header";
import Entypo from "react-native-vector-icons/Entypo";
import { MenuView } from "@react-native-menu/menu";
import { useDelete } from "@/src/hooks/useDelete";
import Icons from "react-native-vector-icons/AntDesign";
import Paginate from "@/src/screens/components/Paginate";
import { usePermohonan } from "@/src/services/usePermohonan";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { APP_URL } from "@env";
import Pdf from "react-native-pdf";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from "react-native-popup-menu";
import Icon from "react-native-vector-icons/FontAwesome";
import { useUser } from "@/src/services";

const baseRem = 16;
const rem = multiplier => baseRem * multiplier;

const TitikUji = ({ navigation, route, status }) => {
  const { uuid } = route.params || {};
  const { data: permohonan } = usePermohonan(uuid);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [reportUrl, setReportUrl] = useState("");
  const { data: user } = useUser();
  const openModal = () => {
    setIsModalVisible(true);
  };

  useEffect(() => {
    console.log("DATA ANJAY", uuid);
  }, [uuid]);

  const closeModal = () => {
    setIsModalVisible(false);
  };
  const queryClient = useQueryClient();
  const titikPermohonans = queryClient.getQueryData(["permohonan", uuid, "titik"])
  // const { permohonans, isLoading: isLoadingData } = useQuery(
  //   ["permohonan", uuid],
  //   () =>
  //     axios
  //       .post(`/permohonan/titik`, { permohonan_uuid: uuid })
  //       .then(res => res.data),
  //   {
  //     onSuccess: data => {
  //       console.log("data huh", data);
  //     },
  //     onError: error => {
  //       console.error(error.response.data);
  //     },
  //   },
  // );

  const paginateRef = useRef();

  const { delete: deleteTitikUji, DeleteConfirmationModal } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries(["TitikUji"]);
      navigation.navigate("TitikUji");
    },
    onError: error => {
      console.log("Delete error : ", error);
    },
  });

  const dropdownOptions = [
    {
      id: "Parameter",
      title: "Parameter",
      action: item => navigation.navigate("Parameter", { uuid: item.uuid }),
    },
    {
      id: "Edit",
      title: "Edit",
      action: item =>
        navigation.navigate("FormTitikUji", {
          uuid: item.uuid,
          permohonan: permohonan,
        }),
    },
    {
      id: "Hapus",
      title: "Hapus",
      action: item => deleteTitikUji(`/permohonan/titik/${item.uuid}`),
    },
  ];

  //   const ActionColumn = ({ item }) => {
  //     const showCertificateButton =
  //       item.status_tte === 1 &&
  //       (item.status_pembayaran === 1 ||
  //         item.permohonan?.user?.golongan_id === 2);

  //     const handleCertificatePress = () => {
  //       if (previewReport) {
  //         setReportUrl(
  //           `/api/v1/report/${
  //             item.uuid
  //           }/lhu/tte/download?token=${AsyncStorage.getItem("auth_token")}`,
  //         );
  //         showReportModal();
  //       } else {
  //         downloadReport(`/report/${item.uuid}/lhu/tte/download`);
  //       }
  //     };

  //     const handleReportOptionPress = () => {
  //       if (previewReport) {
  //         setReportUrl(
  //           `/api/v1/report/${
  //             item.uuid
  //           }/${reportType}?token=${AsyncStorage.getItem("auth_token")}`,
  //         );
  //         showReportModal();
  //       } else {
  //         downloadReport(`/report/${item.uuid}/${reportType}`);
  //       }
  //     };

  //     return (
  //       <>
  //       <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
  //         {showCertificateButton && (
  //           <TouchableOpacity
  //           style={{
  //             backgroundColor: "#28a745",
  //             padding: 8,
  //             borderRadius: 4,
  //             flexDirection: "row",
  //             alignItems: "center",
  //           }}
  //           onPress={handleCertificatePress}>
  //             <Icon name="file-pdf-o" size={20} color="white" />
  //             <Text style={{ color: "white", marginLeft: 4 }}>
  //               Sertifikat LHU
  //             </Text>
  //           </TouchableOpacity>
  //         )}

  //         <Menu>
  //           <MenuTrigger>
  //             <View
  //               style={{
  //                 backgroundColor: "#dc3545",
  //                 padding: 8,
  //                 borderRadius: 4,
  //                 flexDirection: "row",
  //                 alignItems: "center",
  //               }}>
  //               <Icon name="file-pdf-o" size={20} color="white" />
  //               <Text style={{ color: "white", marginLeft: 4 }}>Report</Text>
  //             </View>
  //           </MenuTrigger>
  //           <MenuOptions>
  //             {item.status >= 2 && (
  //               <MenuOption
  //               onSelect={() => handleReportOptionPress("tanda-terima")}>
  //                 <View style={{ flexDirection: "row", alignItems: "center" }}>
  //                   <Icon name="file-pdf-o" size={20} />
  //                   <Text style={{ marginLeft: 8 }}>Permohonan Pengujian</Text>
  //                 </View>
  //               </MenuOption>
  //             )}
  //             {!item.permohonan.is_mandiri && (
  //               <MenuOption
  //               onSelect={() => handleReportOptionPress("berita-acara")}>
  //                 <View style={{ flexDirection: "row", alignItems: "center" }}>
  //                   <Icon name="file-pdf-o" size={20} />
  //                   <Text style={{ marginLeft: 8 }}>
  //                     Berita Acara Pengambilan
  //                   </Text>
  //                 </View>
  //               </MenuOption>
  //             )}
  //           </MenuOptions>
  //         </Menu>
  //       </View>
  // </>
  //     );
  //   };

  const CardTitikUji = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.card}>
        <View style={styles.cards}>
          <Text className="text-black text-base font-bold">{item.lokasi}</Text>
          <Text className="font-bold text-2xl text-black my-1">
            {item.kode}
          </Text>
          <View className="py-1">
            <Text className=" text-sm text-black ">
              Diambil : {item.tanggal_pengambilan || "-"}
            </Text>
            <Text className=" text-sm text-black ">
              Diterima : {item.tanggal_diterima || "-"}
            </Text>
            <Text className=" text-sm text-black ">
              Selesai : {item.tanggal_selesai_uji || "-"}
            </Text>
          </View>

          <View>
            <Text
              style={styles.badge}
              className={`text-[12px] text-indigo-600  mt-2
              ${
                status == 0
                  ? "bg-green-400"
                  : status == 1
                  ? "bg-slate-100"
                  : status == 2
                  ? "bg-slate-100"
                  : status == 3
                  ? "bg-slate-100"
                  : status == 4
                  ? "bg-slate-100"
                  : status == 5
                  ? "bg-slate-100"
                  : status == 6
                  ? "bg-slate-100"
                  : status == 7
                  ? "bg-slate-100"
                  : status == 8
                  ? "bg-slate-100"
                  : status == 9
                  ? "bg-slate-100"
                  : status == 10
                  ? "bg-slate-100"
                  : status == 11
                  ? "bg-slate-100"
                  : "bg-slate-100"
              }`}>
              {" "}
              Pengambilan :
              {status == 0
                ? "Mengakan Permohonan"
                : status == 1
                ? "Menyerahkan Sampel"
                : status == 2
                ? "Menyerahkan Surat Perintah Pengujian"
                : status == 3
                ? "Menyerahkan sampel untuk Proses Pengujian"
                : status == 4
                ? "Menyerahkan RDPS"
                : status == 5
                ? "Menyerahkan RDPS untuk Pengetikan LHU"
                : status == 6
                ? "Menyerahkan LHU untuk Diverifikasi"
                : status == 7
                ? "Mengesahkan LHU"
                : status == 8
                ? "Pembayaran"
                : status == 9
                ? "Penyerahan LHU"
                : status == 10
                ? "Penyerahan LHU Amandemen (Jika ada)"
                : status == 11
                ? "Selesai"
                : "Menunggu"}
            </Text>
            <Text
              style={styles.badge}
              className={`text-[12px] text-indigo-600
              ${
                status == 0
                  ? "bg-green-400"
                  : status == 1
                  ? "bg-slate-100"
                  : status == 2
                  ? "bg-slate-100"
                  : status == 3
                  ? "bg-slate-100"
                  : status == 4
                  ? "bg-slate-100"
                  : status == 5
                  ? "bg-slate-100"
                  : status == 6
                  ? "bg-slate-100"
                  : status == 7
                  ? "bg-slate-100"
                  : status == 8
                  ? "bg-slate-100"
                  : status == 9
                  ? "bg-slate-100"
                  : status == 10
                  ? "bg-slate-100"
                  : status == 11
                  ? "bg-slate-100"
                  : "bg-slate-100 && text-red-500"
              }`}>
              {" "}
              Penerimaan :
              {status == 0
                ? "Mengakan Permohonan"
                : status == 1
                ? "Menyerahkan Sampel"
                : status == 2
                ? "Menyerahkan Surat Perintah Pengujian"
                : status == 3
                ? "Menyerahkan sampel untuk Proses Pengujian"
                : status == 4
                ? "Menyerahkan RDPS"
                : status == 5
                ? "Menyerahkan RDPS untuk Pengetikan LHU"
                : status == 6
                ? "Menyerahkan LHU untuk Diverifikasi"
                : status == 7
                ? "Mengesahkan LHU"
                : status == 8
                ? "Pembayaran"
                : status == 9
                ? "Penyerahan LHU"
                : status == 10
                ? "Penyerahan LHU Amandemen (Jika ada)"
                : status == 11
                ? "Selesai"
                : "Menunggu"}
            </Text>
            <Text
              style={styles.badge}
              className="text-[12px] text-indigo-600  bg-slate-100 ">
              Pengujian :{item.text_status || "-"}
            </Text>
          </View>
        </View>
        <View style={styles.cards2}>
          <MenuView
            title="Menu Title"
            actions={dropdownOptions.map(option => ({
              ...option,
            }))}
            onPressAction={({ nativeEvent }) => {
              const selectedOption = dropdownOptions.find(
                option => option.title === nativeEvent.event,
              );
              if (selectedOption) {
                selectedOption.action(item);
              }
            }}
            shouldOpenOnLongPress={false}>
            {/* <TouchableOpacity
        className="flex-row justify-center bg-red-600 p-2 rounded-xl absolute bottom-8 right-1 items-end"
        onPress={openModal}>
        <Icons name="plus" size={24} color="#fff" />
        <Text className="text-white font-bold"></Text>
      </TouchableOpacity>

      {/* Modal to display the empty card */}
            {/* <Modal
        visible={isModalVisible}
        animationType="fade"
        onRequestClose={closeModal}
        transparent={true}>
        <View className="flex-1 justify-center items-center bg-black bg-black/50">
          <View className="bg-white rounded-xl w-5/6 p-6 shadow-lg">
            <Text className="text-black text-xl font-bold mb-4">Empty Card</Text>

            {/* Empty card content */}
            {/* <View className="w-full h-40 bg-gray-200 rounded-lg mb-4"></View> */}

            {/* <TouchableOpacity
              className="self-end bg-red-600 py-2 px-4 rounded-md"
              onPress={closeModal}>
              <Text className="text-white font-bold">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal> */}

            <View>
              <Entypo name="dots-three-vertical" size={16} color="#312e81" />
            </View>
          </MenuView>
          {/* <ActionColumn item={item} /> */}
        </View>
      </View>
    </View>
  );

  return (
    <>
      <Header navigate={() => navigation.navigate("Profile")} />
      <View className="bg-[#ececec] w-full h-full">
        {permohonan ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginHorizontal: rem(1),
              marginTop: rem(0.5),
            }}>
            <View style={{ flexDirection: "row" }}>
              <Text style={styles.topText} className="mt-4 mx-1">
                {permohonan?.industri} : Titik Pengujian
              </Text>
            </View>
          </View>
        ) : (
          <View className="h-full flex justify-center">
            <ActivityIndicator size={"large"} color={"#312e81"} />
          </View>
        )}
        {/* {user && user?.has_tagihan ? (
          <View>
            <Text>anjay</Text>
          </View>
        ) : (
          <View></View>
        )} */}
        {/* <Text>
          {titikPermohonans?.data?.length}
        </Text> */}
        {!titikPermohonans?.data?.length && (
          <View className="flex items-center mt-5">
            <Text className="text-gray-500 mb-0">Silahkan Tambah Titik Lokasi Sampel Pengujian</Text>
            <Text className="text-gray-500 text-xs">Anda belum memiliki Titik Lokasi Sampel satu pun.</Text>
          </View>
        )}
        <Paginate
          ref={paginateRef}
          payload={{ permohonan_uuid: { uuid } }}
          url="/permohonan/titik"
          queryKey={["permohonan", uuid, "titik"]}
          className="mb-28"
          renderItem={CardTitikUji}></Paginate>
      </View>

      <Icons
        name="plus"
        size={28}
        color="#fff"
        style={styles.plusIcon}
        onPress={() => navigation.navigate("FormTitikUji", { permohonan })}
      />
      <DeleteConfirmationModal />
    </>
  );
};
const styles = StyleSheet.create({
  backButton: {
    padding: 4,
    backgroundColor: "#6b7fde",
    borderRadius: 5,
    alignItems: "center",
    width: "10%",
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  topText: {
    fontWeight: "bold",
    color: "black",
    fontSize: rem(1),
  },
  badge: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 8,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  picker: {
    flex: 1,
    marginHorizontal: 4,
  },
  card: {
    marginVertical: 10,
    borderRadius: 15,
    padding: rem(0.8),
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
    fontSize: 13,
    color: "black",
  },
  plusIcon: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#312e81",
    padding: 10,
    marginBottom: rem(4),
    borderRadius: 50,
  },
});

export default TitikUji;
