import produce from "immer";
import {
	sequencerActionTypes,
	sequencerActions,
	Sequencer,
	LockData,
} from "./types";

export const initialState: Sequencer = {
	activePattern: 0,
	counter: 1,
	followSchedulerID: undefined,
	override: true,
	patterns: {
		0: {
			name: "pattern 1",
			patternLength: 16,
			tracks: [
				{
					events: Array(16).fill({}),
					length: 16,
					noteLength: "16n",
					page: 0,
					selected: [],
					velocity: 60
				},
			],
		},
	},
	quantizeRecording: false,
	step: undefined,
	stepFollowerdID: undefined,
};

export function sequencerReducer(
	state: Sequencer = initialState,
	action: sequencerActionTypes
): Sequencer {
	return produce(state, (draft) => {
		let pattern: number,
			track: number,
			patternLength: number,
			noteLength: number | string,
			selected: number[],
			page: number,
			patternToGo: number | undefined,
			pageToGo: number | undefined,
			data: LockData,
			note: string[] | string,
			offset: number,
			name: string,
			velocity: number,
			step: number[] | number,
			counter: number = draft.counter,
			pastEvent: any
		switch (action.type) {
			case sequencerActions.ADD_INSTRUMENT_TO_SEQUENCER:
				let trackNumber: number = draft.patterns[0].tracks.length;
				Object.keys(draft.patterns).forEach(
					(v) =>
						(draft.patterns[parseInt(v)].tracks[trackNumber] = {
							length: 16,
							events: Array(16).fill({}),
							noteLength: "16n",
							velocity: 60,
							page: 0,
							selected: [],
						})
				);
				break;
			case sequencerActions.REMOVE_INSTRUMENT_FROM_SEQUENCER:
				track = action.payload.index;
				Object.keys(draft.patterns).forEach((v) =>
					draft.patterns[parseInt(v)].tracks.splice(track, 1)
				);
				break;
			case sequencerActions.ADD_PATTERN:
				draft.patterns[draft.counter] = {
					name: `Pattern ${draft.counter + 1}`,
					patternLength: 16,
					tracks: [],
				};
				[...Array(draft.patterns[0].tracks.length).keys()].forEach((i) => {
					draft.patterns[draft.counter].tracks[i] = {
						length: 16,
						events: Array(16).fill({}),
						velocity: 60,
						noteLength: "16n",
						page: 0,
						selected: [],
					};
				});
				draft.counter = draft.counter + 1;
				break;
			case sequencerActions.CHANGE_PAGE:
				[page, pattern, track] = [
					action.payload.page,
					action.payload.pattern,
					action.payload.track,
				];
				draft.patterns[pattern].tracks[track].page = page;
				break;
			case sequencerActions.CHANGE_PATTERN_LENGTH:
				[pattern, patternLength] = [action.payload.pattern, action.payload.patternLength];
				draft.patterns[pattern].patternLength = patternLength;
				break;
			case sequencerActions.CHANGE_TRACK_LENGTH:
				[patternLength, track, pattern] = [
					action.payload.patternLength,
					action.payload.track,
					action.payload.pattern,
				];
				draft.patterns[pattern].tracks[track].length = patternLength;
				break;
			case sequencerActions.DELETE_EVENTS:
				[pattern, track, step] = [action.payload.pattern, action.payload.track, action.payload.step];
				draft.patterns[pattern].tracks[track].events[step] = {};
				break;
			case sequencerActions.GO_TO_ACTIVE:
				[patternToGo, pageToGo, track] = [
					action.payload.patternToGo,
					action.payload.pageToGo,
					action.payload.track,
				];
				if (patternToGo && pageToGo)
					[draft.activePattern, draft.patterns[patternToGo].tracks[track].page] = [
						patternToGo,
						pageToGo,
					];
				else if (patternToGo && !pageToGo) draft.activePattern = patternToGo;
				else if (!patternToGo && pageToGo)
					draft.patterns[draft.activePattern].tracks[track].page = pageToGo;
				break;
			case sequencerActions.PARAMETER_LOCK:
				[data, pattern, step, track] = [
					action.payload.data,
					action.payload.pattern,
					action.payload.step,
					action.payload.track,
				];
				step.forEach((v, i, a) => {
					draft.patterns[pattern].tracks[track].events[v][data.parameter] =
						data.value;
				});
				break;
			case sequencerActions.REMOVE_PATTERN:
				pattern = action.payload.patternKey;
				delete draft.patterns[pattern];
				break;
			case sequencerActions.SELECT_PATTERN:
				pattern = action.payload.pattern;
				draft.activePattern = pattern;
				break;
			case sequencerActions.SELECT_STEP:
				[pattern, track, step] = [
					action.payload.pattern,
					action.payload.track,
					action.payload.step,
				];
				if (draft.patterns[pattern].tracks[track].selected.includes(step)) {
					const ind: number = draft.patterns[pattern].tracks[track].selected.indexOf(
						step
					);
					draft.patterns[pattern].tracks[track].selected.splice(ind, 1);
				} else {
					draft.patterns[pattern].tracks[track].selected.push(step);
				}
				break;
			case sequencerActions.SET_NOTE:
				[pattern, track, step, note] = [
					action.payload.pattern,
					action.payload.track,
					action.payload.step,
					action.payload.note,
				];
				draft.patterns[pattern].tracks[track].events[step]["note"] = note
				break;
			case sequencerActions.SET_NOTE_MIDI:
				[track, note, velocity, step] = [
					action.payload.track,
					action.payload.note,
					action.payload.step,
					action.payload.velocity
				]
				if (!draft.patterns[draft.activePattern].tracks[track].events[step]['notes'].includes(note))
					draft.patterns[draft.activePattern].tracks[track].events[step]['notes'].push(note);
				else
					draft.patterns[draft.activePattern].tracks[track].events[step]['notes'] =
						draft.patterns[draft.activePattern].tracks[track].events[step]['notes'].filter((n: string) => n !== note)
				draft.patterns[draft.activePattern].tracks[track].events[step]['velocity'] = velocity;
				break;
			case sequencerActions.SET_NOTE_LENGTH:
				[noteLength, step, pattern, track] = [
					action.payload.noteLength,
					action.payload.step,
					action.payload.pattern,
					action.payload.track,
				];
				draft.patterns[pattern].tracks[track].events[step]["length"] = noteLength
				break;
			case sequencerActions.SET_NOTE_LENGTH_PLAYBACK:
				[noteLength, note, pattern, track, step] = [
					action.payload.noteLength,
					action.payload.note,
					action.payload.pattern,
					action.payload.track,
					action.payload.step,
				];
				if (draft.override)
					draft.patterns[pattern].tracks[track].events[step].note = [note];
				else if (
					!draft.override &&
					draft.patterns[pattern].tracks[track].events[step].note.includes(note)
				)
					draft.patterns[pattern].tracks[track].events[step].note.push(note);
				break;
			case sequencerActions.SET_OFFSET:
				[pattern, track, step, offset] = [
					action.payload.pattern,
					action.payload.track,
					action.payload.step,
					action.payload.offset,
				];
				draft.patterns[pattern].tracks[track].events[step].offset = offset
				break;
			case sequencerActions.SET_PATTERN_NOTE_LENGTH:
				[pattern, noteLength, track] = [action.payload.pattern, action.payload.noteLength, action.payload.track];
				draft.patterns[pattern].tracks[track].noteLength = noteLength;
				break;
			case sequencerActions.SET_PLAYBACK_INPUT:
				[pattern, track, step, offset, note, velocity] = [
					action.payload.pattern,
					action.payload.track,
					action.payload.step,
					action.payload.offset,
					action.payload.note,
					action.payload.velocity,
				];
				draft.patterns[pattern].tracks[track].events[step].note = note;
				draft.patterns[pattern].tracks[track].events[step].offset = offset;
				draft.patterns[pattern].tracks[track].events[step].velocity = velocity;
				break;
			case sequencerActions.SET_VELOCITY:
				[pattern, track, step, velocity] = [
					action.payload.pattern,
					action.payload.track,
					action.payload.step,
					action.payload.velocity,
				];
				draft.patterns[pattern].tracks[track].events[step].velocity = velocity;
				break;
			case sequencerActions.TOGGLE_OVERRIDE:
				draft.override = !draft.override;
				break;
			case sequencerActions.TOGGLE_RECORDING_QUANTIZATION:
				draft.quantizeRecording = !draft.quantizeRecording;
				break;
			case sequencerActions.CHANGE_PATTERN_NAME:
				[pattern, name] = [action.payload.pattern, action.payload.name]
				draft.patterns[pattern].name = name;
				break;
			case sequencerActions.DUPLICATE_PATTERN:
				[pattern] = [action.payload.pattern]
				draft.patterns[counter] = {
					...draft.patterns[pattern],
					name: draft.patterns[pattern].name + ' Copy'
				}
				draft.counter = draft.counter + 1;
		}
	});
}
