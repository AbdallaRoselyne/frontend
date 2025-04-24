import React from "react";
import Login from "./Auth/Login";

function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex flex-col items-center justify-center pt-16">
        <h1 className="text-3xl md:text-4xl font-bold text-[#c8db00] mb-2 text-center">
          Prodesign Project Management Platform
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-4 text-center">
          Assign tasks, clarify hours and request resources.
        </p>

        <Login />
      </div>
    </div>
  );
}

export default LandingPage;
