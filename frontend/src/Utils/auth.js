export const clearAuthCookies = () => {
  const cookies = ["token", "role", "email", "name"];
  cookies.forEach((c) => {
    document.cookie = `${c}=; path=/; max-age=0`;
  });
};

export const getTokenFromCookies = () => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; token=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};
