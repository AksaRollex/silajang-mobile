import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import Konfigurasi from './Konfigurasi'
import LogTte  from './log-tte/LogTte'
import TandaTangan from './tanda-tangan/TandaTangan'
import UmpanBalik from './umpan-balik/UmpanBalik'
import TrackingPengujian from './tracking-pengujian/TrackingPengujian'
import FormTandaTangan from './tanda-tangan/FormTandaTangan'
import DetailTracking from './tracking-pengujian/DetailTracking'
import Denda from './denda/Denda'
const Stack = createNativeStackNavigator();

export default function MainScreen() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false, animation : "slide_from_right" }}>
            <Stack.Screen name="KonfigurasiIndex" component={Konfigurasi} />
            <Stack.Screen name="Denda" component={Denda} />
            <Stack.Screen name="LogTte" component={LogTte} />
            <Stack.Screen name="TandaTangan" component={TandaTangan} />
            <Stack.Screen name="UmpanBalik" component={UmpanBalik} />
            <Stack.Screen name="TrackingPengujian" component={TrackingPengujian} /> 
            <Stack.Screen name="FormTandaTangan" component={FormTandaTangan} />
            <Stack.Screen name="DetailTracking" component={DetailTracking} />
        </Stack.Navigator>
    )
}