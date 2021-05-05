import { getNested, propertiesToArray, setNestedArray, setNestedValue } from '../../lib/objectDecompose'
import { curveTypes, getInitials } from '../../containers/Track/defaults'
import { getEffectsInitials } from '../../containers/Track/defaults'
import {
	trackActionTypes,
	trackActions,
	Track,
	xolombrisxInstruments,
	effectTypes,
	generalInstrumentOptions,
	generalEffectOptions,
} from "./types";
import valueFromCC, { valueFromMouse, optionFromCC, steppedCalc } from '../../lib/curves';
import produce from "immer";

export const initialState: Track = {
	instrumentCounter: 0,
	selectedTrack: 0,
	trackCount: 1,
	tracks: [
		{
			// instrument: xolombrisxInstruments.FMSYNTH,
			// options: getInitials(xolombrisxInstruments.FMSYNTH),
			// instrument: xolombrisxInstruments.AMSYNTH,
			// options: getInitials(xolombrisxInstruments.AMSYNTH),
			instrument: xolombrisxInstruments.NOISESYNTH,
			options: getInitials(xolombrisxInstruments.NOISESYNTH),
			// instrument: xolombrisxInstruments.MEMBRANESYNTH,
			// options: getInitials(xolombrisxInstruments.MEMBRANESYNTH),
			// instrument: xolombrisxInstruments.METALSYNTH,
			// options: getInitials(xolombrisxInstruments.METALSYNTH),
			// instrument: xolombrisxInstruments.PLUCKSYNTH,
			// options: getInitials(xolombrisxInstruments.PLUCKSYNTH),
			// instrument: xolombrisxInstruments.DRUMRACK,
			// options: getInitials(xolombrisxInstruments.DRUMRACK),
			id: 0,
			fx: [
				// {
				// 	fx: effectTypes.COMPRESSOR,
				// 	id: 0,
				// 	options: getEffectsInitials(effectTypes.COMPRESSOR)
				// },
			],
			fxCounter: 1,
			// env: 0.001,
			midi: {
				// device: undefined,
				// channel: undefined,
				device: 'onboardKey',
				channel: 'all',
			},
		},
	],
};

