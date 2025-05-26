import React , { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface ProgressBarProps {
  total: number;
  current: number;
  duration?: number; // en ms, opcional
}

const StoryProgressBar: React.FC<ProgressBarProps> = ({ total, current, duration }) => {
    const progress = useRef(new Animated.Value(0)).current;
  
    useEffect(() => {
      progress.setValue(0); // Reiniciar animación
      Animated.timing(progress, {
        toValue: 1,
        duration,
        useNativeDriver: false, // width no soporta native driver
      }).start();
    }, [current]);
  
    return (
      <View style={styles.container}>
        {Array.from({ length: total }).map((_, i) => {
          if (i < current) {
            // Completadas
            return (
              <View key={i} style={styles.barContainer}>
                <View style={[styles.bar, { width: '100%', backgroundColor: 'rgba(0, 0, 0, 0.4)' }]} />
              </View>
            );
          } else if (i === current) {
            // Actual → animada
            return (
              <View key={i} style={styles.barContainer}>
                <Animated.View
                  style={[
                    styles.bar,
                    {
                      backgroundColor: i === current ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.5)',
                      width: progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
            );
          } else {
            // Futuras
            return (
              <View key={i} style={styles.barContainer}>
                <View style={[styles.bar, { width: '0%', backgroundColor: 'rgba(255, 255, 255, 0.5)' }]} />
              </View>
            );
          }
        })}
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      position: 'absolute',
      top: 50,
      left: 10,
      right: 10,
      height: 4,
      justifyContent: 'space-between',
      zIndex: 10,
    },
    barContainer: {
      flex: 1,
      height: 4,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      marginHorizontal: 2,
      borderRadius: 2,
      overflow: 'hidden',
    },
    bar: {
      height: 4,
      borderRadius: 2,
    },
  });

export default StoryProgressBar;