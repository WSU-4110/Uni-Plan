import React, { useState } from 'react';

//authenticate login
function authenticateLogin(username, password) {
    //check if username and password match database records
    if (username === "validUsername" && password === "validPassword") {
        return true; //authentication successful
    } 
    else {
        return false; //authentication failed
    }
}

export default function CourseSearch () {
    const [searchText, setSearchText] = useState("");
    const [term, setTerm] = useState("");
    const [results, setResults] = useState([]);

    function searchCourses(searchText, term) {
        //test database search function
        const courses = [
            { name: "Intro to Computer Science", crn: "12345", subject: "CS", keyword: "programming", term: "Spring/Summer 2026" },
            { name: "Data Structures", crn: "67890", subject: "CS", keyword: "algorithms", term: "Fall 2026" },
        ]; 

        const text=searchText.trim().toLowerCase(); //trims possible whitespace
        
        //search database for courses matching search text and term
        return courses.filter(course => {
            const matchesSearchText = 
                course.name.toLowerCase().includes(text) ||
                course.crn.toLowerCase().includes(text) ||
                course.subject.toLowerCase().includes(text) ||
                course.keyword.toLowerCase().includes(text);
            
            const matchesTerm = 
                course.term.toLowerCase() === term.toLowerCase();

            return matchesSearchText && matchesTerm; //return courses that match both search text and term
        });
    }

    const handleSearch = () => {
        const results = searchCourses(searchText, term);
        setResults(results);
    };

    return (
        //select semester drop down
        <div style={{padding: "20px"}}>
            {/*term selection*/}
            <label htmlFor="term-select">Select Semester</label>

            <select
                id="term-select"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                aria-label="Select term"
            >
                <option value="" disabled>
                    Select a term
                </option>
                <option value="Spring/Summer 2026">Spring/Summer 2026</option>
                <option value="Fall 2026">Fall 2026</option>
            </select>

            <br /><br />

            {/*course search input*/}
            <input
                type="text"
                placeholder="Course Name, CRN, Subject, or Keyword"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                aria-label="Search courses"
            />

            {/*search button*/}
            <button onClick={handleSearch}>Search</button>

            <div style={{ marginTop: "20px" }}>
                {results.length > 0 ? (
                    <ul>
                        {results.map((course, index) => (
                            <li key={index}>
                                <strong>{course.name}</strong> — CRN: {course.crn} — {course.subject}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No results found.</p>
                )}
            </div>

        </div>
    );
}

//sort results

//if invalid input, display message