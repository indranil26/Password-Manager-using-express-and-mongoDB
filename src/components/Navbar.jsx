import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const Navbar = () => {
  const { loginWithRedirect, logout, user, isAuthenticated } = useAuth0();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className={`bg-slate-800 text-white transition-all duration-300 ease-in-out ${isOpen ? 'h-48' : 'h-14'} md:h-14`}>
      <div className="mycontainer relative flex justify-between items-center px-4 py-5 h-full">

        {/* Logo */}
        <div className={`font-bold text-white text-xl md:text-2xl ${isOpen ? 'absolute left-1/2 transform -translate-x-1/2 top-4' : ''}`}>
          <span className='text-green-500'>&lt;</span>
          Pass<span className='text-green-500'>OP/ &gt;</span>
        </div>

        {/* Hamburger button for small screens */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            {/* Hamburger Icon */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          </button>
        </div>

        {/* Navbar content */}
        <div className={`md:flex md:items-center md:space-x-4 ${isOpen ? 'flex flex-col items-center absolute left-1/2 transform -translate-x-1/2 top-12 space-y-2' : 'hidden'} md:flex md:relative md:top-0 md:left-0 md:transform-none`}>
          <a href="https://github.com/indranil26/Password-Manager-using-express-and-mongoDB">
            <button className='text-white bg-green-700 rounded-full flex justify-center items-center ring-white ring-1 px-4 py-2'>
              <img className='invert w-6 md:w-8 p-1' src="icons/github.png" alt="github logo" />
              <span className="font-bold text-base px-2">Github</span>
            </button>
          </a>

          {/* User name and Logout/Login buttons */}
          <div className="md:flex md:items-center md:space-x-2 w-full text-center md:text-left">
            {isAuthenticated ? (
              <>
                <span className="block md:inline text-base">{user.name}</span>
                <button
                  onClick={() => logout({ returnTo: window.location.origin })}
                  className='bg-red-500 p-2 rounded text-base mt-2 w-24 md:w-auto md:mt-0'
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={loginWithRedirect}
                className='bg-green-500 p-2 rounded text-base w-24 md:w-auto'
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;