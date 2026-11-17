import React, { useState, useEffect, useRef } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { GymScene, CameraMode } from './three/GymScene';
import { TopNavigation, ActiveTab } from './components/TopNavigation';
import { WorkoutHUD } from './components/WorkoutHUD';
import { BodyStatsModal } from './components/BodyStatsModal';
import { CompetitionArena } from './components/CompetitionArena';
import { SocialNPCsModal } from './components/SocialNPCsModal';
import { NutritionModal } from './components/NutritionModal';
import { GymEmpireModal } from './components/GymEmpireModal';
import { CareerModal } from './components/CareerModal';
import { PRCelebrationModal } from './components/PRCelebrationModal';
import { sound } from './audio/soundEngine';
import { Sparkles, Info, X } from 'lucide-react';

const MainGymApp: React.FC = () => {
  const {
    player,
    currentExerciseId,
    selectedWeight,
    lastPR,
    clearLastPR,
    activeNotification,
  } = useGame();

  const [activeTab, setActiveTab] = useState<ActiveTab>('workout');
  const [cameraMode, setCameraMode] = useState<CameraMode>('orbit');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isMusicOn, setIsMusicOn] = useState<boolean>(false);
  const [showQuickHelp, setShowQuickHelp] = useState<boolean>(true);

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const gymSceneRef = useRef<GymScene | null>(null);

  // Initialize Three.js 3D Gym Engine
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    const scene = new GymScene(canvasContainerRef.current);
    gymSceneRef.current = scene;

    return () => {
      scene.destroy();
      gymSceneRef.current = null;
    };
  }, []);

  // Update 3D world when exercise changes
  useEffect(() => {
    if (gymSceneRef.current) {
      gymSceneRef.current.setExercise(currentExerciseId);
      gymSceneRef.current.updatePlatesVisual(selectedWeight);
    }
  }, [currentExerciseId, selectedWeight]);

  // Update camera mode in 3D scene
  useEffect(() => {
    if (gymSceneRef.current) {
      gymSceneRef.current.setCameraMode(cameraMode);
    }
  }, [cameraMode]);

  // Morph athlete musculature when physical stats change
  useEffect(() => {
    if (gymSceneRef.current) {
      gymSceneRef.current.updateAthleteMuscles(player);
    }
  }, [player.muscleMassKg, player.bodyFatPercent]);

  // Handle live rep trajectory
  const handleRepProgress = (progress: number, isStrain: boolean) => {
    if (gymSceneRef.current) {
      gymSceneRef.current.setRepProgress(progress, isStrain);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#090b0e] text-slate-100 flex flex-col select-none">
      {/* 3D WebGL Canvas Layer */}
      <div
        ref={canvasContainerRef}
        className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing"
      />

      {/* Top Athletic Status & Navigation Bar */}
      <TopNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cameraMode={cameraMode}
        setCameraMode={setCameraMode}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        isMusicOn={isMusicOn}
        setIsMusicOn={setIsMusicOn}
      />

      {/* Floating Notification Toast */}
      {activeNotification && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 px-5 py-2.5 rounded-xl bg-amber-500/90 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2 backdrop-blur-md animate-bounce">
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>{activeNotification}</span>
        </div>
      )}

      {/* Quick Biomechanics Controls Guide (Dismissible) */}
      {showQuickHelp && activeTab === 'workout' && (
        <div className="absolute top-20 right-4 z-20 max-w-xs p-3 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/80 text-xs shadow-xl hidden md:block">
          <div className="flex items-center justify-between font-bold text-amber-400 mb-1">
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              LIFTING BIOMECHANICS
            </span>
            <button
              onClick={() => setShowQuickHelp(false)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            • <b>Hold [S] / Down</b> to lower bar with controlled tempo.<br />
            • Wait for <b>Sweet Spot</b> chest touch.<br />
            • <b>Press [W] / Space</b> for explosive drive up.<br />
            • <b>[A] / [D]</b> keys stabilize horizontal bar tilt.
          </p>
        </div>
      )}

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col justify-end p-3 sm:p-4 md:p-6 overflow-y-auto pointer-events-none">
        <div className="pointer-events-auto">
          {activeTab === 'workout' && (
            <WorkoutHUD
              onRepProgressUpdate={handleRepProgress}
              onExerciseChange={(id) => {
                if (gymSceneRef.current) gymSceneRef.current.setExercise(id);
              }}
              onWeightChange={(w) => {
                if (gymSceneRef.current) gymSceneRef.current.updatePlatesVisual(w);
              }}
            />
          )}
          {activeTab === 'body' && <BodyStatsModal />}
          {activeTab === 'competitions' && <CompetitionArena />}
          {activeTab === 'social' && <SocialNPCsModal />}
          {activeTab === 'nutrition' && <NutritionModal />}
          {activeTab === 'empire' && <GymEmpireModal />}
          {activeTab === 'career' && <CareerModal />}
        </div>
      </main>

      {/* Cinematic PR Celebration Modal */}
      {lastPR && <PRCelebrationModal prData={lastPR} onClose={clearLastPR} />}
    </div>
  );
};

export default function App() {
  return (
    <GameProvider>
      <MainGymApp />
    </GameProvider>
  );
}
