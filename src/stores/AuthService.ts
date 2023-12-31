import { ref, Ref, computed } from "vue";
import router from "@/router";
import { defineStore } from "pinia";
import instance from "@/utils/axios-interceptor";
import { AxiosResponse } from "axios";

export interface LoginUser {
  email: string;
  password: string;
}

export interface Response {
  code: string;
  message: string;
  data: any;
  description: string | null;
  accessToken: string | null;
}

export const useAuthStore = defineStore("auth", () => {
  const user: Ref<string> = ref("");
  const token: Ref<string> = ref("");
  const returnURL: Ref<string> = ref("/");

  const getUser = computed(() => user.value);
  const getToken = computed(() => token.value);

  async function login(loginUser: LoginUser): Promise<Response> {
    const response: AxiosResponse = await instance.post("/auth/login", {
      ...loginUser,
    });
    const datas: Response = response.data;
    if (datas.data.accessToken) {
      token.value = datas.data.accessToken;
      router.push(returnURL.value ?? "/");
    }
    return Promise.resolve(datas);
  }

  async function refresh() {
    const response: AxiosResponse = await instance.post("/auth/refresh");
    const responseData: Response = response.data;
    const data = responseData.data;

    if (data.accessToken) {
      token.value = data.accessToken;
    } else if (responseData.code === "ERROR") {
      console.warn(responseData.message);
    }
  }

  async function logout() {
    await instance.post("/auth/logout");
    token.value = "";
    user.value = "";
    await router.push("/auth/login");
  }

  return {
    user,
    token,
    returnURL,
    getUser,
    getToken,
    login,
    refresh,
    logout,
  };
});

export interface SignupUser {
  email: string;
  password: string;
  passwordVerify: string;
  name: string;
}

export const useSignupStore = defineStore("signup", () => {
  async function checkRequired(user: SignupUser): Promise<boolean> {
    const response: AxiosResponse = await instance.post("/auth/signup/check", {
      ...user,
    });

    let checkedRequired = true;

    if ((response.data?.code ?? "ERROR") === "ERROR") {
      checkedRequired = false;
    }

    return Promise.resolve(checkedRequired);
  }

  async function requestSignup(user: SignupUser): Promise<Response> {
    const response: AxiosResponse = await instance.post(
      "/auth/signup/request",
      { ...user }
    );
    return Promise.resolve(response.data);
  }

  async function resendMail(email: string) {}

  return {
    checkRequired,
    requestSignup,
    resendMail,
  };
});
