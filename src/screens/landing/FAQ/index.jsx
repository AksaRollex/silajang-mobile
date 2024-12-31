import {
  View,
  Text,
  ImageBackground,
  ScrollView,
  Animated,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Alert,
  Linking,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import Header from "../../components/Header";
import IonIcons from "react-native-vector-icons/Ionicons";
import FooterLanding from "../component/FooterLanding";
import AskButton from "../component/AskButton";
import Video from "react-native-video";
import RNFetchBlob from "rn-fetch-blob";
import Pdf from "react-native-pdf";

const FAQ = ({ navigation }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpens, setIsOpens] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleAccordions = () => {
    const toValue = isOpen ? 0 : 1;
    setIsOpen(!isOpen);

    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };
  const toggleAccordionss = () => {
    const toValue = isOpen ? 0 : 1;
    setIsOpens(!isOpens);

    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const rotate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const videoUrl = require("../../../../assets/media/documentation.mp4");

  const requestStoragePermission = async () => {
    if (Platform.OS === "android") {
      try {
        // Cek status permission saat ini
        const readStatus = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );
        const writeStatus = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
  
        // Jika salah satu permission ditolak dengan "never ask again"
        if (!readStatus || !writeStatus) {
          Alert.alert(
            "Izin Diperlukan",
            "Aplikasi memerlukan izin penyimpanan. Silakan aktifkan di pengaturan aplikasi.",
            [
              { text: "Batal" },
              {
                text: "Buka Pengaturan",
                onPress: () => {
                  Linking.openSettings();
                },
              },
            ]
          );
          return false;
        }
  
        // Jika belum pernah meminta permission
        const permissions = [
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ];
  
        const statuses = await PermissionsAndroid.requestMultiple(permissions);
        
        return Object.values(statuses).every(
          status => status === PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (err) {
        console.error('Error requesting permission:', err);
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const result = await requestStoragePermission();
        console.log('Initial permission check result:', result);
      } catch (error) {
        console.error('Error in initial permission check:', error);
      }
    };
    
    checkPermissions();
  }, []);

  const downloadFile = async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) return;

    const { fs } = RNFetchBlob;
    const fileDir = fs.dirs.DownloadDir;
    const fileName = `manual_book_${Date.now()}.pdf`;
    const destinationPath = `${fileDir}/${fileName}`;

    try {
      await RNFetchBlob.fs.cp(
        fs.asset("manual_book_silajang_user.pdf"),
        destinationPath,
      );
      Alert.alert(
        "Download Sukses",
        `File berhasil diunduh ke: ${destinationPath}`,
      );
    } catch (error) {
      console.error("Gagal mengunduh file:", error);
      Alert.alert("Download Gagal", "Terjadi kesalahan saat mengunduh file.");
    }
  };

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <View className="w-full h-full bg-[#ececec]">
      <ScrollView
        className="flex-col "
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[]}>
        <ImageBackground
          source={require("../../../../assets/images/background.png")}
          style={{
            flex: 1,
            height: "100%",
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
          }}>
          <Header
            navigate={() => {
              navigation.navigate("Profile");
            }}
          />
        </ImageBackground>
        <View className="flex-col p-3">
          <View>
            <Text className="font-poppins-bold text-2xl text-[#252a61]">
              FAQs
            </Text>
            <Text className="font-poppins-regular capitalize text-base text-[#252a61]">
              Pertanyaan Umum ? kami punya jawabannya
            </Text>
          </View>
          <View className="border border-gray-200 rounded-lg mb-2 bg-white my-3">
            <TouchableOpacity
              onPress={toggleAccordions}
              className="flex-row justify-between items-center p-4">
              <Text className="text-[#252a61] font-poppins-semibold text-lg">
                Daftar Aplikasi SI-LAJANG
              </Text>
              <Animated.View style={{ transform: [{ rotate }] }}>
                <IonIcons name="chevron-up" size={24} color="#252a61" />
              </Animated.View>
            </TouchableOpacity>

            {isOpen && (
              <View className="px-4 pb-4">
                <Text className="font-poppins-regular text-black text-sm">
                  Fitur "DAFTAR / REGISTER" digunakan untuk mendapatkan akun
                  login. Isikan nama Perusahaan , No Wahatsapp dan alamat email
                  aktif dan password login (bukan password email ya). Dalam
                  beberapa detik Anda akan mendapatkan email resmi dari Aplikasi
                  SI-LAJANG UPT. Laboratorium Dinas Lingkungan Hidup Kab.
                  Jombang. Klik tombol "Verifikasi Email" untuk kembali ke
                  halaman login. dan anda Juga akan Mendapatkan OTP di Whastapp
                  Anda untuk Memverifikasi No. Whatsapp anda.
                </Text>
              </View>
            )}
          </View>
          <View className="border border-gray-200 rounded-lg mb-2 bg-white">
            <TouchableOpacity
              onPress={toggleAccordionss}
              className="flex-row justify-between items-center p-4">
              <Text className="text-[#252a61] font-poppins-semibold text-lg">
                Login
              </Text>
              <Animated.View style={{ transform: [{ rotate }] }}>
                <IonIcons name="chevron-up" size={24} color="#252a61" />
              </Animated.View>
            </TouchableOpacity>

            {isOpens && (
              <View className="px-4 pb-4">
                <Text className="font-poppins-regular text-black text-sm">
                  Untuk Login aplikasi SI-LAJANG dapat mengunakan Login E-Mail
                  yang sudah di daftarkan atau dapat juga mengunakan OTP (One
                  Time Password) dengan memasukan No. Whatsapp yang sudah di
                  daftakan nanti akan mendaptkan OTP Ke No. Whatsapp tersebut.
                </Text>
              </View>
            )}
          </View>

          <View className="p-3 bg-white border-gray-200  border rounded-lg ">
            {/* Video Player Container */}
            <View className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-4 p-3">
              <Video
                source={{ uri: videoUrl }}
                style={{ flex: 1 }}
                resizeMode="contain"
                paused={!isPlaying}
                onLoad={data => setDuration(data.duration)}
                onProgress={data => setCurrentTime(data.currentTime)}
                controls={false}
              />

              {/* Custom Controls */}
              <View className="absolute bottom-0 left-0 right-0 bg-black/50 p-2 flex-row items-center">
                <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)}>
                  <IonIcons
                    name={isPlaying ? "pause" : "play"}
                    size={24}
                    color="white"
                  />
                </TouchableOpacity>

                <Text className="text-white mx-2">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </Text>

                <View className="flex-1 mx-2 h-1 bg-gray-500">
                  <View
                    className="h-full bg-blue-500"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </View>

                <TouchableOpacity>
                  <IonIcons name="settings-outline" size={20} color="white" />
                </TouchableOpacity>

                <TouchableOpacity className="ml-2">
                  <IonIcons name="expand-outline" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
            {/* Download Button */}
            <TouchableOpacity
              onPress={downloadFile}
              className="flex-row items-center justify-center bg-indigo-50 rounded-xl py-3 px-6 mx-auto"
              style={{
                borderWidth: 1,
                borderStyle: "dashed",
                borderColor: "#5C6BC0",
              }}>
              <IonIcons name="download-outline" size={20} color="black" />
              <Text className="ml-2 text-black font-poppins-medium">
                Unduh Manual Book
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <AskButton />
        <FooterLanding />
      </ScrollView>
    </View>
  );
};

const PdfViewer = () => {
  const source = {
    uri: "bundle-assets://media/Manual Book Silajang.pdf", // Path ke file dalam subfolder media
    cache: true,
  };

  return (
    <View style={styles.container}>
      <Pdf
        source={source}
        onLoadComplete={numberOfPages => {
          console.log(`Jumlah halaman: ${numberOfPages}`);
        }}
        onError={error => {
          console.log("Error saat membuka PDF:", error);
        }}
        style={styles.pdf}
      />
    </View>
  );
};

export default FAQ;

const styles = StyleSheet.create({
  pdf: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});
