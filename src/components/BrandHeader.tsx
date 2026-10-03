import React from "react";
import { Image, StyleSheet, View } from "react-native";

export const BrandHeader: React.FC = () => {
  return (
    <View style={styles.header}>
      <Image
        source={require("../../assets/logo.png")}
        style={styles.logo}
        resizeMode="contain"
        accessibilityLabel="E-Math"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 50,
    height: 50,
  },
});
