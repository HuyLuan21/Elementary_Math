import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface OverviewMetricProps {
  value: number | string;
  label: string;
}

export const OverviewMetric: React.FC<OverviewMetricProps> = ({ value, label }) => {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  metric: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 2,
  },
  metricValue: {
    color: "#3F484F",
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  metricLabel: {
    color: "#858D95",
    fontSize: 11,
    textAlign: "center",
    marginTop: 2,
  },
});
