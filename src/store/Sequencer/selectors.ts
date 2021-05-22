import { RootState } from '../../containers/Xolombrisx';
// import { RootState } from '../';

export const activePattObjSelector = (activePatt: number) => (state: RootState) => state.sequencer.present.patterns[activePatt]
export const activePattSelector = (state: RootState) => state.sequencer.present.activePattern;
export const pattsObjSelector = (state: RootState) => state.sequencer.present.patterns;
export const counterSelector = (state: RootState) => state.sequencer.present.counter;
export const activeStepSelector = (state: RootState) => state.sequencer.present.step;
export const patternsSelector = (state: RootState) => state.sequencer.present.patterns;
export const pattObjSelector = (pattern: number) => (state: RootState) => state.sequencer.present.patterns[pattern]

export const activePattTrkNoteLenSelector = (activePatt: number, selectedTrkIdx: number) => {
    return (state: RootState) => state.sequencer.present.patterns[activePatt].tracks[selectedTrkIdx].noteLength
}
export const activePattLenSelector = (activePatt: number) => (state: RootState) => { 
    return state.sequencer.present.patterns[activePatt].patternLength; 
}
export const activePageSelector = (activePatt: number, selectedTrkIdx: number) =>  (state: RootState) => { 
    return state.sequencer.present.patterns[activePatt].tracks[selectedTrkIdx].page; 
}
export const activePattTrkLenSelector = (activePatt: number, selectedTrkIndex: number) => (state: RootState) => { 
    return state.sequencer.present.patterns[activePatt].tracks[selectedTrkIndex].length 
}
export const eventsSelector = (activePatt: number, selectedTrkIndex: number) =>  (state: RootState) => { 
    return state.sequencer.present.patterns[activePatt].tracks[selectedTrkIndex].events 
}
export const selectedStepsSelector = (activePatt: number, selectedTrkIndex: number) => (state: RootState) => { 
    return state.sequencer.present.patterns[activePatt].tracks[selectedTrkIndex].selected 
}
export const pattTrkVelocitySelector = (activePatt: number, selectedTrkIndex: number) => (state: RootState) => { 
    return state.sequencer.present.patterns[activePatt].tracks[selectedTrkIndex].velocity 
}
export const pattVelocitiesSelector = (index: number) => (state: RootState) => {
    let o: { [key: number]: number } = {}
    Object.keys(state.sequencer.present.patterns).forEach(key => {
        let k = parseInt(key)
        o[k] = state.sequencer.present.patterns[k].tracks[index].velocity
    });
    return o;
}
export const pattsNoteLenSelector = (index: number) => (state: RootState) => {
    let o: { [key: number]: string | number | undefined } = {}
    Object.entries(state.sequencer.present.patterns).forEach(([key, pattern]) => {
        let k = parseInt(key);
        o[k] = pattern.tracks[index].noteLength;
    });
    Object.keys(state.sequencer.present.patterns).forEach(key => {
        let k = parseInt(key)
        o[k] = state.sequencer.present.patterns[k].tracks[index].noteLength
    });
    return o
}
export const pattsLenSelector = (state: RootState) => {
    let o: { [key: number]: any } = {}
    Object.keys(state.sequencer.present.patterns).forEach(key => {
        let k = parseInt(key)
        o[k] = state.sequencer.present.patterns[k].patternLength
    });
    return o;
}
export const trkPattsLenSelector = (index: number) => (state: RootState) => {
    let o: { [key: number]: any } = {}
    Object.keys(state.sequencer.present.patterns).forEach(key => {
        let k = parseInt(key)
        o[k] = state.sequencer.present.patterns[k].tracks[index].length
    });
    return o;
}
export const controllerKeysSelector = (selectedChannel: number | 'all' | undefined, selectedDevice: string | undefined) => 
    (state: RootState) => {
        return (selectedDevice && !Number.isNaN(Number(selectedChannel))) 
            ? state.midi.devices[selectedDevice][Number(selectedChannel)] 
            : (selectedDevice === 'onboardKey' && selectedChannel === 'all') 
            ? state.midi.devices[selectedDevice]['all']
            : false
    } 
