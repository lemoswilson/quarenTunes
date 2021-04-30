import produce from "immer";
import {
	sequencerActionTypes,
	sequencerActions,
	Sequencer,
} from "./types";
import { propertiesToArray, getNested, setNestedValue } from "../../lib/objectDecompose";
import { eventOptions } from "../../containers/Track/Instruments";
import valueFromCC, { valueFromMouse, optionFromCC, steppedCalc } from "../../lib/curves";
import { startEndRange } from "../../lib/utility";

const initialTrack = {
	events: Array(16).fill({ instrument: { note: [] }, fx: [], offset: 0 }),
	// events: Array(16).fill({ instrument: { note: [] }, fx: [{}], offset: 0 }),
	length: 16,
	noteLength: "16n",
	page: 0,
	selected: [],
	velocity: 60
}
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
				// {
				// 	events: Array(16).fill({ instrument: { note: [] }, fx: [], offset: 0 }),
				// 	// events: Array(16).fill({ instrument: { note: [] }, fx: [{}], offset: 0 }),
				// 	length: 16,
				// 	noteLength: "16n",
				// 	page: 0,
				// 	selected: [],
				// 	velocity: 60
				// },
				initialTrack
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
			trackIndex: number,
			patternLength: number,
			noteLength: number | string | undefined,
			from: number,
			to: number,
			page: number,
			patternToGo: number | undefined,
			pageToGo: number | undefined,
			data: any,
			note: string[] | string,
			offset: number,
			direction: number,
			interval: number[],
			name: string,
			amount: number,
			velocity: number,
			fxIndex: number,
			movement: number,
			property: string,
			step: number,
			cc: boolean | undefined,
			isContinuous: boolean | undefined,
			trackValues: any[],
			effectValues: any[],
			trackCount: number,
			counter: number = draft.counter
		switch (action.type) {
			case sequencerActions.ADD_INSTRUMENT_TO_SEQUENCER:
				let trackNumber: number = draft.patterns[0].tracks.length;
				Object.keys(draft.patterns).forEach(
					(v) =>
					(draft.patterns[parseInt(v)].tracks[trackNumber] = initialTrack)
					// {
					// 	length: 16,
					// 	events: Array(16).fill({ instrument: { note: [] }, fx: [], offset: 0 }),
					// 	// eventsFx: Array(16).fill({}),
					// 	noteLength: "16n",
					// 	velocity: 60,
					// 	page: 0,
					// 	selected: [],
					// })
				);
				break;
			case sequencerActions.REMOVE_INSTRUMENT_FROM_SEQUENCER:
				trackIndex = action.payload.trackIndex;
				Object.keys(draft.patterns).forEach((v) =>
					delete draft.patterns[parseInt(v)].tracks[trackIndex]
					// draft.patterns[parseInt(v)].tracks.splice(track, 1)
				);
				break;
			case sequencerActions.ADD_PATTERN:
				draft.patterns[draft.counter] = {
					name: `Pattern ${draft.counter + 1}`,
					patternLength: 16,
					tracks: [],
				};
				const anyPattern = Number(Object.keys(draft.patterns)[0]);
				const trackCount = Object.keys(draft.patterns[anyPattern].tracks).length;
				[...Array(trackCount).keys()].forEach((i) => {
					const fxNumber = draft.patterns[anyPattern].tracks[0].events[0].fx.length
					draft.patterns[draft.counter].tracks[i] = {
						length: 16,
						events: Array(16).fill({ instrument: { note: [] }, fx: Array(fxNumber).map(v => { }), offset: 0 }),
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
				[page, pattern, trackIndex] = [
					action.payload.page,
					action.payload.pattern,
					action.payload.trackIndex,
				];
				draft.patterns[pattern].tracks[trackIndex].page = page;
				break;
			case sequencerActions.CHANGE_PATTERN_LENGTH:
				[pattern, patternLength] = [action.payload.pattern, action.payload.patternLength];
				draft.patterns[pattern].patternLength = patternLength;
				break;
			case sequencerActions.CHANGE_TRACK_LENGTH:
				[patternLength, trackIndex, pattern] = [
					action.payload.patternLength,
					action.payload.trackIndex,
					action.payload.pattern,
				];
				let j = draft.patterns[pattern].tracks[trackIndex].events.length;
				while (j < patternLength) {
					draft.patterns[pattern].tracks[trackIndex].events.push({ instrument: { note: [] }, fx: [], offset: 0 })
					j++
				}
				draft.patterns[pattern].tracks[trackIndex].length = patternLength;
				break;
			case sequencerActions.INC_DEC_OFFSET:
				[trackIndex, pattern, step, amount] =
					[
						action.payload.trackIndex,
						action.payload.pattern,
						action.payload.step,
						action.payload.amount,
					]
				console.log('amount is ', amount)
				const totalOffset = Number(draft.patterns[pattern].tracks[trackIndex].events[step].offset) + amount
				draft.patterns[pattern].tracks[trackIndex].events[step].offset =
					(amount > 0 && totalOffset <= 100) || (amount < 0 && totalOffset >= -100)
						? totalOffset
						: amount > 0 && totalOffset > 100
							? 100
							: -100
				break
			case sequencerActions.INC_DEC_VELOCITY:
				[trackIndex, pattern, step, amount] =
					[
						action.payload.trackIndex,
						action.payload.pattern,
						action.payload.step,
						action.payload.amount,
					]
				if (step >= 0) {
					const currVel = draft.patterns[pattern].tracks[trackIndex].events[step].instrument.velocity
					const totalVelocity = currVel ? currVel + amount : draft.patterns[pattern].tracks[trackIndex].velocity + amount
					draft.patterns[pattern].tracks[trackIndex].events[step].instrument.velocity =
						(amount > 0 && totalVelocity <= 127) || (amount < 0 && totalVelocity >= 0)
							? totalVelocity
							: amount > 0 && totalVelocity > 127
								? 127
								: 0
				} else {
					const totalVelocity = Number(draft.patterns[pattern].tracks[trackIndex].velocity)
					draft.patterns[pattern].tracks[trackIndex].velocity =
						(amount > 0 && totalVelocity < 127) || (amount < 0 && totalVelocity > 0)
							? totalVelocity + amount
							: amount > 0 && totalVelocity === 127
								? 127
								: 0
				}
				break
			case sequencerActions.INC_DEC_PT_VELOCITY:
				[trackIndex, pattern, amount] = [
					action.payload.trackIndex,
					action.payload.pattern,
					action.payload.amount,
				]
				const totalVelocity = Number(draft.patterns[pattern].tracks[trackIndex].velocity)
				draft.patterns[pattern].tracks[trackIndex].velocity =
					(amount > 0 && totalVelocity < 127) || (amount < 0 && totalVelocity > 0)
						? totalVelocity + amount
						: amount > 0 && totalVelocity === 127
							? 127
							: 0
				break;
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
				[amount, pattern, trackIndex] = [
					action.payload.amount,
					action.payload.pattern,
					action.payload.trackIndex
				];
				const totalTrack = draft.patterns[pattern].tracks[trackIndex].length + amount
				let k = draft.patterns[pattern].tracks[trackIndex].events.length;
				draft.patterns[pattern].tracks[trackIndex].length =
					(amount > 0 && totalTrack <= 64) || (amount < 0 && totalTrack >= 1)
						? totalTrack
						: amount > 0 && totalTrack > 64
							? 64
							: 1
				while (k < draft.patterns[pattern].tracks[trackIndex].length) {
					draft.patterns[pattern].tracks[trackIndex].events.push({ instrument: { note: [] }, fx: [], offset: 0 })
					k++
				}
				break;
			case sequencerActions.RENAME_PATTERN:
				[name, pattern] = [
					action.payload.name,
					action.payload.pattern
				]
				draft.patterns[pattern].name = name
				break;
			case sequencerActions.DELETE_EVENTS:
				[pattern, trackIndex, step] = [action.payload.pattern, action.payload.trackIndex, action.payload.step];
				draft.patterns[pattern].tracks[trackIndex].events[step] = { fx: [], instrument: [], offset: 0 };
				break;
			case sequencerActions.GO_TO_ACTIVE:
				[patternToGo, pageToGo, trackIndex] = [
					action.payload.patternToGo,
					action.payload.pageToGo,
					action.payload.trackIndex,
				];
				if (patternToGo && pageToGo)
					[draft.activePattern, draft.patterns[patternToGo].tracks[trackIndex].page] = [
						patternToGo,
						pageToGo,
					];
				else if (patternToGo && !pageToGo) draft.activePattern = patternToGo;
				else if (!patternToGo && pageToGo)
					draft.patterns[draft.activePattern].tracks[trackIndex].page = pageToGo;
				break;
			case sequencerActions.PARAMETER_LOCK:
				[data, pattern, step, trackIndex] = [
					action.payload.data,
					action.payload.pattern,
					action.payload.step,
					action.payload.trackIndex,
				];
				const prop = data.parameter;
				const valor = getNested(data.value, prop);
				setNestedValue(prop, valor, draft.patterns[pattern].tracks[trackIndex].events[step].instrument);
				break;
			case sequencerActions.REMOVE_PATTERN:
				pattern = action.payload.pattern;
				delete draft.patterns[pattern];
				draft.activePattern = Number(Object.keys(draft.patterns)[0])
				break;
			case sequencerActions.SELECT_PATTERN:
				pattern = action.payload.pattern;
				draft.activePattern = pattern;
				break;
			case sequencerActions.SELECT_STEP:
				[pattern, trackIndex, step] = [
					action.payload.pattern,
					action.payload.trackIndex,
					action.payload.step,
				];
				if (step < 0){
					draft.patterns[pattern].tracks[trackIndex].selected.length = 0
					break;
				} else if (step >= draft.patterns[pattern].tracks[trackIndex].length) {
					break
				}
				const sel = draft.patterns[pattern].tracks[trackIndex].selected
				if (sel.includes(step)) {
					const ind: number = sel.indexOf(
						step
					);
					draft.patterns[pattern].tracks[trackIndex].selected.splice(ind, 1);
				} else {
					let i = 0
					for (i; i < sel.length ; i++) {
						if (sel[i] >= step) { break }	
					}
					if (i == 0) 
						draft.patterns[pattern].tracks[trackIndex].selected.unshift(step)
					else if (i == sel.length)
						draft.patterns[pattern].tracks[trackIndex].selected.push(step)
					else 
						draft.patterns[pattern].tracks[trackIndex].selected.splice(i, 0, step)

					// draft.patterns[pattern].tracks[trackIndex].selected.push(step);
				}
				break;
			case sequencerActions.SET_NOTE:
				[pattern, trackIndex, step, note] = [
					action.payload.pattern,
					action.payload.trackIndex,
					action.payload.step,
					action.payload.note,
				];
				const selected = draft.patterns[pattern].tracks[trackIndex].selected
				const Dnote = draft.patterns[pattern].tracks[trackIndex].events[step].instrument.note
				const noteIndex = Dnote ? Dnote.indexOf(note) : -1;

				let incl = false;
				if (selected.length > 0) {
					incl = true;
					selected.forEach(sel => {

						if (draft.patterns[pattern].tracks[trackIndex].events[sel].instrument.note && !draft.patterns[pattern].tracks[trackIndex].events[sel].instrument.note?.includes(String(note))) {
							incl = false
						}
					})
				}
				if ((noteIndex >= 0 && selected.length === 1) || incl) {
					draft.patterns[pattern].tracks[trackIndex].events[step].instrument.note?.splice(noteIndex, 1)
				} else if (noteIndex < 0 && draft.patterns[pattern].tracks[trackIndex].events[step].instrument.note) {
					draft.patterns[pattern].tracks[trackIndex].events[step].instrument.note?.push(note)
				} else if (noteIndex < 0 && !draft.patterns[pattern].tracks[trackIndex].events[step].instrument.note) {
					draft.patterns[pattern].tracks[trackIndex].events[step].instrument.note = [note];
				}
				break;
			case sequencerActions.SET_NOTE_MIDI:
				[trackIndex, note, velocity, step] = [
					action.payload.trackIndex,
					action.payload.note,
					action.payload.step,
					action.payload.velocity
				]
				draft.patterns[draft.activePattern].tracks[trackIndex].events[step].instrument['note'] = Array.isArray(note) ? note : undefined;
				draft.patterns[draft.activePattern].tracks[trackIndex].events[step].instrument['velocity'] = velocity;
				break;
			case sequencerActions.NOTE_INPUT:
				// length property is not set on note on message
				[pattern, trackIndex, step, offset, note, velocity] = [
					action.payload.pattern,
					action.payload.trackIndex,
					action.payload.step,
					action.payload.offset,
					action.payload.note,
					action.payload.velocity,
				];
				draft.patterns[pattern].tracks[trackIndex].events[step].instrument.note = Array.isArray(note) ? note : undefined;
				draft.patterns[pattern].tracks[trackIndex].events[step].instrument.offset = offset;
				draft.patterns[pattern].tracks[trackIndex].events[step].instrument.velocity = velocity;
				break;
			case sequencerActions.SET_NOTE_LENGTH:
				[noteLength, step, pattern, trackIndex] = [
					action.payload.noteLength,
					action.payload.step,
					action.payload.pattern,
					action.payload.trackIndex,
				];
				draft.patterns[pattern].tracks[trackIndex].events[step].instrument["length"] = noteLength
				break;
			case sequencerActions.SET_NOTE_LENGTH_PLAYBACK:
				[noteLength, note, pattern, trackIndex, step] = [
					action.payload.noteLength,
					action.payload.note,
					action.payload.pattern,
					action.payload.trackIndex,
					action.payload.step,
				];
				draft.patterns[pattern].tracks[trackIndex].events[step].instrument.length = noteLength;
				break;
			case sequencerActions.SET_OFFSET:
				[pattern, trackIndex, step, offset] = [
					action.payload.pattern,
					action.payload.trackIndex,
					action.payload.step,
					action.payload.offset,
				];
				draft.patterns[pattern].tracks[trackIndex].events[step].offset = offset
				break;
			case sequencerActions.SET_PATTERN_NOTE_LENGTH:
				[pattern, noteLength, trackIndex] = [action.payload.pattern, action.payload.noteLength, action.payload.trackIndex];
				draft.patterns[pattern].tracks[trackIndex].noteLength = noteLength;
				break;
			case sequencerActions.SET_VELOCITY:
				[pattern, trackIndex, step, velocity] = [
					action.payload.pattern,
					action.payload.trackIndex,
					action.payload.step,
					action.payload.velocity,
				];
				draft.patterns[pattern].tracks[trackIndex].events[step].instrument.velocity = velocity;
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
				[trackIndex, fxIndex] = [action.payload.trackIndex, action.payload.fxIndex];
				Object.keys(draft.patterns).forEach(pattern => {
					const p = parseInt(pattern)
					const l = draft.patterns[p].tracks[trackIndex].events.length
					let i = 0
					while (i < l) {
						draft.patterns[p].tracks[trackIndex].events[i].fx.splice(fxIndex, 0, {});
						i++
					}
				})
				break;
			case sequencerActions.REMOVE_EFFECT_SEQUENCER:
				[trackIndex, fxIndex] = [action.payload.trackIndex, action.payload.fxIndex];
				Object.keys(draft.patterns).forEach(pattern => {
					const p = parseInt(pattern)
					let l = draft.patterns[p].tracks[trackIndex].events.length
					let i = 0
					while (i < l) {
						draft.patterns[p].tracks[trackIndex].events[i].fx.splice(fxIndex, 1);
						i++
					}
				})
				break;
			case sequencerActions.CHANGE_EFFECT_INDEX:
				[trackIndex, from, to] = [action.payload.trackIndex, action.payload.from, action.payload.to];
				Object.keys(draft.patterns).forEach(pattern => {
					const p = parseInt(pattern)
					const l = draft.patterns[p].tracks[trackIndex].events.length
					let i = 0
					while (i < l) {
						[
							draft.patterns[p].tracks[trackIndex].events[i].fx[from],
							draft.patterns[p].tracks[trackIndex].events[i].fx[to],
						] = [
								draft.patterns[p].tracks[trackIndex].events[i].fx[to],
								draft.patterns[p].tracks[trackIndex].events[i].fx[from],
							]
						i++
					}
				});
				break;
			case sequencerActions.PARAMETER_LOCK_EFFECT:
				[step, trackIndex, pattern, data, fxIndex] = [
					action.payload.step,
					action.payload.trackIndex,
					action.payload.pattern,
					action.payload.data,
					action.payload.fxIndex
				]
				const p = propertiesToArray(data)[0]
				const v = getNested(data, p)
				setNestedValue(p, v, draft.patterns[pattern].tracks[trackIndex].events[step].fx[fxIndex]);
				break;
			case sequencerActions.PARAMETER_LOCK_INC_DEC:
				[step, trackIndex, pattern, movement, property, cc, isContinuous, trackValues] =
					[
						action.payload.step,
						action.payload.trackIndex,
						action.payload.pattern,
						action.payload.movement,
						action.payload.property,
						action.payload.cc,
						action.payload.isContinuous,
						action.payload.trackValues
					]
				const prevValue = getNested(draft.patterns[pattern].tracks[trackIndex].events[step].instrument, property)
				let val;

				if (isContinuous) {
					val = cc ? valueFromCC(movement, trackValues[1][0], trackValues[1][1], trackValues[4])
						: valueFromMouse(
							prevValue ? prevValue : trackValues[0],
							movement,
							trackValues[1][0],
							trackValues[1][1],
							trackValues[4],
							property === 'volume' || property === 'detune'
								? property
								: undefined
						);
					if (val === -Infinity) {
						setNestedValue(property, val, draft.patterns[pattern].tracks[trackIndex].events[step].instrument)
					} else if (val >= trackValues[1][0] && val <= trackValues[1][1]) {
						setNestedValue(property, Number(val.toFixed(4)), draft.patterns[pattern].tracks[trackIndex].events[step].instrument)
					}
				} else {
					val = cc ? optionFromCC(movement, trackValues[1]) : steppedCalc(movement, trackValues[1], prevValue ? prevValue : trackValues[0])
					setNestedValue(property, val, draft.patterns[pattern].tracks[trackIndex].events[step].instrument)
				}
				break;
			case sequencerActions.PARAMETER_LOCK_INC_DEC_EFFECT:
				[step, trackIndex, pattern, movement, property, cc, isContinuous, effectValues, fxIndex] =
					[
						action.payload.step,
						action.payload.trackIndex,
						action.payload.pattern,
						action.payload.movement,
						action.payload.property,
						action.payload.cc,
						action.payload.isContinuous,
						action.payload.effectValues,
						action.payload.fxIndex
					]
				const prevValueFX = getNested(draft.patterns[pattern].tracks[trackIndex].events[step].fx[fxIndex], property)
				let valFx;

				if (isContinuous) {
					valFx = cc ? valueFromCC(movement, effectValues[1][0], effectValues[1][1], effectValues[4])
						: valueFromMouse(
							prevValueFX ? prevValueFX : effectValues[0],
							movement,
							effectValues[1][0],
							effectValues[1][1],
							effectValues[4],
							property === 'volume' || property === 'detune'
								? property
								: undefined
						);
					if (valFx === -Infinity) {
						setNestedValue(property, valFx, draft.patterns[pattern].tracks[trackIndex].events[step].fx[fxIndex])
					} else if (valFx >= effectValues[1][0] && valFx <= effectValues[1][1]) {
						setNestedValue(property, Number(valFx.toFixed(4)), draft.patterns[pattern].tracks[trackIndex].events[step].fx[fxIndex])
					}
				} else {
					val = cc ? optionFromCC(movement, effectValues[1]) : steppedCalc(movement, effectValues[1], prevValueFX ? prevValueFX : effectValues[0])
					setNestedValue(property, valFx, draft.patterns[pattern].tracks[trackIndex].events[step].fx[fxIndex])
				}
				break;
			case sequencerActions.CHANGE_EFFECT_SEQ:
				[trackIndex, fxIndex] = [action.payload.trackIndex, action.payload.fxIndex]
				Object.keys(draft.patterns).forEach(p => {
					const pat = Number(p)
					const eventsLength = draft.patterns[pat].tracks[trackIndex].events.length
					for (let i = 0; i < eventsLength; i++) {
						draft.patterns[pat].tracks[trackIndex].events[i].fx[fxIndex] = {}
						// const note = draft.patterns[pat].tracks[trackIndex].events[i].instrument.note
						// const vel = draft.patterns[pat].tracks[trackIndex].events[i].instrument.velocity
						// const len = draft.patterns[pat].tracks[trackIndex].events[i].instrument.length
						// draft.patterns[pat].tracks[trackIndex].events[i].instrument = {
						// 	note: note,
						// 	velocity: velocity,
						// 	length: length,
						// }
					}
				})
				break;
			case sequencerActions.CHANGE_INSTRUMENT_SEQ:
				trackIndex = action.payload.trackIndex
				Object.keys(draft.patterns).forEach(p => {
					const patt = Number(p)
					const eventL = draft.patterns[patt].tracks[trackIndex].events.length
					for (let i = 0; i < eventL; i++) {
						const note = draft.patterns[patt].tracks[trackIndex].events[i].instrument.note
						const vel = draft.patterns[patt].tracks[trackIndex].events[i].instrument.velocity
						const len = draft.patterns[patt].tracks[trackIndex].events[i].instrument.length
						draft.patterns[patt].tracks[trackIndex].events[i].instrument = {
							note: note,
							velocity: vel,
							length: len,
						}
					}
				})
				break;
			case sequencerActions.CYCLE_STEPS:
				[pattern, trackIndex, direction, interval] = [
					action.payload.pattern,
					action.payload.trackIndex,
					action.payload.direction,
					action.payload.interval
				]
				if (direction > 0){
					const c = draft.patterns[pattern].tracks[trackIndex].events.pop()
					if (c)
						draft.patterns[pattern].tracks[trackIndex].events.unshift(c)
				} else {
					const c = draft.patterns[pattern].tracks[trackIndex].events.shift()
					if (c)
						draft.patterns[pattern].tracks[trackIndex].events.push(c)
				}
				break;
		}
	});
}
