import React, { useState } from "react";
import { Text, View, StyleSheet, TextInput, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SearchBar } from "react-native-screens";
import { Button } from "react-native-ui-lib";

const Pengujian = () => {
    const navigation = useNavigation();
    const [search, setSearch] = useState("");

    const [searchQuery, setSearchQuery] = React.useState("");

    return(
        <View style={styles.container}> 
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%'}}>
                <SearchBar placeholder="Search" onChangeText={setSearchQuery} value={searchQuery} style={styles.search}/>
                <Button style={styles.buttonSearch}>
                    <Image source={require("../../../assets/images/search.png")} style={styles.searchIcon}/>
                </Button>
            </View>
            <Text className="text-xl font-bold">PENGUJIAN</Text>
            <Button
                title="Go Back!"
                onPress={() => navigation.goBack()}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        alignItems: 'center', 
    },
    buttonSearch: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 10
    },
    search: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 5,
        backgroundColor: 'white',
        borderRadius: 10,
        marginVertical: 10
    },
    searchIcon: {
        width: 24,
        height: 24
    }
});

export default Pengujian;
