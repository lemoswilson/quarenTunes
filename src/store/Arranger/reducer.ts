import produce from "immer";
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
					pattern: -1,
					repeat: 0,
					mute: [],
					id: 0,
				},
			],
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
						pattern: -1,
						repeat: 0,
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
							pattern: -1,
							repeat: 0,
							mute: [],
							id: 0,
						},
					],
					counter: 1,
				};
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
				Object.keys(draft.songs).some((key) => {
					let songIndex: number = parseInt(key);
					if (draft.songs[songIndex]) {
						draft.selectedSong = songIndex;
						return true;
					} else return false;
				});
				break;
			case arrangerActions.SELECT_SONG:
				draft.selectedSong = action.payload.songIndex;
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
				draft.songs[draft.selectedSong].events[action.payload.eventIndex].pattern =
					action.payload.pattern;
				break;
			case arrangerActions.SET_REPEAT:
				draft.songs[draft.selectedSong].events[action.payload.eventIndex].repeat =
					action.payload.repeat;
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
		}
	});
}
