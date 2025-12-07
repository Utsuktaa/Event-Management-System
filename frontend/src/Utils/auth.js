export const clearAuthCookies = () => {
  const cookies = ["token", "role", "email", "name"];
  cookies.forEach((c) => {
    document.cookie = `${c}=; path=/; max-age=0`;
  });
};
