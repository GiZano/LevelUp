import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Polygon, Rect, Defs, ClipPath } from 'react-native-svg';
import { useThemeColors } from '../utils/useThemeColors';

interface MountainSvgProps {
  progress: number; // 0-1
  isComplete: boolean;
}

const WIDTH = 200;
const HEIGHT = 160;

// Mountain triangle vertices: top-center, bottom-left, bottom-right
const MOUNTAIN_POINTS = `${WIDTH / 2},10 10,${HEIGHT} ${WIDTH - 10},${HEIGHT}`;
const MOUNTAIN_HEIGHT = HEIGHT - 10; // from y=10 to y=HEIGHT

export default function MountainSvg({ progress, isComplete }: MountainSvgProps) {
  const { colors } = useThemeColors();
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const fillHeight = clampedProgress * MOUNTAIN_HEIGHT;
  const fillY = HEIGHT - fillHeight;

  return (
    <View style={styles.container}>
      <Svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <Defs>
          <ClipPath id="mountainClip">
            <Polygon points={MOUNTAIN_POINTS} />
          </ClipPath>
        </Defs>

        {/* Unfilled mountain shape */}
        <Polygon
          points={MOUNTAIN_POINTS}
          fill={colors.mountain}
        />

        {/* Filled portion clipped to mountain shape */}
        <Rect
          x={0}
          y={fillY}
          width={WIDTH}
          height={fillHeight}
          fill={colors.mountainFilled}
          clipPath="url(#mountainClip)"
        />
      </Svg>

      {isComplete && (
        <MaterialCommunityIcons name="flag-checkered" size={24} color={colors.accent} style={styles.flag} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: WIDTH,
    height: HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flag: {
    position: 'absolute',
    top: 0,
    fontSize: 20,
  },
});
