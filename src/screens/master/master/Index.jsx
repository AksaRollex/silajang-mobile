import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import JasaPengambilan from './jasa-pengambilan/JasaPengambilan'
import JenisSampel from './jenis-sampel/JenisSampel'
import JenisWadah from './jenis-wadah/JenisWadah'
import KodeRetribusi from './kode-retribusi/KodeRetribusi'
import LiburCuti from './libur-cuti/LiburCuti'
import Master from './Master'
import Metode from './metode/Metode'
import Paket from './paket/Paket'
import Parameter from './parameter/Parameter'
import Pengawetan from './pengawetan/Pengawetan'
import Peraturan from './peraturan/Peraturan'
import RadiusPengambilan from './radius-pengambilan/RadiusPengambilan'
import FormMetode from './metode/Form'
import FormPeraturan from './peraturan/Form'
import FormParameter from './parameter/Form'
import FormPengawetan from './pengawetan/Form'
import FormJenisSampel from './jenis-sampel/FormJenisSampel'
import ParameterPeraturan from './peraturan/Parameter'

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
        <Stack.Screen name="FormMetode" component={FormMetode}/>
        <Stack.Screen name="FormPeraturan" component={FormPeraturan}/>
        <Stack.Screen name="FormParameter" component={FormParameter}/>
        <Stack.Screen name="FormPengawetan" component={FormPengawetan}/>
        <Stack.Screen name="FormJenisSampel" component={FormJenisSampel}/>
        <Stack.Screen name="ParameterPeraturan" component={ParameterPeraturan}/>
      </Stack.Navigator>
  )
}