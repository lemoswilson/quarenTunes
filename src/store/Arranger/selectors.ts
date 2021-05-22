import { RootState } from '../../containers/Xolombrisx';
import { Pattern } from '../Sequencer'
// import { RootState } from '../';

interface pattObjs {
    [key: number]: Pattern
}

export const currentSongSelector = (state: RootState) => state.arranger.present.selectedSong;
export const currentSongObjSelector = (currentSong: number) => (state: RootState) => state.arranger.present.songs[currentSong]
export const currentSongEventsSelector = (currentSong: number) => (state: RootState) => state.arranger.present.songs[currentSong].events
export const hashPatternsSelector = (currentSong: number) => (state: RootState) => state.arranger.present.songs[currentSong].events.map(e => e.pattern).reduce((prev, next) => prev + next)

export const pattTrackerSelector = (state: RootState) => state.arranger.present.patternTracker;
export const isFollowSelector = (state: RootState) => state.arranger.present.following;
export const songsSelector = (state: RootState) => state.arranger.present.songs;
export const arrgModeSelector = (state: RootState) => state.arranger.present.mode;
export const activeSongPattSelector = (state: RootState) => state.arranger.present.patternTracker.patternPlaying;


export const eventStartTimesSelector = 
    (currentSong: number, pattsObj: pattObjs) => 
        (state: RootState) => {
            const times: number[] = []
            let acc = 0
            state.arranger.present
            .songs[currentSong].events.forEach((event, idx, __) => {
                times.push(acc);
                acc = acc + pattsObj[event.pattern].patternLength * event.repeat
            })
            return times
        }