export function trackReducer(
	state: Track = initialState,
	action: trackActionTypes
): Track {
	return produce(state, (draft) => {
		let options: generalInstrumentOptions,
			trackIndex: number,
			fxOptions: generalEffectOptions,
			device: string,
			movement: number,
			cc: boolean | undefined,
			curve: curveTypes,
			effect: effectTypes,
			effectIndex: number,
			property: string,
			target: 'modulationEnvelope' | 'envelope',
			fxIndex: number,
			isContinuous: boolean | undefined;

		switch (action.type) {
			case trackActions.ADD_INSTRUMENT:
				// console.log(state, draft.trackCount);
				draft.tracks.push({
					instrument: action.payload.instrument,
					options: getInitials(action.payload.instrument),
					id: draft.instrumentCounter + 1,
					midi: {
						// channel: undefined,
						// device: undefined,
						channel: 'all',
						device: 'onboardKey',
					},
					fx: [],
					fxCounter: 0,
				});
				draft.trackCount = draft.trackCount + 1;
				draft.instrumentCounter = draft.instrumentCounter + 1;
				break;
			case trackActions.CHANGE_INSTRUMENT:
				draft.tracks[action.payload.trackIndex].instrument = action.payload.instrument;
				draft.tracks[action.payload.trackIndex].options = getInitials(action.payload.instrument);
				break;
			case trackActions.REMOVE_INSTRUMENT:
				draft.tracks.splice(action.payload.trackIndex, 1);
				draft.trackCount = draft.trackCount - 1;
				break;
			case trackActions.SELECT_MIDI_CHANNEL:
				draft.tracks[action.payload.trackIndex].midi.channel = action.payload.channel;
				break;
			case trackActions.SELECT_MIDI_DEVICE:
				draft.tracks[action.payload.trackIndex].midi.device = action.payload.device;
				break;
			case trackActions.SELECT_INSTRUMENT:
				draft.selectedTrack = action.payload.trackIndex;
				break;
			case trackActions.CHANGE_EFFECT_INDEX:
				[
					draft.tracks[action.payload.trackIndex].fx[action.payload.fromIndex],
					draft.tracks[action.payload.trackIndex].fx[action.payload.toIndex],
				] = [
						draft.tracks[action.payload.trackIndex].fx[action.payload.fromIndex],
						draft.tracks[action.payload.trackIndex].fx[action.payload.toIndex],
					];
				break;
			case trackActions.DELETE_EFFECT:
				draft.tracks[action.payload.trackIndex].fx.splice(action.payload.effectIndex, 1);
				break;
			case trackActions.INSERT_EFFECT:
				draft.tracks[action.payload.trackIndex].fx.splice(action.payload.effectIndex, 0, {
					fx: action.payload.effect,
					id: draft.tracks[action.payload.trackIndex].fxCounter + 1,
					options: getEffectsInitials(action.payload.effect)
				});
				draft.tracks[action.payload.trackIndex].fxCounter =
					draft.tracks[action.payload.trackIndex].fxCounter + 1;
				break;
			case trackActions.CHANGE_EFFECT:
				[trackIndex, effect, effectIndex] = [
					action.payload.trackIndex,
					action.payload.effect,
					action.payload.effectIndex
				]
				draft.tracks[trackIndex].fx[effectIndex].fx = effect;
				break;
			case trackActions.UPDATE_INSTRUMENT_STATE:
				[trackIndex, options] = [action.payload.trackIndex, action.payload.options];
				const props = propertiesToArray(options);
				props.forEach(
					prop => {
						let v = getNested(options, prop)
						setNestedArray(draft.tracks[trackIndex].options, prop, getNested(options, prop))
						// console.log('setting proeperty, ', props, v);
					}
				);
				break;
			case trackActions.UPDATE_EFFECT_STATE:
				[trackIndex, options, fxIndex] = [
					action.payload.trackIndex,
					action.payload.options,
					action.payload.fxIndex
				]
				const properties = propertiesToArray(options)
				properties.forEach(prop => {
					let v = getNested(options, prop)
					setNestedArray(draft.tracks[trackIndex].fx[fxIndex].options, prop, getNested(options, prop))
				})
				break
			case trackActions.INC_DEC_INST_PROP:
				[trackIndex, movement, cc, property, isContinuous] = [
					action.payload.trackIndex,
					action.payload.movement,
					action.payload.cc,
					action.payload.property,
					action.payload.isContinuous
				]
				// const v = getNested(draft.tracks[index].options, property);
				const instrumentRangeOrOption = getNested(draft.tracks[trackIndex].options, property);
				let val;
				// console.log('property is', property);
				if (isContinuous) {
					val = cc ? valueFromCC(movement, instrumentRangeOrOption[1][0], instrumentRangeOrOption[1][1], instrumentRangeOrOption[4])
						: valueFromMouse(
							instrumentRangeOrOption[0],
							movement,
							instrumentRangeOrOption[1][0],
							instrumentRangeOrOption[1][1],
							instrumentRangeOrOption[4],
							property
						);
					if (val === -Infinity) {
						setNestedArray(draft.tracks[trackIndex].options, property, -Infinity)
					} else if (val >= instrumentRangeOrOption[1][0] && val <= instrumentRangeOrOption[1][1]) {
						// const updateValue = property === 'dampening' ? Math.round(val) : Number(val.toFixed(4))
						const updateValue = Number(val.toFixed(4))
						setNestedArray(draft.tracks[trackIndex].options, property, updateValue)
					}
				} else {
					val = cc ? optionFromCC(movement, instrumentRangeOrOption[1]) : steppedCalc(movement, instrumentRangeOrOption[1], instrumentRangeOrOption[0])
					setNestedArray(draft.tracks[trackIndex].options, property, val)
				}
				break;
			case trackActions.INC_DEC_EFFECT_PROP:
				[trackIndex, movement, cc, property, isContinuous, fxIndex] = [
					action.payload.trackIndex,
					action.payload.movement,
					action.payload.cc,
					action.payload.property,
					action.payload.isContinuous,
					action.payload.fx
				]
				const fxRangeOrOptions = getNested(draft.tracks[trackIndex].fx[fxIndex].options, property)
				let fxVal;
				if (isContinuous) {
					fxVal = cc
						? valueFromCC(movement, fxRangeOrOptions[1][0], fxRangeOrOptions[1][1], fxRangeOrOptions[4])
						: valueFromMouse(
							fxRangeOrOptions[0],
							movement,
							fxRangeOrOptions[1][0],
							fxRangeOrOptions[1][1],
							fxRangeOrOptions[4],
						)
					if (fxVal >= fxRangeOrOptions[1][0] && fxVal <= fxRangeOrOptions[1][1]) {
						const updateValue = Number(fxVal.toFixed(4))
						setNestedArray(draft.tracks[trackIndex].fx[fxIndex].options, property, updateValue)
					}
				} else {
					val = cc ? optionFromCC(movement, fxRangeOrOptions[1]) : steppedCalc(movement, fxRangeOrOptions[1], fxRangeOrOptions[0])
					setNestedArray(draft.tracks[trackIndex].fx[fxIndex].options, property, fxVal)
				}
				break;
			// case trackActions.ENVELOPE_ATTACK:
			// 	[index, movement] = [action.payload.index, action.payload.amount]
			// 	let vi = state.tracks[index].options.envelope.attack;
			// 	draft.tracks[index].options.envelope.attack[0] = Number(valueFromMouse(vi[0], movement, vi[1][0], vi[1][1], curveTypes.EXPONENTIAL).toFixed(4))
			// 	break;
			case trackActions.UPDATE_ENVELOPE_CURVE:
				[trackIndex, target, curve] = [action.payload.trackIndex, action.payload.target, action.payload.curve]
				draft.tracks[trackIndex].options[target].decayCurve[0] = curve
				draft.tracks[trackIndex].options[target].attackCurve[0] = curve
				draft.tracks[trackIndex].options[target].releaseCurve[0] = curve
				break;
			case trackActions.REMOVE_MIDI_DEVICE:
				device = action.payload.device
				draft.tracks.forEach((_, idx, __) => {
					if (draft.tracks[idx].midi.device === device)
					draft.tracks[idx].midi.device = undefined
					draft.tracks[idx].midi.channel = undefined
				})
		}
	});
}
