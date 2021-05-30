import { getNested, propertiesToArray, setNestedArray } from '../../lib/objectDecompose'
import { getInitials } from '../../containers/Track/defaults'
import { getEffectsInitials } from '../../containers/Track/defaults'
import { trackActionTypes, trackActions, Track,	xolombrisxInstruments, effectTypes } from "./types";
import valueFromCC, { valueFromMouse, optionFromCC, steppedCalc } from '../../lib/curves';
import produce from "immer";

export const initialState: Track = {
	instrumentCounter: 0,
	selectedTrack: 0,
	trackCount: 1,
	tracks: [
		{
			instrument: xolombrisxInstruments.METALSYNTH,
			options: getInitials(xolombrisxInstruments.METALSYNTH),
			id: 0,
			fx: [
				{
					fx: effectTypes.COMPRESSOR,
					id: 0,
					options: getEffectsInitials(effectTypes.COMPRESSOR)
				},
			],
			fxCounter: 0,
			midi: {
				device: 'onboardKey',
				channel: 'all',
			},
		},
	],
};

export function trackReducer(
	state: Track = initialState,
	a: trackActionTypes
): Track {
	return produce(state, (draft) => {
		switch (a.type) {
			case trackActions.ADD_INSTRUMENT:
				draft.tracks.push({
					instrument: a.payload.instrument,
					options: getInitials(a.payload.instrument),
					id: draft.instrumentCounter + 1,
					midi: {
						channel: 'all',
						device: 'onboardKey',
					},
					fx: [
						{
							fx: effectTypes.FILTER,
							id: 0,
							options: getEffectsInitials(effectTypes.FILTER)
						}
					],
					fxCounter: 0,
				});
				draft.trackCount = draft.trackCount + 1;
				draft.instrumentCounter = draft.instrumentCounter + 1;
				draft.selectedTrack = draft.tracks.length - 1
				break;
			case trackActions.CHANGE_INSTRUMENT:
				draft.tracks[a.payload.trackIndex].instrument = a.payload.instrument;
				draft.tracks[a.payload.trackIndex].options = getInitials(a.payload.instrument);
				break;
			case trackActions.REMOVE_INSTRUMENT:
				draft.tracks.splice(a.payload.trackIndex, 1);
				draft.trackCount = draft.trackCount - 1;
				draft.selectedTrack = 0
				break;
			case trackActions.SELECT_MIDI_CHANNEL:
				draft.tracks[a.payload.trackIndex].midi.channel = a.payload.channel;
				break;
			case trackActions.SELECT_MIDI_DEVICE:
				draft.tracks[a.payload.trackIndex].midi.device = a.payload.device;
				if (a.payload.device === 'onboardKey')
					draft.tracks[a.payload.trackIndex].midi.channel = 'all'
				else
					draft.tracks[a.payload.trackIndex].midi.channel = undefined;
				break;
			case trackActions.SELECT_INSTRUMENT:
				draft.selectedTrack = a.payload.trackIndex;
				break;
			case trackActions.CHANGE_EFFECT_INDEX:
				[
					draft.tracks[a.payload.trackIndex].fx[a.payload.fromIndex],
					draft.tracks[a.payload.trackIndex].fx[a.payload.toIndex],
				] = [
						draft.tracks[a.payload.trackIndex].fx[a.payload.fromIndex],
						draft.tracks[a.payload.trackIndex].fx[a.payload.toIndex],
					];
				break;
			case trackActions.DELETE_EFFECT:
				draft.tracks[a.payload.trackIndex].fx.splice(a.payload.effectIndex, 1);
				break;
			case trackActions.ADD_EFFECT:
				console.log(`adding effect to track ${a.payload.trackIndex}, effect index ${a.payload.effectIndex}`)
					draft.tracks[a.payload.trackIndex].fx.splice(a.payload.effectIndex + 1, 0, {
						fx: a.payload.effect,
						id: draft.tracks[a.payload.trackIndex].fxCounter + 1,
						options: getEffectsInitials(a.payload.effect)
					});
				draft.tracks[a.payload.trackIndex].fxCounter ++
				break;
			case trackActions.CHANGE_EFFECT:
				console.log(`track index is, ${a.payload.trackIndex} effect index is ${a.payload.effectIndex}`);
				draft.tracks[a.payload.trackIndex].fx[a.payload.effectIndex].fx = a.payload.effect;
				draft.tracks[a.payload.trackIndex].fx[a.payload.effectIndex].options = getEffectsInitials(a.payload.effect);
				break;
			case trackActions.UPDATE_INSTRUMENT_STATE:
				const props = propertiesToArray(a.payload.options);
				props.forEach(
					prop => {
						let v = getNested(a.payload.options, prop)
						setNestedArray(draft.tracks[a.payload.trackIndex].options, prop, getNested(a.payload.options, prop))
					}
				);
				break;
			case trackActions.UPDATE_EFFECT_STATE:
				const properties = propertiesToArray(a.payload.options)
				properties.forEach(prop => {
					let v = getNested(a.payload.options, prop)
					setNestedArray(draft.tracks[a.payload.trackIndex].fx[a.payload.fxIndex].options, prop, getNested(a.payload.options, prop))
				})
				break
			case trackActions.INC_DEC_INST_PROP:
				const instrumentRangeOrOption = getNested(draft.tracks[a.payload.trackIndex].options, a.payload.property);
				let val;
				if (a.payload.isContinuous) {
					val = a.payload.cc ? valueFromCC(a.payload.movement, instrumentRangeOrOption[1][0], instrumentRangeOrOption[1][1], instrumentRangeOrOption[4])
						: valueFromMouse(
							instrumentRangeOrOption[0],
							a.payload.movement,
							instrumentRangeOrOption[1][0],
							instrumentRangeOrOption[1][1],
							instrumentRangeOrOption[4],
							a.payload.property
						);
					if (val === -Infinity) {
						setNestedArray(draft.tracks[a.payload.trackIndex].options, a.payload.property, -Infinity)
					} else if (val >= instrumentRangeOrOption[1][0] && val <= instrumentRangeOrOption[1][1]) {
						const updateValue = Number(val.toFixed(4))
						setNestedArray(draft.tracks[a.payload.trackIndex].options, a.payload.property, updateValue)
					}
				} else {
					val = a.payload.cc ? optionFromCC(a.payload.movement, instrumentRangeOrOption[1]) : steppedCalc(a.payload.movement, instrumentRangeOrOption[1], instrumentRangeOrOption[0])
					setNestedArray(draft.tracks[a.payload.trackIndex].options, a.payload.property, val)
				}
				break;
			case trackActions.INC_DEC_EFFECT_PROP:
				const fxRangeOrOptions = getNested(draft.tracks[a.payload.trackIndex].fx[a.payload.fxIndex].options, a.payload.property)
				let fxVal;
				if (a.payload.isContinuous) {
					fxVal = a.payload.cc
						? valueFromCC(a.payload.movement, fxRangeOrOptions[1][0], fxRangeOrOptions[1][1], fxRangeOrOptions[4])
						: valueFromMouse(
							fxRangeOrOptions[0],
							a.payload.movement,
							fxRangeOrOptions[1][0],
							fxRangeOrOptions[1][1],
							fxRangeOrOptions[4],
						)
					if (fxVal >= fxRangeOrOptions[1][0] && fxVal <= fxRangeOrOptions[1][1]) {
						const updateValue = Number(fxVal.toFixed(4))
						setNestedArray(draft.tracks[a.payload.trackIndex].fx[a.payload.fxIndex].options, a.payload.property, updateValue)
					}
				} else {
					fxVal = a.payload.cc ? optionFromCC(a.payload.movement, fxRangeOrOptions[1]) : steppedCalc(a.payload.movement, fxRangeOrOptions[1], fxRangeOrOptions[0])
					setNestedArray(draft.tracks[a.payload.trackIndex].fx[a.payload.fxIndex].options, a.payload.property, fxVal)
				}
				break;
			case trackActions.UPDATE_ENVELOPE_CURVE:
				if (a.payload.target === 'drumrack'){
					draft.tracks[a.payload.trackIndex].options[`PAD_${a.payload.padIdx}`].curve[0] = a.payload.curve;
				} else {
					draft.tracks[a.payload.trackIndex].options[a.payload.target].decayCurve[0] = a.payload.curve
					draft.tracks[a.payload.trackIndex].options[a.payload.target].attackCurve[0] = a.payload.curve
					draft.tracks[a.payload.trackIndex].options[a.payload.target].releaseCurve[0] = a.payload.curve
				}
				break;
			case trackActions.REMOVE_MIDI_DEVICE:
				draft.tracks.forEach((_, idx, __) => {
					if (draft.tracks[idx].midi.device === a.payload.device)
					draft.tracks[idx].midi.device = undefined
					draft.tracks[idx].midi.channel = undefined
				})
				break;
			case trackActions.SET_SAMPLE:
				draft.tracks[a.payload.trackIndex].options[`PAD_${a.payload.pad}`].urls.C3 = a.payload.sample
				break;
		}
	});
}
