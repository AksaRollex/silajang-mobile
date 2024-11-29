import React from "react";
import "./theme";

import Toast from "react-native-toast-message";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUser } from "./src/services";
import { NativeBaseProvider, extendTheme } from "native-base";

// Import your screens
import Main from "./src/screens/main/Index";
import Auth from "./src/screens/auth/Index";

const Stack = createNativeStackNavigator();

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

const theme = extendTheme({
  fontConfig: {
    Poppins: {
      100: {
        normal: "Poppins-Light",
    },
      200: {
        normal: "Poppins-Light",
      },
      300: {
        normal: "Poppins-Light",
      },
      400: {
        normal: "Poppins-Regular",
      },
      500: {
        normal: "Poppins-Medium",
      },
      600: {
        normal: "Poppins-SemiBold",
      },
      700: {
        normal: "Poppins-Bold",
      },
  }
},
fonts:{
  heading: "Poppins",
  body: "Poppins",
  mono: "Poppins",
}
})

function Navigation(): React.JSX.Element {
  const { data: user, isSuccess } = useUser();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user && isSuccess ? (
          <>
            <Stack.Screen name="main" component={Main} />
          </>
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
      <NativeBaseProvider theme={theme}>
        <Navigation />
        <Toast />
      </NativeBaseProvider>
    </QueryClientProvider>
  );
}

export default App;
