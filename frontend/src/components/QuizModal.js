import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import config from '../config/config';
import './QuizModal.css';

export default function QuizModal({ isOpen, onClose, audiobookId, audiobookTitle }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (isOpen && audiobookId) {
      fetchQuestions();
    }
  }, [isOpen, audiobookId]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.BACKEND_URL}/questions/audiobook/${audiobookId}?limit=10`);
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      const data = await response.json();
      setQuestions(data.questions);
      setCurrentQuestion(0);
      setAnswers({});
      setShowResults(false);
      setResults(null);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to load quiz questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, selectedAnswer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: selectedAnswer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      toast.warning('Please answer all questions before submitting');
      return;
    }

    setSubmitting(true);
    try {
      const answersArray = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
        questionId,
        selectedAnswer: parseInt(selectedAnswer)
      }));

      const response = await fetch(`${config.BACKEND_URL}/questions/submit/${audiobookId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers: answersArray }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit quiz');
      }

      const data = await response.json();
      setResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setResults(null);
  };

  const handleClose = () => {
    onClose();
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setResults(null);
  };

  if (!isOpen) return null;

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="quiz-modal-overlay">
      <div className="quiz-modal">
        <div className="quiz-modal-header">
          <h2>Test Your Knowledge</h2>
          <button className="quiz-close-btn" onClick={handleClose}>
            ×
          </button>
        </div>

        {loading ? (
          <div className="quiz-loading">
            <div className="quiz-spinner"></div>
            <p>Loading quiz questions...</p>
          </div>
        ) : showResults ? (
          <div className="quiz-results">
            <div className="results-header">
              <h3>Quiz Results</h3>
              <div className="score-display">
                <div className="score-circle">
                  <span className="score-number">{results.score}%</span>
                  <span className="score-label">Score</span>
                </div>
                <div className="score-details">
                  <p>{results.correctAnswers} out of {results.totalQuestions} correct</p>
                </div>
              </div>
            </div>

            <div className="results-breakdown">
              <h4>Question Breakdown:</h4>
              {results.results.map((result, index) => (
                <div key={index} className={`result-item ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="result-question">
                    <span className="question-number">Q{index + 1}:</span>
                    <span className="question-text">{result.question}</span>
                  </div>
                  <div className="result-answer">
                    <span className="answer-label">Your answer:</span>
                    <span className={`answer-text ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                      {result.question.options[result.userAnswer]}
                    </span>
                  </div>
                  {!result.isCorrect && (
                    <div className="correct-answer">
                      <span className="answer-label">Correct answer:</span>
                      <span className="answer-text correct">
                        {result.question.options[result.correctAnswer]}
                      </span>
                    </div>
                  )}
                  {result.explanation && (
                    <div className="explanation">
                      <span className="explanation-label">Explanation:</span>
                      <span className="explanation-text">{result.explanation}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="results-actions">
              <button className="quiz-btn restart-btn" onClick={handleRestart}>
                Take Quiz Again
              </button>
              <button className="quiz-btn close-btn" onClick={handleClose}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="quiz-content">
            <div className="quiz-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
              <span className="progress-text">
                Question {currentQuestion + 1} of {questions.length}
              </span>
            </div>

            <div className="question-container">
              <h3 className="question-text">{currentQ?.question}</h3>
              
              <div className="options-container">
                {currentQ?.options.map((option, index) => (
                  <label key={index} className="option-label">
                    <input
                      type="radio"
                      name={`question-${currentQ._id}`}
                      value={index}
                      checked={answers[currentQ._id] === index}
                      onChange={() => handleAnswerSelect(currentQ._id, index)}
                      className="option-input"
                    />
                    <span className="option-text">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="quiz-actions">
              <button
                className="quiz-btn prev-btn"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                Previous
              </button>
              
              {currentQuestion < questions.length - 1 ? (
                <button
                  className="quiz-btn next-btn"
                  onClick={handleNext}
                  disabled={!answers[currentQ?._id]}
                >
                  Next
                </button>
              ) : (
                <button
                  className="quiz-btn submit-btn"
                  onClick={handleSubmit}
                  disabled={submitting || Object.keys(answers).length < questions.length}
                >
                  {submitting ? 'Submitting...' : 'Submit Quiz'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 