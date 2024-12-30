import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, Platform, Dimensions, Animated } from 'react-native';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import IonIcons from "react-native-vector-icons/Ionicons";

const MoreDataModal = ({ visible, onClose, data, navigation, userRole }) => {
  const isAdminOrKepala = ['admin', 'kepala-upt'].includes(userRole);
  const [modalVisible, setModalVisible] = useState(visible);
//   const startIndex = isAdminOrKepala ? 3 : 4;
  
//   const filteredData = data.filter((item, index) => 
//     index >= startIndex && item.permission.includes(userRole)
//   );

  const screenWidth = Dimensions.get('window').width;
  const cardWidth = screenWidth < 768 ? (screenWidth - 60) / 2 : (screenWidth - 80) / 3;
  
  // Animation setup
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateClose = () => {
    // Animate sliding down
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start(() => {
      setModalVisible(false);
      onClose();
    });
  };

  const handleClose = () => {
    animateClose();
  };

  const handleItemPress = (item) => {
    animateClose();
    // Delay navigation until animation completes
    setTimeout(() => {
      navigation.navigate(item.navigation, { 
        screen: item.screen, 
        params: item.params 
      });
    }, 300);
  };

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7
      }).start();
    }
  }, [visible]);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={handleClose}
    >
      <TouchableOpacity 
        activeOpacity={1} 
        onPress={handleClose}
        style={{ 
          flex: 1, 
          backgroundColor: 'rgba(0, 0, 0, 0.5)', 
          justifyContent: 'flex-end'
        }}
      >
        <Animated.View 
          style={{
            width: '100%',
            maxHeight: '80%',
            backgroundColor: 'white',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
            transform: [{
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [800, 0]  // Increased slide distance for smoother animation
              })
            }]
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
            <Text style={{ fontSize: 20, fontFamily: 'Poppins-SemiBold', color: '#000' }}>
              Semua Data
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <MaterialCommunityIcons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: '#e5e7eb', marginBottom: 15 }} />

          {/* Content */}
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ 
              flexDirection: 'row', 
              flexWrap: 'wrap', 
              justifyContent: 'space-between',
              paddingBottom: 30
            }}>
              {data.filter(i => i.permission.includes(userRole)).map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    width: cardWidth,
                    backgroundColor: 'white',
                    borderRadius: 15,
                    padding: 15,
                    marginBottom: 15,
                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                    elevation: 3,
                  }}
                  onPress={() => handleItemPress(item)}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <View style={{ 
                      padding: 12,
                      borderRadius: 50,
                      backgroundColor: `${item.color}20`,
                    }}>
                      <IonIcons name={item.icon} size={24} color={item.color} />
                    </View>
                    <Text style={{ 
                      fontSize: 18,
                      fontFamily: 'Poppins-SemiBold',
                      color: item.color
                    }}>
                      {item.data}
                    </Text>
                  </View>
                  <Text style={{ 
                    fontSize: 14,
                    fontFamily: 'Poppins-Medium',
                    color: '#374151',
                    marginTop: 4
                  }}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

export default MoreDataModal;