import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/AntDesign";
import RNPickerSelect from "react-native-picker-select";

const Select2 = ({ onChangeValue, items, value, placeholder }) => {
  return (
    <View style={styles.container}>
      <View className=" bg-[#fff] rounded-sm border-stone-300 border font-sans">
        <RNPickerSelect
          onValueChange={onChangeValue}
          items={items}
          value={value}
          placeholder={
            placeholder || { label: "Select an item...", value: null }
          }
          placeholderTextColor="black"
          useNativeAndroidPickerStyle={false}
          Icon={() => (
            <Icon name="down" style={styles.icon} size={16} color={"black"} />
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  icon: {
    position: "absolute",
    right: 12,
    top: 15,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 0.5,
    borderRadius: 8,
    color: "black",
    paddingRight: 30,
    backgroundColor: "#fff",
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 1,
    color: "black",
    paddingRight: 30,
    backgroundColor: "#fff",
  },
});

export default Select2;
