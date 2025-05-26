import React from 'react';
import type {PropsWithChildren} from 'react';

import {
  StyleSheet,
  useColorScheme,
} from 'react-native';

import {
  Colors
} from 'react-native/Libraries/NewAppScreen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';
enableScreens();
import InicioScreen from './app/screens/InicioScreen';
import EstadisticasScreen from './app/screens/EstadisticasScreen';
type SectionProps = PropsWithChildren<{
  title: string;
}>;

export type RootStackParamList = {
  Cargar: undefined;
  Inicio: undefined;
  Estadisticas: {
    estadisticas: any; // Puedes reemplazar 'any' por un tipo más específico si lo tienes
  };
};


const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Inicio" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Inicio" component={InicioScreen} />
        <Stack.Screen name="Estadisticas" component={EstadisticasScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',  // Esto distribuye el espacio entre los elementos
    paddingTop: 60,  // Para separar el texto de la parte superior
    paddingBottom: 100,  // Espacio para los botones, los separa un poco del fondo
  },
  
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 20,  // Espacio entre los botones
  },
  
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
  },
});

export default App;
