import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, RotateCcw, ChevronLeft, Trophy, Calendar, Flame, Grid, Activity, Lock, Info, Timer as TimerIcon, SkipForward } from 'lucide-react';

// --- DATA: 30 DAY PLAN WITH FORM TIPS & REST ---
const getWorkoutForDay = (day) => {
  const isRest = [4, 7, 11, 14, 18, 21, 28].includes(day);
  
  if (isRest) return { title: `Day ${day}: Rest & Recovery`, type: "rest", exercises: [] };

  // Example: Day 1 with DETAILED INSTRUCTIONS
  if (day === 1) return {
    title: "Day 1: Full Body Basics",
    description: "Focus on strict form. Quality over quantity.",
    exercises: [
      { 
        name: "Push-ups", 
        sets: 3, 
        reps: 12, 
        type: "reps", 
        rest: 60, // Rest in seconds between sets
        tip: "Keep body straight like a plank. Lower chest until it almost touches floor. Explode up." 
      },
      { 
        name: "Bodyweight Squats", 
        sets: 3, 
        reps: 15, 
        type: "reps", 
        rest: 60,
        tip: "Keep weight on heels. Knees out. Go deep (thighs parallel to floor). Tempo: 2s down, 1s up." 
      },
      { 
        name: "Plank", 
        sets: 3, 
        duration: 30, 
        type: "timer", 
        rest: 45,
        tip: "Squeeze glutes and core. Do not let hips sag. Keep head neutral." 
      },
      { 
        name: "Lunges", 
        sets: 3, 
        reps: 10, 
        type: "reps", 
        rest: 60,
        tip: "10 reps per leg. Back knee should almost touch the ground. Torso upright." 
      }
    ]
  };

  // Fallback for other days (Demo)
  return {
    title: `Day ${day}: Calisthenics Routine`,
    description: "Keep the intensity high today.",
    exercises: [
      { 
        name: "Push-ups", 
        sets: 4, 
        reps: 15, 
        type: "reps", 
        rest: 60,
        tip: "Control the descent. Don't flare elbows out."
      },
      { 
        name: "Squats", 
        sets: 4, 
        reps: 20, 
        type: "reps", 
        rest: 60,
        tip: "Explosive movement up. Controlled down."
      }
    ]
  };
};

// --- COMPONENT: COUNTDOWN TIMER ---
const Timer = ({ duration, onComplete, autoStart = false }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(autoStart);

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
    <div className="w-full flex flex-col items-center">
      <div className="relative w-full h-2 bg-gray-700 rounded-full mb-6 overflow-hidden">
        <div className="bg-blue-500 h-full transition-all duration-1000 ease-linear" style={{ width: `${progress}%` }} />
      </div>
      <div className="text-6xl font-bold font-mono text-blue-400 mb-6">{timeLeft}s</div>
      
      {!autoStart && (
        <div className="flex gap-3 w-full">
            <button onClick={() => setIsActive(!isActive)} className={`flex-1 py-4 rounded-xl font-bold text-white transition-colors ${isActive ? 'bg-yellow-600' : 'bg-green-600'}`}>
            {isActive ? 'PAUSE' : 'START TIMER'}
            </button>
            <button onClick={() => { setIsActive(false); setTimeLeft(duration); }} className="px-4 bg-gray-700 rounded-xl text-white">
            <RotateCcw size={20} />
            </button>
        </div>
      )}
    </div>
  );
};

// --- COMPONENT: REST SCREEN ---
const RestScreen = ({ duration, nextUp, onSkip }) => {
    return (
        <div className="flex flex-col h-full items-center justify-center p-6 bg-gray-900">
            <h2 className="text-2xl font-bold text-white mb-2">Rest Time</h2>
            <p className="text-gray-400 mb-8">Take a breather.</p>
            
            <Timer duration={duration} onComplete={onSkip} autoStart={true} />

            <div className="mt-12 bg-gray-800 p-4 rounded-xl w-full max-w-sm border border-gray-700">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Coming Up</p>
                <p className="text-lg font-bold text-white">{nextUp}</p>
            </div>

            <button onClick={onSkip} className="mt-8 text-white flex items-center gap-2 px-6 py-3 bg-gray-800 rounded-full hover:bg-gray-700">
                <SkipForward size={18} /> Skip Rest
            </button>
        </div>
    )
}

