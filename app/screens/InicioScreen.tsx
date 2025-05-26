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
    
    // Función para analizar el contenido del archivo
    const analyzeMessages = (content: string) => {
        let participant1: string = '';
        let participant2: string = '';
        let participant1MessageCount: number = 0;
        let participant2MessageCount: number = 0;
        let participant1LinksCount: number = 0;
        let participant2LinksCount: number = 0;
        const monthNames = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
        ];
        const dayOfWeekMap = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const dayOfWeekCounts: { [key: number]: number } = {};
        let mostActiveDay = '';
        let dayOfWeekActive=0;
        let maxDayCount = 0;
        // Encontrar el mes con más mensajes
        let maxMonth = '';
        let maxCount = 0;
        let maxHour = -1;
        let maxCountHour = 0;
        const daySet = new Set();
        let totalMessagesavg = 0;
        // Encontrar el emoji más usado
        let mostUsedEmoji = '';
        let mostUsedEmojiCount = 0;
        
        const emojiCounts: Record<string, number> = {};
        // Dividir el contenido por saltos de línea para obtener los mensajes
        const messages = content.split('\n').filter(msg => msg.trim().length > 0).slice(1);
        // Devolver la cantidad de mensajes
        let countMessage = 0;
        const urlRegex = /\b(?:https?|www)\S+\b/;  // Regex para detectar enlaces
        const monthCounts: Record<string, number> = {};
        const hourCountMap: { [key: string]: number } = {};
        // Recorrer cada mensaje y contar los mensajes por persona
        messages.forEach(message => {
        const match = message.match(/^\d{1,2}\/\d{1,2}\/\d{4}, \d{1,2}:\d{2}\s*[ap]\.\s*m\. - (.+): /); // Buscar el nombre del participante
        const fullMatchEmoji = message.match(/^\d{1,2}\/\d{1,2}\/\d{4}, \d{1,2}:\d{2}\s*[ap]\.\s*m\. - (.+?): (.+)/);
        const dateMatch = message.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4}),/);
        const emojiRegex = /([\uD800-\uDBFF][\uDC00-\uDFFF])/g;
        
        
        if (fullMatchEmoji) {
            const messageTextEmoji = fullMatchEmoji[2];
            const emojis = messageTextEmoji.match(emojiRegex);
            if(emojis){
            for (const emoji of emojis) {
                emojiCounts[emoji] = (emojiCounts[emoji] || 0) + 1;
            }
            }        
        }
        // Hacemos otro match solo para extraer la hora y el periodo (a.m./p.m.)
        const timeMatch = message.match(/, (\d{1,2}):(\d{2})\s([ap])\.?\s*m\./);
        if (timeMatch) {
            // Extraemos la hora, minutos y AM/PM
            const hour = timeMatch[1];  // La hora extraída
            const minutes = timeMatch[2];  // Los minutos extraídos
            const ampm = timeMatch[3];  // a.m. o p.m.

            // Convertir a una hora en formato de 24 horas (para comparación)
            let hour24 = parseInt(hour);
            if (ampm === 'p' && hour24 < 12) {
            hour24 += 12;  // Convertir a 24 horas para p.m.
            }
            if (ampm === 'a' && hour24 === 12) {
            hour24 = 0;  // Convertir 12 a.m. a 0 horas
            }

            // Usamos la hora de 24 horas como clave para contar los mensajes
            if (!hourCountMap[hour24]) {
            hourCountMap[hour24] = 0;
            }
            hourCountMap[hour24]++;
        }else {
            console.log("No se encontró la hora en el mensaje:", message);
        }
        if (dateMatch) {
            const [, day, month, year] = dateMatch;
            const key = `${year}-${month.padStart(2, '0')}`; // Ej: 2025-05
            monthCounts[key] = (monthCounts[key] || 0) + 1;


            const dayAvg = `${dateMatch[3]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[1].padStart(2, '0')}`;
            daySet.add(dayAvg); // guardar días únicos
            totalMessagesavg++;


            const dayActive = parseInt(dateMatch[1]);
            const monthActive = parseInt(dateMatch[2]) - 1; // JS usa 0-11 para meses
            const yearActive = parseInt(dateMatch[3]);
            const dateActive = new Date(yearActive, monthActive, dayActive);
            dayOfWeekActive = dateActive.getDay(); // 0 (Domingo) a 6 (Sábado)
            
            dayOfWeekCounts[dayOfWeekActive] = (dayOfWeekCounts[dayOfWeekActive] || 0) + 1;

            if (dayOfWeekCounts[dayOfWeekActive] > maxDayCount) {
            maxDayCount = dayOfWeekCounts[dayOfWeekActive];
            }
        }
        if (match) {
            const name = match[1].trim();  // Extraemos el nombre y lo limpiamos de espacios extra
            const links = message.match(urlRegex);  // Buscar los links en el mensaje
            // Si aún no se ha asignado el primer participante
            if (!participant1) {
            participant1 = name;
            }
            // Si el primer participante ya está asignado, asignamos el segundo
            else if (!participant2 && name !== participant1) {
            participant2 = name;
            }

            // Incrementamos el contador correspondiente según el nombre del participante
            if (name === participant1) {
            participant1MessageCount++;
            } else if (name === participant2) {
            participant2MessageCount++;
            }

            // Si el mensaje tiene links, aumentamos el contador
            if (links) {
            if (name === participant1) {
                participant1LinksCount += links.length;
            } else if (name === participant2) {
                participant2LinksCount += links.length;
            }
            }
        }
        });

        for (const [month, count] of Object.entries(monthCounts)) {
        if (count > maxCount) {
            maxCount = count;
            maxMonth = month;
        }
        }
        // Extraer nombre del mes
        const [year, monthNumStr] = maxMonth.split('-');
        const monthIndex = parseInt(monthNumStr, 10) - 1;
        const monthName = monthNames[monthIndex];
        for (const [hour, count] of Object.entries(hourCountMap)) {
        if (count > maxCountHour) {
            maxCountHour = count;
            maxHour = parseInt(hour);
        }
        }
        for (const [emoji, count] of Object.entries(emojiCounts)) {
        if (count > mostUsedEmojiCount) {
            mostUsedEmoji = emoji;
            mostUsedEmojiCount = count;
        }
        }
        // Convertir la hora al formato de 12 horas (a.m. / p.m.)
        const formattedMaxHour = maxHour > 12 ? `${maxHour - 12} p.m.` : `${maxHour === 0 ? 12 : maxHour} a.m.`;
        countMessage=participant1MessageCount+participant2MessageCount;

        const totalDaysAvg = daySet.size;
        const avgMessagesPerDay = totalDaysAvg > 0 ? (totalMessagesavg / totalDaysAvg).toFixed(2) : 0;

        mostActiveDay= dayOfWeekMap[dayOfWeekActive];
        return {
        countMessage,
        participant1,
        participant2,
        participant1MessageCount,
        participant2MessageCount,
        participant1LinksCount,
        participant2LinksCount,
        maxCount,
        monthName,
        year,
        maxCountHour,
        formattedMaxHour,
        avgMessagesPerDay,
        mostActiveDay,
        mostUsedEmoji
        };
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