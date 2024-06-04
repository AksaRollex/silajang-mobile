import { Colors, Typography, ThemeManager, Assets } from "react-native-ui-lib";

Colors.loadColors({
  brand: "#252a61",
});

Typography.loadTypographies({
  h1: {
    fontSize: 32,
    fontFamiliy: "Poppins-Bold",
    fontWeight: "bold",
  },
  h2: {
    fontSize: 28,
    fontFamiliy: "Poppins-SemiBold",
    fontWeight: "bold",
  },
  h3: {
    fontSize: 24,
    fontFamiliy: "Poppins-SemiBold",
    fontWeight: "bold",
  },
  h4: {
    fontSize: 20,
    fontFamiliy: "Poppins-SemiBold",
    fontWeight: "bold",
  },
  h5: {
    fontSize: 16,
    fontFamiliy: "Poppins-SemiBold",
    fontWeight: "bold",
  },
  h6: {
    fontSize: 14,
    fontFamiliy: "Poppins-SemiBold",
    fontWeight: "bold",
  },
  body: {
    fontSize: 12,
    fontFamiliy: "Poppins-Regular",
  },
});

ThemeManager.setComponentTheme("Text", {
  style: {
    fontFamily: "Poppins-Regular",
  },
});
ThemeManager.setComponentTheme("TextField", {
  style: {
    fontFamily: "Poppins-Regular",
  },
});

ThemeManager.setComponentTheme("Button", {
  labelStyle: {
    fontFamily: "Poppins-Regular",
  },
});

Assets.loadAssetsGroup("icons", {
  chevronLeft: require("@/assets/icons/chevron-left.png"),
  chevronRight: require("@/assets/icons/chevron-right.png"),
});