// --- COMPONENT: ACTIVE WORKOUT ---
const ActiveSession = ({ workout, onFinish, onCancel }) => {
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);

  const exercise = workout.exercises[currentExIndex];
  const isLastExercise = currentExIndex === workout.exercises.length - 1;
  const isLastSet = currentSet === exercise.sets;

  const handleSetComplete = () => {
    if (isLastSet && isLastExercise) {
        onFinish();
    } else {
        setIsResting(true);
    }
  };

  const handleRestComplete = () => {
      setIsResting(false);
      if (isLastSet) {
          setCurrentExIndex(prev => prev + 1);
          setCurrentSet(1);
      } else {
          setCurrentSet(prev => prev + 1);
      }
  };

  // Determine what is coming up next for the Rest Screen
  const nextUpLabel = isLastSet 
    ? (workout.exercises[currentExIndex + 1]?.name || "Finish") 
    : `${exercise.name} (Set ${currentSet + 1})`;

  if (isResting) {
      return <RestScreen duration={exercise.rest || 60} nextUp={nextUpLabel} onSkip={handleRestComplete} />;
  }

  return (
    <div className="flex flex-col h-full max-w-md mx-auto p-4 min-h-screen">
      <div className="flex justify-between items-center mb-4 pt-2">
        <button onClick={onCancel} className="text-gray-400 hover:text-white flex items-center text-sm font-medium">
          <ChevronLeft size={16} /> Quit
        </button>
        <div className="text-xs font-mono text-gray-500">
            Ex {currentExIndex + 1}/{workout.exercises.length}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center">
        <h2 className="text-3xl font-bold text-white text-center mb-1">{exercise.name}</h2>
        <div className="text-lg text-blue-400 font-medium mb-6">
          Set {currentSet} <span className="text-gray-600">/ {exercise.sets}</span>
        </div>

        {/* --- INSTRUCTION CARD --- */}
        <div className="bg-yellow-900/20 border border-yellow-700/50 p-4 rounded-xl w-full mb-8 flex gap-3">
            <Info className="text-yellow-500 shrink-0 mt-1" size={20} />
            <div>
                <p className="text-yellow-500 font-bold text-xs uppercase tracking-wide mb-1">Technique & Pace</p>
                <p className="text-gray-300 text-sm leading-relaxed">{exercise.tip}</p>
            </div>
        </div>

        {/* WORKOUT CONTENT */}
        <div className="w-full flex-1 flex flex-col items-center justify-center">
            {exercise.type === 'timer' ? (
            <Timer duration={exercise.duration} onComplete={() => {}} />
            ) : (
            <div className="flex flex-col items-center justify-center p-10 bg-gray-800 border border-gray-700 rounded-2xl w-full shadow-lg shadow-blue-900/10 mb-8">
                <span className="text-8xl font-bold text-white mb-2">{exercise.reps}</span>
                <span className="text-sm text-gray-400 uppercase tracking-widest font-semibold">Repetitions</span>
            </div>
            )}
        </div>

        <button onClick={handleSetComplete} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-lg flex items-center justify-center gap-3 transition-all mt-auto shadow-lg shadow-blue-600/20 active:scale-95">
          {isLastSet && isLastExercise ? <> <Trophy /> FINISH WORKOUT </> : <> <CheckCircle /> SET COMPLETE </>}
        </button>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
export default function WorkoutApp() {
  const [completedDays, setCompletedDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [mode, setMode] = useState('home'); 

  useEffect(() => {
    const saved = localStorage.getItem('betterMeProgress_v3');
    if (saved) setCompletedDays(JSON.parse(saved));
  }, []);

  const saveProgress = (day) => {
    const newCompleted = [...new Set([...completedDays, day])];
    setCompletedDays(newCompleted);
    localStorage.setItem('betterMeProgress_v3', JSON.stringify(newCompleted));
    setMode('home');
    setSelectedDay(null);
  };

  const nextDay = Array.from({length: 30}, (_, i) => i + 1).find(d => !completedDays.includes(d)) || 30;
  const currentWorkout = selectedDay ? getWorkoutForDay(selectedDay) : getWorkoutForDay(nextDay);
  const streakCount = completedDays.length;

  if (mode === 'home') {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-blue-600 rounded-full blur-[128px] opacity-20 pointer-events-none"></div>
        <div className="w-full max-w-md flex justify-between items-center mb-10 pt-4 z-10">
          <div>
            <h1 className="text-xl font-bold">Hello, Athlete</h1>
            <p className="text-gray-400 text-sm">Form is key.</p>
          </div>
          <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-full border border-gray-700">
            <Flame className={streakCount > 0 ? "text-orange-500 fill-orange-500" : "text-gray-500"} size={20} />
            <span className="font-bold text-lg">{streakCount}</span>
          </div>
        </div>

        <div className="w-full max-w-md z-10">
          <h2 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Ready to train?</h2>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10"><Activity size={120} /></div>
            <span className="inline-block px-3 py-1 bg-blue-900/50 text-blue-300 text-xs font-bold rounded-full mb-3 border border-blue-800">DAY {nextDay}</span>
            <h3 className="text-3xl font-bold mb-1 leading-tight">{getWorkoutForDay(nextDay).title.split(':')[1] || "Workout"}</h3>
            <p className="text-gray-400 text-sm mb-8">{getWorkoutForDay(nextDay).exercises.length} Exercises</p>
            <button onClick={() => { setSelectedDay(nextDay); setMode('preview'); }} className="w-full py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors shadow-lg shadow-white/10">
              <Play fill="black" size={18} /> START SESSION
            </button>
          </div>
        </div>

        <div className="mt-auto w-full max-w-md pt-8">
            <button onClick={() => setMode('library')} className="w-full bg-gray-800/50 border border-gray-700/50 hover:bg-gray-800 hover:border-gray-600 transition-all p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-700 rounded-lg"><Grid size={20}/></div>
                    <div className="text-left"><p className="font-bold text-sm">Full 30-Day Plan</p><p className="text-xs text-gray-400">View schedule</p></div>
                </div>
                <ChevronLeft className="rotate-180 text-gray-500" size={20} />
            </button>
        </div>
      </div>
    );
  }

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
                const workout = getWorkoutForDay(day);
                return (
                <button key={day} onClick={() => { setSelectedDay(day); setMode('preview'); }} className={`w-full p-4 rounded-xl flex items-center justify-between border ${isCompleted ? 'bg-green-900/20 border-green-800/50' : 'bg-gray-800 border-gray-700'}`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${isCompleted ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300'}`}>{isCompleted ? <CheckCircle size={18} /> : day}</div>
                        <div className="text-left">
                            <p className={`font-bold text-sm ${isCompleted ? 'text-green-400' : 'text-white'}`}>{workout.type === 'rest' ? 'Rest Day' : `Day ${day}`}</p>
                            <p className="text-xs text-gray-400">{workout.title.split(': ')[1]}</p>
                        </div>
                    </div>
                </button>
                );
            })}
            </div>
        </div>
      </div>
    );
  }

  if (mode === 'preview' && currentWorkout) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col max-w-md mx-auto">
        <button onClick={() => setMode('home')} className="self-start mb-6 text-gray-400 hover:text-white flex items-center gap-1">
          <ChevronLeft size={20} /> Back
        </button>
        <span className="text-blue-500 font-bold tracking-widest text-xs mb-2 uppercase">Day {selectedDay}</span>
        <h1 className="text-3xl font-bold mb-4">{currentWorkout.title.split(':')[1]}</h1>
        
        {currentWorkout.type === 'rest' ? (
           <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70">
             <div className="p-8 bg-gray-800 rounded-full mb-6"><Calendar size={48} className="text-green-400"/></div>
             <p className="text-xl font-medium">Recovery Mode</p>
             <button onClick={() => saveProgress(selectedDay)} className="mt-12 px-8 py-4 bg-green-600 rounded-xl font-bold w-full">Mark Rest Complete</button>
           </div>
        ) : (
          <>
            <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700">
                <p className="text-gray-300 text-sm">{currentWorkout.description}</p>
            </div>
            <div className="space-y-3 mb-8 overflow-y-auto flex-1">
              {currentWorkout.exercises.map((ex, idx) => (
                <div key={idx} className="bg-gray-800 p-4 rounded-xl border border-gray-700/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-gray-200">{ex.name}</span>
                    <span className="text-xs font-bold bg-blue-900 text-blue-200 px-2 py-1 rounded">{ex.sets} sets</span>
                  </div>
                  <div className="text-xs text-gray-400 flex gap-2 items-center">
                    <Info size={12} className="text-yellow-500"/> {ex.tip}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setMode('session')} className="mt-auto w-full py-4 bg-white text-black rounded-xl font-bold text-lg flex items-center justify-center gap-2">
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
