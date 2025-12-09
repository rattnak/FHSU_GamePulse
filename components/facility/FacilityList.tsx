import React from "react";
import { View, StyleSheet } from "react-native";
import { Facility } from "./FacilityCard";

interface FacilityListProps {
  facilities: Facility[];
}

export default function FacilityList({ facilities }: FacilityListProps) {
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
