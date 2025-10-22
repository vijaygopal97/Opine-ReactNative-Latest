import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import screens
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import InterviewerDashboard from './src/screens/InterviewerDashboard';
import AvailableSurveys from './src/screens/AvailableSurveys';
import MyInterviews from './src/screens/MyInterviews';
import InterviewInterface from './src/screens/InterviewInterface';
import InterviewDetails from './src/screens/InterviewDetails';

// Import theme
import { theme } from './src/theme/theme';

// Import API service
import { apiService } from './src/services/api';

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        
        // Verify token is still valid
        try {
          const response = await apiService.verifyToken();
          if (response.success) {
            setUser(parsedUser);
            setIsAuthenticated(true);
          } else {
            // Token invalid, clear storage
            await AsyncStorage.multiRemove(['authToken', 'userData']);
          }
        } catch (error) {
          // Token verification failed, clear storage
          await AsyncStorage.multiRemove(['authToken', 'userData']);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (userData: any, token: string) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['authToken', 'userData']);
    setUser(null);
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#ffffff' }
          }}
        >
          {!isAuthenticated ? (
            <>
              <Stack.Screen name="Login">
                {(props) => (
                  <LoginScreen
                    {...props}
                    onLogin={handleLogin}
                  />
                )}
              </Stack.Screen>
            </>
          ) : (
            <>
              <Stack.Screen name="Dashboard">
                {(props) => (
                  <InterviewerDashboard
                    {...props}
                    user={user}
                    onLogout={handleLogout}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen 
                name="AvailableSurveys" 
                component={AvailableSurveys}
                options={{
                  headerShown: true,
                  title: 'Available Surveys',
                  headerStyle: {
                    backgroundColor: theme.colors.primary,
                  },
                  headerTintColor: '#ffffff',
                  headerTitleStyle: {
                    fontWeight: 'bold',
                  },
                }}
              />
              <Stack.Screen 
                name="MyInterviews" 
                component={MyInterviews}
                options={{
                  headerShown: true,
                  title: 'My Interviews',
                  headerStyle: {
                    backgroundColor: theme.colors.primary,
                  },
                  headerTintColor: '#ffffff',
                  headerTitleStyle: {
                    fontWeight: 'bold',
                  },
                }}
              />
              <Stack.Screen 
                name="InterviewInterface" 
                component={InterviewInterface}
                options={{
                  headerShown: true,
                  title: 'Interview',
                  headerStyle: {
                    backgroundColor: theme.colors.primary,
                  },
                  headerTintColor: '#ffffff',
                  headerTitleStyle: {
                    fontWeight: 'bold',
                  },
                }}
              />
              <Stack.Screen 
                name="InterviewDetails" 
                component={InterviewDetails}
                options={{
                  headerShown: false,
                }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}