"use client";

import { useState } from "react";
import Link from "next/link";
import { pickQuestions } from "@/lib/quiz";
import { DIFFICULTIES, QUESTION_COUNTS } from "@/lib/quiz/types";
import type { DifficultyKey, QuizQuestion } from "@/lib/quiz/types";

type Phase = "setup" | "playing" | "results";

export function QuizApp() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [difficulty, setDifficulty] = useState<DifficultyKey>("beginner");
  const [count, setCount] = useState(10);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [picked, setPicked] = useState<number | null>(null);

  function start() {
    const qs = pickQuestions(difficulty, count);
    setQuestions(qs);
    setAnswers(Array(qs.length).fill(null));
    setCurrent(0);
    setPicked(null);
    setPhase("playing");
  }

  function choose(optionIndex: number) {
    if (picked !== null) return; // already answered this question
    setPicked(optionIndex);
    setAnswers((prev) => {
      const next = [...prev];
      next[current] = optionIndex;
      return next;
    });
  }

  function next() {
    if (current + 1 < questions.length) {
      setCurrent((c) => c + 1);
      setPicked(null);
    } else {
      setPhase("results");
    }
  }

  function restart() {
    setPhase("setup");
    setQuestions([]);
    setAnswers([]);
    setPicked(null);
    setCurrent(0);
  }

  // --------------------------------------------------------------- SETUP
  if (phase === "setup") {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5">
          <h1 className="text-2xl font-bold text-navy">Bible Quiz</h1>
          <p className="mt-2 text-steel">
            Test your Bible knowledge. Pick a level and how many questions you
            want, then begin.
          </p>

          <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-steel">
            Difficulty
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {DIFFICULTIES.map((d) => {
              const active = difficulty === d.key;
              return (
                <button
                  key={d.key}
                  type="button"
                  disabled={!d.ready}
                  onClick={() => d.ready && setDifficulty(d.key)}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    !d.ready
                      ? "cursor-not-allowed border-steel/20 bg-ice/50 opacity-60"
                      : active
                        ? "border-sky bg-sky/10 ring-1 ring-sky"
                        : "border-steel/30 bg-white hover:border-sky"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-navy">{d.label}</span>
                    {!d.ready && (
                      <span className="rounded-full bg-ice px-2 py-0.5 text-xs text-steel">
                        Coming soon
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-steel">{d.desc}</p>
                </button>
              );
            })}
          </div>

          <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-steel">
            Number of questions
          </h2>
          <div className="mt-3 flex gap-3">
            {QUESTION_COUNTS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setCount(n)}
                className={`h-11 flex-1 rounded-xl border font-semibold transition-colors ${
                  count === n
                    ? "border-sky bg-sky text-white"
                    : "border-steel/30 bg-white text-deep hover:border-sky"
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={start}
            className="mt-8 h-12 w-full rounded-xl bg-sky font-semibold text-white transition-colors hover:bg-deep"
          >
            Start quiz
          </button>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------- PLAYING
  if (phase === "playing") {
    const q = questions[current];
    const answered = picked !== null;
    const progress = ((current + (answered ? 1 : 0)) / questions.length) * 100;

    return (
      <div className="mx-auto w-full max-w-2xl">
        {/* progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-steel">
            <span>
              Question {current + 1} of {questions.length}
            </span>
            <span>{DIFFICULTIES.find((d) => d.key === difficulty)?.label ?? difficulty}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-ice">
            <div
              className="h-full rounded-full bg-sky transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
          <h2 className="text-lg font-semibold text-navy">{q.question}</h2>

          <div className="mt-5 space-y-3">
            {q.options.map((opt, i) => {
              const isCorrect = i === q.answer;
              const isPicked = i === picked;
              let cls =
                "border-steel/30 bg-white hover:border-sky text-navy";
              if (answered) {
                if (isCorrect)
                  cls = "border-green-500 bg-green-50 text-green-800";
                else if (isPicked)
                  cls = "border-red-400 bg-red-50 text-red-700";
                else cls = "border-steel/20 bg-white text-steel";
              }
              return (
                <button
                  key={i}
                  type="button"
                  disabled={answered}
                  onClick={() => choose(i)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${cls} ${
                    answered ? "cursor-default" : ""
                  }`}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-xs font-semibold">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span>{opt}</span>
                  {answered && isCorrect && (
                    <span className="ml-auto text-green-600">✓</span>
                  )}
                  {answered && isPicked && !isCorrect && (
                    <span className="ml-auto text-red-500">✗</span>
                  )}
                </button>
              );
            })}
          </div>

          {answered && (
            <div className="mt-5 rounded-xl bg-ice p-4">
              <p className="text-sm text-navy">{q.explanation}</p>
              <p className="mt-1 text-xs font-medium text-deep">
                {q.reference}
              </p>
            </div>
          )}

          {answered && (
            <button
              type="button"
              onClick={next}
              className="mt-6 h-11 w-full rounded-xl bg-sky font-semibold text-white transition-colors hover:bg-deep"
            >
              {current + 1 < questions.length ? "Next question" : "See results"}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------- RESULTS
  const score = answers.reduce<number>(
    (s, a, i) => (a === questions[i].answer ? s + 1 : s),
    0,
  );
  const pct = Math.round((score / questions.length) * 100);
  const message =
    pct >= 90
      ? "Outstanding! 🎉"
      : pct >= 70
        ? "Well done! 👏"
        : pct >= 50
          ? "Good effort — keep studying! 📖"
          : "Keep reading the Word — you'll get there! 🙏";

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
        <p className="text-sm font-semibold uppercase tracking-wide text-steel">
          Your score
        </p>
        <p className="mt-2 text-5xl font-bold text-navy">
          {score}
          <span className="text-2xl text-steel">/{questions.length}</span>
        </p>
        <p className="mt-1 text-lg text-sky">{pct}%</p>
        <p className="mt-3 text-navy">{message}</p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={restart}
            className="h-11 rounded-xl bg-sky px-6 font-semibold text-white transition-colors hover:bg-deep"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="flex h-11 items-center justify-center rounded-xl border border-steel/30 px-6 font-semibold text-deep transition-colors hover:border-sky"
          >
            Back to dashboard
          </Link>
        </div>
      </div>

      {/* Review */}
      <h2 className="mt-8 mb-3 text-lg font-bold text-navy">Review</h2>
      <ul className="space-y-3">
        {questions.map((q, i) => {
          const a = answers[i];
          const correct = a === q.answer;
          return (
            <li
              key={q.id}
              className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5"
            >
              <div className="flex items-start gap-2">
                <span
                  className={`mt-0.5 text-lg ${correct ? "text-green-600" : "text-red-500"}`}
                >
                  {correct ? "✓" : "✗"}
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-navy">
                    {i + 1}. {q.question}
                  </p>
                  {!correct && a !== null && (
                    <p className="mt-1 text-sm text-red-600">
                      Your answer: {q.options[a]}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-green-700">
                    Correct: {q.options[q.answer]}
                  </p>
                  <p className="mt-2 text-sm text-steel">{q.explanation}</p>
                  <p className="mt-1 text-xs font-medium text-deep">
                    {q.reference}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
