import { useState } from "react";
import "./LoginPage.css";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log("Username: ", username);
        console.log("Password: ", password);
    };

    return (
        <div style={{margin: "50px auto" }}>
            <h1>Wayne State University</h1>
            <h2>Academica Login</h2>

            <p>You have reached a page that requires authentication,
                please enter your Wayne State AccessID and password.</p>

            <form onSubmit={handleSubmit}>
                <p>Your Wayne State AccessID</p>
                <input
                    type="text"
                    placeholder="AccessID"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <br/>

                <p>Your Password</p>
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <br/>

                <button type="submit">Login</button>
            </form>

            <p>Forgot your AccessID or password?</p>

            <p>Don't have an AccessID or password?</p>

            <p>Need help with other WSU technologies?</p>

            <p>By using this service you agree to adhere to WSU computing policies and guidelines.</p>
        </div>
    );
}

export default Login;