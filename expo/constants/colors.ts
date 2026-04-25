import { Platform } from 'react-native';

export const Colors = {
  background: '#F2ECE0',
  surface: '#F2ECE0',
  card: '#FBF7EC',
  cardBorder: 'rgba(22, 44, 58, 0.18)',
  gold: '#C9A16A',
  goldLight: '#D7B680',
  goldDark: '#A77F4C',
  goldMuted: 'rgba(201, 161, 106, 0.16)',
  goldSubtle: 'rgba(201, 161, 106, 0.08)',
  textPrimary: '#162C3A',
  textSecondary: '#526572',
  textTertiary: '#7B8B97',
  green: '#47745F',
  greenMuted: 'rgba(71, 116, 95, 0.12)',
  red: '#A55346',
  redMuted: 'rgba(165, 83, 70, 0.12)',
  white: '#FBF7EC',
  black: '#162C3A',
  divider: 'rgba(22, 44, 58, 0.18)',
  inputBg: '#FBF7EC',
  inputBorder: 'rgba(22, 44, 58, 0.22)',
  overlay: 'rgba(22, 44, 58, 0.42)',
  fontDisplay: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' }),
  radiusSm: 2,
  radiusMd: 4,
  radiusLg: 6,
} as const;

export default Colors;
