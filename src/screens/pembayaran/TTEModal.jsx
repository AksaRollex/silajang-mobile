import React, { useState, useEffect } from 'react';
import { 
    Text, 
    View, 
    Modal, 
    TouchableOpacity, 
    TextInput 
} from "react-native";
import { MenuView } from "@react-native-menu/menu";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import AntDesign from "react-native-vector-icons/AntDesign";
import axios from '@/src/libs/axios';
import Toast from 'react-native-toast-message';

const TTEModal = ({ visible, onClose, onSubmit,}) => {
    const [formData, setFormData] = useState({
        tanda_tangan_id: '',
        passphrase: '',
    });
    const [ttds, setTtds] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const fetchTTDs = async () => {
            if (!visible) return;
            
            setIsLoading(true);
            try {
                const response = await axios.get('/konfigurasi/tanda-tangan'); 
                if (response.data?.data) {
                    setTtds(response.data.data.map(ttd => ({
                        id: ttd.id,
                        text: `${ttd.bagian} - ${ttd.user?.nama} (${ttd.user?.nik})`
                    })));
                }
            } catch (error) {
                console.error('Error fetching TTDs:', error);
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: error.response?.data?.message || 'Failed to fetch TTD options',
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchTTDs();
    }, [visible]);

    const handleSubmit = async () => {
        if (!formData.tanda_tangan_id || !formData.passphrase) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Mohon lengkapi semua field yang diperlukan',
            });
            return;
        }

        onSubmit(formData);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-center items-center bg-black/50">
                <View className="bg-white rounded-lg w-[90%] p-4">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg font-poppins-semibold text-black">Ajukan TTE</Text>
                        <TouchableOpacity onPress={onClose}>
                            <AntDesign name="close" size={24} color="black" />
                        </TouchableOpacity>
                    </View>

                    <View className="mb-4">
                        <Text className="text-sm font-poppins-bold mb-2 text-black">Tanda Tangan<Text className="text-red-500">*</Text></Text>
                        {isLoading ? (
                            <View className="border border-gray-300 rounded-md p-3">
                                <Text className="font-poppins-semibold text-black">Loading TTD options...</Text>
                            </View>
                        ) : (
                            <MenuView
                                title="Pilih TTD"
                                actions={ttds.map(ttd => ({
                                    id: ttd.id.toString(),
                                    title: ttd.text,
                                }))}
                                onPressAction={({ nativeEvent }) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        tanda_tangan_id: nativeEvent.event
                                    }));
                                }}
                                shouldOpenOnLongPress={false}
                            >
                                <View className="border border-gray-300 rounded-md p-3">
                                    <View className="flex-row justify-between items-center">
                                        <Text className="font-poppins-semibold">
                                            {ttds.find(t => t.id.toString() === formData.tanda_tangan_id)?.text || 'Pilih TTD'}
                                        </Text>
                                        <MaterialIcons name="arrow-drop-down" size={24} color="black" />
                                    </View>
                                </View>
                            </MenuView>
                        )}
                    </View>

                    <View className="mb-4">
                        <Text className="text-sm text-black font-poppins-bold mb-2">
                        Passphrase<Text className="text-red-500">*</Text>
                        </Text>
                        <View className="relative">
                        <TextInput
                            className="border border-gray-300 rounded-md p-3 font-poppins-medium w-full pr-12"
                            secureTextEntry={!showPassword}
                            value={formData.passphrase}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, passphrase: text }))}
                            placeholder="Masukkan passphrase"
                        />
                        <TouchableOpacity 
                            onPress={togglePasswordVisibility}
                            className="absolute right-4 top-4"
                        >
                            {showPassword ? (
                            <Ionicons name="eye-outline" size={20} color="grey" />
                            ) : (
                            <Ionicons name="eye-off-outline" size={20} color="grey"/>
                            )}
                        </TouchableOpacity>
                        </View>
                    </View>

                    <View className="flex-row justify-end space-x-2">
                        <TouchableOpacity 
                            onPress={handleSubmit}
                            className="bg-indigo-600 px-4 py-2 rounded-md flex-row items-center"
                        >
                            <Ionicons name="document-text-outline" size={20} color="white" className="mr-2" />
                            <Text className="text-white font-poppins-semibold ml-2">Kirim</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
  
export default TTEModal;