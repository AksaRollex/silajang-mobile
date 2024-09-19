import React from "react";
import { Text, View, Button, StyleSheet } from "react-native";

export default function DetailKontrak({ route, navigation }) {
    const { uuid } = route.params

    return (
        <View style={styles.container}>
            <Text>Detail Kontrak { uuid }</Text>
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