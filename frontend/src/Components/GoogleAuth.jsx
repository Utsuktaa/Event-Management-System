import { GoogleLogin } from "@react-oauth/google";
import { API_BASE } from "../config";

const setCookie = (name, value) => {
  document.cookie = `${name}=${value}; path=/; max-age=604800; SameSite=Lax`;
};

const redirect = (role) => {
  if (role === "admin" || role === "superadmin") {
    window.location.href = "/admin-dashboard";
  } else {
    window.location.href = "/user-dashboard";
  }
};

const GoogleAuth = () => {
  const handleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await response.json();
      if (response.ok) {
        setCookie("token", data.token);
        setCookie("role", data.role);
        setCookie("email", data.email);
        setCookie("name", data.name);
        redirect(data.role);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Google authentication failed");
    }
  };

  const handleError = () => {
    alert("Google authentication failed");
  };

  return (
    <div className="flex justify-center">
      <GoogleLogin onSuccess={handleSuccess} onError={handleError} useOneTap={false} />
    </div>
  );
};

export default GoogleAuth;
