import React, { useCallback, useState } from "react";
import { Stack, useFocusEffect } from "expo-router";
import { ParentPinModal } from "../../../src/components/ParentPinModal";

export default function ParentLayout() {
  const [isFocused, setIsFocused] = useState(false);
  const [pinVerified, setPinVerified] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => {
        setIsFocused(false);
        setPinVerified(false);
      };
    }, []),
  );

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="report/[profileId]" />
      </Stack>
      <ParentPinModal
        visible={isFocused && !pinVerified}
        mode="verify"
        onClose={() => {}}
        onSuccess={() => setPinVerified(true)}
      />
    </>
  );
}
