import { ShipWheelIcon } from "lucide-react";
import { Link } from "react-router";

const LandingPage = () => {
  return (
    <div
      className="h-screen flex items-center justify-center p-4 sm:p-6 md:p-8"
      data-theme="forest"
    >
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">
        <div className="w-full lg:w-1/2 p-6 sm:p-10 flex flex-col justify-center">
          <div className="mb-6 flex items-center justify-start gap-2">
            <ShipWheelIcon className="size-9 text-primary" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              Streamify
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Learn languages with real people
            </h1>
            <p className="text-base opacity-70">
              Connect with language partners worldwide. Practice conversations, make friends, and
              improve your skills together.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <Link to="/login" className="btn btn-primary flex-1">
              Sign In
            </Link>
            <Link to="/signup" className="btn btn-outline btn-primary flex-1">
              Sign Up
            </Link>
          </div>
        </div>

        <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
          <div className="max-w-md p-8">
            <div className="relative aspect-square max-w-sm mx-auto">
              <img src="/i.png" alt="Language connection illustration" className="w-full h-full" />
            </div>

            <div className="text-center space-y-3 mt-6">
              <h2 className="text-xl font-semibold">Connect with language partners worldwide</h2>
              <p className="opacity-70">
                Practice conversations, make friends, and improve your language skills together
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
