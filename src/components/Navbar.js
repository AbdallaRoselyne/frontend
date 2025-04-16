import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-[#3b0764] text-[#fafafa] p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-large font-bold mb-8">
          Pro<span className="text-[#bef264]">Design</span>
        </div>
        <div className="space-x-4">
          <Link to="/login">
            <button className="bg-white text-[#3b0764] px-4 py-2 rounded hover:bg-purple-400">
              Login
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
