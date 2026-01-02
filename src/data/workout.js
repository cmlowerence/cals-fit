export const getWorkoutForDay = (day) => {
  const isRest = [4, 7, 11, 14, 18, 21, 28].includes(day);
  
  if (isRest) return { title: `Day ${day}: Rest & Recovery`, type: "rest", exercises: [] };

  if (day === 1) return {
    title: "Day 1: Full Body Basics",
    description: "Focus on strict form. Quality over quantity.",
    exercises: [
      { name: "Push-ups", sets: 3, reps: 12, type: "reps", rest: 60, tip: "Keep body straight. Chest to floor." },
      { name: "Squats", sets: 3, reps: 15, type: "reps", rest: 60, tip: "Weight on heels. Go deep." },
      { name: "Plank", sets: 3, duration: 30, type: "timer", rest: 45, tip: "Squeeze glutes. Don't sag." },
      { name: "Lunges", sets: 3, reps: 10, type: "reps", rest: 60, tip: "10 reps per leg. Back knee low." }
    ]
  };

  // Generic fallback for Day 2-30 (You can edit this later)
  return {
    title: `Day ${day}: Intensity`,
    description: "Keep the heart rate up.",
    exercises: [
      { name: "Push-ups", sets: 4, reps: 15, type: "reps", rest: 60, tip: "Control the descent." },
      { name: "Squats", sets: 4, reps: 20, type: "reps", rest: 60, tip: "Explosive movement up." },
      { name: "Plank", sets: 3, duration: 45, type: "timer", rest: 45, tip: "Hold steady." }
    ]
  };
};
