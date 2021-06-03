import produce from "immer";
import {
	sequencerActionTypes,
	sequencerActions,
	Sequencer,
} from "./types";
import { propertiesToArray, getNested, setNestedValue, deleteProperty } from "../../lib/objectDecompose";
import valueFromCC, { valueFromMouse, optionFromCC, steppedCalc } from "../../lib/curves";
import { bisect } from "../../lib/utility";
import { transportActions } from "../Transport";

const initialTrack = {
	events: Array(16).fill({ instrument: { note: [] }, fx: [{}], offset: 0 }),
	length: 16,
	noteLength: "16n",
	page: 0,
	selected: [],
	velocity: 60,
	fxCount: 1,
}
export const initialState: Sequencer = {
	activePattern: 0,
	counter: 1,
	// override: true,
	patterns: {
		0: {
			name: "pattern 1",
			patternLength: 16,
			tracks: [ initialTrack ],
		},
	},
	// quantizeRecording: false,
	step: 0,
};

export function sequencerReducer(
	s: Sequencer = initialState,
	a: sequencerActionTypes
): Sequencer {
	return produce(s, (draft) => {
		switch (a.type) {
			case sequencerActions.ADD_INSTRUMENT_TO_SEQUENCER:
				let an = Number(Object.keys(draft.patterns)[0])
				let trackNumber: number = draft.patterns[an].tracks.length;
				Object.keys(draft.patterns).forEach(
					(v) => (draft.patterns[parseInt(v)].tracks[trackNumber] = initialTrack)
				);
				break;
			case sequencerActions.REMOVE_INSTRUMENT_FROM_SEQUENCER:
				Object.keys(draft.patterns).forEach((v) =>
					draft.patterns[parseInt(v)].tracks.splice(a.payload.trackIndex, 1)
				);
				break;
			case sequencerActions.ADD_PATTERN:

				const anyPattern = Number(Object.keys(draft.patterns)[0]);
				const trackCount = draft.patterns[anyPattern].tracks.length;

				draft.activePattern = draft.counter
				draft.patterns[draft.counter] = {
					name: `Pattern ${draft.counter + 1}`,
					patternLength: 16,
					tracks: [],
				};

				[...Array(trackCount).keys()].forEach((_, i, __) => {
					const fxNumber = draft.patterns[anyPattern].tracks[i].fxCount
					draft.patterns[draft.counter].tracks[i] = {
						length: 16,
						events: Array(16).fill({ instrument: { note: [] }, fx: [...Array(fxNumber).keys()].map(_ => Object.create({})), offset: 0 }),
						velocity: 60,
						noteLength: "16n",
						page: 0,
						selected: [],
						fxCount: 1,
					};
				});
				draft.counter ++;
				break;
			case sequencerActions.CHANGE_PAGE:
				draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].page = a.payload.page;
				break;
			case sequencerActions.CHANGE_PATTERN_LENGTH:
				draft.patterns[a.payload.pattern].patternLength = a.payload.patternLength;
				break;
			case sequencerActions.CHANGE_TRACK_LENGTH:
				let j = draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].events.length;
				while (j < a.payload.patternLength) {
					draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].events.push({ instrument: { note: [] }, fx: [], offset: 0 })
					j++
				}
				draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].length = a.payload.patternLength;
				break;
			case sequencerActions.INC_DEC_OFFSET:
				const totalOffset = Number(draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].events[a.payload.step].offset) + a.payload.amount
				draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].events[a.payload.step].offset =
					(a.payload.amount > 0 && totalOffset <= 100) 
					|| (a.payload.amount < 0 && totalOffset >= -100)
						? totalOffset
						: a.payload.amount > 0 && totalOffset > 100
							? 100
							: -100
				break
			case sequencerActions.INC_DEC_VELOCITY:
				if (a.payload.step >= 0) {
					const currVel = draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].events[a.payload.step].instrument.velocity
					const totalVelocity = currVel ? currVel + a.payload.amount : draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].velocity + a.payload.amount
					draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].events[a.payload.step].instrument.velocity =
						(a.payload.amount > 0 && totalVelocity <= 127) || (a.payload.amount < 0 && totalVelocity >= 0)
							? totalVelocity
							: a.payload.amount > 0 && totalVelocity > 127
								? 127
								: 0
				} else {
					const totalVelocity = Number(draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].velocity)
					draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].velocity =
						(a.payload.amount > 0 && totalVelocity < 127) || (a.payload.amount < 0 && totalVelocity > 0)
							? totalVelocity + a.payload.amount
							: a.payload.amount > 0 && totalVelocity === 127
								? 127
								: 0
				}
				break
			case sequencerActions.INC_DEC_PT_VELOCITY:
				const totalVelocity = Number(draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].velocity)
				draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].velocity =
					(a.payload.amount > 0 && totalVelocity < 127) || (a.payload.amount < 0 && totalVelocity > 0)
						? totalVelocity + a.payload.amount
						: a.payload.amount > 0 && totalVelocity === 127
							? 127
							: 0
				break;
			case sequencerActions.INC_DEC_PAT_LENGTH:
				const totalPat = draft.patterns[a.payload.pattern].patternLength + a.payload.amount
				draft.patterns[a.payload.pattern].patternLength =
					(a.payload.amount > 0 && totalPat <= 64) || (a.payload.amount < 0 && totalPat >= 1)
						? totalPat
						: a.payload.amount > 0 && totalPat > 64
							? 64
							: 1
				break;
			case sequencerActions.INC_DEC_TRACK_LENGTH:
				const totalTrack = draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].length + a.payload.amount
				let k = draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].events.length;
				draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].length =
					(a.payload.amount > 0 && totalTrack <= 64) || (a.payload.amount < 0 && totalTrack >= 1)
						? totalTrack
						: a.payload.amount > 0 && totalTrack > 64
							? 64
							: 1
				while (k < draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].length) {
					draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].events.push({ instrument: { note: [] }, fx: [], offset: 0 })
					k++
				}
				break;
			case sequencerActions.RENAME_PATTERN:
				draft.patterns[a.payload.pattern].name = a.payload.name
				break;
			case sequencerActions.DELETE_EVENTS:
				draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].events[a.payload.step] = { instrument: { note: [] }, fx: [], offset: 0 };
				break;
			case sequencerActions.GO_TO_ACTIVE:
				if (a.payload.patternToGo && a.payload.pageToGo)
					[draft.activePattern, draft.patterns[a.payload.patternToGo].tracks[a.payload.trackIndex].page] = [
						a.payload.patternToGo,
						a.payload.pageToGo,
					];
				else if (a.payload.patternToGo && !a.payload.pageToGo) draft.activePattern = a.payload.patternToGo;
				else if (!a.payload.patternToGo && a.payload.pageToGo)
					draft.patterns[draft.activePattern].tracks[a.payload.trackIndex].page = a.payload.pageToGo;
				break;
			case sequencerActions.PARAMETER_LOCK:
				const prop = a.payload.data.parameter;
				const valor = getNested(a.payload.data.value, prop);
				setNestedValue(prop, valor, draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].events[a.payload.step].instrument);
				break;
			case sequencerActions.REMOVE_PATTERN:
				delete draft.patterns[a.payload.pattern];
				draft.activePattern = a.payload.nextPattern;
				break;
			case sequencerActions.SELECT_PATTERN:
				draft.activePattern = a.payload.pattern;
				break;
			case sequencerActions.SELECT_STEP:
				if (a.payload.step < 0){
					draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].selected.length = 0
					break;
				} else if (a.payload.step >= draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].length) {
					break
				}

				const sel = draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].selected
				if (sel.includes(a.payload.step)) {
					const ind: number = sel.indexOf(
						a.payload.step
					);
					draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].selected.splice(ind, 1);
				} else {
					let i = bisect(sel, a.payload.step)
					if (i == 0) 
						draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].selected.unshift(a.payload.step)
					else if (i == sel.length)
						draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].selected.push(a.payload.step)
					else 
						draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].selected.splice(i, 0, a.payload.step)

				}
				break;
			case sequencerActions.SET_NOTE:
				const selected = draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].selected
				const Dnote = draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].events[a.payload.step].instrument.note
				const noteIndex = Dnote ? Dnote.indexOf(a.payload.note) : -1;

				let incl = false;
				if (selected.length > 0) {
					incl = true;
					selected.forEach(sel => {

						if (draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].events[sel].instrument.note && !draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].events[sel].instrument.note?.includes(String(a.payload.note))) {
							incl = false
						}
					})
				}
				if ((noteIndex >= 0 && selected.length === 1) || incl) {
					draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].events[a.payload.step].instrument.note?.splice(noteIndex, 1)
				} else if (noteIndex < 0 && draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].events[a.payload.step].instrument.note) {
					draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].events[a.payload.step].instrument.note?.push(a.payload.note)
				} else if (noteIndex < 0 && !draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].events[a.payload.step].instrument.note) {
					draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].events[a.payload.step].instrument.note = [a.payload.note];
				}
				break;
			case sequencerActions.SET_NOTE_MIDI:
				draft.patterns[draft.activePattern].tracks[a.payload.trackIndex].events[a.payload.step].instrument['note'] = Array.isArray(a.payload.note) ? a.payload.note : undefined;
				draft.patterns[draft.activePattern].tracks[a.payload.trackIndex].events[a.payload.step].instrument['velocity'] = a.payload.velocity;
				break;
			case sequencerActions.NOTE_INPUT:
				draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].events[a.payload.step].instrument.note = Array.isArray(a.payload.note) ? a.payload.note : undefined;
				draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].events[a.payload.step].instrument.offset = a.payload.offset;
				draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].events[a.payload.step].instrument.velocity = a.payload.velocity;
				break;
			case sequencerActions.SET_NOTE_LENGTH:
				draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].events[a.payload.step].instrument["length"] = a.payload.noteLength
				break;
			case sequencerActions.SET_NOTE_LENGTH_PLAYBACK:
				draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].events[a.payload.step].instrument.length = a.payload.noteLength;
				break;
			case sequencerActions.SET_OFFSET:
				draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].events[a.payload.step].offset = a.payload.offset
				break;
			case sequencerActions.SET_PATTERN_NOTE_LENGTH:
				draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].noteLength = a.payload.noteLength;
				break;
			case sequencerActions.SET_VELOCITY:
				draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].events[a.payload.step].instrument.velocity = a.payload.velocity;
				break;
			// case sequencerActions.TOGGLE_OVERRIDE:
			// 	draft.override = !draft.override;
			// 	break;
			// case sequencerActions.TOGGLE_RECORDING_QUANTIZATION:
			// 	draft.quantizeRecording = !draft.quantizeRecording;
			// 	break;
			case sequencerActions.CHANGE_PATTERN_NAME:
				draft.patterns[a.payload.pattern].name = a.payload.name;
				break;
			case sequencerActions.DUPLICATE_PATTERN:
				draft.patterns[draft.counter] = {
					...draft.patterns[a.payload.pattern],
					name: draft.patterns[a.payload.pattern].name + ' Copy'
				}
				draft.counter = draft.counter + 1;
				break;
			case sequencerActions.ADD_EFFECT_SEQUENCER:
				Object.keys(draft.patterns).forEach(pattern => {
					const p = parseInt(pattern)
					const l = draft.patterns[p].tracks[a.payload.trackIndex].events.length
					let i = 0
					draft.patterns[p].tracks[a.payload.trackIndex].fxCount ++ 
					while (i < l) {
						draft.patterns[p].tracks[a.payload.trackIndex].events[i].fx.splice(a.payload.fxIndex, 0, {});
						i++
					}
				})
				break;
			case sequencerActions.REMOVE_EFFECT_SEQUENCER:
				Object.keys(draft.patterns).forEach(pattern => {
					const p = parseInt(pattern)
					let l = draft.patterns[p].tracks[a.payload.trackIndex].events.length
					draft.patterns[p].tracks[a.payload.trackIndex].fxCount --
					let i = 0
					while (i < l) {
						draft.patterns[p].tracks[a.payload.trackIndex].events[i].fx.splice(a.payload.fxIndex, 1);
						i++
					}
				})
				break;
			case sequencerActions.CHANGE_EFFECT_INDEX:
				Object.keys(draft.patterns).forEach(pattern => {
					const p = parseInt(pattern)
					const l = draft.patterns[p].tracks[a.payload.trackIndex].events.length
					let i = 0
					while (i < l) {
						[
							draft.patterns[p].tracks[a.payload.trackIndex].events[i].fx[a.payload.from],
							draft.patterns[p].tracks[a.payload.trackIndex].events[i].fx[a.payload.to],
						] = [
								draft.patterns[p].tracks[a.payload.trackIndex].events[i].fx[a.payload.to],
								draft.patterns[p].tracks[a.payload.trackIndex].events[i].fx[a.payload.from],
							]
						i++
					}
				});
				break;
			case sequencerActions.PARAMETER_LOCK_EFFECT:
				const p = propertiesToArray(a.payload.data)[0]
				const v = getNested(a.payload.data, p)
				setNestedValue(p, v, draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].events[a.payload.step].fx[a.payload.fxIndex]);
				break;
			case sequencerActions.PARAMETER_LOCK_INC_DEC:
				const prevValue = getNested(draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].events[a.payload.step].instrument, a.payload.property)
				let val;

				if (a.payload.isContinuous) {
					val = a.payload.cc ? valueFromCC(a.payload.movement, a.payload.trackValues[1][0], a.payload.trackValues[1][1], a.payload.trackValues[4])
						: valueFromMouse(
							prevValue ? prevValue : a.payload.trackValues[0],
							a.payload.movement,
							a.payload.trackValues[1][0],
							a.payload.trackValues[1][1],
							a.payload.trackValues[4],
							a.payload.property === 'volume' || a.payload.property === 'detune'
								? a.payload.property
								: undefined
						);
					if (val === -Infinity) {
						setNestedValue(a.payload.property, val, draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].events[a.payload.step].instrument)
					} else if (val >= a.payload.trackValues[1][0] && val <= a.payload.trackValues[1][1]) {
						setNestedValue(a.payload.property, Number(val.toFixed(4)), draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].events[a.payload.step].instrument)
					}
				} else {
					val = a.payload.cc ? optionFromCC(a.payload.movement, a.payload.trackValues[1]) : steppedCalc(a.payload.movement, a.payload.trackValues[1], prevValue ? prevValue : a.payload.trackValues[0])
					setNestedValue(a.payload.property, val, draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].events[a.payload.step].instrument)
				}
				break;
			case sequencerActions.PARAMETER_LOCK_INC_DEC_EFFECT:
				const prevValueFX = getNested(draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].events[a.payload.step].fx[a.payload.fxIndex], a.payload.property)
				let valFx;

				if (a.payload.isContinuous) {
					valFx = a.payload.cc ? valueFromCC(a.payload.movement, a.payload.effectValues[1][0], a.payload.effectValues[1][1], a.payload.effectValues[4])
						: valueFromMouse(
							prevValueFX ? prevValueFX : a.payload.effectValues[0],
							a.payload.movement,
							a.payload.effectValues[1][0],
							a.payload.effectValues[1][1],
							a.payload.effectValues[4],
							a.payload.property === 'volume' || a.payload.property === 'detune'
								? a.payload.property
								: undefined
						);
					if (valFx === -Infinity) {
						setNestedValue(a.payload.property, valFx, draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].events[a.payload.step].fx[a.payload.fxIndex])
					} else if (valFx >= a.payload.effectValues[1][0] && valFx <= a.payload.effectValues[1][1]) {
						setNestedValue(a.payload.property, Number(valFx.toFixed(4)), draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].events[a.payload.step].fx[a.payload.fxIndex])
					}
				} else {
					valFx = a.payload.cc ? optionFromCC(a.payload.movement, a.payload.effectValues[1]) : steppedCalc(a.payload.movement, a.payload.effectValues[1], prevValueFX ? prevValueFX : a.payload.effectValues[0])
					setNestedValue(a.payload.property, valFx, draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].events[a.payload.step].fx[a.payload.fxIndex])
				}
				break;
			case sequencerActions.CYCLE_STEPS:

				const trackIndex = a.payload.trackIndex ? 0 : a.payload.trackIndex;

				const [init, end] = a.payload.interval;
				const events = draft.patterns[a.payload.pattern].tracks[trackIndex].events

				if (end-init === 1) 
					break

				if (a.payload.direction > 0){
					const temp = events[end]
					draft.patterns[a.payload.pattern].tracks[trackIndex].events.copyWithin(init + 1, init, end-1)
					draft.patterns[a.payload.pattern].tracks[trackIndex].events[init] = temp
				} else {
					const temp = events[init]
					draft.patterns[a.payload.pattern].tracks[trackIndex].events.copyWithin(init, init+1, end)
					draft.patterns[a.payload.pattern].tracks[trackIndex].events[end] = temp
				}

				break;
			case sequencerActions.DELETE_LOCKS:

				const notes = draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].events[a.payload.step].instrument.note
				draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].events[a.payload.step]	= {
					instrument: { note: [] }, fx: [], offset: 0 
				}
				draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].events[a.payload.step].instrument.note = notes
				break;
			case sequencerActions.DELETE_NOTES:
				draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].events[a.payload.step].instrument.note = []
				break
			case sequencerActions.COPY_EVENTS:
				const sels = draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].selected

				if (a.payload.events) {
						for (let i = 0; i < Math.min(sels.length, a.payload.events.length); i++){
							draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].events[sels[i]] = 
								a.payload.events[i]
						}
				}
				break;
			case sequencerActions.COPY_NOTES:
				const selss = draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].selected

				if (a.payload.events) {
					for (let i = 0; i < Math.min(selss.length, a.payload.events.length); i++){
						draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].events[selss[i]].instrument.note = 
						a.payload.events[i].instrument.note
					}
				}
				break;
			case sequencerActions.REMOVE_PROPERTY_LOCK:
				deleteProperty(draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].events[a.payload.step].instrument, a.payload.property)
				break;
			case sequencerActions.REMOVE_EFFECT_PROPERTY_LOCK:
				deleteProperty(draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].events[a.payload.step].fx[a.payload.fxIndex], a.payload.property)
				break;
			case sequencerActions.SET_PATTERN_TRACK_VELOCITY:
				draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].velocity = a.payload.velocity
				break;
			case sequencerActions.SELECT_STEPS_BATCH:
				draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].selected.push(...a.payload.steps);
				break;
			case sequencerActions.SET_ACTIVE_STEP:
				const result = (a.payload.counter % draft.patterns[a.payload.pattern].patternLength) % draft.patterns[a.payload.pattern].tracks[a.payload.trackIndex].length
				draft.step = result
				break;
			case transportActions.STOP:
				draft.step = 0
				break
		}
	});
}
