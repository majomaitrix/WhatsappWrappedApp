import React, { useState,useEffect  } from 'react';
import {
  SafeAreaView,
  StatusBar,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  PermissionsAndroid, 
  Platform
} from 'react-native';
import { pick } from '@react-native-documents/picker';
import { RootStackParamList } from '../../App';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import RNFS, { stat } from 'react-native-fs';
import LinearGradient from 'react-native-linear-gradient';
import { unzip } from 'react-native-zip-archive';
import RNBlobUtil from 'react-native-blob-util';
import { analyzeMessages } from '../utils/analyzeMessages';

type Props = NativeStackScreenProps<RootStackParamList, 'Inicio'>;


export default function InicioScreen({ navigation }: Props) {
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const requestStoragePermission = async () => {
            if (Number(Platform.Version) >= 33) {

                const permissions = [
                  PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
                  PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
                  PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
                ];
        
                const granted = await PermissionsAndroid.requestMultiple(permissions);
        
                const allGranted = Object.values(granted).every(
                  (status) => status === PermissionsAndroid.RESULTS.GRANTED
                );
        
                if (!allGranted) {
                  Alert.alert('Permiso denegado', 'No podrás seleccionar archivos .zip');
                  return false;
                }
        
              } else {
                const granted = await PermissionsAndroid.request(
                  PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
                );
        
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                  Alert.alert('Permiso denegado', 'No podrás seleccionar archivos .zip');
                  return false;
                }
              }
        };
    
        requestStoragePermission();
      }, []);


    const handleImport = async (types: string[]) => {
        try {
          setLoading(true);
          const [file] = await pick({
            type: types,
          });
          if (file && file.name && file.uri) {
            const fileName = file.name.toLowerCase();
            if (fileName.endsWith('.txt')) {
      
              try {
                const content = await RNFS.readFile(file.uri, 'utf8');
                // Analizamos el contenido del archivo
                const estadisticas = analyzeMessages(content);
                setLoading(false); // Oculta el spinner
                navigation.navigate('Estadisticas', { estadisticas });
              } catch (readError: any) {
                if (readError instanceof Error) {
                  Alert.alert('Error al leer el archivo', readError.message);
                } else {
                  Alert.alert('Error desconocido', 'Ha ocurrido un error desconocido al leer el archivo.');
                }
              }
            } else if(fileName.endsWith('.zip')){

                const uri = file.uri;
                const fileName = file.name || 'archivo.zip';

                //  Copiar el ZIP a una ruta segura
                const destPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
                await RNBlobUtil.fs.cp(uri, destPath);


                //  Crear ruta para descomprimir
                const unzipPath = `${RNFS.DocumentDirectoryPath}/unzipped`;
                await RNFS.mkdir(unzipPath);

                //  Descomprimir
                const extractedPath = await unzip(destPath, unzipPath);

                // 6. Buscar el .txt dentro del ZIP
                const files = await RNFS.readDir(extractedPath);
                const txtFile = files.find((f) => f.name.endsWith('.txt'));

                if (!txtFile) {
                Alert.alert('Error', 'No se encontró ningún archivo .txt en el ZIP');
                return;
                }

                // Leer contenido del .txt
                const content = await RNFS.readFile(txtFile.path, 'utf8');

                const estadisticas = analyzeMessages(content);
                setLoading(false); // Oculta el spinner
                navigation.navigate('Estadisticas', { estadisticas });
                
            }else{
              Alert.alert('Archivo no válido', 'Por favor selecciona un archivo .txt');  
            }
          }
        } catch (err) {
          console.warn('Error al seleccionar archivo:', err);
        }
      };    
    

    if (loading) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={{ marginTop: 10 }}>Procesando archivo...</Text>
          </View>
        );
      }

    return (
        <LinearGradient
        colors={['#075E54', '#25D366']}  // Colores estilo WhatsApp
        style={styles.gradient}
        >
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                <Image source={require('../utils/images/WhatsLogo.png')} style={styles.logo} resizeMode="contain" />
            
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={() => handleImport(['text/plain'])}>
                    <Text style={styles.buttonText}>Importar .txt</Text>
                    </TouchableOpacity>
            
                    <TouchableOpacity style={styles.button} onPress={() => handleImport(['application/zip'])}>
                    <Text style={styles.buttonText2}>Importar .zip</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </LinearGradient>
        
      );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
      },
    container: {
      flex: 1,
      justifyContent: 'space-between',
      paddingTop: 60,
      paddingBottom: 100,
    },
    logo: {
        width: 280,
        height: 280,
        alignSelf: 'center',
        marginBottom: 40,
      },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#EDEDED', // blanco suave
        textShadowColor: '#000',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 6,
        marginBottom: 40,
    },
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
        gap: 20,
    },
    button: {
        backgroundColor: '#075E54', // Verde oscuro de WhatsApp
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6, // Android shadow
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 18,
        fontFamily: 'Poppins-Italic'
    },
    buttonText2: {
        color: '#ffffff',
        fontSize: 18,
        fontFamily: 'Poppins-Italic'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
  });