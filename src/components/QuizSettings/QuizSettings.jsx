import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  InputNumber,
  Button,
  message,
  Card,
  Radio,
  Checkbox,
  Input,
  Form,
} from "antd";
import { auth, db } from "../../firebase";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import { run } from "../../gemini/aiinstructions";
import "./QuizSettings.css";

const { Option } = Select;

const QuizSettings = () => {
  const navigate = useNavigate();
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [customConcept, setCustomConcept] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [settings, setSettings] = useState({
    concept: null,
    numQuestions: null,
    difficulty: null,
    questionType: null,
    timeLimit: null,
  });
  const [quizData, setQuizData] = useState(null);
  const [quizId, setQuizId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [acceptloading, setAcceptLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSelect = (questionId, value) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: value }));
    setError("")
  };

  const handleConceptChange = (value) => {
    if (value === "other") {
      setSettings((prev) => ({ ...prev, concept: customConcept }));
    } else {
      setSettings((prev) => ({ ...prev, concept: value }));
      setCustomConcept("");
      
    }
    setError("")
  };
  const handleTimeChange = (value) => {
    if (value === "custom") {
      setSettings((prev) => ({ ...prev, timeLimit: customTime }));
    } else {
      setSettings((prev) => ({ ...prev, timeLimit: value }));
      setCustomConcept("");
    }
    setError("")
  };

  const handleCustomConceptChange = (e) => {
    const newValue = e.target.value;
    setCustomConcept(newValue);
    setSettings((prev) => ({ ...prev, concept: newValue }));
    setError("")
  };

  const handleCustomTimeChange = (e) => {
    const newValue = e.target.value;
    setCustomTime(newValue);
    setSettings((prev) => ({ ...prev, timeLimit: newValue }));
    setError("")
  };

  const fetchQuiz = async () => {
    if (!validateFields()) return;
    setLoading(true);
    setError(null);
    setQuizData([]);

    try {
      const user = auth.currentUser;
      if (!user) {
        setError("User not logged in.");
        return;
      }

      const response = await run(JSON.stringify(settings, null, 2));
      const trimmedResponse = response.replace(/^```json\n|\n```$/g, "");
      const parsedData = JSON.parse(trimmedResponse);

      if (Array.isArray(parsedData)) {
        setQuizData(parsedData);

        // Create a new quiz reference
        const quizRef = doc(collection(db, "quizzes"));
        const newQuizId = quizRef.id;
        setQuizId(newQuizId);

        // Temporarily store quiz settings
        await setDoc(quizRef, {
          quizId: newQuizId,
          concept: settings.concept,
          num_of_questions: settings.numQuestions,
          difficulty_level: settings.difficulty,
          question_types: settings.questionType,
          time_limit: settings.timeLimit,
          created_by: user.uid,
          created_at: new Date(),
          question_ids: [],
        });

        message.success("Quiz generated successfully!");
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

  const handleAcceptQuiz = async () => {
    if (!quizId || !quizData || quizData.length === 0) {
      message.error("No quiz data available.");
      return;
    }

    try {
      setAcceptLoading(true);
      const user = auth.currentUser;
      if (!user) {
        message.error("User not logged in.");
        return;
      }

      const questionPromises = quizData.map(async (quiz) => {
        const questionRef = doc(collection(db, "questions"));
        const questionId = questionRef.id;

        await setDoc(questionRef, {
          questionId,
          quizId,
          id: quiz.id,
          question: quiz.question,
          options: quiz.options,
          correct_answers: quiz.answer,
        });

        return questionId;
      });

      const questionIds = await Promise.all(questionPromises);

      // Update the quiz with the saved question IDs
      const quizRef = doc(db, "quizzes", quizId);
      await setDoc(quizRef, { question_ids: questionIds }, { merge: true });

      message.success("Quiz saved successfully!");
      navigate(`/all-quizzes`);
    } catch (error) {
      message.error("Failed to save quiz.");
      console.error("Error saving quiz:", error);
    } finally {
      setAcceptLoading(false);
    }
  };

  const handleDiscardQuiz = () => {
    setQuizData(null);
    setQuizId(null);
    message.info("Quiz discarded.");
    setError("")
  };

  useEffect(() => {
    console.log("Updated quizData:", quizData);
  }, [quizData]);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setError("")
  };
  const validateFields = () => {
    if (
      !settings.concept || 
      (settings.concept === customConcept && !customConcept) || 
      !settings.numQuestions || 
      !settings.difficulty || 
      !settings.questionType || 
      !settings.timeLimit || 
      (settings.timeLimit === customTime && !customTime)
    ) {
      setError("Please fill all required fields.");
      return false;
    }
    return true;
  };

  return (
    <div>
      <div className="quiz-settings">
       
        <Select
          placeholder="Select Concept"
          className="quiz-dropdown"
          onChange={handleConceptChange}
          value={settings.concept === customConcept ? "other" : settings.concept}
        >
          <Option value="java">Java</Option>
          <Option value="python">Python</Option>
          <Option value="javascript">JavaScript</Option>
          <Option value="other">Other</Option>
        </Select>

        {settings.concept === customConcept && (
          <Input
            placeholder="Enter Custom Concept"
            className="quiz-input"
            value={customConcept}
            onChange={handleCustomConceptChange}
          />
        )}

        <InputNumber
          min={1}
          max={50}
          placeholder="No. of Questions"
          className="quiz-input"
          onChange={(value) => handleChange("numQuestions", value)}
        />

        <Select
          placeholder="Difficulty Level"
          className="quiz-dropdown"
          onChange={(value) => handleChange("difficulty", value)}
          
        >
          <Option value="easy">Easy</Option>
          <Option value="medium">Medium</Option>
          <Option value="hard">Hard</Option>
        </Select>

        <Select
          placeholder="Type of Questions"
          className="quiz-dropdown"
          onChange={(value) => handleChange("questionType", value)}
        >
          <Option value="multiple-choice">Multiple Choice</Option>
          <Option value="multi-select">Multi-Select</Option>
        </Select>

        <Select
          placeholder="Select Time Limit (minutes)"
          className="quiz-dropdown"
          onChange={handleTimeChange}
          value={settings.timeLimit === customTime ? "custom" : settings.timeLimit}
        >
          <Option value="5">5 minutes</Option>
          <Option value="10">10 minutes</Option>
          <Option value="15">15 minutes</Option>
          <Option value="30">30 minutes</Option>
          <Option value="custom">Custom</Option>
        </Select>

        {settings.timeLimit === customTime && (
          <Input
            placeholder="Enter Custom Time (minutes)"
            className="quiz-input"
            value={customTime}
            onChange={handleCustomTimeChange}
          />
        )}

        <Button
          type="primary"
          className="quiz-button"
          onClick={fetchQuiz}
          loading={loading}
        >
          {loading ? "Generating..." : "Generate Quiz"}
        </Button>
        {error && <p className="error">{error}</p>}
      </div>

      <div>
        {quizData &&
          quizData.length > 0 &&
          quizData.map((quiz) => (
            <Card key={quiz.question} className="quiz-card">
              <h3>{quiz.question}</h3>
              {quiz.type === "single" ? (
                <Radio.Group
                  className="quiz-options"
                  onChange={(e) => handleSelect(quiz.id, e.target.value)}
                  value={selectedAnswers[quiz.id]}
                >
                  {quiz.options.map((option) => (
                    <Radio.Button key={option} value={option}>
                      {option}
                    </Radio.Button>
                  ))}
                </Radio.Group>
              ) : (
                <Checkbox.Group
                  className="quiz-options"
                  onChange={(checkedValues) =>
                    handleSelect(quiz.id, checkedValues)
                  }
                  value={selectedAnswers[quiz.id] || []}
                >
                  {quiz.options.map((option) => (
                    <Checkbox key={option} value={option}>
                      {option}
                    </Checkbox>
                  ))}
                </Checkbox.Group>
              )}
            </Card>
          ))}
        {quizData && quizData.length > 0 && (
          <div className="quiz-actions">
            <Button type="danger" className="discard-btn" onClick={handleDiscardQuiz}>
              Discard
            </Button>
            <Button
              type="primary"
              className="accept-btn"
              onClick={handleAcceptQuiz}
              loading={acceptloading}
            >
              Accept
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizSettings;
