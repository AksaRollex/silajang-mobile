import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import Konfigurasi from '../IndexKonfigurasi'
import LogTte from '../../konfigurasi/log-tte/LogTte'
import TandaTangan from '../../konfigurasi/tanda-tangan/TandaTangan'
import UmpanBalik from '../../konfigurasi/umpan-balik/UmpanBalik'
import TrackingPengujian from '../../konfigurasi/tracking-pengujian/TrackingPengujian'
import FormTandaTangan from '../../konfigurasi/tanda-tangan/FormTandaTangan'
import DetailTracking from '../../konfigurasi/tracking-pengujian/DetailTracking'
const Stack = createNativeStackNavigator();

export default function MainScreen() {
    return (
        <Stack.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                animation: route.name.startsWith('Form')
                    ? "fade_from_bottom"
                    : "slide_from_right"
            })}
        >
            <Stack.Screen name="KonfigurasiIndex" component={Konfigurasi} />
            <Stack.Screen name="LogTte" component={LogTte} />
            <Stack.Screen name="TandaTangan" component={TandaTangan} />
            <Stack.Screen name="UmpanBalik" component={UmpanBalik} />
            <Stack.Screen name="TrackingPengujian" component={TrackingPengujian} />
            <Stack.Screen name="FormTandaTangan" component={FormTandaTangan} />
            <Stack.Screen name="DetailTracking" component={DetailTracking} />
        </Stack.Navigator>
    )
}