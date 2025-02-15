import React, { useState, useEffect } from "react";
import { Card, Button, Radio, Checkbox } from "antd";
import { run } from "../../gemini/aiinstructions";
import "./QuizPage.css";

const QuizPage = () => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizData, setQuizData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSelect = (questionId, value) => {
    setSelectedAnswers({ ...selectedAnswers, [questionId]: value });
  };

  const fetchQuiz = async () => {
    setLoading(true);
    setError(null);
    setQuizData([]);

    const inputContent = "";

    try {
      const response = await run(inputContent);
      const trimmedResponse = response.replace(/^```json\n|\n```$/g, "");
      const parsedData = JSON.parse(trimmedResponse);
      
      if (Array.isArray(parsedData)) {
        setQuizData(parsedData);
      } else {
        setError("Invalid data format received.");
      }
    } catch (error) {
      setError("Failed to fetch quiz. Please try again.");
      console.error("Error fetching quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Updated quizData:", quizData);
  }, [quizData]);

  return (
    <div className="quiz-page">
      <h2 className="text-xl font-bold mb-4">Fetch a Science Quiz</h2>
      <button 
        onClick={fetchQuiz} 
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? "Fetching..." : "Get Quiz"}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}

      {quizData.length > 0 && quizData.map((quiz) => (
        <Card key={quiz.id} className="quiz-card">
          <h3>{quiz.question}</h3>
          {quiz.type === "single" ? (
            <Radio.Group
              className="quiz-options"
              onChange={(e) => handleSelect(quiz.id, e.target.value)}
              value={selectedAnswers[quiz.id]}
            >
              {quiz.options.map((option) => (
                <Radio.Button
                  key={option}
                  value={option}
                  className={
                    selectedAnswers[quiz.id] === option ? "selected-option" : ""
                  }
                >
                  {option}
                </Radio.Button>
              ))}
            </Radio.Group>
          ) : (
            <Checkbox.Group
              className="quiz-options"
              onChange={(checkedValues) => handleSelect(quiz.id, checkedValues)}
              value={selectedAnswers[quiz.id] || []}
            >
              {quiz.options.map((option) => (
                <Checkbox
                  key={option}
                  value={option}
                  className={
                    selectedAnswers[quiz.id]?.includes(option) ? "selected-option" : ""
                  }
                >
                  {option}
                </Checkbox>
              ))}
            </Checkbox.Group>
          )}
        </Card>
      ))}
      <Button type="primary" className="submit-btn">Submit</Button>
    </div>
  );
};

export default QuizPage;