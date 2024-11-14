import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/AntDesign";
import SelectDropdown from "react-native-select-dropdown";

const Select2 = ({ onSelect, data, value, placeholder, defaultValue }) => {
  const [selectedValue, setSelectedValue] = useState(null);

  // Effect untuk menangani defaultValue
  useEffect(() => {
    if (defaultValue && data.length > 0) {
      const defaultItem = data.find(item => item.value === defaultValue);
      if (defaultItem) {
        setSelectedValue(defaultItem);
      }
    }
  }, [defaultValue, data]);

  return (
    <View className="rounded-sm font-poppins-regular">
      <SelectDropdown
        buttonStyle={{ padding: 12 }}
        data={data}
        onSelect={selectedItem => {
          setSelectedValue(selectedItem);
          if (onSelect) {
            onSelect(selectedItem.value);
          }
        }}
        defaultValue={selectedValue}
        renderButton={(selectedItem, isOpened) => {
          return (
            <View style={styles.dropdownButtonStyle}>
              {selectedItem && (
                <Icon
                  name={selectedItem.icon}
                  style={styles.dropdownButtonIconStyle}
                />
              )}
              <Text
                style={[
                  styles.dropdownButtonTxtStyle,
                  { color: selectedItem ? "black" : "grey" }, // Warna teks dinamis
                ]}>
                {(selectedItem && selectedItem.title) ||
                  placeholder ||
                  "Select Option"}
              </Text>
              <Icon
                name={isOpened ? "up" : "down"}
                style={styles.dropdownButtonArrowStyle}
              />
            </View>
          );
        }}
        renderItem={(item, index, isSelected) => {
          return (
            <View
              style={[
                styles.dropdownItemStyle,
                isSelected && { backgroundColor: "#D2D9DF" },
              ]}>
              <Icon name={item.icon} style={styles.dropdownItemIconStyle} />
              <Text style={styles.dropdownItemTxtStyle}>{item.title}</Text>
            </View>
          );
        }}
        search
        searchPlaceHolder={`Search ${placeholder}`}
        searchInputStyle={styles.searchInput}
        searchPlaceHolderColor="grey"
        renderSearchInputLeftIcon={() => {
          return <Icon name={"search1"} color={"grey"} size={18} />;
        }}
        rowTextForSelection={item => item.title}
        buttonTextAfterSelection={item => item.title}
        showsVerticalScrollIndicator={false}
        dropdownStyle={styles.dropdownMenuStyle}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownButtonStyle: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius : 16,
    borderWidth: 1, // Tambahkan border jika diinginkan
    borderColor: "#D6D3D1", // Warna border
    backgroundColor: "#FFFFFF",
  },
  dropdownButtonIconStyle: {
    fontSize: 18,
    marginRight: 8,
    color: "black",
  },
  dropdownButtonTxtStyle: {
    flex: 1,
    fontSize: 16,
    color: "black", // Warna teks hitam
    fontFamily: "Poppins-Regular",
  },
  dropdownButtonArrowStyle: {
    fontSize: 18,
    color: "black",
  },
  dropdownMenuStyle: {
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dropdownItemStyle: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dropdownItemIconStyle: {
    fontSize: 18,
    marginRight: 8,
    color: "black", // Warna teks hitam
  },
  dropdownItemTxtStyle: {
    fontSize: 17,
    color: "black", // Warna teks hitam
    fontFamily: "Poppins-Regular",
  },
  searchInput: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    color: "black", // Warna teks hitam pada input pencarian
  },
});

export default Select2;
