import React from "react";
import "./SUSignIn.css";
import WildCatText from "../../assets/image/TITLE.png";
import WildAdmin from "../../assets/image/wildcat-admin.png";
import SUSignInForm from "./SUSignInForm";

const SUSignIn = () => {
    return (
        <div className="SUbackground">
            <div className="container">
                <div className="icon">
                    <img className="img1" src={WildCatText} alt="WildCat Text" />
                    <img className="img2" src={WildAdmin} alt="Wild Admin" />
                </div>
                <div className="login-container">
                    <div className="login-design">
                        <span>WELCOME SuperUser!</span>
                        <span style={{ fontWeight: "300" }}>
                            Sign in to your Account
                        </span>
                    </div>
                    <SUSignInForm />
                </div>
            </div>
        </div>
    );
};

export default SUSignIn;