import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/services/api/auth.api';
import type { LoginInput, RegisterUserInput, IUser } from 'shared';

export const useAuth = () => {
  const { user, accessToken, isAuthenticated, login, logout, setUser } = useAuthStore();

  const handleLogin = async (data: LoginInput) => {
    const response = await authApi.login(data);
    login(response.data.accessToken, response.data.user);
    return response;
  };

  const handleRegister = async (data: RegisterUserInput) => {
    const response = await authApi.register(data);
    login(response.data.accessToken, response.data.user);
    return response;
  };

  const refreshProfile = async () => {
    const response = await authApi.getProfile();
    setUser(response.data);
    return response.data;
  };

  return {
    user,
    accessToken,
    isAuthenticated,
    role: user?.role,
    login: handleLogin,
    register: handleRegister,
    logout,
    setUser,
    refreshProfile,
  };
};

export default useAuth;
