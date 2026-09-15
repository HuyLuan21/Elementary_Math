import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const BrandHeader: React.FC = () => {
  return (
    <View style={styles.header}>
      <Text style={styles.logoRed}>NETFLIX</Text>
      <View style={styles.badgeMathContainer}>
        <Text style={styles.badgeMathText}>E-Math</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRed: {
    color: '#E50914',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 2,
  },
  badgeMathContainer: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginLeft: 8,
  },
  badgeMathText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
