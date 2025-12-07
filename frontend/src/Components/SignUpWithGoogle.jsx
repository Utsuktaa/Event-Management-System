import { useGoogleLogin } from "@react-oauth/google";

const SignUpWithGoogle = () => {
  const responseGoogle = async (authResult) => {
    try {
      if (authResult.code) {
        const res = await fetch(
          `http://localhost:5000/api/auth/google?code=${authResult.code}`,
          { method: "GET" }
        );
        const data = await res.json();

        if (res.ok) {
          console.log("Google signup success:", data);
          document.cookie = `token=${data.token}; path=/; max-age=${
            7 * 24 * 60 * 60
          }`;
          document.cookie = `role=${data.role}; path=/; max-age=${
            7 * 24 * 60 * 60
          }`;
          document.cookie = `email=${data.email}; path=/; max-age=${
            7 * 24 * 60 * 60
          }`;
          document.cookie = `name=${data.name}; path=/; max-age=${
            7 * 24 * 60 * 60
          }`;
          if (data.role === "admin") {
            window.location.href = "/admin-dashboard";
          } else {
            window.location.href = "/user-dashboard";
          }
        } else {
          alert(data.message);
        }
      } else {
        console.error(authResult);
        throw new Error(authResult);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      className="flex items-center justify-center w-full border rounded-lg p-2 hover:bg-gray-200 mb-4"
    >
      <img src="/image/google.png" alt="Google Logo" className="w-5 h-5 mr-3" />
      Sign Up with Google
    </button>
  );
};

export default SignUpWithGoogle;
