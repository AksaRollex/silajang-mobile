import { memo } from "react";
import { SafeAreaView } from "react-native";

import { View, Text } from "react-native-ui-lib";

export default memo(function Index() {
  return (
    <SafeAreaView>
      <View>
        <Text>Main</Text>
      </View>
    </SafeAreaView>
  );
});
