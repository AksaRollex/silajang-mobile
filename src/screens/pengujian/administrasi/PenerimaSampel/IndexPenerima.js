import React from "react";
import { Text, View, Button, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native';
export default function PenerimaSampel({ navigation }) {
    
    const nav = useNavigation();

    const handlePress = () => {
        const uuid = '7cd62078-6101-4ef3-ad6f-28afe23d81b9';
        nav.navigate("DetailPenerima", { uuid });
    }

    return (
        <View style={styles.container}>
        <View>
            <TouchableOpacity
            onPress={handlePress}
            style={styles.to}
            >
                <Text style={styles.title}>Detail</Text>
            </TouchableOpacity>
        </View>
            <Text style={styles.title}>PENERIMA SAMPEL CUY</Text>
            <Button
                title="Go Back!"
                onPress={() => navigation.goBack()}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, 
        alignItems: 'center', 
        justifyContent: 'center'
    },
    title: {
        fontSize:25,
        color: "black",
        marginBottom:30,
        alignItems: "center",
        justifyContent: "center",
    },
    to: {
        backgroundColor: "blue",
        width: 200,
        borderRadius: 20,
    }
});