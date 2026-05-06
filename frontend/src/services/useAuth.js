export const useAuth = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return { user, logout };
};
