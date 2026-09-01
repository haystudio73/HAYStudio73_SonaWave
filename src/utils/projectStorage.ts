import {
  AspectRatio,
  VisualizerConfig,
  LyricsConfig,
  LyricLine,
  BackgroundConfig,
  ParticleConfig,
  TrackMetadata,
  TextBoxItem,
  FilmLightConfig,
  ColorGradingConfig,
  MasterEQConfig,
  MasterEQCustomPreset,
  MasterEQBands,
} from '../types';
import {
  DEFAULT_VISUALIZER,
  DEFAULT_LYRICS,
  DEFAULT_BACKGROUND,
  DEFAULT_PARTICLES,
  DEFAULT_TRACK,
  DEFAULT_TEXT_BOXES,
  DEFAULT_FILM_LIGHT,
  DEFAULT_COLOR_GRADING,
  DEFAULT_MASTER_EQ,
  SAMPLE_SRT_SYNTHWAVE,
} from './presets';
import { parseAnyLyrics } from './lyricsParser';

export interface SavedProject {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  aspectRatio: AspectRatio;
  visualizer: VisualizerConfig;
  lyricsConfig: LyricsConfig;
  lyricsData: LyricLine[];
  background: BackgroundConfig;
  particles: ParticleConfig;
  track: TrackMetadata;
  textBoxes: TextBoxItem[];
  filmLight?: FilmLightConfig;
  colorGrading?: ColorGradingConfig;
  masterEq?: MasterEQConfig;
  audioFileName: string;
  sampleAudioType?: 'lofi' | 'synthwave' | 'acoustic' | 'edm';
}

const STORAGE_KEY_PROJECTS = 'sonawave_saved_projects_v1';
const STORAGE_KEY_AUTOSAVE = 'sonawave_autosave_project_v1';

/**
 * Get all saved projects from localStorage
 */
export function getSavedProjects(): SavedProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROJECTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load projects from localStorage:', err);
    return [];
  }
}

/**
 * Save or update a project in localStorage
 */
