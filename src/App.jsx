import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, RotateCcw, ChevronLeft, Trophy, Calendar, Flame, Grid, Activity, Lock } from 'lucide-react';

// --- DATA: THE 30 DAY PLAN LOGIC ---
// (Same logic as before, condensed for brevity in this view)
const getWorkoutForDay = (day) => {
  const isRest = [4, 7, 11, 14, 18, 21, 28].includes(day);
  
  if (isRest) return { title: `Day ${day}: Rest & Recovery`, type: "rest", exercises: [] };

  // Phase 1 Examples
  if (day === 1) return {
    title: "Day 1: Full Body Basics",
    exercises: [
      { name: "Push-ups", sets: 3, reps: 12, type: "reps" },
      { name: "Squats", sets: 3, reps: 15, type: "reps" },
      { name: "Plank", sets: 3, duration: 30, type: "timer" },
      { name: "Lunges", sets: 3, reps: 10, type: "reps" }
    ]
  };
  // ... (You can paste the rest of the workout logic from the previous code here)
  
  // Generic fallback for demo so the app works for all 30 days immediately
  return {
    title: `Day ${day}: Calisthenics Routine`,
    description: "Focus on form and controlled movements.",
    exercises: [
      { name: "Push-ups", sets: 4, reps: 15, type: "reps" },
      { name: "Squats", sets: 4, reps: 20, type: "reps" },
      { name: "Plank", sets: 3, duration: 45, type: "timer" }
    ]
  };
};

// --- HELPER COMPONENTS ---

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
    <div className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-xl mb-4 w-full border border-gray-700">
      <div className="text-6xl font-bold font-mono text-blue-400 mb-4">{timeLeft}s</div>
      <div className="w-full bg-gray-700 h-3 rounded-full mb-6 overflow-hidden">
        <div className="bg-blue-500 h-full transition-all duration-1000 ease-linear" style={{ width: `${progress}%` }} />
      </div>
      <div className="flex gap-3 w-full">
        <button onClick={() => setIsActive(!isActive)} className={`flex-1 py-3 rounded-lg font-bold text-white transition-colors ${isActive ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-green-600 hover:bg-green-500'}`}>
          {isActive ? 'PAUSE' : 'START'}
        </button>
        <button onClick={() => { setIsActive(false); setTimeLeft(duration); }} className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white">
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
};

