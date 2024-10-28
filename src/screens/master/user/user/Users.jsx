import { Text, View } from "react-native-ui-lib";
import React from "react";
import { useDelete } from "@/src/hooks/useDelete";
import Paginate from "@/src/screens/components/Paginate";
import { MenuView } from "@react-native-menu/menu";
import { useQueryClient } from "@tanstack/react-query";
import Icon from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";


const Users = ({ navigation }) => {
    return (
        <View>
            <Text>Users</Text>
        </View>
    )
}

export default Users