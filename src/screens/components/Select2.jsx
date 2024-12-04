import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import Icon from 'react-native-vector-icons/AntDesign';

const Select2 = ({ onChangeValue, items, value, placeholder }) => {
  return (
    <View style={styles.container}>
      <RNPickerSelect
        onValueChange={onChangeValue}
        items={items}
        value={value}
        placeholder={placeholder || { label: 'Select an item...', value: null }}
        style={pickerSelectStyles}
        useNativeAndroidPickerStyle={false}
        Icon={() => <Icon name="down" size={16}  style={styles.icon} />}
      />
    </View>
  );
  
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 1,
  },
  icon: {
    position: 'absolute',
    right: 12,
    top: 15,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
    backgroundColor: '#fff',
  },
  inputAndroid: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
    backgroundColor: '#fff',
  },
});


export default Select2;