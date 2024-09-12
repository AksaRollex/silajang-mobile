import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'

const JasaPengambilan = () => {
  const navigation = useNavigation()
  return (
    <TouchableOpacity onPress={() => navigation.navigate('MasterIndex')}>
    <Text>Jasa Pen</Text>
</TouchableOpacity>  )
}

export default JasaPengambilan