const ActiveSession = ({ workout, onFinish, onCancel }) => {
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);

  const exercise = workout.exercises[currentExIndex];
  const isLastExercise = currentExIndex === workout.exercises.length - 1;
  const isLastSet = currentSet === exercise.sets;

  const handleNext = () => {
    if (isLastSet) {
      if (isLastExercise) onFinish();
      else {
        setCurrentExIndex(prev => prev + 1);
        setCurrentSet(1);
      }
    } else {
      setCurrentSet(prev => prev + 1);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto p-4 min-h-screen">
      <div className="flex justify-between items-center mb-6 pt-2">
        <button onClick={onCancel} className="text-gray-400 hover:text-white flex items-center text-sm font-medium">
          <ChevronLeft size={16} /> Quit
        </button>
        <div className="flex gap-1">
           {workout.exercises.map((_, i) => (
             <div key={i} className={`h-1.5 w-6 rounded-full ${i === currentExIndex ? 'bg-blue-500' : i < currentExIndex ? 'bg-green-500' : 'bg-gray-700'}`} />
           ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold text-white text-center mb-1">{exercise.name}</h2>
        <div className="text-lg text-blue-400 font-medium mb-8">
          Set {currentSet} <span className="text-gray-500">/ {exercise.sets}</span>
        </div>

        {exercise.type === 'timer' ? (
          <Timer duration={exercise.duration} onComplete={() => {}} />
        ) : (
          <div className="flex flex-col items-center justify-center p-10 bg-gray-800 border border-gray-700 rounded-2xl mb-8 w-full shadow-lg shadow-blue-900/10">
            <span className="text-7xl font-bold text-white mb-2">{exercise.reps}</span>
            <span className="text-sm text-gray-400 uppercase tracking-widest font-semibold">Repetitions</span>
          </div>
        )}

        <button onClick={handleNext} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-lg flex items-center justify-center gap-3 transition-all mt-auto shadow-lg shadow-blue-600/20 active:scale-95">
          {isLastSet && isLastExercise ? <> <Trophy /> COMPLETE WORKOUT </> : <> <CheckCircle /> {isLastSet ? "NEXT EXERCISE" : "SET DONE"} </>}
        </button>
      </div>
    </div>
  );
};

// --- MAIN APP ---

export default function WorkoutApp() {
  const [completedDays, setCompletedDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [mode, setMode] = useState('home'); // home, library, preview, session

  // Load progress
  useEffect(() => {
    const saved = localStorage.getItem('betterMeProgress_v2');
    if (saved) setCompletedDays(JSON.parse(saved));
  }, []);

  const saveProgress = (day) => {
    const newCompleted = [...new Set([...completedDays, day])];
    setCompletedDays(newCompleted);
    localStorage.setItem('betterMeProgress_v2', JSON.stringify(newCompleted));
    setMode('home');
    setSelectedDay(null);
  };

  // Logic to find the next available day
  const nextDay = Array.from({length: 30}, (_, i) => i + 1).find(d => !completedDays.includes(d)) || 30;
  const currentWorkout = selectedDay ? getWorkoutForDay(selectedDay) : getWorkoutForDay(nextDay);
  
  // Calculate Streak (Visual only - total days completed)
  const streakCount = completedDays.length;

  // --- VIEW: HOME (The "Dashboard") ---
  if (mode === 'home') {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-blue-600 rounded-full blur-[128px] opacity-20 pointer-events-none"></div>
        
        {/* Header / Streak */}
        <div className="w-full max-w-md flex justify-between items-center mb-10 pt-4 z-10">
          <div>
            <h1 className="text-xl font-bold">Hello, Athlete</h1>
            <p className="text-gray-400 text-sm">Let's get moving.</p>
          </div>
          <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-full border border-gray-700">
            <Flame className={streakCount > 0 ? "text-orange-500 fill-orange-500" : "text-gray-500"} size={20} />
            <span className="font-bold text-lg">{streakCount}</span>
          </div>
        </div>

        {/* MAIN CARD: Next Workout */}
        <div className="w-full max-w-md z-10">
          <h2 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Current Objective</h2>
          
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10">
                <Activity size={120} />
            </div>
            
            <span className="inline-block px-3 py-1 bg-blue-900/50 text-blue-300 text-xs font-bold rounded-full mb-3 border border-blue-800">
                DAY {nextDay}
            </span>
            <h3 className="text-3xl font-bold mb-1 leading-tight">{getWorkoutForDay(nextDay).title.split(':')[1] || "Workout"}</h3>
            <p className="text-gray-400 text-sm mb-8">{getWorkoutForDay(nextDay).exercises.length} Exercises • Est. 25 Min</p>

            <button 
              onClick={() => { setSelectedDay(nextDay); setMode('preview'); }}
              className="w-full py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors shadow-lg shadow-white/10"
            >
              <Play fill="black" size={18} /> START SESSION
            </button>
          </div>
        </div>

        {/* FOOTER NAV: The "Other Pocket" */}
        <div className="mt-auto w-full max-w-md pt-8">
            <button 
                onClick={() => setMode('library')}
                className="w-full bg-gray-800/50 border border-gray-700/50 hover:bg-gray-800 hover:border-gray-600 transition-all p-4 rounded-xl flex items-center justify-between group"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-700 rounded-lg group-hover:bg-gray-600"><Grid size={20}/></div>
                    <div className="text-left">
                        <p className="font-bold text-sm">Full 30-Day Plan</p>
                        <p className="text-xs text-gray-400">View schedule & repeat workouts</p>
                    </div>
                </div>
                <ChevronLeft className="rotate-180 text-gray-500" size={20} />
            </button>

            <div className="text-center mt-6 mb-2">
                 <button onClick={() => { localStorage.removeItem('betterMeProgress_v2'); setCompletedDays([]); }} className="text-[10px] text-gray-600 hover:text-red-400 uppercase tracking-widest">
                    Reset Data
                 </button>
            </div>
        </div>
      </div>
    );
  }

  // --- VIEW: LIBRARY (The "Other Pocket") ---
  if (mode === 'library') {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-md mx-auto">
            <div className="flex items-center gap-4 mb-8 pt-4">
                <button onClick={() => setMode('home')} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700"><ChevronLeft size={20}/></button>
                <h1 className="text-xl font-bold">All Workouts</h1>
            </div>

            <div className="grid grid-cols-1 gap-3">
            {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                const isCompleted = completedDays.includes(day);
                const isLocked = day > nextDay && !isCompleted;
                const workout = getWorkoutForDay(day);
                
                return (
                <button
                    key={day}
                    onClick={() => { setSelectedDay(day); setMode('preview'); }}
                    disabled={isLocked} // Optional: Remove this if you want them to be able to jump ahead
                    className={`
                    w-full p-4 rounded-xl flex items-center justify-between border
                    ${isCompleted 
                        ? 'bg-green-900/20 border-green-800/50' 
                        : isLocked 
                            ? 'bg-gray-800/50 border-transparent opacity-50 cursor-not-allowed' 
                            : 'bg-gray-800 border-gray-700 hover:border-gray-500'}
                    transition-all
                    `}
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${isCompleted ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300'}`}>
                            {isCompleted ? <CheckCircle size={18} /> : day}
                        </div>
                        <div className="text-left">
                            <p className={`font-bold text-sm ${isCompleted ? 'text-green-400' : 'text-white'}`}>{workout.type === 'rest' ? 'Rest Day' : `Day ${day}`}</p>
                            <p className="text-xs text-gray-400 line-clamp-1">{workout.title.split(': ')[1] || "Workout"}</p>
                        </div>
                    </div>
                    {isLocked && <Lock size={16} className="text-gray-600"/>}
                </button>
                );
            })}
            </div>
        </div>
      </div>
    );
  }

  // --- VIEW: PREVIEW & SESSION (Shared Logic) ---
  if (mode === 'preview' && currentWorkout) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col max-w-md mx-auto">
        <button onClick={() => setMode(selectedDay === nextDay ? 'home' : 'library')} className="self-start mb-6 text-gray-400 hover:text-white flex items-center gap-1">
          <ChevronLeft size={20} /> Back
        </button>

        <span className="text-blue-500 font-bold tracking-widest text-xs mb-2 uppercase">Day {selectedDay}</span>
        <h1 className="text-3xl font-bold mb-4">{currentWorkout.title.split(':')[1]}</h1>
        
        {currentWorkout.type === 'rest' ? (
           <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70">
             <div className="p-8 bg-gray-800 rounded-full mb-6"><Calendar size={48} className="text-green-400"/></div>
             <p className="text-xl font-medium">Recovery Mode</p>
             <p className="text-sm text-gray-400 mt-2 max-w-xs">Muscles grow while you rest. Take a walk, stretch, and eat well today.</p>
             <button onClick={() => saveProgress(selectedDay)} className="mt-12 px-8 py-4 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-white w-full">
               Mark Rest as Complete
             </button>
           </div>
        ) : (
          <>
            <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                    <Activity size={16} className="text-blue-400" />
                    <span className="text-sm font-bold text-gray-300">Workout Brief</span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{currentWorkout.description || "Complete all sets with good form. Rest 60s between exercises."}</p>
            </div>

            <div className="space-y-3 mb-8 overflow-y-auto flex-1">
              {currentWorkout.exercises.map((ex, idx) => (
                <div key={idx} className="bg-gray-800 p-4 rounded-xl flex justify-between items-center border border-gray-700/50">
                  <span className="font-medium text-gray-200">{ex.name}</span>
                  <span className="text-xs font-bold bg-gray-700 px-3 py-1 rounded text-gray-300">
                    {ex.sets} x {ex.type === 'timer' ? `${ex.duration}s` : ex.reps}
                  </span>
                </div>
              ))}
            </div>

            <button onClick={() => setMode('session')} className="mt-auto w-full py-4 bg-white hover:bg-gray-200 text-black rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-white/5 transition-all">
              <Play fill="black" size={18} /> START
            </button>
          </>
        )}
      </div>
    );
  }

  if (mode === 'session') {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <ActiveSession workout={currentWorkout} onFinish={() => saveProgress(selectedDay)} onCancel={() => setMode('preview')}/>
      </div>
    );
  }
}
