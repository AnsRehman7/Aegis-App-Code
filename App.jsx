import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Splash from './src/screens/Splash';
import Home from './src/screens/Home';
import Login from './src/screens/Login';
import SignUp from './src/screens/SignUp';
import ForgetPassword from './src/screens/ForgetPassword';
import ChangePassword from './src/screens/ChangePassword';
import PasswordSplash from './src/screens/PasswordSplash';
import ConnectApp from './src/screens/ConnectApp';
import CustomDrawer from './src/screens/CustomDrawer';
import Information from './src/Activities/Information';
import ChildLocation from './src/Activities/ChildLocation';
import ScreenTime from './src/Activities/ScreenTime';
import LockScreen from './src/screens/LockScreen';
import ContentFilteringScreen from './src/Activities/ContentFilteringScreen';
import 'react-native-reanimated';
import { FirebaseProvider } from './src/context/Firebase';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

 

// Stack Navigator - Starts from Splash
const StackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Splash" component={Splash} options={{ headerShown: false }} />
      <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      <Stack.Screen name="Signup" component={SignUp} options={{ headerShown: false }} />
      <Stack.Screen name="ForgetPassword" component={ForgetPassword} options={{ headerShown: false }} />
      <Stack.Screen name="ChangePassword" component={ChangePassword} options={{ headerShown: false }} />
      <Stack.Screen name="PasswordSplash" component={PasswordSplash} options={{ headerShown: false }} />
      <Stack.Screen name="ConnectApp" component={ConnectApp} options={{ headerShown: false }} />
      <Stack.Screen name="LockScreen" component={LockScreen} options={{ headerShown: false }} />
      {/* Drawer Navigator */}
      <Stack.Screen name="DrawerNavigator" component={DrawerNavigator} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

// Drawer Navigator 

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        drawerActiveTintColor: '#2E7D32', 
        drawerInactiveTintColor: '#333', 
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '500',
        },
        drawerStyle: {
          width: '75%',
          backgroundColor: '#FFFFFF', 
        },
        drawerItemStyle: {
          marginVertical: 4,
        },
        drawerActiveBackgroundColor: '#E8F5E9', 
      }}
    >
      <Drawer.Screen 
        name="Information" 
        component={Information}
        options={{
         
        }}
      />
      <Drawer.Screen 
        name="ChildLocation" 
        component={ChildLocation}
        options={{
          
        }}
      />
      <Drawer.Screen 
        name="ScreenTime" 
        component={ScreenTime}
        options={{
          
        }}
      />
       <Drawer.Screen 
        name="ContentFilteringScreen"
        component={ContentFilteringScreen} 
        options={{
          
        }}
      />
    </Drawer.Navigator>
  );
};
// Main App - Starts from StackNavigator (Splash First)
const App = () => {
  return (
   
    <FirebaseProvider>
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
    </FirebaseProvider>
  );
};

export default App;
