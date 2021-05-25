import { useSelector } from 'react-redux';
import { arrgModeSelector, 
    currentSongEventsSelector, 
    currentSongObjSelector, 
    currentSongSelector, 
    hashPatternsSelector, 
    isFollowSelector, 
    pattTrackerSelector, 
    songsSelector 
} from '../../store/Arranger/selectors';
import useQuickRef from '../useQuickRef';
import usePrevious from '../usePrevious';
import { pattsObjSelector } from '../../store/Sequencer/selectors';

export const useArrangerSelector = () => {

    const pattsObj = useSelector(pattsObjSelector);
    const currentSong = useSelector(currentSongSelector);
	const activeSongObj = useSelector(currentSongObjSelector(currentSong));
	const songEvents = useSelector(currentSongEventsSelector(currentSong))
    const ref_songEvents = useQuickRef(songEvents);
	const hashedPatterns = useSelector(hashPatternsSelector(currentSong));
	const isFollow = useSelector(isFollowSelector);
	const ref_isFollow = useQuickRef(isFollow);
	const songs = useSelector(songsSelector);
    const arrgMode = useSelector(arrgModeSelector)
	const prev_arrgMode = usePrevious(arrgMode);
	const songLength = songEvents.map(
        s => pattsObj[s.pattern].patternLength * s.repeat
    ).reduce((prev, next) => prev + next)

    return { 
        currentSong, 
        activeSongObj,
        songEvents,
        ref_songEvents,
        hashedPatterns,
        songLength,
        ref_isFollow,
        songs,
        arrgMode,
        prev_arrgMode,
    }
}

export const useSourceArrgSelector = () => {
    const pattTracker = useSelector(pattTrackerSelector);
    const ref_pattTracker = useQuickRef(pattTracker);
    const arrgMode = useSelector(arrgModeSelector);
    const ref_arrgMode = useQuickRef(arrgMode);
    const currentSong = useSelector(currentSongSelector);

    return { pattTracker, ref_pattTracker, arrgMode, ref_arrgMode, currentSong };
}