import { View } from 'react-native'
import { Button } from 'react-native-ui-lib'
import React from 'react'
import IonIcons from 'react-native-vector-icons/Ionicons'

const 
BackButton = ({ action, style, size }) => {
  return (
    <View style={style}>
        <IonIcons name="arrow-back-outline" size={size} color="black" onPress={action} />
    </View>
  )
}

export default BackButton