//importing react and useState hook
import { useState } from "react";

//creating a functional component named Login
function Login()
{
    //defining two state variables, username and password, and their corresponding setter functions
    const[username, setUsername] = useState("");
    const[password, setPassword] = useState("");

    //defining a function named handleSubmit that takes an event as an argument
    const handleSubmit = (event) =>
    {
        //preventing the default behavior of the form submission
        event.preventDefault();
        //logging the username to the console
        console.log("Username: ", username);
        console.log("Password: ", password);
    }
}