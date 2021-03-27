import produce from "immer";
import {
	sequencerActionTypes,
	sequencerActions,
	Sequencer,
} from "./types";
import { propertiesToArray, getNested, setNestedValue } from "../../lib/objectDecompose";
import { eventOptions } from "../../containers/Track/Instruments";

export const initialState: Sequencer = {
	activePattern: 0,
	counter: 1,
	// followSchedulerID: undefined,
	override: true,
	patterns: {
		0: {
			name: "pattern 1",
			patternLength: 16,
			tracks: [
				{
					events: Array(16).fill({ instrument: {}, fx: [], offset: 0 }),
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
			index: number,
			from: number,
			to: number,
			page: number,
			patternToGo: number | undefined,
			pageToGo: number | undefined,
			data: eventOptions,
			note: string[] | string,
			offset: number,
			name: string,
			amount: number,
			velocity: number,
			fxIndex: number,
			step: number,
			counter: number = draft.counter
		switch (action.type) {
			case sequencerActions.ADD_INSTRUMENT_TO_SEQUENCER:
				let trackNumber: number = draft.patterns[0].tracks.length;
				Object.keys(draft.patterns).forEach(
					(v) =>
					(draft.patterns[parseInt(v)].tracks[trackNumber] = {
						length: 16,
						events: Array(16).fill({ instrument: {}, fx: {}, offset: 0 }),
						// eventsFx: Array(16).fill({}),
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
						events: Array(16).fill({ instrument: {}, fx: {}, offset: 0 }),
						// eventsFx: Array(16).fill({}),
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
			case sequencerActions.INC_DEC_OFFSET:
				[track, pattern, step, amount] =
					[
						action.payload.track,
						action.payload.pattern,
						action.payload.step,
						action.payload.amount,
					]
				const totalOffset = draft.patterns[pattern].tracks[track].events[step].offset + amount
				draft.patterns[pattern].tracks[track].events[step].offset =
					(amount > 0 && totalOffset <= 100) || (amount < 0 && totalOffset >= -100)
						? totalOffset
						: amount > 0 && totalOffset > 100
							? 100
							: -100
				break
			case sequencerActions.INC_DEC_VELOCITY:
				[track, pattern, step, amount] =
					[
						action.payload.track,
						action.payload.pattern,
						action.payload.step,
						action.payload.amount,
					]
				if (step > 0) {
					const totalVelocity = Number(draft.patterns[pattern].tracks[track].events[step].instrument.velocity) + amount
					draft.patterns[pattern].tracks[track].events[step].offset =
						(amount > 0 && totalVelocity <= 127) || (amount < 0 && totalVelocity >= 0)
							? totalVelocity
							: amount > 0 && totalVelocity > 127
								? 127
								: 0
				} else {
					const totalVelocity = Number(draft.patterns[pattern].tracks[track].velocity)
					draft.patterns[pattern].tracks[track].velocity =
						(amount > 0 && totalVelocity < 127) || (amount < 0 && totalVelocity > 0)
							? totalVelocity + amount
							: amount > 0 && totalVelocity === 127
								? 127
								: -10
				}
				break
			case sequencerActions.INC_DEC_PAT_LENGTH:
				[amount, pattern] = [
					action.payload.amount,
					action.payload.pattern,
				];
				const totalPat = draft.patterns[pattern].patternLength + amount
				draft.patterns[pattern].patternLength =
					(amount > 0 && totalPat <= 64) || (amount < 0 && totalPat >= 1)
						? totalPat
						: amount > 0 && totalPat > 64
							? 64
							: 1
				break;
			case sequencerActions.INC_DEC_TRACK_LENGTH:
				[amount, pattern, track] = [
					action.payload.amount,
					action.payload.pattern,
					action.payload.track
				];
				const totalTrack = draft.patterns[pattern].tracks[track].length + amount
				draft.patterns[pattern].tracks[track].length =
					(amount > 0 && totalTrack <= 64) || (amount < 0 && totalTrack >= 1)
						? totalTrack
						: amount > 0 && totalTrack > 64
							? 64
							: 1
				break;
			case sequencerActions.RENAME_PATTERN:
				[name, pattern] = [
					action.payload.name,
					action.payload.pattern
				]
				draft.patterns[pattern].name = name
				break;
			case sequencerActions.DELETE_EVENTS:
				[pattern, track, step] = [action.payload.pattern, action.payload.track, action.payload.step];
				draft.patterns[pattern].tracks[track].events[step] = { fx: [], instrument: [], offset: 0 };
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
				const prop = propertiesToArray(data)[0];
				const val = getNested(data, prop);
				setNestedValue(prop, val, draft.patterns[pattern].tracks[track].events[step].instrument);
				break;
			case sequencerActions.REMOVE_PATTERN:
				pattern = action.payload.patternKey;
				delete draft.patterns[pattern];
				break;
			case sequencerActions.SELECT_PATTERN:
				console.log('selecting patterns');
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
				const noteIndex = draft.patterns[pattern].tracks[track].events[step].instrument.note?.indexOf(note);
				if (noteIndex && noteIndex >= 0) {
					draft.patterns[pattern].tracks[track].events[step].instrument.note?.splice(noteIndex, 1)
				} else {
					draft.patterns[pattern].tracks[track].events[step].instrument.note?.push(note)
				}
				break;
			case sequencerActions.SET_NOTE_MIDI:
				[track, note, velocity, step] = [
					action.payload.track,
					action.payload.note,
					action.payload.step,
					action.payload.velocity
				]
				draft.patterns[draft.activePattern].tracks[track].events[step].instrument['note'] = Array.isArray(note) ? note : undefined;
				draft.patterns[draft.activePattern].tracks[track].events[step].instrument['velocity'] = velocity;
				break;
			case sequencerActions.NOTE_INPUT:
				// length property is not set on note on message
				[pattern, track, step, offset, note, velocity] = [
					action.payload.pattern,
					action.payload.track,
					action.payload.step,
					action.payload.offset,
					action.payload.note,
					action.payload.velocity,
				];
				draft.patterns[pattern].tracks[track].events[step].instrument.note = Array.isArray(note) ? note : undefined;
				draft.patterns[pattern].tracks[track].events[step].instrument.offset = offset;
				draft.patterns[pattern].tracks[track].events[step].instrument.velocity = velocity;
				break;
			case sequencerActions.SET_NOTE_LENGTH:
				[noteLength, step, pattern, track] = [
					action.payload.noteLength,
					action.payload.step,
					action.payload.pattern,
					action.payload.track,
				];
				draft.patterns[pattern].tracks[track].events[step].instrument["length"] = noteLength
				break;
			case sequencerActions.SET_NOTE_LENGTH_PLAYBACK:
				[noteLength, note, pattern, track, step] = [
					action.payload.noteLength,
					action.payload.note,
					action.payload.pattern,
					action.payload.track,
					action.payload.step,
				];
				draft.patterns[pattern].tracks[track].events[step].instrument.length = noteLength;
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
			case sequencerActions.SET_VELOCITY:
				[pattern, track, step, velocity] = [
					action.payload.pattern,
					action.payload.track,
					action.payload.step,
					action.payload.velocity,
				];
				draft.patterns[pattern].tracks[track].events[step].instrument.velocity = velocity;
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
				break;
			case sequencerActions.ADD_EFFECT_SEQUENCER:
				[track, index] = [action.payload.track, action.payload.index];
				Object.keys(draft.patterns).forEach(pattern => {
					const p = parseInt(pattern)
					const l = draft.patterns[p].tracks[track].events.length
					let i = 0
					while (i < l) {
						draft.patterns[p].tracks[track].events[i].fx.splice(index, 0, {});
						i++
					}
				})
				break;
			case sequencerActions.REMOVE_EFFECT_SEQUENCER:
				[track, index] = [action.payload.track, action.payload.index];
				Object.keys(draft.patterns).forEach(pattern => {
					const p = parseInt(pattern)
					let l = draft.patterns[p].tracks[track].events.length
					let i = 0
					while (i < l) {
						draft.patterns[p].tracks[track].events[i].fx.splice(index, 1);
						i++
					}
				})
				break;
			case sequencerActions.CHANGE_EFFECT_INDEX:
				[track, from, to] = [action.payload.track, action.payload.from, action.payload.to];
				Object.keys(draft.patterns).forEach(pattern => {
					const p = parseInt(pattern)
					const l = draft.patterns[p].tracks[track].events.length
					let i = 0
					while (i < l) {
						[
							draft.patterns[p].tracks[track].events[i].fx[from],
							draft.patterns[p].tracks[track].events[i].fx[to],
						] = [
								draft.patterns[p].tracks[track].events[i].fx[to],
								draft.patterns[p].tracks[track].events[i].fx[from],
							]
						i++
					}
				});
				break;
			case sequencerActions.PARAMETER_LOCK_EFFECT:
				[step, track, pattern, data, fxIndex] = [
					action.payload.step,
					action.payload.track,
					action.payload.pattern,
					action.payload.data,
					action.payload.fxIndex
				]
				const p = propertiesToArray(data)[0]
				const v = getNested(data, p)
				setNestedValue(p, v, draft.patterns[pattern].tracks[track].events[step].fx[fxIndex]);

		}
	});
}
