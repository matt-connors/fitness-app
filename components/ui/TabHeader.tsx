import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomTabHeaderProps } from '@react-navigation/bottom-tabs';
import { ThemedText } from '../ThemedText';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/useThemeColor';
import { SPACING } from '@/constants/Spacing';

export function TabHeader({ route, options }: BottomTabHeaderProps) {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor('background');
  const borderColor = useThemeColor('border');
  
  const title = options.title || route.name;
  
  return (
    <View 
      style={[
        styles.container,
        {
          backgroundColor,
          paddingTop: insets.top,
          borderBottomColor: borderColor,
        }
      ]}
    >
      <ThemedText style={styles.title}>{title}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 110, // Adjust based on your design
    paddingBottom: 12,
    paddingHorizontal: SPACING.pageHorizontal,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
}); 