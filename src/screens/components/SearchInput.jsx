import { View } from "react-native-ui-lib";
import BackButton from "./BackButton";
import { Searchbar } from "react-native-paper";

const SearchInput = ({ style, placeholder, onChangeText, value, action, size }) => {
    return (
        <View className="flex-row w-full items-center space-x-2">
            <BackButton action={action} size={size} />
            <Searchbar
                style={style}
                placeholder={placeholder}
                onChangeText={onChangeText}
                value={value}
            />
        </View>
    )
}

export default SearchInput