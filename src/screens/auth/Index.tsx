import { memo } from "react";
import { SafeAreaView } from "react-native";

import { View, Text, Button, Colors, Card } from "react-native-ui-lib";

export default memo(function Index() {
  return (
    <SafeAreaView>
      <View paddingH-20 paddingV-10>
        <Text color={Colors.brand} h2>
          Auth aiueo
        </Text>
        <Button label="Buttonaa" backgroundColor={Colors.brand}></Button>
      </View>
    </SafeAreaView>
  );
});
