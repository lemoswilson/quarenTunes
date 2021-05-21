import { RootState } from '../../containers/Xolombrisx';

const trackSelector = (state: RootState) => state.track.present;
const effectLengthsSelector = (state: RootState) => state.track.present.tracks.map(track => track.fx.length);
const selectedTrkIdxSelector = (state: RootState) => state.track.present.selectedTrack;
const trkCountSelector = (state: RootState) => state.track.present.trackCount;
const fxCountSelector = (trackIndex: number) => (state: RootState) => state.track.present.tracks[trackIndex].fx.length
const selectedTrkVoiceSelector = (selectedTrkIndex: number) => (state: RootState) => state.track.present.tracks[selectedTrkIndex].instrument
const selectedDeviceSelector = (selectedTrkIndex: number) => (state: RootState) => {
    return state.track.present.tracks[selectedTrkIndex].midi.device
} 
const selectedChannelSelector = (selectedTrkIndex: number) => (state: RootState) => {
    return state.track.present.tracks[selectedTrkIndex].midi.channel
}