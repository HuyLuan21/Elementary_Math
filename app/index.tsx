import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../src/context/AuthContext";
import { BrandHeader } from "../src/components/BrandHeader";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginRoute() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setErrorMessage("");
    if (!email.trim()) {
      setErrorMessage("Vui lòng nhập Email hoặc Số điện thoại!");
      return;
    }
    if (!password.trim()) {
      setErrorMessage("Vui lòng nhập Mật khẩu!");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      login(email);
      router.replace("/profiles");
    }, 600);
  };

  const handleQuickDemo = () => {
    setEmail("phuhuynh@mathkids.edu.vn");
    setPassword("123456");
    setErrorMessage("");
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      login("phuhuynh@mathkids.edu.vn");
      router.replace("/profiles");
    }, 500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerWrapper}>
            <BrandHeader />
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Đăng Nhập</Text>
            <Text style={styles.subtitle}>
              Hệ thống Học Toán Tiểu Học Thông Minh
            </Text>

            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email hoặc Số điện thoại"
                placeholderTextColor="#8C8C8C"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, { paddingRight: 80 }]}
                placeholder="Mật khẩu"
                placeholderTextColor="#8C8C8C"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeText}>
                  {showPassword ? "ẨN" : "HIỆN"}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.loginBtnText}>Đăng Nhập</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.demoBtn}
              onPress={handleQuickDemo}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.demoBtnText}>
                ⚡ Đăng nhập nhanh (Tài khoản Demo)
              </Text>
            </TouchableOpacity>

            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View
                  style={[
                    styles.checkbox,
                    rememberMe && styles.checkboxChecked,
                  ]}
                >
                  {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.rememberText}>Ghi nhớ đăng nhập</Text>
              </TouchableOpacity>

              <TouchableOpacity>
                <Text style={styles.helpText}>Cần trợ giúp?</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.signupContainer}>
              <Text style={styles.newToApp}>Mới tham gia MathKids? </Text>
              <TouchableOpacity>
                <Text style={styles.signupNow}>Đăng ký ngay.</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.captchaNote}>
              Trang này được bảo vệ bởi Google reCAPTCHA để đảm bảo an toàn cho
              tài khoản học sinh.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#141414",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  headerWrapper: {
    marginBottom: 28,
  },
  card: {
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    borderRadius: 12,
    padding: 28,
    borderWidth: 1,
    borderColor: "#262626",
    elevation: 5,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    color: "#A0A0A0",
    fontSize: 13,
    marginBottom: 24,
  },
  errorBox: {
    backgroundColor: "#E5091422",
    borderLeftWidth: 4,
    borderLeftColor: "#E50914",
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 13,
    fontWeight: "500",
  },
  inputContainer: {
    marginBottom: 16,
    position: "relative",
  },
  input: {
    backgroundColor: "#333333",
    borderRadius: 6,
    height: 52,
    paddingHorizontal: 16,
    color: "#FFFFFF",
    fontSize: 15,
  },
  eyeButton: {
    position: "absolute",
    right: 16,
    top: 16,
  },
  eyeText: {
    color: "#8C8C8C",
    fontSize: 12,
    fontWeight: "bold",
  },
  loginBtn: {
    backgroundColor: "#E50914",
    height: 50,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  demoBtn: {
    backgroundColor: "#1E293B",
    borderWidth: 1,
    borderColor: "#38BDF8",
    height: 46,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  demoBtnText: {
    color: "#38BDF8",
    fontSize: 14,
    fontWeight: "600",
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#737373",
    backgroundColor: "#333333",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: "#737373",
    borderColor: "#737373",
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
  },
  rememberText: {
    color: "#B3B3B3",
    fontSize: 13,
  },
  helpText: {
    color: "#B3B3B3",
    fontSize: 13,
  },
  signupContainer: {
    flexDirection: "row",
    marginTop: 28,
  },
  newToApp: {
    color: "#737373",
    fontSize: 14,
  },
  signupNow: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  captchaNote: {
    color: "#737373",
    fontSize: 11,
    marginTop: 20,
    lineHeight: 16,
  },
});
