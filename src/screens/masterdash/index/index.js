import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import JasaPengambilan from '../../master/master/jasa-pengambilan/JasaPengambilan'
import JenisSampel from '../../master/master/jenis-sampel/JenisSampel'
import JenisWadah from '../../master/master/jenis-wadah/JenisWadah'
import KodeRetribusi from '../../master/master/kode-retribusi/KodeRetribusi'
import LiburCuti from '../../master/master/libur-cuti/LiburCuti'
import IndexMaster from '../IndexMaster'
import Metode from '../../master/master/metode/Metode'
import Paket from '../../master/master/paket/Paket'
import Parameter from '../../master/master/parameter/Parameter'
import Pengawetan from '../../master/master/pengawetan/Pengawetan'
import Peraturan from '../../master/master/peraturan/Peraturan'
import RadiusPengambilan from '../../master/master/radius-pengambilan/RadiusPengambilan'
import FormMetode from '../../master/master/metode/Form'
import FormPaket from '../../master/master/paket/Form'
import FormPeraturan from '../../master/master/peraturan/Form'
import FormParameter from '../../master/master/parameter/Form'
import FormPengawetan from '../../master/master/pengawetan/Form'
import FormJenisSampel from '../../master/master/jenis-sampel/FormJenisSampel'
import FormJenisWadah from '../../master/master/jenis-wadah/FormJenisWadah'
import FormJasaPegambilan from '../../master/master/jasa-pengambilan/FormJasaPengambilan'
import FormRadiusPengambilan from '../../master/master/radius-pengambilan/FormRadiusPengambilan'
import FormLiburCuti from '../../master/master/libur-cuti/FormLiburCuti'
import FormKodeRetribusi from '../../master/master/kode-retribusi/FormKodeRetribusi'
import ParameterPeraturan from '../../master/master/peraturan/Parameter'
import ParameterPaket from '../../master/master/paket/ParameterPaket'
import Jabatan from '../../master/user/jabatan/Jabatan'
import FormJabatan from '../../master/user/jabatan/FormJabatan'
import Users from '../../master/user/user/Users'
import KotaKab from '../../master/wilayah/kotakab/KotaKab'
import FormKotaKab from '../../master/wilayah/kotakab/FormKotaKab'
import Kecamatan from '../../master/wilayah/kecamatan/Kecamatan'
import FormKecamatan from '../../master/wilayah/kecamatan/FormKecamatan'
import Kelurahan from '../../master/wilayah/kelurahan/Kelurahan'
import FormKelurahan from '../../master/wilayah/kelurahan/FormKelurahan'
import FormUsers from '../../master/user/user/FormUsers'
import ParameterUsers from '../../master/user/user/ParameterUsers'

const Stack = createNativeStackNavigator()
export default function MainScreen() {
  return (
    <Stack.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        animation:
          route.name.startsWith('Form') ||
            route.name.includes('Parameter') && route.name !== 'Parameter'
            ? "fade_from_bottom"
            : "slide_from_right"
      })}
    >
      <Stack.Screen name="MasterIndex" component={IndexMaster} />
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
      <Stack.Screen name="FormMetode" component={FormMetode} />
      <Stack.Screen name="FormPeraturan" component={FormPeraturan} />
      <Stack.Screen name="FormParameter" component={FormParameter} />
      <Stack.Screen name="FormPengawetan" component={FormPengawetan} />
      <Stack.Screen name="FormJenisSampel" component={FormJenisSampel} />
      <Stack.Screen name="FormJenisWadah" component={FormJenisWadah} />
      <Stack.Screen name="FormJasaPengambilan" component={FormJasaPegambilan} />
      <Stack.Screen name="FormRadiusPengambilan" component={FormRadiusPengambilan} />
      <Stack.Screen name="FormLiburCuti" component={FormLiburCuti} />
      <Stack.Screen name="FormKodeRetribusi" component={FormKodeRetribusi} />
      <Stack.Screen name="FormPaket" component={FormPaket} />
      <Stack.Screen name="ParameterPaket" component={ParameterPaket} />
      <Stack.Screen name="ParameterPeraturan" component={ParameterPeraturan} />
      <Stack.Screen name="Jabatan" component={Jabatan} />
      <Stack.Screen name="Users" component={Users} />
      <Stack.Screen name="FormJabatan" component={FormJabatan} />
      <Stack.Screen name="FormUsers" component={FormUsers} />
      <Stack.Screen name="ParameterUsers" component={ParameterUsers} />
      <Stack.Screen name="KotaKab" component={KotaKab} />
      <Stack.Screen name="Kecamatan" component={Kecamatan} />
      <Stack.Screen name="Kelurahan" component={Kelurahan} />
      <Stack.Screen name="FormKelurahan" component={FormKelurahan} />
      <Stack.Screen name="FormKecamatan" component={FormKecamatan} />
      <Stack.Screen name="FormKotaKab" component={FormKotaKab} />
    </Stack.Navigator>
  )
}