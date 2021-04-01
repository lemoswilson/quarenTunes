import produce from "immer";
import { startEndRange } from "../../lib/utility";
import {
	arrangerActions,
	arrangerMode,
	Arranger,
	arrangerActionTypes,
} from "./types";

export const initialState: Arranger = {
	mode: arrangerMode.PATTERN,
	following: false,
	selectedSong: 0,
	counter: 1,
	patternTracker: [],
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
	action: arrangerActionTypes
): Arranger {
	return produce(state, (draft) => {
		switch (action.type) {
			case arrangerActions.ADD_ROW:
				draft.songs[draft.selectedSong]["events"].splice(
					action.payload.index + 1,
					0,
					{
						pattern: draft.songs[draft.selectedSong].events[action.payload.index].pattern,
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
							pattern: draft.songs[Number(Object.keys(draft.songs)[0])].events[0].pattern,
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
				draft.songs[draft.selectedSong].events.splice(action.payload.rowIndex, 1);
				break;
			case arrangerActions.REMOVE_SONG:
				delete draft.songs[draft.selectedSong];
				draft.selectedSong = Number(Object.keys(draft.songs)[0])
				break;
			case arrangerActions.SELECT_SONG:
				draft.selectedSong = action.payload.song;
				break;
			case arrangerActions.SET_FOLLOW:
				draft.following = action.payload.follow;
				break;
			case arrangerActions.SET_MODE:
				draft.mode = action.payload.arrangerMode;
				break;
			case arrangerActions.SET_MUTE:
				draft.songs[draft.selectedSong].events[action.payload.eventIndex].mute =
					action.payload.mutes;
				break;
			case arrangerActions.SET_PATTERN:
				console.log('setting pattern')
				draft.songs[draft.selectedSong].events[action.payload.eventIndex].pattern =
					action.payload.pattern;
				break;
			case arrangerActions.SET_REPEAT:
				draft.songs[draft.selectedSong].events[action.payload.eventIndex].repeat =
					action.payload.repeat;
				break;
			case arrangerActions.INC_DEC_REPEAT:
				console.log('inside arranger reducer, inc dec')
				const [amount, songId, eventIndex] = [
					action.payload.amount,
					action.payload.song,
					action.payload.eventIndex
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
				draft.songs[action.payload.song].name = action.payload.name;
				break;
			case arrangerActions.REMOVE_PATTERN:
				let index = action.payload.index;
				Object.keys(draft.songs).forEach((k) =>
					draft.songs[parseInt(k)].events.forEach((x, idx, arr) => {
						if (arr[idx].pattern === index) arr[idx].pattern = -1;
					})
				);
				break
			case arrangerActions.SET_TRACKER:
				let tracker: number[] = action.payload.tracker;
				draft.patternTracker = tracker;
				break;
			case arrangerActions.SET_TIMER:
				const timer = action.payload.timer;
				const song = action.payload.song;
				draft.songs[song].timer = timer;
				break;

		}
	});
}
