import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useNavigation } from "@react-navigation/native";
import BackButton from '../../components/BackButton';
import { useHeaderStore } from '@/src/screens/main/Index'


const Denda = ({ navigation }) => {
    const { setHeader } = useHeaderStore();
              
        React.useLayoutEffect(() => {
          setHeader(false)
        
          return () => setHeader(true)
        }, [])

    return (
        <View className="flex-row items-center justify-center mt-4">
            <View className="absolute left-4">
            <BackButton action={() => navigation.goBack()} size={26} />
            </View>
            <Text className="text-[20px] font-poppins-semibold text-black">Denda</Text>
        </View>
    )
}

export default Denda

const styles = StyleSheet.create({})