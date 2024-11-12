import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import User from './User'
import Jabatan from './jabatan/Jabatan'
import FormJabatan from './jabatan/FormJabatan'
import Users from './user/Users'
import IndexMaster from '../../masterdash/IndexMaster'

const Stack = createNativeStackNavigator()

export default function MainScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="IndexUser" component={User} />
      <Stack.Screen name="IndexMaster" component={IndexMaster} />
      <Stack.Screen name="Jabatan" component={Jabatan} />
      <Stack.Screen name="Users" component={Users}/>
      <Stack.Screen name="FormJabatan" component={FormJabatan} />
      <Stack.Screen name="FormUsers" component={FormUsers} />
      {/* <Stack.Screen name="IndexMaster" component={IndexMaster} /> */}
    </Stack.Navigator>
  )
}