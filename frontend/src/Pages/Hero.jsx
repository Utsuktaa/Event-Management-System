import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div
      className="relative h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/image/background.jpg')" }}
    >
      <div className="absolute top-4 right-4 z-10 flex space-x-4">
        <Link
          to="/login"
          className="text-black hover:text-blue-400 font-semibold"
        >
          Login
        </Link>
        <Link
          to="/signup"
          className="text-Black hover:text-blue-400 font-semibold"
        >
          Sign Up
        </Link>
      </div>

      <div className="relative z-0 flex flex-col items-center justify-center h-full text-center text-white px-4">
        <h1 className="text-6xl font-bold">
          <span className="text-[#000000]">Event Sync</span>
        </h1>

        <p className="text-[#ffffff] text-xl mt-4 font-semibold">
          <i>subtitle 1</i>
        </p>
        <p className="text-[#ffffff] text-xl mt-4 font-semibold">
          <i>subtitle 2</i>
        </p>
      </div>
    </div>
  );
};

export default Hero;
