import { Platform, View } from 'react-native';

export const Chart = (Platform.OS === 'web') ? require('./web/charts').Chart : View;
