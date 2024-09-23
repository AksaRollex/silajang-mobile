import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'

const Index = () => {
    const navigation = useNavigation()
    return (
      <View>
        <TouchableOpacity onPress={() => navigation.navigate('Master')}>
          <Text>Tets</Text>
        </TouchableOpacity>
      </View>
    )
  }

export default Index