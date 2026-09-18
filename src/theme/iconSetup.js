import { cssInterop } from 'nativewind';
import { Feather, MaterialCommunityIcons, Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';

const iconConfig = {
  className: {
    target: 'style',
    nativeStyleToProp: {
      color: true,
      size: true,
    },
  },
};

cssInterop(Feather, iconConfig);
cssInterop(MaterialCommunityIcons, iconConfig);
cssInterop(Ionicons, iconConfig);
cssInterop(MaterialIcons, iconConfig);
cssInterop(FontAwesome, iconConfig);
