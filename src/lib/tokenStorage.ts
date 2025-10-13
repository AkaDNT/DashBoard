export const tokenStorage = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("jwtToken");
  },
  set(token: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem("jwtToken", token);
  },
  remove() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("jwtToken");
  },
};
