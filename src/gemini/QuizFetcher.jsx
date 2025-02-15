import { useState } from "react";
import { run } from "./aiinstructions";

const QuizFetcher = () => {
    const [quizData, setQuizData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchQuiz = async () => {
        setLoading(true);
        setError(null);
        setQuizData(null);

        const inputContent = JSON.stringify({
    
        });

        try {
            const response = await run(inputContent);
            const trimmedResponse = response.replace(/^```json\n|\n```$/g, ''); // Remove ```json and ```
            console.log(trimmedResponse);
            
            setQuizData(trimmedResponse);
        } catch (error) {
            setError("Failed to fetch quiz. Please try again.");
            console.error("Error fetching quiz:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 border rounded-lg shadow-md max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4">Fetch a Science Quiz</h2>
            <button 
                onClick={fetchQuiz} 
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
                {loading ? "Fetching..." : "Get Quiz"}
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
            {quizData && (
                <pre className="mt-4 p-2 bg-gray-100 border rounded">{JSON.stringify(quizData, null, 2)}</pre>
            )}
        </div>
    );
};

export default QuizFetcher;