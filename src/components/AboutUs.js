import React from "react";

function AboutUs() {
  return (
    <section className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="bg-white shadow-md rounded-lg p-40 mx-4 text-center">
        <h2 className="text-2xl font-bold mb-4">About Us</h2>
        <p className="text-gray-700 text-lg max-w-2xl mx-auto">
          Welcome to ProDesign Project Planner! Our platform streamlines project
          management by connecting admins, planners, and team members
          seamlessly. Whether you need to assign tasks, clarify hours, or review
          reports, ProDesign is here to make your work easier and more
          efficient.
        </p>
      </div>
    </section>
  );
}

export default AboutUs;
