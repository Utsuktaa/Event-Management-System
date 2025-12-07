import { useGoogleLogin } from "@react-oauth/google";

const LoginWithGoogle = () => {
  const responseGoogle = async (authResult) => {
    try {
      if (authResult.code) {
        console.log(authResult.code);
        const response = await fetch(
          `http://localhost:5000/api/auth/google?code=${authResult.code}`,
          { method: "GET" }
        );
        const data = await response.json();
        if (response.ok) {
          console.log(data);
          document.cookie = `email=${data.email}; path=/; max-age=${
            7 * 24 * 60 * 60
          }`;
          document.cookie = `name=${data.name}; path=/; max-age=${
            7 * 24 * 60 * 60
          }`;
          document.cookie = `token=${data.token}; path=/; max-age=${
            7 * 24 * 60 * 60
          }`;
          window.location.href = "/login";
          // navigate("/");
        } else alert(data.message);
      } else {
        console.log(authResult);
        throw new Error(authResult);
      }
    } catch (error) {
      console.log(error);
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
      Login with Google
    </button>
  );
};

export default LoginWithGoogle;
