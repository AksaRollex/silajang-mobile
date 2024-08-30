import React from "react";
import "./theme";

import Toast from "react-native-toast-message";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUser } from "./src/services";

// Import your screens
import Main from "./src/screens/main/Index";
import Auth from "./src/screens/auth/Index";
import TrackingPengujian from "./src/screens/pengujian/TrackingPengujian";
import TrackingList from "./src/screens/pengujian/TrackingList";

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
            <Stack.Screen name="main" component={Main} />
            <Stack.Screen name="TrackingPengujian" component={TrackingPengujian} />
            <Stack.Screen name="TrackingList" component={TrackingList} />
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
      <Navigation />
      <Toast />
    </QueryClientProvider>
  );
}

export default App;
