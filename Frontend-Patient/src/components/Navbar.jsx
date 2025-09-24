import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../main";
import axios from "axios";
import { toast } from "react-toastify";
import { AiOutlineClose } from "react-icons/ai";
import { GiHamburgerMenu } from "react-icons/gi";
import { googleLogout } from "@react-oauth/google";

const Navbar = () => {
  const [show, setShow] = useState(true);
  const { isAuthenticated, setIsAuthenticated, user, setUser } =
    useContext(Context);
  const navigateTo = useNavigate();

  const handleLogout = async () => {
    if (user.iss === "https://accounts.google.com") {
      googleLogout();
      toast.success("Logged out from Google account");
      setIsAuthenticated(false);
      setUser(null);
      console.log("Logging out from google");
      navigateTo("/");
    } else {
      await axios
        .get("http://localhost:4000/api/v1/user/patient/logout", {
          withCredentials: true,
        })
        .then((res) => {
          toast.success(res.data.message);
          setIsAuthenticated(false);
        })
        .catch((err) => {
          toast.error(err.response.data.message);
        });
      console.log("Logging out");
    }
  };

  const gotoLogin = async () => {
    navigateTo("/login");
    setShow(!show);
  };

  return (
    <>
      <nav className="container">
        <div className="logo">
          {" "}
          <img
            src="/logo.png"
            alt="logo"
            className="logo-img"
            onClick={() => navigateTo("/")}
          />
        </div>
        <div className={show ? "navLinks showmenu" : "navLinks"}>
          <div className="links">
            <Link to={"/"} onClick={() => setShow(!show)}>
              Home{" "}
            </Link>
            <Link to={"/appointment"} onClick={() => setShow(!show)}>
              Appointment{" "}
            </Link>
            <Link to={"/about"} onClick={() => setShow(!show)}>
              About Us{" "}
            </Link>
          </div>
          {isAuthenticated && user ? (
            <button className="logoutBtn btn" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <button className="logoutBtn btn" onClick={gotoLogin}>
              Login
            </button>
          )}
        </div>
        <div className="hamburger" onClick={() => setShow(!show)}>
          {show ? <GiHamburgerMenu /> : <AiOutlineClose />}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
