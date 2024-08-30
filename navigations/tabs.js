import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import Dashboard from '../src/screens/main/Dashboard';
import Pengujian from '../src/screens/pengujian/Pengujian';
import Pembayaran from '../src/screens/pembayaran/Pembayaran';
import Profile from '../src/screens/main/Profile';

const Tab = createBottomTabNavigator();

const Tabs = () => {
    return (
        <Tab.Navigator>
            <Tab.Screen name='Dashboard'>{Dashboard}</Tab.Screen>
            <Tab.Screen name='Pengujian'>{Pengujian}</Tab.Screen>
            <Tab.Screen name='Pembayaran'>{Pembayaran}</Tab.Screen>
            <Tab.Screen name='Profile'>{{Profile}}</Tab.Screen>
        </Tab.Navigator>
    )
}

export default Tabs;