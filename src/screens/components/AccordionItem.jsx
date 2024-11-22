import { List } from "react-native-paper";
import { View, Text } from "react-native";
const AccordionItem = ({ title, right, left, style, onPress }) => {
    return (
        <View>
            <List.Item
                title={<Text className="font-poppins-medium">{title}</Text>}
                right={right}
                left={left}
                onPress={onPress}
                style={style}
            />
        </View>
    );
};

export default AccordionItem