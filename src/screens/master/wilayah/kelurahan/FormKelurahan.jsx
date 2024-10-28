import { Text, View, Button, TextField } from "react-native-ui-lib";
import React, { memo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ScrollView } from "react-native-gesture-handler";
import Select2 from "@/src/screens/components/Select2";
import axios from "@/src/libs/axios";
import Toast from "react-native-toast-message";
import BackButton from "@/src/screens/components/BackButton";
import { ActivityIndicator } from "react-native-paper";

export default memo(function form({ route, navigation}) {
    const { uuid } = route.params || {};
    const { handleSubmit, control, formState: { errors }, setValue } = useForm();

})