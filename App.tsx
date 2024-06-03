import React from "react";

import Toast from "react-native-toast-message";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
const Stack = createNativeStackNavigator();

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUser } from "./src/services";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnReconnect: true,
      retry: false,
      networkMode: "always",
    },
    mutations: {
      retry: false,
      networkMode: "always",
    },
  },
});

import { Colors, Typography, ThemeManager } from "react-native-ui-lib";
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

ThemeManager.setComponentTheme("Button", {
  labelStyle: {
    fontFamily: "Poppins-Regular",
  },
});

import Main from "./src/screens/main/Index";
import Auth from "./src/screens/auth/Index";

function Navigation(): React.JSX.Element {
  const { data: user, isSuccess } = useUser();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user && isSuccess ? (
          <Stack.Screen name="main" component={Main} />
        ) : (
          <Stack.Screen name="auth" component={Auth} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function App(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <Navigation />
      <Toast />
    </QueryClientProvider>
  );
}

export default App;
