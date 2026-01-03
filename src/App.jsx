import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { getWorkoutForDay } from './data/workouts';
import Auth from './components/Auth';
import { Play, CheckCircle, RotateCcw, ChevronLeft, Trophy, Calendar, Flame, Grid, Activity, Info, SkipForward, LogOut, Clock, BarChart3 } from 'lucide-react';

// --- UTILS: FORMAT TIME ---
const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
};

// --- COMPONENT: TIMER ---
const Timer = ({ duration, onComplete, autoStart = false }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(autoStart);
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    else if (timeLeft === 0) { setIsActive(false); onComplete(); }
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
            <button onClick={() => setIsActive(!isActive)} className={`flex-1 py-4 rounded-xl font-bold text-white ${isActive ? 'bg-yellow-600' : 'bg-green-600'}`}>{isActive ? 'PAUSE' : 'START'}</button>
            <button onClick={() => { setIsActive(false); setTimeLeft(duration); }} className="px-4 bg-gray-700 rounded-xl text-white"><RotateCcw size={20} /></button>
        </div>
      )}
    </div>
  );
};

// --- COMPONENT: ACTIVE SESSION ---
const ActiveSession = ({ workout, onFinish, onCancel }) => {
  const [currentExIndex, setCurrentExIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [startTime] = useState(Date.now()); // Track when user started

  const exercise = workout.exercises[currentExIndex];
  const isLastExercise = currentExIndex === workout.exercises.length - 1;
  const isLastSet = currentSet === exercise.sets;

  const handleSetComplete = () => { isLastSet && isLastExercise ? finishSession() : setIsResting(true); };
  
  const finishSession = () => {
    const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
    onFinish(durationSeconds);
  };

  const handleRestComplete = () => {
      setIsResting(false);
      isLastSet ? (setCurrentExIndex(p => p + 1), setCurrentSet(1)) : setCurrentSet(p => p + 1);
  };

  if (isResting) return (
    <div className="flex flex-col h-screen items-center justify-center p-6 bg-gray-900 text-white">
        <h2 className="text-2xl font-bold mb-2">Rest</h2>
        <Timer duration={exercise.rest || 60} onComplete={handleRestComplete} autoStart={true} />
        <div className="mt-8 text-center text-gray-400 text-sm">Next: {isLastSet ? workout.exercises[currentExIndex + 1]?.name || 'Finish' : exercise.name}</div>
        <button onClick={handleRestComplete} className="mt-4 flex gap-2 text-white bg-gray-800 px-6 py-3 rounded-full hover:bg-gray-700"><SkipForward size={18}/> Skip</button>
    </div>
  );

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto p-4 text-white">
      <div className="flex justify-between items-center mb-4 pt-2">
        <button onClick={onCancel} className="text-gray-400 flex items-center text-sm"><ChevronLeft size={16} /> Quit</button>
        <div className="text-xs font-mono text-gray-500">Ex {currentExIndex + 1}/{workout.exercises.length}</div>
      </div>
      <div className="flex-1 flex flex-col items-center">
        <h2 className="text-3xl font-bold text-center mb-1">{exercise.name}</h2>
        <div className="text-lg text-blue-400 font-medium mb-6">Set {currentSet} / {exercise.sets}</div>
        <div className="bg-yellow-900/20 border border-yellow-700/50 p-4 rounded-xl w-full mb-8 flex gap-3">
            <Info className="text-yellow-500 shrink-0 mt-1" size={20} />
            <p className="text-gray-300 text-sm">{exercise.tip}</p>
        </div>
        <div className="w-full flex-1 flex flex-col items-center justify-center">
            {exercise.type === 'timer' ? <Timer duration={exercise.duration} onComplete={()=>{}} /> : 
            <div className="flex flex-col items-center justify-center p-10 bg-gray-800 rounded-2xl w-full mb-8"><span className="text-8xl font-bold">{exercise.reps}</span><span className="text-sm text-gray-400 uppercase">Reps</span></div>}
        </div>
        <button onClick={handleSetComplete} className="w-full py-5 bg-blue-600 text-white font-bold rounded-xl text-lg flex items-center justify-center gap-3">{isLastSet && isLastExercise ? <><Trophy /> FINISH</> : <><CheckCircle /> SET COMPLETE</>}</button>
      </div>
    </div>
  );
};

