'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
}

export interface QuizContentProps {
  data: {
    title: string;
    description?: string;
    questions: QuizQuestion[];
  };
}

export default function QuizContent({ data }: QuizContentProps) {
  // Validate that data and questions exist
  if (!data || !data.questions || !Array.isArray(data.questions)) {
    return (
      <div className="w-full max-w-2xl h-full flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 flex items-center justify-center flex-1">
          <div className="text-center">
            <h2 className="text-xl font-bold text-red-500 mb-2">
              Invalid Quiz Data
            </h2>
            <p className="text-gray-600">
              The quiz content couldn't be loaded properly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<number[]>(
    Array(data.questions.length).fill(-1)
  );
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = data.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === data.questions.length - 1;
  const hasAnswered = selectedOptions[currentQuestionIndex] !== -1;

  const handleSelectOption = (optionIndex: number) => {
    // If already answered, don't allow changing
    if (hasAnswered) return;

    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[currentQuestionIndex] = optionIndex;
    setSelectedOptions(newSelectedOptions);
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      setShowResults(true);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOptions(Array(data.questions.length).fill(-1));
    setShowResults(false);
  };

  const calculateScore = () => {
    return data.questions.reduce((score, question, index) => {
      return selectedOptions[index] === question.correctOptionIndex
        ? score + 1
        : score;
    }, 0);
  };

  // Additional validation check for currentQuestion
  if (!currentQuestion) {
    return (
      <div className="w-full max-w-2xl h-full flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 flex items-center justify-center flex-1">
          <div className="text-center">
            <h2 className="text-xl font-bold text-red-500 mb-2">
              Question Error
            </h2>
            <p className="text-gray-600">
              The current question couldn't be loaded.
            </p>
            <button
              onClick={handleRestartQuiz}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Reset Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Helper to render tick or cross icon
  const renderIcon = (idx: number) => {
    if (!hasAnswered) {
      return String.fromCharCode(65 + idx); // A, B, C, D etc.
    }

    const isCorrect = idx === currentQuestion.correctOptionIndex;
    const isSelected = selectedOptions[currentQuestionIndex] === idx;

    if (isSelected || isCorrect) {
      if (isCorrect) {
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path
              fillRule="evenodd"
              d="M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 0 1 1.04-.208Z"
              clipRule="evenodd"
            />
          </svg>
        );
      } else {
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4"
          >
            <path
              fillRule="evenodd"
              d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        );
      }
    }

    return String.fromCharCode(65 + idx);
  };

  if (showResults) {
    const score = calculateScore();
    const percentage = Math.round((score / data.questions.length) * 100);

    return (
      <div className="w-full max-w-2xl h-full flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-center mb-6">
            {data.title} - Results
          </h1>

          <div className="text-center mb-6">
            <div className="text-5xl font-bold mb-2">
              {score} / {data.questions.length}
            </div>
            <div className="text-xl">Your score: {percentage}%</div>
          </div>
        </div>

        {/* Scrollable results container */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <div className="space-y-4 mb-6">
            {data.questions.map((question, index) => (
              <div
                key={question.id}
                className={`p-4 rounded-lg ${
                  selectedOptions[index] === question.correctOptionIndex
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <p className="font-medium">
                  Question {index + 1}: {question.question}
                </p>
                <p className="mt-1">
                  <span className="font-semibold">Your answer:</span>{' '}
                  {selectedOptions[index] >= 0
                    ? question.options[selectedOptions[index]]
                    : 'Not answered'}
                </p>
                <p className="mt-1">
                  <span className="font-semibold">Correct answer:</span>{' '}
                  {question.options[question.correctOptionIndex]}
                </p>
                {question.explanation && (
                  <p className="mt-2 text-sm italic">{question.explanation}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Fixed position footer with restart button */}
        <div className="p-4 border-t bg-white">
          <div className="flex justify-center">
            <button
              onClick={handleRestartQuiz}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Restart Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl h-full flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 flex-1 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-2">{data.title}</h1>
        {data.description && (
          <p className="mb-6 text-gray-600">{data.description}</p>
        )}

        <div className="mb-4 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Question {currentQuestionIndex + 1} of {data.questions.length}
          </span>
          <div className="w-32 h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-blue-600 rounded-full"
              style={{
                width: `${
                  ((currentQuestionIndex + 1) / data.questions.length) * 100
                }%`,
              }}
            />
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {currentQuestion.question}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectOption(idx)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  !hasAnswered
                    ? selectedOptions[currentQuestionIndex] === idx
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                    : idx === currentQuestion.correctOptionIndex
                    ? 'bg-green-100 border-green-500'
                    : selectedOptions[currentQuestionIndex] === idx &&
                      idx !== currentQuestion.correctOptionIndex
                    ? 'bg-red-100 border-red-500'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                      selectedOptions[currentQuestionIndex] === idx
                        ? hasAnswered &&
                          idx !== currentQuestion.correctOptionIndex
                          ? 'bg-red-500 text-white'
                          : 'bg-blue-500 text-white'
                        : hasAnswered &&
                          idx === currentQuestion.correctOptionIndex
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200'
                    }`}
                  >
                    {renderIcon(idx)}
                  </div>
                  <span>{option}</span>
                </div>
              </div>
            ))}
          </div>

          {hasAnswered && currentQuestion.explanation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md"
            >
              <p className="text-sm">
                <span className="font-semibold">Explanation:</span>{' '}
                {currentQuestion.explanation}
              </p>
            </motion.div>
          )}
        </div>
      </div>

      <div className="p-4 border-t bg-white">
        <div className="flex justify-end">
          {hasAnswered && (
            <button
              onClick={handleNextQuestion}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {isLastQuestion ? 'Show Results' : 'Next Question'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
