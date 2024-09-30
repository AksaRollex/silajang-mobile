import React, { useState } from "react";
import { Text, View, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Button } from "react-native-ui-lib";
import { TextInput } from "react-native-gesture-handler";
import BackButton from "../components/BackButton";

const Global = () => {
    const navigation = useNavigation();
    const [search, setSearch] = useState("");

    const [searchQuery, setSearchQuery] = React.useState("");

    return(
        <View className="flex-1 bg-gray-100 p-4">

            <Text className="text-2xl font-bold mb-6 text-gray-800 text-center">Global</Text>

            <View className="w-full flex-row items-center justify-between mb-4 space-x-3">
                <BackButton action={()=> navigation.goBack()} size={26} />
                <TextInput
                placeholder="Cari"
                className="flex-1 bg-white p-3 rounded-lg shadow-md"
                value={searchQuery}
                onChangeText={setSearchQuery}
                />
                <Button
                 className="p-3 rounded-lg shadow-md">
                    <Image
                    source={require("../../../assets/images/search.png")}
                    className="w-6 h-6"
                    />
                </Button>
            </View>

        


        </View>
    )
}

export default Global;