// --- MAIN CONTROLLER ---

export default function WorkoutApp() {
  const [session, setSession] = useState(null);
  const [workoutLogs, setWorkoutLogs] = useState([]); // Stores full log objects
  const [selectedDay, setSelectedDay] = useState(null);
  const [mode, setMode] = useState('home'); 
  const [loading, setLoading] = useState(true);

  // --- SUPABASE SYNC ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchLogs();
      else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchLogs();
      else setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchLogs = async () => {
    try {
      // Get all logs for this user
      let { data, error } = await supabase.from('workout_logs').select('*');
      if (error) throw error;
      setWorkoutLogs(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveSession = async (durationSeconds) => {
    const dayToSave = selectedDay; 
    
    // 1. Optimistic Update (Immediate UI change)
    const newLog = { 
        day_number: dayToSave, 
        duration_seconds: durationSeconds, 
        completed_at: new Date().toISOString() 
    };
    setWorkoutLogs([...workoutLogs, newLog]);
    setMode('home');
    setSelectedDay(null);

    // 2. Database Insert
    if (session) {
      await supabase.from('workout_logs').insert({ 
          user_id: session.user.id, 
          day_number: dayToSave, 
          duration_seconds: durationSeconds 
      });
    }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); setWorkoutLogs([]); };

  // --- STATS CALCULATIONS ---
  const completedDayNumbers = workoutLogs.map(log => log.day_number);
  const totalMinutes = Math.floor(workoutLogs.reduce((acc, curr) => acc + curr.duration_seconds, 0) / 60);
  const totalWorkouts = workoutLogs.length;

  // Streak Calculation (Consecutive Days based on timestamps)
  const calculateStreak = () => {
    if (workoutLogs.length === 0) return 0;
    const sortedDates = [...new Set(workoutLogs.map(l => l.completed_at.split('T')[0]))].sort();
    let streak = 0;
    let currentStreak = 0;
    // Simple logic: if user has logged anything recently, we count. 
    // For a robust streak, you'd check gap between dates. 
    // Simplified for now: just count distinct days logged.
    return sortedDates.length; 
  };
  const streakCount = calculateStreak();

  const nextDay = Array.from({length: 30}, (_, i) => i + 1).find(d => !completedDayNumbers.includes(d)) || 30;
  const currentWorkout = selectedDay ? getWorkoutForDay(selectedDay) : getWorkoutForDay(nextDay);

  if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white"><Activity className="animate-spin" /></div>;
  if (!session) return <Auth onLogin={fetchLogs} />;

  // --- VIEWS ---
  
  if (mode === 'home') {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-blue-600 rounded-full blur-[128px] opacity-20 pointer-events-none"></div>
        
        {/* Header */}
        <div className="w-full max-w-md flex justify-between items-center mb-6 pt-4 z-10">
          <div><h1 className="text-xl font-bold">Hello, Athlete</h1><p className="text-gray-400 text-sm">Let's crush today.</p></div>
          <button onClick={handleLogout} className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-red-400"><LogOut size={18}/></button>
        </div>

        {/* Stats Bar */}
        <div className="w-full max-w-md grid grid-cols-3 gap-3 mb-8 z-10">
            <div className="bg-gray-800/80 p-3 rounded-xl border border-gray-700 flex flex-col items-center">
                <Flame className="text-orange-500 mb-1" size={20}/>
                <span className="text-lg font-bold">{streakCount}</span>
                <span className="text-[10px] text-gray-400 uppercase">Streak</span>
            </div>
            <div className="bg-gray-800/80 p-3 rounded-xl border border-gray-700 flex flex-col items-center">
                <Clock className="text-blue-500 mb-1" size={20}/>
                <span className="text-lg font-bold">{totalMinutes}</span>
                <span className="text-[10px] text-gray-400 uppercase">Mins</span>
            </div>
            <div className="bg-gray-800/80 p-3 rounded-xl border border-gray-700 flex flex-col items-center">
                <BarChart3 className="text-green-500 mb-1" size={20}/>
                <span className="text-lg font-bold">{totalWorkouts}</span>
                <span className="text-[10px] text-gray-400 uppercase">Sessions</span>
            </div>
        </div>

        {/* Main Card */}
        <div className="w-full max-w-md z-10">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <span className="inline-block px-3 py-1 bg-blue-900/50 text-blue-300 text-xs font-bold rounded-full mb-3">DAY {nextDay}</span>
            <h3 className="text-3xl font-bold mb-1">{getWorkoutForDay(nextDay).title.split(':')[1]}</h3>
            <p className="text-gray-400 text-sm mb-8">{getWorkoutForDay(nextDay).exercises.length} Exercises</p>
            <button onClick={() => { setSelectedDay(nextDay); setMode('preview'); }} className="w-full py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-200"><Play fill="black" size={18} /> START SESSION</button>
          </div>
        </div>

        <div className="mt-auto w-full max-w-md pt-8">
            <button onClick={() => setMode('library')} className="w-full bg-gray-800/50 border border-gray-700/50 p-4 rounded-xl flex items-center justify-between"><div className="flex items-center gap-3"><Grid size={20}/><div className="text-left"><p className="font-bold text-sm">30-Day Plan</p></div></div><ChevronLeft className="rotate-180" size={20} /></button>
        </div>
      </div>
    );
  }

  // --- LIBRARY (Modified to check against new log structure) ---
  if (mode === 'library') {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-md mx-auto">
            <div className="flex items-center gap-4 mb-8 pt-4"><button onClick={() => setMode('home')} className="p-2 bg-gray-800 rounded-full"><ChevronLeft size={20}/></button><h1 className="text-xl font-bold">All Workouts</h1></div>
            <div className="grid grid-cols-1 gap-3">
            {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                const isCompleted = completedDayNumbers.includes(day);
                return (
                <button key={day} onClick={() => { setSelectedDay(day); setMode('preview'); }} className={`w-full p-4 rounded-xl flex items-center justify-between border ${isCompleted ? 'bg-green-900/20 border-green-800/50' : 'bg-gray-800 border-gray-700'}`}>
                    <div className="flex items-center gap-4"><div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${isCompleted ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300'}`}>{isCompleted ? <CheckCircle size={18} /> : day}</div><p className="font-bold text-sm">{getWorkoutForDay(day).title.split(':')[1]}</p></div>
                </button>
                );
            })}
            </div>
        </div>
      </div>
    );
  }

  // --- PREVIEW (Modified for Time Saving) ---
  if (mode === 'preview') return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col max-w-md mx-auto">
      <button onClick={() => setMode('home')} className="self-start mb-6 text-gray-400 flex items-center gap-1"><ChevronLeft size={20} /> Back</button>
      <h1 className="text-3xl font-bold mb-4">{currentWorkout.title.split(':')[1]}</h1>
      {currentWorkout.type === 'rest' ? <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70"><p className="text-xl font-medium">Recovery Mode</p><button onClick={() => saveSession(0)} className="mt-12 px-8 py-4 bg-green-600 rounded-xl font-bold w-full">Mark Complete</button></div> : 
      <><div className="space-y-3 mb-8 flex-1">{currentWorkout.exercises.map((ex, i) => <div key={i} className="bg-gray-800 p-4 rounded-xl border border-gray-700"><span className="font-bold">{ex.name}</span></div>)}</div><button onClick={() => setMode('session')} className="w-full py-4 bg-white text-black rounded-xl font-bold flex items-center justify-center gap-2"><Play fill="black" size={18} /> START</button></>}
    </div>
  );

  if (mode === 'session') return <div className="min-h-screen bg-gray-900 text-white"><ActiveSession workout={currentWorkout} onFinish={saveSession} onCancel={() => setMode('preview')}/></div>;
}
