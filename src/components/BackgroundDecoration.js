import { Dimensions, View } from 'react-native';
import Svg, { Circle, Defs, Path, Pattern, Rect } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function BackgroundDecoration() {
  const { theme } = useTheme();
  const strokeColor = theme.isDark ? '#12251E' : '#E8F2EC';
  const dotColor = theme.isDark ? '#12251E' : '#E8F2EC';

  return (
    <View className="absolute inset-0 -z-10" pointerEvents="none">
      <Svg height={height} width={width} className="absolute inset-0">
        <Defs>
          <Pattern id="dots" x="0" y="0" width="15" height="15" patternUnits="userSpaceOnUse">
            <Circle cx="2" cy="2" r="1.5" fill={dotColor} />
          </Pattern>
        </Defs>
        <Rect x="0" y="0" width={width} height={height} fill="url(#dots)" />
        {/* Top Left Curves */}
        <Path
          d={`M0,0 L${width * 0.8},0 C${width * 0.4},100 ${width * 0.6},250 0,350 Z`}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
        />
        <Path
          d={`M0,0 L${width * 0.6},0 C${width * 0.2},80 ${width * 0.4},200 0,280 Z`}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.5"
        />
        {/* Bottom Right Curves */}
        <Path
          d={`M${width},${height} L${width * 0.2},${height} C${width * 0.6},${height - 100} ${width * 0.4},${height - 250} ${width},${height - 350} Z`}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
        />
      </Svg>
    </View>
  );
}