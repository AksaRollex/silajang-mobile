import React from 'react';
import { ScrollView, TouchableOpacity, Text, View } from 'react-native';

const HorizontalFilterMenu = ({ items, selected, onPress }) => {
  return (
    <View style={{ flex: 1, maxHeight: 50 }}>
      <ScrollView 
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
        }}
        style={{
          flexGrow: 0,
        }}
      >
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => onPress(item)}
            style={{
              backgroundColor: selected === item.id ? '#312e81' : 'white',
              paddingHorizontal: 18,
              paddingVertical: 5,
              borderRadius: 20,
              marginRight: 10,
            }}
          >
            <Text
              style={{
                color: selected === item.id ? 'white' : '#312e81',
                fontSize: 12,
                fontFamily: 'Poppins-SemiBold',
              }}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default HorizontalFilterMenu;