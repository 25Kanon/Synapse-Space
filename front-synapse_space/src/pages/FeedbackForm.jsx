import React, { useState } from "react";

export default function FeedbackForm() {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleRating = (index) => {
    setRating(index);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
        const response = await fetch("http://localhost:8000/api/feedback/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ rating, feedback }),
          });
        
          console.log(response)
  
      if (response.ok) {
        setSubmitted(true);  // Display success message
        setFeedback("");     // Clear the feedback input
        setRating(0);        // Reset the rating
      } else {
        const errorData = await response.json();
        console.error("Failed to submit feedback:", errorData);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-base-300">
      <div className="w-full max-w-md">
        <div className="p-8 rounded-lg shadow-xl bg-base-100">
        {submitted ? (
            <div className="text-2xl font-bold text-center text-white">
                Thank you for your feedback!
            </div>
            ) : (
            <>
                <h1 className="mb-4 text-2xl font-bold text-center text-primary">
                We value your opinion.
                </h1>
                <p className="mb-6 text-center text-accent">
                How would you rate your overall experience?
                </p>
                <div className="flex justify-center mb-4">
                {[1, 2, 3, 4, 5].map((index) => (
                    <button
                    key={index}
                    onClick={() => handleRating(index)}
                    className={`w-8 h-8 rounded-full border ${
                        index <= rating
                        ? "bg-primary text-base-100"
                        : "border-gray-300 text-gray-400"
                    }`}
                    >
                    ★
                    </button>
                ))}
                </div>
                <form onSubmit={handleSubmit}>
                <label
                    htmlFor="feedback"
                    className="block mb-2 text-sm font-bold text-accent"
                >
                    Kindly take a moment to tell us what you think.
                </label>
                <textarea
                    id="feedback"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-primary"
                    placeholder="Write your feedback here..."
                    rows="4"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    required
                ></textarea>
                <button
                    type="submit"
                    className="w-full px-4 py-2 mt-4 font-semibold text-white transition-all rounded-lg bg-primary hover:bg-info"
                >
                    Share my feedback
                </button>
                </form>
            </>
            )}
        </div>
      </div>
    </div>
  );
}
