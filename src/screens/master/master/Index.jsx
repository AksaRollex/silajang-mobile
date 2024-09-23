import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import JasaPengambilan from './JasaPengambilan'
import JenisSampel from './JenisSampel'
import JenisWadah from './JenisWadah'
import KodeRetribusi from './KodeRetribusi'
import LiburCuti from './LiburCuti'
import Master from './Master'
import Metode from './Metode'
import Paket from './Paket'
import Parameter from './Parameter'
import Pengawetan from './Pengawetan'
import Peraturan from './Peraturan'
import RadiusPengambilan from './RadiusPengambilan'

const Stack = createNativeStackNavigator()
export default function MainScreen () {
  return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MasterIndex" component={Master} />
        <Stack.Screen name="Metode" component={Metode} />
        <Stack.Screen name="JasaPengambilan" component={JasaPengambilan} />
        <Stack.Screen name="JenisSampel" component={JenisSampel} />
        <Stack.Screen name="JenisWadah" component={JenisWadah} />
        <Stack.Screen name="KodeRetribusi" component={KodeRetribusi} />
        <Stack.Screen name="LiburCuti" component={LiburCuti} />
        <Stack.Screen name="Paket" component={Paket} />
        <Stack.Screen name="Parameter" component={Parameter} />
        <Stack.Screen name="Pengawetan" component={Pengawetan} />
        <Stack.Screen name="Peraturan" component={Peraturan} />
        <Stack.Screen name="RadiusPengambilan" component={RadiusPengambilan} />
      </Stack.Navigator>
  )
}