export function saveProject(
  projectData: Omit<SavedProject, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): SavedProject {
  const projects = getSavedProjects();
  const now = Date.now();

  let targetProject: SavedProject;

  if (projectData.id) {
    const existingIndex = projects.findIndex((p) => p.id === projectData.id);
    if (existingIndex >= 0) {
      targetProject = {
        ...projects[existingIndex],
        ...projectData,
        id: projectData.id,
        updatedAt: now,
      };
      projects[existingIndex] = targetProject;
    } else {
      targetProject = {
        ...projectData,
        id: projectData.id,
        createdAt: now,
        updatedAt: now,
      };
      projects.unshift(targetProject);
    }
  } else {
    targetProject = {
      ...projectData,
      id: `proj_${now}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: now,
      updatedAt: now,
    };
    projects.unshift(targetProject);
  }

  try {
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to save project to localStorage:', err);
  }

  return targetProject;
}

/**
 * Delete a saved project
 */
export function deleteProject(id: string): boolean {
  try {
    const projects = getSavedProjects().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
    return true;
  } catch (err) {
    console.error('Failed to delete project:', err);
    return false;
  }
}

/**
 * Clear all saved projects from localStorage
 */
export function clearAllProjects(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY_PROJECTS);
    return true;
  } catch (err) {
    console.error('Failed to clear all projects:', err);
    return false;
  }
}

/**
 * Get a specific saved project
 */
export function getProject(id: string): SavedProject | null {
  const projects = getSavedProjects();
  return projects.find((p) => p.id === id) || null;
}

/**
 * Save current state to AutoSave slot
 */
export function saveAutoSave(
  state: Omit<SavedProject, 'id' | 'name' | 'createdAt' | 'updatedAt'>
): void {
  try {
    const autoSaveData: SavedProject = {
      ...state,
      id: 'autosave_session',
      name: `Tự động lưu (${state.track.title || 'Dự án'})`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY_AUTOSAVE, JSON.stringify(autoSaveData));
  } catch (err) {
    // Silently handle quota limits
  }
}

/**
 * Get AutoSave data if available
 */
export function getAutoSave(): SavedProject | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTOSAVE);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

/**
 * Check if AutoSave exists
 */
export function hasAutoSave(): boolean {
  return !!localStorage.getItem(STORAGE_KEY_AUTOSAVE);
}

/**
 * Clear AutoSave
 */
export function clearAutoSave(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_AUTOSAVE);
  } catch (err) {
    // Ignore
  }
}

/**
 * Export project as downloadable JSON file
 */
export function exportProjectAsJSON(project: SavedProject): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
  const downloadAnchor = document.createElement('a');
  const filename = `SonaWave_Project_${(project.name || project.track.title).replace(/\s+/g, '_')}_${Date.now()}.sonawave.json`;
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Import project from JSON file
 */
export function importProjectFromJSON(file: File): Promise<SavedProject> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed || !parsed.visualizer || !parsed.background) {
          throw new Error('Định dạng file dự án không hợp lệ!');
        }

        const project: SavedProject = {
          id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          name: parsed.name || file.name.replace(/\.(json|sonawave)$/i, ''),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          aspectRatio: parsed.aspectRatio || '9:16',
          visualizer: { ...DEFAULT_VISUALIZER, ...parsed.visualizer },
          lyricsConfig: { ...DEFAULT_LYRICS, ...parsed.lyricsConfig },
          lyricsData: Array.isArray(parsed.lyricsData)
            ? parsed.lyricsData
            : parseAnyLyrics(SAMPLE_SRT_SYNTHWAVE, 30),
          background: { ...DEFAULT_BACKGROUND, ...parsed.background },
          particles: { ...DEFAULT_PARTICLES, ...parsed.particles },
          track: { ...DEFAULT_TRACK, ...parsed.track },
          textBoxes: Array.isArray(parsed.textBoxes) ? parsed.textBoxes : DEFAULT_TEXT_BOXES,
          filmLight: parsed.filmLight ? { ...DEFAULT_FILM_LIGHT, ...parsed.filmLight } : DEFAULT_FILM_LIGHT,
          colorGrading: parsed.colorGrading ? { ...DEFAULT_COLOR_GRADING, ...parsed.colorGrading } : DEFAULT_COLOR_GRADING,
          masterEq: parsed.masterEq ? { ...DEFAULT_MASTER_EQ, ...parsed.masterEq } : DEFAULT_MASTER_EQ,
          audioFileName: parsed.audioFileName || 'Imported_Audio.wav',
          sampleAudioType: parsed.sampleAudioType || 'synthwave',
        };

        resolve(project);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
}

export const STORAGE_KEY_MASTER_EQ_CUSTOM_PRESETS = 'sonawave_master_eq_custom_presets_v1';
export const MAX_CUSTOM_MASTER_EQ_PRESETS = 5;

/**
 * Get all custom Master EQ presets from localStorage (max 5)
 */
export function getMasterEQCustomPresets(): MasterEQCustomPreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MASTER_EQ_CUSTOM_PRESETS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, MAX_CUSTOM_MASTER_EQ_PRESETS);
  } catch (err) {
    console.error('Failed to load custom Master EQ presets from localStorage:', err);
    return [];
  }
}

/**
 * Save or overwrite a custom Master EQ preset in localStorage (max 5)
 */
export function saveMasterEQCustomPreset(
  presetData: {
    name: string;
    preampGain: number;
    lowCutFreq: number;
    highCutFreq: number;
    bands: MasterEQBands;
    id?: string;
  }
): { success: boolean; preset?: MasterEQCustomPreset; error?: string } {
  try {
    const presets = getMasterEQCustomPresets();
    const now = Date.now();

    if (presetData.id) {
      // Update existing preset
      const existingIdx = presets.findIndex((p) => p.id === presetData.id);
      if (existingIdx >= 0) {
        const updatedPreset: MasterEQCustomPreset = {
          ...presets[existingIdx],
          name: presetData.name.trim() || presets[existingIdx].name,
          preampGain: presetData.preampGain,
          lowCutFreq: presetData.lowCutFreq,
          highCutFreq: presetData.highCutFreq,
          bands: { ...presetData.bands },
        };
        presets[existingIdx] = updatedPreset;
        localStorage.setItem(STORAGE_KEY_MASTER_EQ_CUSTOM_PRESETS, JSON.stringify(presets));
        return { success: true, preset: updatedPreset };
      }
    }

    // Check if limit of 5 is reached
    if (presets.length >= MAX_CUSTOM_MASTER_EQ_PRESETS) {
      return {
        success: false,
        error: `Đã đạt giới hạn tối đa ${MAX_CUSTOM_MASTER_EQ_PRESETS} cấu hình tùy chỉnh. Vui lòng xóa bớt cấu hình cũ để lưu cấu hình mới.`,
      };
    }

    const newPreset: MasterEQCustomPreset = {
      id: `custom_eq_${now}_${Math.random().toString(36).substr(2, 4)}`,
      name: presetData.name.trim() || `Tùy Chỉnh EQ #${presets.length + 1}`,
      createdAt: now,
      preampGain: presetData.preampGain,
      lowCutFreq: presetData.lowCutFreq,
      highCutFreq: presetData.highCutFreq,
      bands: { ...presetData.bands },
    };

    presets.push(newPreset);
    localStorage.setItem(STORAGE_KEY_MASTER_EQ_CUSTOM_PRESETS, JSON.stringify(presets));
    return { success: true, preset: newPreset };
  } catch (err) {
    console.error('Failed to save custom Master EQ preset:', err);
    return { success: false, error: 'Không thể lưu cấu hình tùy chỉnh vào trình duyệt.' };
  }
}

/**
 * Delete a custom Master EQ preset by ID
 */
export function deleteMasterEQCustomPreset(id: string): MasterEQCustomPreset[] {
  try {
    const presets = getMasterEQCustomPresets();
    const filtered = presets.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY_MASTER_EQ_CUSTOM_PRESETS, JSON.stringify(filtered));
    return filtered;
  } catch (err) {
    console.error('Failed to delete custom Master EQ preset:', err);
    return getMasterEQCustomPresets();
  }
}

/**
 * Rename a custom Master EQ preset
 */
export function renameMasterEQCustomPreset(id: string, newName: string): MasterEQCustomPreset[] {
  try {
    const presets = getMasterEQCustomPresets();
    const existing = presets.find((p) => p.id === id);
    if (existing && newName.trim()) {
      existing.name = newName.trim();
      localStorage.setItem(STORAGE_KEY_MASTER_EQ_CUSTOM_PRESETS, JSON.stringify(presets));
    }
    return presets;
  } catch (err) {
    console.error('Failed to rename custom Master EQ preset:', err);
    return getMasterEQCustomPresets();
  }
}

