import * as Tone from 'tone';
import { MutableRefObject } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    setActivePlayer,
    addRow,
    selectSong,
    addSong,
    setPattern,
    setRepeat,
    increaseDecreaseRepeat,
    removeRow,
    renameSong,
    swapEvents,
    songEvent,
    removeSong,
    Song,
    arrangerMode,
} from '../../../store/Arranger'
import { selectPattern } from '../../../store/Sequencer';
import { newPatternObject }  from '../../../components/Layout';
import { ToneObjectContextType } from '../../../context/ToneObjectsContext';
import { DropResult } from 'react-beautiful-dnd';
import triggEmitter, { triggEventTypes } from '../../../lib/Emitters/triggEmitter';
import { Track } from '../../../store/Track';
import { trackSelector } from '../../../store/Track/selectors';
import { hashPatternsSelector } from '../../../store/Arranger/selectors';

export const useArrangerDispatchers = (
    ref_toneObjects: ToneObjectContextType,
    ref_isFollow: MutableRefObject<boolean>,
    activePatt: number,
    currentSong: number,
    arrgMode: arrangerMode,
    trkCount: number,
    songEvents: songEvent[], 
    songs: {[key: number]: Song},
    // Track: Track,
) => {
    const dispatch = useDispatch();
	const Track = useSelector(trackSelector);


	const goToPattern = (pattern: number, eventIndex: number,) => {
		console.log('should be going to pattern, pattern is', pattern, 'event index is', eventIndex);


		dispatch(setActivePlayer(pattern, eventIndex))
		if (ref_isFollow.current){
            
			console.log('is following is real, go to pattern', pattern);
			dispatch(selectPattern(pattern))
		}
	}

	const _addRow = (index: number): void => {

		if (ref_toneObjects.current){
			ref_toneObjects.current.arranger
				.splice(
					index + 1, 
					0, 
					newPatternObject(Tone, Track)
					
				)
		}

		triggEmitter.emit(triggEventTypes.NEW_EVENT, {eventIndex: index + 1})

		dispatch(addRow(index));
	}

	const updateToneObjs = (nextEv: number) => {
		let currEv = songEvents.length

		if (currEv < nextEv && ref_toneObjects.current){

			while (currEv !== nextEv){
				ref_toneObjects.current.arranger
					.push(newPatternObject(Tone, Track))
				currEv ++ 
			}

		} else if (currEv > nextEv && ref_toneObjects.current) {

			while (currEv !== nextEv){
				for (let i = 0; i < trkCount ; i ++){
					ref_toneObjects.current.arranger[currEv-1][i].instrument.dispose()
					const fxCount = ref_toneObjects.current.arranger[currEv-1][i].effects.length	

					for (let j = 0; j < fxCount; j ++)
						ref_toneObjects.current.arranger[currEv-1][i].effects[j].dispose()
				}

				ref_toneObjects.current.arranger.pop()
				currEv -- 
			}

		}
	}

	const _selectSong = (nextSong: number): void => {

		updateToneObjs(songs[nextSong].events.length)
		dispatch(selectSong(nextSong));
	};


	const _addSong = (): void => { 
		updateToneObjs(1)
		dispatch(addSong(activePatt)); 
	};

	const _removeSong = (): void => {
		if (arrgMode === arrangerMode.ARRANGER)
			Tone.Transport.cancel();

		const nextSong = Number(Object.keys(songs).find(song => Number(song) !== currentSong))
		updateToneObjs(songs[nextSong].events.length)
		dispatch(removeSong(currentSong, nextSong));
	};

	const _setEventPattern = (eventIndex: number, pattern: number): void => {
		dispatch(setPattern(pattern, eventIndex));
	};

	const _setRepeat = (repeat: number, eventIndex: number): void => {
		dispatch(setRepeat(repeat, eventIndex));
	};

	const _incDecRepeat = (amount: number, song: number, eventIndex: number): void => {
		dispatch(increaseDecreaseRepeat(song, eventIndex, amount))

	}

	const _removeRow = (index: number): void => {

		if (ref_toneObjects.current){
			for (let i = 0; i < trkCount; i ++)	{

				ref_toneObjects.current.arranger[index][i].instrument.dispose()
				const fx = ref_toneObjects.current.arranger[index][i].effects.length;
				for (let j = 0; j < fx ; j ++)
					ref_toneObjects.current.arranger[index][i].effects[j].dispose()

			}

			ref_toneObjects.current.arranger.splice(index, 1)
		}

		dispatch(removeRow(index));

	};

	const _renameSong = (event: React.FormEvent<HTMLFormElement>): void => {
		event.preventDefault();
		const input = event.currentTarget.getElementsByTagName('input')[0];
		if (input.value.length >= 1) {
			dispatch(renameSong(currentSong, input.value))
		} else {
			input.value = songs[currentSong].name;
		}
	}

	const onDragEnd = (result: DropResult) => {
		if (!result.destination) {
			return;
		}

		const source = result.source.index;
		const destination = result.destination.index;
		if (ref_toneObjects.current && source !== destination){
			[ref_toneObjects.current.arranger[source], ref_toneObjects.current.arranger[destination]] =
			[ref_toneObjects.current.arranger[destination], ref_toneObjects.current.arranger[source]]
			dispatch(swapEvents(currentSong, source, destination))
		}

	}

    return {
        goToPattern,
        _addRow,
        _selectSong,
        _addSong,
        _removeSong,
        _setEventPattern,
        _setRepeat,
        _incDecRepeat,
        _removeRow,
        _renameSong,
        onDragEnd,
    }
}