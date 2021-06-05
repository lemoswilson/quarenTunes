import { RootState } from '../../containers/Xolombrisx';

export const trackSelector = (state: RootState) => state.track.present;
export const tracksSelector = (state: RootState) => state.track.present.tracks;
export const effectsLengthsSelector = (state: RootState) => state.track.present.tracks.map(track => track.fx.length);
export const selectedTrkIdxSelector = (state: RootState) => state.track.present.selectedTrack;
export const selectedTrkIdSelector = (trackIndex: number) => (state: RootState) => state.track.present.tracks[trackIndex].id;
export const instrumentIdCounterSelector = (state: RootState) => state.track.present.instrumentCounter;
export const trkCountSelector = (state: RootState) => state.track.present.trackCount;
export const fxCountSelector = (trackIndex: number) => (state: RootState) => state.track.present.tracks[trackIndex].fx.length
export const selectedTrkVoiceSelector = (selectedTrkIndex: number) => (state: RootState) => state.track.present.tracks[selectedTrkIndex].instrument
export const trackNameSelector = (selectedTrkIndex: number) => (state: RootState) => state.track.present.tracks[selectedTrkIndex].name;
export const effectNameSelector = (selectedTrkIndex: number, fxIndex?: number) => (state: RootState) => fxIndex || fxIndex === 0  ? state.track.present.tracks[selectedTrkIndex].fx[fxIndex].name : undefined;
export const selectedDeviceSelector = (selectedTrkIndex: number) => (state: RootState) => {
    return state.track.present.tracks[selectedTrkIndex].midi.device
} 
export const selectedChannelSelector = (selectedTrkIndex: number) => (state: RootState) => {
    return state.track.present.tracks[selectedTrkIndex].midi.channel
}