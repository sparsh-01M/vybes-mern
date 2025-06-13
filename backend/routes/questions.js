const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Question = require("../models/question");

// Get questions for a specific audiobook
router.get("/audiobook/:audiobookId", async (req, res) => {
  try {
    const { audiobookId } = req.params;
    const { limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(audiobookId)) {
      return res.status(400).json({ error: "Invalid audiobook ID" });
    }

    // Get random questions for the audiobook
    const questions = await Question.aggregate([
      { $match: { audiobookId: new mongoose.Types.ObjectId(audiobookId) } },
      { $sample: { size: parseInt(limit) } },
      { $project: { 
        _id: 1, 
        question: 1, 
        options: 1, 
        difficulty: 1,
        explanation: 1
      }}
    ]);

    res.json({ questions });
  } catch (err) {
    console.error("Error fetching questions:", err);
    res.status(500).json({ error: "Error fetching questions" });
  }
});

// Submit quiz answers and get score
router.post("/submit/:audiobookId", async (req, res) => {
  try {
    const { audiobookId } = req.params;
    const { answers } = req.body; // answers should be an array of { questionId, selectedAnswer }

    if (!mongoose.Types.ObjectId.isValid(audiobookId)) {
      return res.status(400).json({ error: "Invalid audiobook ID" });
    }

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: "Answers must be an array" });
    }

    // Get all questions for this audiobook
    const questions = await Question.find({ audiobookId });
    
    // Calculate score
    let correctAnswers = 0;
    const results = [];

    for (const answer of answers) {
      const question = questions.find(q => q._id.toString() === answer.questionId);
      if (question) {
        const isCorrect = question.correctAnswer === answer.selectedAnswer;
        if (isCorrect) correctAnswers++;
        
        results.push({
          questionId: answer.questionId,
          question: question.question,
          userAnswer: answer.selectedAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect,
          explanation: question.explanation
        });
      }
    }

    const score = Math.round((correctAnswers / answers.length) * 100);
    const totalQuestions = answers.length;

    res.json({
      score,
      totalQuestions,
      correctAnswers,
      results
    });
  } catch (err) {
    console.error("Error submitting quiz:", err);
    res.status(500).json({ error: "Error submitting quiz" });
  }
});

// Add sample questions for an audiobook
router.post("/add-sample-questions/:audiobookId", async (req, res) => {
  try {
    const { audiobookId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(audiobookId)) {
      return res.status(400).json({ error: "Invalid audiobook ID" });
    }

    const sampleQuestions = [
      {
        audiobookId: new mongoose.Types.ObjectId(audiobookId),
        question: "What is the main theme of this audiobook?",
        options: [
          "Personal growth and development",
          "Financial management",
          "Relationship building",
          "Career advancement"
        ],
        correctAnswer: 0,
        explanation: "The audiobook primarily focuses on personal growth and development concepts.",
        difficulty: "easy"
      },
      {
        audiobookId: new mongoose.Types.ObjectId(audiobookId),
        question: "Which concept is most emphasized throughout the book?",
        options: [
          "Time management",
          "Habit formation",
          "Goal setting",
          "Mindfulness"
        ],
        correctAnswer: 1,
        explanation: "The book heavily emphasizes the importance of forming good habits and breaking bad ones.",
        difficulty: "medium"
      },
      {
        audiobookId: new mongoose.Types.ObjectId(audiobookId),
        question: "What does the author suggest is the key to lasting change?",
        options: [
          "Making big changes quickly",
          "Small, consistent improvements",
          "Seeking external motivation",
          "Following strict schedules"
        ],
        correctAnswer: 1,
        explanation: "The author emphasizes that small, consistent improvements lead to lasting change.",
        difficulty: "medium"
      },
      {
        audiobookId: new mongoose.Types.ObjectId(audiobookId),
        question: "How does the author recommend dealing with setbacks?",
        options: [
          "Give up and try something else",
          "Ignore them and keep going",
          "Learn from them and adjust",
          "Blame external circumstances"
        ],
        correctAnswer: 2,
        explanation: "The author encourages learning from setbacks and using them as opportunities to adjust strategies.",
        difficulty: "hard"
      },
      {
        audiobookId: new mongoose.Types.ObjectId(audiobookId),
        question: "What is the recommended approach to goal setting?",
        options: [
          "Set very high goals",
          "Make goals specific and measurable",
          "Keep goals vague and flexible",
          "Focus only on short-term goals"
        ],
        correctAnswer: 1,
        explanation: "The author recommends making goals specific and measurable for better success rates.",
        difficulty: "easy"
      },
      {
        audiobookId: new mongoose.Types.ObjectId(audiobookId),
        question: "Which environment factor is most important for habit formation?",
        options: [
          "Having expensive equipment",
          "Creating a supportive environment",
          "Working in complete silence",
          "Having a large workspace"
        ],
        correctAnswer: 1,
        explanation: "Creating a supportive environment is crucial for forming and maintaining good habits.",
        difficulty: "medium"
      },
      {
        audiobookId: new mongoose.Types.ObjectId(audiobookId),
        question: "What does the author say about motivation?",
        options: [
          "It's the most important factor",
          "It's unreliable and temporary",
          "It should be your primary focus",
          "It's not necessary for success"
        ],
        correctAnswer: 1,
        explanation: "The author explains that motivation is unreliable and temporary, so systems are more important.",
        difficulty: "hard"
      },
      {
        audiobookId: new mongoose.Types.ObjectId(audiobookId),
        question: "How should you approach habit tracking?",
        options: [
          "Track everything perfectly",
          "Make it simple and visible",
          "Use complex spreadsheets",
          "Ignore tracking entirely"
        ],
        correctAnswer: 1,
        explanation: "The author recommends making habit tracking simple and visible for better consistency.",
        difficulty: "easy"
      },
      {
        audiobookId: new mongoose.Types.ObjectId(audiobookId),
        question: "What is the 'two-minute rule'?",
        options: [
          "Only work for two minutes at a time",
          "Make new habits take less than two minutes",
          "Take two-minute breaks between tasks",
          "Review goals every two minutes"
        ],
        correctAnswer: 1,
        explanation: "The two-minute rule suggests making new habits so easy they take less than two minutes to start.",
        difficulty: "medium"
      },
      {
        audiobookId: new mongoose.Types.ObjectId(audiobookId),
        question: "What does the author recommend for maintaining habits long-term?",
        options: [
          "Increasing difficulty over time",
          "Making habits enjoyable",
          "Relying on willpower",
          "Changing habits frequently"
        ],
        correctAnswer: 1,
        explanation: "The author emphasizes making habits enjoyable to maintain them long-term.",
        difficulty: "hard"
      }
    ];

    const savedQuestions = await Question.insertMany(sampleQuestions);
    console.log("Sample questions saved:", savedQuestions.length);
    res.json(savedQuestions);
  } catch (err) {
    console.error("Error adding sample questions:", err);
    res.status(500).json({ error: "Error adding sample questions" });
  }
});

module.exports = router; 