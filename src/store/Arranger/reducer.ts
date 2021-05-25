import produce from "immer";
import {
	arrangerActions,
	arrangerMode,
	Arranger,
	arrangerActionTypes,
} from "./types";
import { sequencerActions } from '../Sequencer';

export const initialState: Arranger = {
	mode: arrangerMode.PATTERN,
	following: false,
	selectedSong: 0,
	step: 0,
	counter: 1,
	patternTracker: {
		activeEventIndex: -1,
		patternPlaying: -1,
		playbackStart: 0,
	},
	songs: {
		0: {
			name: "song 1",
			events: [
				{
					pattern: 0,
					repeat: 1,
					mute: [],
					id: 0,
				},
			],
			timer: [0],
			counter: 1,
		},
	},
};

export function arrangerReducer(
	state: Arranger = initialState,
	a: arrangerActionTypes
): Arranger {
	return produce(state, (draft) => {
		// let song;
		switch (a.type) {
			case arrangerActions.ADD_ROW:
				draft.songs[draft.selectedSong]["events"].splice(
					a.payload.index + 1,
					0,
					{
						pattern: draft.songs[draft.selectedSong].events[a.payload.index].pattern,
						repeat: 1,
						mute: [],
						id: draft.songs[draft.selectedSong]["counter"],
					}
				);
				draft.songs[draft.selectedSong].counter =
					draft.songs[draft.selectedSong].counter + 1;
				break;
			case arrangerActions.ADD_SONG:
				draft.songs[draft.counter] = {
					name: `song ${draft.counter + 1}`,
					events: [
						{
							pattern: a.payload.initPatt,
							repeat: 1,
							mute: [],
							id: 0,
						},
					],
					timer: [0],
					counter: 1,
				};
				draft.selectedSong = draft.counter
				draft.counter = draft.counter + 1;
				break;
			case arrangerActions.PREPEND_ROW:
				draft.songs[draft.selectedSong].events.unshift({
					pattern: -1,
					repeat: 0,
					mute: [],
					id: draft.songs[draft.selectedSong].counter,
				});
				draft.songs[draft.selectedSong].counter =
					draft.songs[draft.selectedSong].counter + 1;
				break;
			case arrangerActions.REMOVE_ROW:
				draft.songs[draft.selectedSong].events.splice(a.payload.rowIndex, 1);
				break;
			case arrangerActions.REMOVE_SONG:
				delete draft.songs[draft.selectedSong];
				draft.selectedSong = a.payload.nextSong
				break;
			case arrangerActions.SELECT_SONG:
				draft.selectedSong = a.payload.song;
				break;
			case arrangerActions.SET_FOLLOW:
				draft.following = a.payload.follow;
				break;
			case arrangerActions.SET_MODE:
				draft.mode = a.payload.arrangerMode;
				break;
			case arrangerActions.SET_MUTE:
				draft.songs[draft.selectedSong].events[a.payload.eventIndex].mute =
					a.payload.mutes;
				break;
			case arrangerActions.SET_PATTERN:
				console.log('setting pattern')
				draft.songs[draft.selectedSong].events[a.payload.eventIndex].pattern =
					a.payload.pattern;
				break;
			case arrangerActions.SET_REPEAT:
				draft.songs[draft.selectedSong].events[a.payload.eventIndex].repeat =
					a.payload.repeat;
				break;
			case arrangerActions.INC_DEC_REPEAT:
				console.log('inside arranger reducer, inc dec')
				const [amount, songId, eventIndex] = [
					a.payload.amount,
					a.payload.song,
					a.payload.eventIndex
				]
				const total = draft.songs[songId].events[eventIndex].repeat + amount
				draft.songs[songId].events[eventIndex].repeat =
					total >= 1 && total <= 100
						? total
						: total < 1
							? 1
							: 100
				break;
			case arrangerActions.RENAME_SONG:
				draft.songs[a.payload.song].name = a.payload.name;
				break;
			case sequencerActions.REMOVE_PATTERN:
				let pattern = a.payload.pattern;
				let next = a.payload.nextPattern;
				Object.keys(draft.songs).forEach((k) =>
					draft.songs[parseInt(k)].events.forEach((x, idx, arr) => {
						if (arr[idx].pattern === pattern) arr[idx].pattern = next;
					})
				);
				break
			case arrangerActions.SET_ACTIVE_PLAYER:
				draft.patternTracker.patternPlaying = a.payload.patternPlaying;
				draft.patternTracker.activeEventIndex = a.payload.activeEventIndex;
				break;
			case arrangerActions.SET_PLAYBACK_START:
				draft.patternTracker.playbackStart = a.payload.startEventIndex
				break;
			case arrangerActions.SET_TIMER:
				const timer = a.payload.timer;
				draft.songs[a.payload.song].timer = timer;
				break;
			case arrangerActions.SWAP_EVENTS:
				const from = a.payload.from;
				const to = a.payload.to;
				[draft.songs[a.payload.song].events[from],
				draft.songs[a.payload.song].events[to]
				] = [
						draft.songs[a.payload.song].events[to],
						draft.songs[a.payload.song].events[from]
					]
				break;
			case arrangerActions.TOGGLE_MODE:
				draft.mode = draft.mode === arrangerMode.ARRANGER ? arrangerMode.PATTERN : arrangerMode.ARRANGER
				break;
		}
	});
}
