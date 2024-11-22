import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Wilayah from './Wilayah'
import KotaKab from './kotakab/KotaKab'
import FormKotaKab from './kotakab/FormKotaKab'
import Kecamatan from './kecamatan/Kecamatan'
import FormKecamatan from './kecamatan/FormKecamatan'
import Kelurahan from './kelurahan/Kelurahan'
import FormKelurahan from './kelurahan/FormKelurahan'


const Stack = createNativeStackNavigator()

export default function MainScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="IndexWilayah" component={Wilayah}/>
      <Stack.Screen name="KotaKab" component={KotaKab}/>
      <Stack.Screen name="Kecamatan" component={Kecamatan}/>
      <Stack.Screen name="Kelurahan" component={Kelurahan}/>
      <Stack.Screen name="FormKelurahan" component={FormKelurahan}/>
      <Stack.Screen name="FormKecamatan" component={FormKecamatan}/>
      <Stack.Screen name="FormKotaKab" component={FormKotaKab}/>
    </Stack.Navigator>
  )
}