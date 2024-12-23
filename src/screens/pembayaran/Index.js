import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import Pembayaran from './Pembayaran'
import Pengujian from './Pengujian'
import EditPembayaran from '../formComponent/EditPembayaran'
import Detail from './Detail'
import MultiPayment from './MultiPayment'
import FormMulti from './FormMulti'
import NonPengujian from './NonPengujian'
import DetailNonPengujian from './DetailNonPengujian'
import FormNonPengujian from './Form'
import Global from './Global'
import DetailMulti from './DetailMulti'

const Stack = createNativeStackNavigator();

export default function PembayaranStackScreen() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
            <Stack.Screen name="PembayaranIndex" component={Pembayaran} />
            <Stack.Screen name="Pengujian" component={Pengujian}/>
            <Stack.Screen name="EditPembayaran" component={EditPembayaran}/>
            <Stack.Screen name="Detail" component={Detail} />
            <Stack.Screen name="MultiPayment" component={MultiPayment} />
            <Stack.Screen name="NonPengujian" component={NonPengujian} />
            <Stack.Screen name="DetailNonPengujian" component={DetailNonPengujian} />
            <Stack.Screen name="FormNonPengujian" component={FormNonPengujian} />
            <Stack.Screen name="FormMulti" component={FormMulti} />
            <Stack.Screen name="Global" component={Global} />
            <Stack.Screen name="DetailMulti" component={DetailMulti} />
        </Stack.Navigator>
    )
}