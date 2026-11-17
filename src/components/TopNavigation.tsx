import React from 'react';
import { useGame } from '../context/GameContext';
import { CameraMode } from '../three/GymScene';
import { sound } from '../audio/soundEngine';
import {
  Dumbbell,
  User,
  Trophy,
  Users,
  Utensils,
  Building2,
  Award,
  Volume2,
  VolumeX,
  Music,
  Video,
  Moon,
  Zap,
  Droplets,
  DollarSign,
  Flame,
} from 'lucide-react';

export type ActiveTab = 'workout' | 'body' | 'competitions' | 'social' | 'nutrition' | 'empire' | 'career';

interface Props {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  cameraMode: CameraMode;
  setCameraMode: (mode: CameraMode) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  isMusicOn: boolean;
  setIsMusicOn: (on: boolean) => void;
}

export const TopNavigation: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  cameraMode,
  setCameraMode,
  isMuted,
  setIsMuted,
  isMusicOn,
  setIsMusicOn,
}) => {
  const { player, restAndSleep } = useGame();

  const handleTabClick = (tab: ActiveTab) => {
    sound.playClick();
    setActiveTab(tab);
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
  };

  const toggleMusic = () => {
    const active = sound.toggleMusic();
    setIsMusicOn(active);
  };

  const cycleCamera = () => {
    sound.playClick();
    const modes: CameraMode[] = ['orbit', 'first_person', 'cinematic', 'overview'];
    const idx = modes.indexOf(cameraMode);
    const next = modes[(idx + 1) % modes.length];
    setCameraMode(next);
  };

  return (
    <header className="w-full bg-[#0d121b]/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3 select-none z-30">
      {/* Brand & Level Info */}
      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Dumbbell className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl tracking-wider text-slate-100 uppercase leading-none">
                IRONVERSE 3D
              </span>
              <span className="text-[10px] font-bold tracking-widest px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                PRO SIM
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Day {player.day}</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-400 font-semibold">Tier {player.careerTier}</span>
            </div>
          </div>
        </div>

        {/* Player Level & XP Gauge */}
        <div className="hidden sm:flex flex-col gap-1 min-w-[140px]">
          <div className="flex justify-between text-[11px] font-semibold text-slate-300">
            <span>LVL {player.level} TITAN</span>
            <span className="text-amber-400 font-mono">{player.xp} / {player.xpToNextLevel} XP</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
              style={{ width: `${Math.min(100, (player.xp / player.xpToNextLevel) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <nav className="flex items-center gap-1 overflow-x-auto max-w-full py-1 scrollbar-none">
        {[
          { id: 'workout' as ActiveTab, label: 'Train', icon: Dumbbell },
          { id: 'body' as ActiveTab, label: 'Physique', icon: User },
          { id: 'competitions' as ActiveTab, label: 'Compete', icon: Trophy },
          { id: 'social' as ActiveTab, label: 'Rivals & AI', icon: Users },
          { id: 'nutrition' as ActiveTab, label: 'Fuel Bar', icon: Utensils },
          { id: 'empire' as ActiveTab, label: 'Own Gym', icon: Building2 },
          { id: 'career' as ActiveTab, label: 'Career', icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                  : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Vitals, Economy & Tool Controls */}
      <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-between md:justify-end">
        {/* Cash */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold shadow-inner">
          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          <span>{player.money.toLocaleString()}</span>
        </div>

        {/* Energy & Hydration */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1 text-amber-400" title="Energy Level">
            <Zap className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{player.energy}%</span>
          </div>
          <div className="flex items-center gap-1 text-sky-400" title="Hydration">
            <Droplets className="w-3.5 h-3.5 fill-sky-400 text-sky-400" />
            <span>{player.hydration}%</span>
          </div>
        </div>

        {/* 8-Hour Sleep Rest Button */}
        <button
          onClick={restAndSleep}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/50 text-indigo-300 hover:text-white text-xs font-semibold cursor-pointer transition-colors"
          title="Sleep 8 hours: Recovers muscle DOMS and advances day"
        >
          <Moon className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden lg:inline">Rest Day</span>
        </button>

        {/* Controls: Camera Mode, Music, Mute */}
        <div className="flex items-center gap-1 border-l border-slate-700/80 pl-2">
          <button
            onClick={cycleCamera}
            className="p-1.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs flex items-center gap-1 cursor-pointer"
            title={`Camera: ${cameraMode.toUpperCase()} (Click to toggle)`}
          >
            <Video className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden xl:inline text-[10px] font-bold uppercase">{cameraMode}</span>
          </button>

          <button
            onClick={toggleMusic}
            className={`p-1.5 rounded-md border text-xs cursor-pointer transition-colors ${
              isMusicOn
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm shadow-amber-500/20'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border-slate-700'
            }`}
            title="Toggle Procedural Gym Synth Music Beat"
          >
            <Music className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggleMute}
            className="p-1.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs cursor-pointer"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-slate-300" />}
          </button>
        </div>
      </div>
    </header>
  );
};
