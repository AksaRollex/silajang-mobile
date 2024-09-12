import { List } from "react-native-paper";
import { View } from "react-native-ui-lib";

const AccordionItem = ({ title, right, left, style, onPress }) => {
    return (
        <View>
            <List.Item
                title={title}
                right={right}
                left={left}
                onPress={onPress}
                style={style}
            />
        </View>
    );
};

export default AccordionItem