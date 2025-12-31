import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, Clock, RotateCcw, ChevronLeft, Trophy, Calendar } from 'lucide-react';

// --- DATA: THE 30 DAY PLAN LOGIC ---
const getWorkoutForDay = (day) => {
  const isRest = [4, 7, 11, 14, 18, 21, 28].includes(day);
  
  if (isRest) return { title: "Rest & Recovery", type: "rest", exercises: [] };

  // Phase 1: Foundation (Days 1-7)
  if (day <= 7) {
    if (day === 1) return {
      title: "Day 1: Full Body Basics",
      exercises: [
        { name: "Push-ups", sets: 3, reps: 12, type: "reps" },
        { name: "Bodyweight Squats", sets: 3, reps: 15, type: "reps" },
        { name: "Plank", sets: 3, duration: 30, type: "timer" },
        { name: "Lunges", sets: 3, reps: 10, type: "reps" } // 10 per leg
      ]
    };
    if (day === 2) return {
      title: "Day 2: Core & Cardio",
      exercises: [
        { name: "Mountain Climbers", sets: 3, duration: 30, type: "timer" },
        { name: "Bicycle Crunches", sets: 3, reps: 30, type: "reps" }, // 15 per side
        { name: "Leg Raises", sets: 3, reps: 10, type: "reps" }
      ]
    };
    if (day === 3) return {
      title: "Day 3: Upper Body Focus",
      exercises: [
        { name: "Wide-Grip Push-ups", sets: 3, reps: 10, type: "reps" },
        { name: "Tricep Dips", sets: 3, reps: 10, type: "reps" },
        { name: "Pike Push-ups", sets: 3, reps: 8, type: "reps" },
        { name: "Superman Hold", sets: 3, reps: 10, type: "reps" }
      ]
    };
    if (day === 5) return {
      title: "Day 5: Lower Body Power",
      exercises: [
        { name: "Sumo Squats", sets: 3, reps: 15, type: "reps" },
        { name: "Glute Bridges", sets: 3, reps: 15, type: "reps" },
        { name: "Calf Raises", sets: 3, reps: 20, type: "reps" },
        { name: "Wall Sit", sets: 3, duration: 45, type: "timer" }
      ]
    };
    if (day === 6) return {
      title: "Day 6: Mini Circuit",
      description: "Perform 4 Rounds. Rest 90s between rounds.",
      exercises: [
        { name: "Push-ups", sets: 4, reps: 10, type: "reps" },
        { name: "Squats", sets: 4, reps: 10, type: "reps" },
        { name: "Sit-ups", sets: 4, reps: 10, type: "reps" },
        { name: "Jumping Jacks", sets: 4, reps: 20, type: "reps" }
      ]
    };
  }

  // Phase 2: Intensity (Days 8-14)
  if (day <= 14) {
    if (day === 8) return {
       title: "Day 8: Upper Body Overload",
       exercises: [
         { name: "Diamond Push-ups", sets: 4, reps: 8, type: "reps" },
         { name: "Decline Push-ups", sets: 4, reps: 8, type: "reps" },
         { name: "Doorframe Rows", sets: 4, reps: 12, type: "reps" }
       ]
    };
    // ... Simplified logic for demo (You can expand this for days 9-14 based on the plan)
    return {
      title: `Day ${day}: Intensity Phase`,
      exercises: [
        { name: "Burpees", sets: 3, reps: 10, type: "reps" },
        { name: "High Knees", sets: 3, duration: 45, type: "timer" },
        { name: "Squat Pulses", sets: 3, duration: 30, type: "timer" }
      ]
    };
  }

  // Default fallback for Phase 3 & 4 (Demo purposes)
  return {
    title: `Day ${day}: Beast Mode`,
    exercises: [
      { name: "Push-ups", sets: 5, reps: 20, type: "reps" },
      { name: "Jump Squats", sets: 5, reps: 15, type: "reps" },
      { name: "Plank", sets: 4, duration: 60, type: "timer" }
    ]
  };
};

// --- COMPONENTS ---

const Timer = ({ duration, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      onComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, onComplete]);

  const progress = ((duration - timeLeft) / duration) * 100;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-xl mb-4 w-full">
      <div className="text-6xl font-bold font-mono text-blue-400 mb-4">
        {timeLeft}s
      </div>
      <div className="w-full bg-gray-700 h-4 rounded-full mb-6 overflow-hidden">
        <div 
          className="bg-blue-500 h-full transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex gap-4">
        <button 
          onClick={() => setIsActive(!isActive)}
          className={`px-8 py-3 rounded-lg font-bold text-white ${isActive ? 'bg-yellow-600' : 'bg-green-600'}`}
        >
          {isActive ? 'PAUSE' : 'START TIMER'}
        </button>
        <button 
          onClick={() => { setIsActive(false); setTimeLeft(duration); }}
          className="px-4 py-3 bg-gray-600 rounded-lg text-white"
        >
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
};

