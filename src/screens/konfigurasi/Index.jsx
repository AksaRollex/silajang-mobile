import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import Konfigurasi from './Konfigurasi'
import LogTte  from './log-tte/LogTte'
import TandaTangan from './tanda-tangan/TandaTangan'
import FormTandaTangan from './tanda-tangan/FormTandaTangan'
import TrackingPengujian from './tracking-pengujian/TrackingPengujian'
const Stack = createNativeStackNavigator();

export default function MainScreen() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="KonfigurasiIndex" component={Konfigurasi} />
            <Stack.Screen name="LogTte" component={LogTte} />
            <Stack.Screen name="TandaTangan" component={TandaTangan} />
            <Stack.Screen name="TrackingPengujian" component={TrackingPengujian} />
            <Stack.Screen name="FormTandaTangan" component={FormTandaTangan} />
        </Stack.Navigator>
    )
}