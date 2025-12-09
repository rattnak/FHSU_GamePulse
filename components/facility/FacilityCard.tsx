import React from "react";
import { View, StyleSheet } from "react-native";

export interface Facility {
  id: string;
  name: string;
}

interface FacilityCardProps {
  facility: Facility;
}

export default function FacilityCard({ facility }: FacilityCardProps) {
  return (
    <View style={styles.container}>
      {/* We'll build this together */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Styles will go here
  },
});
