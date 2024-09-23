// Navigation.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUser } from "./src/services";
import Toast from "react-native-toast-message";

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

function Navigation(): React.JSX.Element {
  const { data: user, isSuccess } = useUser();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user && isSuccess ? (
          <>
            <Stack.Screen name="Main" component={Main} />
          </>
        ) : (
          <>
            <Stack.Screen name="Auth" component={Auth} />
          </>
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
