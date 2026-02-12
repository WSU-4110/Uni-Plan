import { useState } from "react";
import Login from "./LoginPage/LoginPage.jsx";


function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log("Username: ", username);
        console.log("Password: ", password);
    };

    return (
        <div style={{ maxWidth: "400px", margin: "50px auto" }}>
            {/* creating a heading for the login form */}
            <h2>Login</h2>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="AccessID"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default Login;