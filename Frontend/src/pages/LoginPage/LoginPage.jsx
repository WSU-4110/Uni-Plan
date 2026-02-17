import { useState } from "react";
import "./LoginPage.css";

import wayneLogo from "../../assets/images/wayneLogo.png";
import person from "../../assets/images/person.png";
import lock from "../../assets/images/lock.png";
import checkmark from "../../assets/images/checkmark.png";

function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log("Username: ", username);
        console.log("Password: ", password);
    };

    return (
        <div className="login-page">
            <div className="top-header">

                <img src={wayneLogo} alt="Wayne State University Logo" className="header-logo" />
                <h1 className="header-title">WAYNE STATE UNIVERSITY</h1>
            </div>

            <div className="login-content">
                <h2>Academica Login</h2>

                <p>You have reached a page that requires authentication,
                    please enter your Username and password.</p>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <div className="label-row">
                            <img src={person} className="label-icon" alt="User icon" />
                            <label className="input-label">Your Username</label>
                        </div>

                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="full-input"
                        />
                    </div>

                    <div className="input-group">
                        <div className="label-row">
                            <img src={lock} className="label-icon" alt="Lock icon" />
                            <label className="input-label">Your Password</label>
                        </div>

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="full-input"
                        />
                    </div>

                    <div className="input-group">
                        <button type="submit" className="login-button">
                            <img src={checkmark} className="button-icon" alt="Checkmark icon" />
                            Login
                        </button>

                    </div>

                </form>

                <p>By using this service you agree to adhere to WSU computing policies and guidelines.</p>
            </div>
        </div>
    );
}

export default LoginPage;
