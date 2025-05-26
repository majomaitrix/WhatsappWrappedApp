import React,{ useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions,Pressable  } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
const { width, height } = Dimensions.get('window');
import Svg, { Circle, Rect ,Polygon } from 'react-native-svg';
import StoryProgressBar from './StoryProgressBar';
interface StoryProps {
  title: string;
  value: string;
  onNext: () => void;
  onPrev: () => void;
  gradientColors: string[];
  fontFamily: string;
}
const SvgDecorations = () => (
    <Svg style={{ position: 'absolute', width: '100%', height: '100%' }}>
      <Circle cx="50" cy="50" r="40" fill="rgba(255,255,255,0.1)" />
      <Circle cx="150" cy="150" r="60" fill="rgba(255,255,255,0.05)" />
    </Svg>
  );
function generateRandomShapes(count: number) {
  const shapes = [];
  for (let i = 0; i < count; i++) {
    const rand = Math.random();
    // Decide tipo de figura (circle o rect)
    const type = rand < 0.33 ? 'circle' : rand < 0.66 ? 'rect' : 'triangle';

    // Posición aleatoria dentro del área (suponiendo 360x640 para ejemplo)
    const cx = Math.random() * 360;
    const cy = Math.random() * 640;
    const size = 20 + Math.random() * 80;
    const fill = `rgba(255,255,255,${(Math.random() * 0.1 + 0.05).toFixed(2)})`;

    shapes.push({ type, cx, cy, size, fill });
  }
  return shapes;
}
const Story: React.FC<StoryProps> = ({ title, value, onNext, onPrev, gradientColors ,fontFamily }) => {

    const shapes = useMemo(() => generateRandomShapes(15), []);
    return (
        <LinearGradient colors={gradientColors} style={styles.container}>
            <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
            {shapes.map((shape, index) => {
            if (shape.type === 'circle') {
                return (
                <Circle
                    key={index}
                    cx={shape.cx}
                    cy={shape.cy}
                    r={shape.size / 2}
                    fill={shape.fill}
                />
                );
            } else if (shape.type === 'rect') {
                return (
                <Rect
                    key={index}
                    x={shape.cx}
                    y={shape.cy}
                    width={shape.size}
                    height={shape.size / 2}
                    fill={shape.fill}
                />
                );
            } else if (shape.type === 'triangle') {
                // Triángulo equilátero apuntando hacia arriba
                const x = shape.cx;
                const y = shape.cy;
                const s = shape.size;

                const points = `${x},${y} ${x - s / 2},${y + s} ${x + s / 2},${y + s}`;
                return (
                <Polygon
                    key={index}
                    points={points}
                    fill={shape.fill}
                />
                );
            }
            })}
            </Svg>
            
            {/* Zonas táctiles invisibles izquierda/derecha */}
            <Pressable style={styles.leftZone} onPress={onPrev} />
            <Pressable style={styles.rightZone} onPress={onNext} />

            {/* Contenido de la historia */}
            <View style={styles.content}>
                <Text style={[styles.title, { fontFamily }]}>{title}</Text>
                <Text style={styles.value}>{value}</Text>
            </View>
        </LinearGradient>
    );
  };

  const styles = StyleSheet.create({
    svg: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
    container: {
      width,
      height,
      backgroundColor: '#000',
    },
    leftZone: {
      position: 'absolute',
      width: width / 2,
      height,
      left: 0,
      zIndex: 1,
    },
    circle: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    rightZone: {
      position: 'absolute',
      width: width / 2,
      height,
      right: 0,
      zIndex: 1,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    title: {
      color: '#fff',
      fontSize: 24,
      marginBottom: 10,
      textAlign: 'center',
    },
    value: {
      color: '#fff',
      fontSize: 20,
      textAlign: 'center',
    },
  });
  
  export default Story;