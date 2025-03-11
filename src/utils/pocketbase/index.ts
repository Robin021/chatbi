import PocketBase, { AuthRecord } from "pocketbase";


// Initialize the PocketBase client
// const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL as string);
const pb = new PocketBase('http://54.222.196.102:3000');


pb.autoCancellation(false);

// Type for OAuth providers
type OAuthProvider = "oidc" | "google" | "github" | string;

// Type for AuthData returned from authentication
export interface AuthData {
  token: string;
  record: Record<string, any>;
}

/**
 * 使用 OAuth 登录
 * @param provider - OAuth 提供商，默认为 'oidc'
 * @returns 认证数据，包括 token 和用户记录
 */
export const loginWithOAuth = async (
  provider: OAuthProvider = "oidc"
): Promise<AuthData> => {
  try {
    const authData: AuthData = await pb.collection("authing").authWithOAuth2({
      provider,
      redirectUrl: window.location.origin + "/login",
    });
    return authData;
  } catch (error) {
    console.error("Login failed:", error);
    throw new Error("Authentication failed");
  }
};

/**
 * 检查用户是否已登录
 * @returns 用户是否已登录
 */
export const isAuthenticated = (): boolean => {
  return pb.authStore.isValid;
};


export const getAuthenticatedUser = (): AuthRecord | null => {
  return pb.authStore.record;
};

/**
 * 注销用户
 */
export const logout = (): void => {
  pb.authStore.clear();
};

/**
 * 获取 PocketBase 客户端实例
 * @returns PocketBase 实例
 */
export const getPocketBaseClient = (): PocketBase => {
  return pb;
};


