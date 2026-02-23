import React, { useState } from 'react';

//creating pop-up error message
export default function ErrorMessage() {
    const [errorMessage, setErrorMessage] = useState("");

    //function to show error message in CourseSearch.jsx
    function showError(message) {
        setErrorMessage(message);
    }

    return (
        <div>
            {errorMessage !== "" && (
                <div className="fixed top-3 right-4 z-50">
                    <div className="relative bg-red-600 text-white px-3 py-2 rounded shadow-lg max-w-xs sm:max-w-sm md:max-w-md w-fit">
                        
                        {/* X button */}
                        <button
                            onClick={() => setErrorMessage(false)}
                            className="absolute top-2 right-2 text-white hover:text-gray-200 text-xl leading-none">
                                    
                            ✕
                        </button>
                        
                        <p className="pr-6 break-words text-center">
                            {errorMessage}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}