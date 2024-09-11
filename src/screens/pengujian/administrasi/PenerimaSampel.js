import React from "react";
import { Text, View, Button, StyleSheet } from "react-native";
import { useNavigation } from '@react-navigation/native';

export default function PenerimaSampel() {
    const navigation = useNavigation();
    
    return (
        <View style={styles.container}>
            <Text>PENERIMA SAMPEL</Text>
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
});