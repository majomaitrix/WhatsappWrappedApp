import React,{useRef, useState,useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView,FlatList,TouchableWithoutFeedback} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import Story from '../components/Story';
import StoryProgressBar from '../components/StoryProgressBar';
type Props = NativeStackScreenProps<RootStackParamList, 'Estadisticas'>;

export default function EstadisticasScreen({ route }: Props) {
    const { estadisticas } = route.params;
    const flatListRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const DURATION = 5000;
    const gradientColorsArray = [
        ['#075E54', '#128C7E'],  // Verde oscuro a verde medio
        ['#128C7E', '#25D366'],  // Verde medio a verde claro
        ['#25D366', '#6CCB9E'],  // Verde claro a verde súper claro (WhatsApp chat bg)
        ['#075E54', '#128C7E'],
        ['#128C7E', '#25D366'],
        ['#25D366', '#128C7E'],
        ['#075E54', '#128C7E'],
        ['#128C7E', '#25D366'],
        ['#25D366', '#6CCB9E'],
        ['#25D366', '#6CCB9E'],
      ];
    const fontFamilies = [
        'Lobster-Regular',
        'Poppins-SemiBold',
        'Poppins-Regular',
        'Poppins-ExtraBold',
        'Poppins-BoldItalic',
        'Poppins-SemiBoldItalic',
        'Poppins-Black',
        'Poppins-MediumItalic',
        'Poppins-Medium'
        // agrega tantos como stories tengas
        ];
    const storiesData = [
        { title: '📊 Bienvenido a tus estadísticas', value: '¡Descubre tus datos de WhatsApp!' },
        { title: '💬 Total de mensajes', value: `${estadisticas.countMessage} Mensajes` },
        {
            title: 'Participantes',
            value: `${estadisticas.participant1}\nCantidad de mensajes: ${estadisticas.participant1MessageCount}\nLinks enviados: ${estadisticas.participant1LinksCount}\n\n${estadisticas.participant2}\nCantidad de mensajes: ${estadisticas.participant2MessageCount}\nLinks enviados: ${estadisticas.participant2LinksCount}`
        },
        { title: '📅 Mes con más mensajes', value: `${estadisticas.monthName} ${estadisticas.year}` },
        { title: '⏰ Hora con más mensajes al dia', value: `${estadisticas.formattedMaxHour}` },
        { title: '📈 Máxima cantidad de mensajes en una hora', value: `${estadisticas.maxCountHour} Mensajes` },
        { title: '📊 Promedio de mensajes por día', value: `${estadisticas.avgMessagesPerDay} Mensajes` },
        { title: '🔥 Día más activo', value: `${estadisticas.mostActiveDay}` },
        { title: '😂 Emoji más usado 🤣', value: `${estadisticas.mostUsedEmoji}` },
      ];
    const handleNext = () => {
        const nextIndex = currentIndex + 1;
        if (nextIndex < storiesData.length) {
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        setCurrentIndex(nextIndex);
        }
    };

    const handlePrev = () => {
        const prevIndex = currentIndex - 1;
        if (prevIndex >= 0) {
        flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
        setCurrentIndex(prevIndex);
        }
    };
    // ⏱️ useEffect para el autoplay
    useEffect(() => {
        const timer = setTimeout(() => {
        if (currentIndex < storiesData.length - 1) {
            handleNext();
        }
        }, DURATION);

        return () => clearTimeout(timer); // limpia el timer si cambia antes de terminar
    }, [currentIndex]);
    return (
        
        <View style={{ flex: 1 }}>
            {/* Barra de progreso fija arriba */}
            <StoryProgressBar
                total={storiesData.length}
                current={currentIndex}
                duration={DURATION}
            />
    
            {/* FlatList con las stories */}
            <FlatList
                ref={flatListRef}
                horizontal
                pagingEnabled
                scrollEnabled={false}
                data={storiesData}
                renderItem={({ item,index  }) => (
                    <Story
                        title={item.title}
                        value={item.value}
                        onNext={handleNext}
                        onPrev={handlePrev}
                        gradientColors={gradientColorsArray[index]}
                        fontFamily={fontFamilies[index]}
                    />
                )}
                keyExtractor={(_, index) => index.toString()}
                showsHorizontalScrollIndicator={false}
                extraData={currentIndex} // para que se re-renderice cuando cambia el index
            />
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      padding: 24,
      backgroundColor: '#fff',
      flexGrow: 1,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
    stat: {
      fontSize: 20,
      marginBottom: 12,
    },
    flatlist: {
        flex: 1,
        backgroundColor: '#000', // opcional: fondo negro tipo historia
    },
  });