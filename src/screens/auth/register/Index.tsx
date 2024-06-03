import React, { memo } from "react";
import { SafeAreaView } from "react-native";
import { Image } from "react-native-ui-lib";

export default memo(function Login(): React.JSX.Element {
  return (
    <SafeAreaView>
      <Image source={require("@/assets/images/laboratory.svg")} />
    </SafeAreaView>
  );
});
