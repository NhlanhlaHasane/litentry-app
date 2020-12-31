import {StyleSheet, Platform} from 'react-native';

export const standardPadding = 8;

const dividerPlain = {
  height: 2,
  width: '100%',
};

export const monofontFamily = Platform.OS === 'ios' ? 'Menlo' : 'monospace';
export const colorGreen = '#1BC575'; // rgba(27, 197, 117, 0.3)
export const colorGreenLight = 'rgba(27, 197, 117, 0.3)';
export const defaultIconColor = '#778899';

export const colorRed = '#FF3D71';
export const getIconColorByTheme = (theme: 'light' | 'dark') =>
  theme === 'light' ? 'black' : 'white';
export const hitSlop = {top: 5, bottom: 5, left: 5, right: 5};

const inlineIconDimension = {
  width: 20,
  height: 20,
};
const iconColor = {
  color: defaultIconColor,
};
const globalStyles = StyleSheet.create({
  paddedContainer: {
    padding: standardPadding * 2,
  },
  rowContainer: {
    flexDirection: 'row',
  },
  rowAlignCenter: {
    alignItems: 'center',
  },
  divider: {
    marginVertical: standardPadding,
    ...dividerPlain,
  },
  dividerPlain,
  centeredContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  icon: {...inlineIconDimension, ...iconColor},
  inlineIconDimension,
  iconColor,
  dialogMinHeight: {
    minHeight: 240,
  },
  flex: {flex: 1},

  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 1,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 3.84,

    elevation: 5,
  },

  aye: {
    color: colorGreen,
    fontFamily: monofontFamily,
  },
  nye: {
    color: colorRed,
    fontFamily: monofontFamily,
  },
});

export default globalStyles;
