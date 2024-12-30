import {
  View,
  Text,
  ScrollView,
  ImageBackground,
  Linking, 
  TouchableOpacity,
} from "react-native";
import React from "react";
import Header from "../../components/Header";
import AskButton from "../component/AskButton";
import FooterLanding from "../component/FooterLanding";
import { useQuery } from "@tanstack/react-query";
import axios from "@/src/libs/axios";
import { APP_URL } from "@env";

const PeraturanMenteriRepublikIndonesia = () => {
  const { data, isFetching } = useQuery({
    queryKey: ["PeraturanMenteriRepublikIndonesia"],
    queryFn: () =>
      axios.get("konfigurasi/produk-hukum").then(res => {
        console.log(res.data.data);
        return res.data.data;
      }),
    placeholderData: { data: [] },
    onError: error => console.error(error.response?.data),
  });

  const slug = "peraturan-menteri-republik-indonesia";

  const { data: dataWSlug, isFetching: isFetchingWSlug } = useQuery({
    queryKey: ["PeraturanMenteriRepublikIndonesia", slug],
    queryFn: () =>
      axios.get(`konfigurasi/produk-hukum/${slug}`).then(res => {
        console.log("Detail data:", res.data.data);
        return res.data.data;
      }),
    placeholderData: null,
    onError: error => console.error(error.response?.data),
  });

  const handleDocumentPress = async fileUrl => {
    try {
      const serverUrl = APP_URL;

      const cleanPath = fileUrl.startsWith("/")
        ? fileUrl.substring(1)
        : fileUrl;

      const fullUrl = `${serverUrl}/${cleanPath}`;

      console.log("Opening URL:", fullUrl);

      const supported = await Linking.canOpenURL(fullUrl);
      console.log("URL supported:", supported);

      if (supported) {
        await Linking.openURL(fullUrl);
      } else {
        Linking.openURL(fullUrl).catch(err => {
          console.error("Error opening URL:", err);
          alert(
            "Tidak dapat membuka file PDF. Pastikan Anda memiliki aplikasi PDF reader.",
          );
        });
      }
    } catch (error) {
      console.error("Error detail:", error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <View className="w-full h-full bg-[#ececec]">
      <ScrollView>
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
        <View>
          <View className="flex-col p-3">
            <Text className="font-poppins-bold text-2xl text-[#252a61]">
              Produk Hukum
            </Text>
            <Text className="font-poppins-regular text-base text-[#252a61]">
              Produk Hukum Yang Dimiliki Oleh Laboratorium DLH Kabupaten Jombang
            </Text>
          </View>
          <View className="flex-row flex-wrap px-3">
            {dataWSlug ? (
              <View className="my-2 shadow-lg rounded-lg p-4 bg-white w-full">
                <Text className="font-poppins-bold text-2xl text-[#252a61] mb-2">
                  {dataWSlug.nama}
                </Text>
                <Text className="font-poppins-regular text-base text-[#252a61] mb-4">
                  {dataWSlug.deskripsi ? (
                    <Text>{dataWSlug.deskripsi.replace(/<[^>]*>/g, "")}</Text>
                  ) : (
                    "Deskripsi tidak tersedia"
                  )}
                </Text>

                {dataWSlug.items && dataWSlug.items.length > 0 ? (
                  <View>
                    <Text className="font-poppins-bold text-xl text-[#252a61] mb-2">
                      Dokumen Terkait:
                    </Text>
                    {dataWSlug.items.map(item => (
                      <TouchableOpacity
                        key={item.uuid}
                        onPress={() => handleDocumentPress(item.file)}
                        className="mb-3">
                        <View className="p-3 bg-gray-50 rounded flex-row items-center">
                          <View className="flex-1">
                            <Text className="font-poppins-medium text-base text-[#252a61]">
                              {item.nama}
                            </Text>
                            <Text className="font-poppins-regular text-xs text-gray-500 mt-1">
                              Ketuk untuk membuka dokumen
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text className="text-center text-base text-[#252a61]">
                    Tidak ada dokumen terkait.
                  </Text>
                )}
              </View>
            ) : (
              <Text className="text-center text-base text-[#252a61]">
                Tidak ada data produk hukum untuk slug ini.
              </Text>
            )}
          </View>
        </View>
        <AskButton />
        <FooterLanding />
      </ScrollView>
    </View>
  );
};

export default PeraturanMenteriRepublikIndonesia;
