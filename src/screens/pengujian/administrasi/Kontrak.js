import React from "react";
import { Text, View, Button, StyleSheet } from "react-native";
import { useNavigation } from '@react-navigation/native';

export default function Kontrak() {
    const navigation = useNavigation();
    
    return (
        <View style={styles.container}>
            <Text>KONTRAK</Text>
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