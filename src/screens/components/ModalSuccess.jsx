import { Text, View, Modal } from 'react-native';
import React, { useEffect } from 'react';
import LottieView from 'lottie-react-native';

export default function ModalSuccess({
  url,
  modalVisible,
  title,
  subTitle,
  onClose,
  duration = 2000, // Default 2 seconds
}) {
  useEffect(() => {
    if (modalVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [modalVisible, onClose, duration]);

  return (
    <Modal 
      animationType="fade" 
      transparent={true} 
      visible={modalVisible}
    >
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="bg-white rounded-2xl p-5 w-10/12 max-w-md shadow-lg">
          <View className="items-center">
            <LottieView
              source={url}
              autoPlay
              loop={false}
              style={{ width: 100, height: 100 }}
            />
            
            {title && (
              <Text className="text-lg text-black text-center my-2 font-poppins-medium">
                {title}
              </Text>
            )}
            <Text className="text-md text-gray-600 text-center my-2 font-poppins-regular bottom-1">
              {subTitle}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}