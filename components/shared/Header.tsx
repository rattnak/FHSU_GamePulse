import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSizes } from '@/constants/theme';

interface HeaderProps {
  title?: string;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  backgroundColor?: string;
  textColor?: string;
}

export default function Header({
  title = 'FHSU GamePulse',
  leftComponent,
  rightComponent,
  backgroundColor = Colors.fhsuGold,
  textColor = Colors.fhsuBlack,
}: HeaderProps) {
  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor }]}>
      <View style={[styles.container, { backgroundColor }]}>

        {/* Left icon container — fixed width */}
        <View style={styles.sideContainer}>
          {leftComponent}
        </View>

        {/* Center title */}
        <Text style={[styles.title, { color: textColor }]}>
          {title}
        </Text>

        {/* Right icon container — fixed width */}
        <View style={styles.sideContainer}>
          {rightComponent}
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.fhsuGold,
  },
  container: {
    backgroundColor: Colors.fhsuGold,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },

  // Fixed-width left / right areas so title stays centered
  sideContainer: {
    width: 40,         // enough space for one icon
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: FontSizes.x2l,
    fontWeight: 'bold',
    color: Colors.fhsuBlack,
    textAlign: 'center',
    flex: 1,           // Title fills available space
  },
});
