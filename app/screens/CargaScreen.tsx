// screens/CargaScreen.tsx
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Cargar'>;


export default function CargarScreen({ navigation }: Props) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Carga tu archivo de WhatsApp</Text>
        <Button title="Seleccionar archivo" onPress={() => navigation.navigate('Inicio')} />
      </View>
    );
  }



  const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    text: { fontSize: 20, marginBottom: 20 },
  });