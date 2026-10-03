import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  User,
} from "lucide-react-native";

import { useAuth } from "../src/context/AuthContext";
import { authApi } from "../src/services/authApi";
import { COLORS } from "../src/theme";

export default function LoginRoute() {
  const router = useRouter();
  const { login } = useAuth();

  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Xử lý thông báo lỗi và thành công
  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
<<<<<<< HEAD

    if (!email.trim()) {
      setErrorMessage("Vui lòng nhập Email!");
      return;
    }
    if (!password.trim()) {
      setErrorMessage("Vui lòng nhập Mật khẩu!");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password });
      setIsLoading(false);

      if (res.data) {
        await login(res.data.email || email, res.data, res.access_token);
      } else {
        await login(email, undefined, res.access_token);
      }
      router.replace("/profiles");
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(
        err.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản!",
      );
    }
=======
>>>>>>> origin/maichi
  };

  // Xử lý đăng nhập tài khoản phụ huynh
  const handleLogin = async () => {
    clearMessages();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage("Vui lòng nhập email.");
      return;
    }

    if (!password) {
      setErrorMessage("Vui lòng nhập mật khẩu.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await authApi.login({
        email: trimmedEmail,
        password,
      });

      if (res.data) {
        await login(
          res.data.email || trimmedEmail,
          res.data,
          res.access_token
        );
      } else {
        await login(trimmedEmail, undefined, res.access_token);
      }

      // Đăng nhập thành công thì chuyển sang quản lý hồ sơ bé
      router.replace("/profiles");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Email hoặc mật khẩu không chính xác.");
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý đăng ký tài khoản phụ huynh
  const handleRegister = async () => {
    clearMessages();

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setErrorMessage("Vui lòng nhập họ và tên.");
      return;
    }

    if (!trimmedEmail) {
      setErrorMessage("Vui lòng nhập email.");
      return;
    }

    if (!password) {
      setErrorMessage("Vui lòng nhập mật khẩu.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Mật khẩu cần có ít nhất 6 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsLoading(true);

    try {
      await authApi.register({
        full_name: trimmedName,
        email: trimmedEmail,
        password,
      });

      setSuccessMessage(
        "Tài khoản đã được tạo. Vui lòng đăng nhập để tiếp tục."
      );

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        setIsRegisterMode(false);
        setSuccessMessage("");
      }, 1200);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Không thể tạo tài khoản. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  // Chuyển đổi giữa màn hình đăng nhập và đăng ký
  const switchMode = (registerMode: boolean) => {
    setIsRegisterMode(registerMode);
    setFullName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    clearMessages();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.brandSection}>
            <Image
              source={require("../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.brandTitle}>
              Chào mừng đến với E-math
            </Text>

            <Text style={styles.brandSubtitle}>
              Đồng hành cùng bé trong hành trình học toán
            </Text>
          </View>

          <View style={styles.card}>
            {/* Tab đăng nhập / đăng ký */}
            <View style={styles.tabs}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  !isRegisterMode && styles.activeTab,
                ]}
                onPress={() => switchMode(false)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabText,
                    !isRegisterMode && styles.activeTabText,
                  ]}
                >
                  Đăng nhập
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tab,
                  isRegisterMode && styles.activeTab,
                ]}
                onPress={() => switchMode(true)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabText,
                    isRegisterMode && styles.activeTabText,
                  ]}
                >
                  Đăng ký
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tiêu đề và mô tả form */}
            <Text style={styles.formTitle}>
              {isRegisterMode
                ? "Tạo tài khoản phụ huynh"
                : "Đăng nhập tài khoản phụ huynh"}
            </Text>

            <Text style={styles.formSubtitle}>
              {isRegisterMode
                ? "Tạo tài khoản để quản lý hồ sơ và quá trình học tập của bé."
                : "Đăng nhập để quản lý hồ sơ và theo dõi quá trình học tập của bé."}
            </Text>

            {/* Thông báo lỗi */}
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Thông báo đăng ký thành công */}
            {successMessage ? (
              <View style={styles.successBox}>
                <View style={styles.successIcon}>
                  <Check
                    size={15}
                    color="#FFFFFF"
                    strokeWidth={3}
                  />
                </View>

                <Text style={styles.successText}>
                  {successMessage}
                </Text>
              </View>
            ) : null}

            {/* Họ và tên - chỉ hiển thị khi đăng ký */}
            {isRegisterMode && (
              <View style={styles.field}>
                <Text style={styles.label}>Họ và tên</Text>

                <View style={styles.inputWrapper}>
                  <User
                    size={19}
                    color={COLORS.textSecondary}
                    strokeWidth={1.8}
                  />

                  <TextInput
                    style={styles.input}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Nhập họ và tên"
                    placeholderTextColor="#9AA9B5"
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>
              </View>
            )}

            {/* Email */}
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>

              <View style={styles.inputWrapper}>
                <Mail
                  size={19}
                  color={COLORS.textSecondary}
                  strokeWidth={1.8}
                />

                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Nhập email của bạn"
                  placeholderTextColor="#9AA9B5"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Mật khẩu */}
            <View style={styles.field}>
              <Text style={styles.label}>Mật khẩu</Text>

              <View style={styles.inputWrapper}>
                <LockKeyhole
                  size={19}
                  color={COLORS.textSecondary}
                  strokeWidth={1.8}
                />

                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor="#9AA9B5"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />

                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  {showPassword ? (
                    <EyeOff
                      size={19}
                      color={COLORS.textSecondary}
                    />
                  ) : (
                    <Eye
                      size={19}
                      color={COLORS.textSecondary}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Xác nhận mật khẩu - chỉ hiển thị khi đăng ký */}
            {isRegisterMode && (
              <View style={styles.field}>
                <Text style={styles.label}>
                  Xác nhận mật khẩu
                </Text>

                <View style={styles.inputWrapper}>
                  <LockKeyhole
                    size={19}
                    color={COLORS.textSecondary}
                    strokeWidth={1.8}
                  />

                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Nhập lại mật khẩu"
                    placeholderTextColor="#9AA9B5"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />

                  <TouchableOpacity
                    onPress={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    style={styles.eyeButton}
                  >
                    {showConfirmPassword ? (
                      <EyeOff
                        size={19}
                        color={COLORS.textSecondary}
                      />
                    ) : (
                      <Eye
                        size={19}
                        color={COLORS.textSecondary}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Ghi nhớ đăng nhập */}
            {!isRegisterMode && (
              <TouchableOpacity
                style={styles.rememberRow}
                activeOpacity={0.8}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View
                  style={[
                    styles.checkbox,
                    rememberMe && styles.checkboxActive,
                  ]}
                >
                  {rememberMe && (
                    <Check
                      size={13}
                      color="#FFFFFF"
                      strokeWidth={3}
                    />
                  )}
                </View>

                <Text style={styles.rememberText}>
                  Ghi nhớ đăng nhập
                </Text>
              </TouchableOpacity>
            )}

            {/* Nút đăng nhập / đăng ký */}
            <TouchableOpacity
              style={[
                styles.mainButton,
                isLoading && styles.mainButtonDisabled,
              ]}
              disabled={isLoading}
              onPress={
                isRegisterMode
                  ? handleRegister
                  : handleLogin
              }
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.mainButtonText}>
                    {isRegisterMode
                      ? "Tạo tài khoản"
                      : "Đăng nhập"}
                  </Text>

                  <ArrowRight
                    size={19}
                    color="#FFFFFF"
                    strokeWidth={2.5}
                  />
                </>
              )}
            </TouchableOpacity>

            {/* Chuyển đổi giữa đăng nhập và đăng ký */}
            <View style={styles.switchRow}>
              <Text style={styles.switchText}>
                {isRegisterMode
                  ? "Đã có tài khoản?"
                  : "Chưa có tài khoản?"}
              </Text>

              <TouchableOpacity
                onPress={() => switchMode(!isRegisterMode)}
              >
                <Text style={styles.switchLink}>
                  {isRegisterMode
                    ? " Đăng nhập"
                    : " Đăng ký"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <Text style={styles.footerText}>
            E-math · Nền tảng học toán dành cho bé
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Layout tổng thể
  safeArea: {
    flex: 1,
    backgroundColor: "#F7FBFD",
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 28,
  },

  // Header
  brandSection: {
    width: "100%",
    maxWidth: 470,
    alignItems: "center",
    marginBottom: 24,
  },

  logo: {
    width: 82,
    height: 82,
    marginBottom: 12,
  },

  brandTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.4,
  },

  brandSubtitle: {
    marginTop: 6,
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },

  // Card đăng nhập / đăng ký
  card: {
    width: "100%",
    maxWidth: 470,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: "#E7EFF4",
    shadowColor: "#17324D",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    elevation: 3,
  },

  // Tab đăng nhập / đăng ký
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E8EFF3",
    marginBottom: 25,
  },

  tab: {
    flex: 1,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  activeTab: {
    borderBottomWidth: 2.5,
    borderBottomColor: COLORS.primary,
  },

  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },

  activeTabText: {
    color: COLORS.primary,
    fontWeight: "bold",
  },

  // Tiêu đề form
  formTitle: {
    color: COLORS.text,
    fontSize: 21,
    fontWeight: "800",
    lineHeight: 28,
    marginBottom: 7,
  },

  formSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 22,
  },

  // Thông báo
  errorBox: {
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FFD9D9",
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 11,
    marginBottom: 16,
  },

  errorText: {
    color: "#C63D45",
    fontSize: 13,
    lineHeight: 18,
  },

  successBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1FBF5",
    borderWidth: 1,
    borderColor: "#CFEED9",
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 11,
    marginBottom: 16,
  },

  successIcon: {
    width: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: COLORS.success,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 9,
  },

  successText: {
    flex: 1,
    color: "#287B43",
    fontSize: 13,
    lineHeight: 18,
  },

  // Các trường nhập liệu
  field: {
    marginBottom: 16,
  },

  label: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 7,
  },

  inputWrapper: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DCE7ED",
    borderRadius: 11,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
  },

  input: {
    flex: 1,
    height: "100%",
    color: COLORS.text,
    fontSize: 14,
    marginLeft: 10,
    paddingVertical: 0,
  },

  eyeButton: {
    width: 34,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-end",
  },

  // Ghi nhớ đăng nhập
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -2,
    marginBottom: 2,
  },

  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#CBD9E1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },

  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  rememberText: {
    color: COLORS.textSecondary,
    fontSize: 12.5,
  },

  // Nút chính
  mainButton: {
    height: 52,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    gap: 9,
  },

  mainButtonDisabled: {
    opacity: 0.65,
  },

  mainButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  // Chuyển đổi đăng nhập / đăng ký
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  switchText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },

  switchLink: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "800",
  },

  // Footer
  footerText: {
    marginTop: 20,
    color: "#9AA9B5",
    fontSize: 11,
    textAlign: "center",
  },
});