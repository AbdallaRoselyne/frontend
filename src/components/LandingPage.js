import React from "react";
import Login from "./Auth/Login";

function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-100 pt-20 px-4 flex flex-col items-center">
      {/* Tagline Section */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-purple-800 mb-2">
          Prodesign Project Management Platform
        </h1>
        <p className="text-lg md:text-xl text-gray-700">
          Assign tasks, clarify hours and request resources.
        </p>
      </div>

      {/* Just a small space between tagline and login */}
      <div className="mt-2 w-full max-w-md">
        <Login />
      </div>
    </div>
  );
}

export default LandingPage;