const ActiveSession = ({ workout, onFinish, onCancel }) => {
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);

  const exercise = workout.exercises[currentExIndex];
  const isLastExercise = currentExIndex === workout.exercises.length - 1;
  const isLastSet = currentSet === exercise.sets;

  const handleNext = () => {
    if (isLastSet) {
      if (isLastExercise) {
        onFinish();
      } else {
        setCurrentExIndex(prev => prev + 1);
        setCurrentSet(1);
        setIsResting(false); // Can add a "Next Exercise Rest" screen here if desired
      }
    } else {
      setCurrentSet(prev => prev + 1);
      // Optional: Auto-trigger rest mode here
    }
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onCancel} className="text-gray-400 hover:text-white">
          <ChevronLeft /> Exit
        </button>
        <span className="text-sm font-bold text-blue-400">
          Exercise {currentExIndex + 1}/{workout.exercises.length}
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold text-white text-center mb-2">{exercise.name}</h2>
        <div className="text-xl text-gray-400 mb-8">
          Set <span className="text-white font-bold">{currentSet}</span> of {exercise.sets}
        </div>

        {exercise.type === 'timer' ? (
          <Timer duration={exercise.duration} onComplete={() => {}} />
        ) : (
          <div className="flex flex-col items-center justify-center p-10 bg-gray-800 rounded-xl mb-8 w-full">
            <span className="text-6xl font-bold text-white mb-2">{exercise.reps}</span>
            <span className="text-xl text-gray-400 uppercase tracking-wider">Reps</span>
          </div>
        )}

        <button 
          onClick={handleNext}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-lg flex items-center justify-center gap-2 transition-all mt-auto"
        >
          {isLastSet && isLastExercise ? (
            <> <Trophy /> FINISH WORKOUT </>
          ) : (
            <> <CheckCircle /> {isLastSet ? "NEXT EXERCISE" : "SET COMPLETE"} </>
          )}
        </button>
      </div>
    </div>
  );
};

export default function WorkoutApp() {
  const [completedDays, setCompletedDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [mode, setMode] = useState('dashboard'); // dashboard, view, session

  // Load progress from local storage
  useEffect(() => {
    const saved = localStorage.getItem('betterMeProgress');
    if (saved) setCompletedDays(JSON.parse(saved));
  }, []);

  const saveProgress = (day) => {
    const newCompleted = [...new Set([...completedDays, day])];
    setCompletedDays(newCompleted);
    localStorage.setItem('betterMeProgress', JSON.stringify(newCompleted));
    setMode('dashboard');
    setSelectedDay(null);
  };

  const currentWorkout = selectedDay ? getWorkoutForDay(selectedDay) : null;

  // --- RENDER: DASHBOARD ---
  if (mode === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <header className="mb-8 mt-4">
          <h1 className="text-2xl font-bold text-center mb-1">30-Day Calisthenics</h1>
          <p className="text-center text-gray-400 text-sm">BetterMe Challenge</p>
          <div className="flex justify-center mt-4">
             <div className="bg-gray-800 px-4 py-2 rounded-full text-sm">
               Progress: <span className="text-blue-400 font-bold">{Math.round((completedDays.length / 30) * 100)}%</span>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-5 gap-3 max-w-md mx-auto">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
            const isCompleted = completedDays.includes(day);
            const isRest = [4, 7, 11, 14, 18, 21, 28].includes(day);
            
            return (
              <button
                key={day}
                onClick={() => { setSelectedDay(day); setMode('view'); }}
                className={`
                  aspect-square rounded-xl flex flex-col items-center justify-center relative
                  ${isCompleted ? 'bg-green-600' : isRest ? 'bg-gray-700 opacity-70' : 'bg-gray-800 hover:bg-gray-700'}
                  transition-all
                `}
              >
                <span className={`text-lg font-bold ${isCompleted ? 'text-white' : 'text-gray-300'}`}>{day}</span>
                {isCompleted && <CheckCircle size={16} className="text-white mt-1" />}
                {isRest && !isCompleted && <span className="text-[10px] text-gray-400 mt-1">REST</span>}
              </button>
            );
          })}
        </div>
        
        <div className="max-w-md mx-auto mt-8 text-center">
            <button 
                onClick={() => { localStorage.clear(); setCompletedDays([]); }}
                className="text-xs text-red-400 hover:text-red-300 underline"
            >
                Reset Progress
            </button>
        </div>
      </div>
    );
  }

  // --- RENDER: WORKOUT PREVIEW ---
  if (mode === 'view' && currentWorkout) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col max-w-md mx-auto">
        <button onClick={() => setMode('dashboard')} className="self-start mb-6 text-gray-400 hover:text-white flex items-center gap-1">
          <ChevronLeft size={20} /> Back
        </button>

        <h1 className="text-2xl font-bold mb-2">{currentWorkout.title}</h1>
        {currentWorkout.type === 'rest' ? (
           <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70">
             <Calendar size={64} className="mb-4 text-blue-400"/>
             <p className="text-xl">Enjoy your rest day!</p>
             <p className="text-sm text-gray-400 mt-2">Stretch, hydrate, and recover.</p>
             <button 
               onClick={() => saveProgress(selectedDay)}
               className="mt-8 px-6 py-3 bg-green-600 rounded-lg font-bold"
             >
               Mark as Completed
             </button>
           </div>
        ) : (
          <>
            <div className="space-y-3 mb-8">
              {currentWorkout.description && <p className="text-yellow-400 text-sm mb-4">{currentWorkout.description}</p>}
              {currentWorkout.exercises.map((ex, idx) => (
                <div key={idx} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center">
                  <span className="font-medium">{ex.name}</span>
                  <span className="text-gray-400 text-sm">
                    {ex.sets} x {ex.type === 'timer' ? `${ex.duration}s` : ex.reps}
                  </span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setMode('session')}
              className="mt-auto w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-lg flex items-center justify-center gap-2"
            >
              <Play fill="currentColor" /> START WORKOUT
            </button>
          </>
        )}
      </div>
    );
  }

  // --- RENDER: ACTIVE SESSION ---
  if (mode === 'session') {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <ActiveSession 
          workout={currentWorkout} 
          onFinish={() => saveProgress(selectedDay)}
          onCancel={() => setMode('view')}
        />
      </div>
    );
  }
}
