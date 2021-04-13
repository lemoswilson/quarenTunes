import { getNested, propertiesToArray, setNestedArray, setNestedValue } from '../../lib/objectDecompose'
import { curveTypes, getInitials } from '../../containers/Track/defaults'
import { getEffectsInitials } from '../../containers/Track/defaults'
import {
	trackActionTypes,
	trackActions,
	Track,
	xolombrisxInstruments, effectTypes, generalInstrumentOptions
} from "./types";
import valueFromCC, { valueFromMouse, optionFromCC, steppedCalc } from '../../lib/curves';
import produce from "immer";
import { DRAFT_STATE } from 'immer/dist/internal';

export const initialState: Track = {
	instrumentCounter: 0,
	selectedTrack: 0,
	trackCount: 1,
	tracks: [
		{
			// instrument: xolombrisxInstruments.FMSYNTH,
			// options: getInitials(xolombrisxInstruments.FMSYNTH),
			instrument: xolombrisxInstruments.NOISESYNTH,
			options: getInitials(xolombrisxInstruments.NOISESYNTH),
			id: 0,
			fx: [],
			fxCounter: 0,
			env: 0.001,
			midi: {
				device: undefined,
				channel: undefined,
			},
		},
	],
};

export function trackReducer(
	state: Track = initialState,
	action: trackActionTypes
): Track {
	return produce(state, (draft) => {
		let index: number,
			options: generalInstrumentOptions,
			movement: number,
			cc: boolean | undefined,
			curve: curveTypes,
			property: string,
			target: 'modulationEnvelope' | 'envelope',
			isContinuous: boolean | undefined;

		switch (action.type) {
			case trackActions.ADD_INSTRUMENT:
				console.log(state, draft.trackCount);
				draft.tracks.push({
					instrument: action.payload.instrument,
					options: getInitials(action.payload.instrument),
					id: draft.instrumentCounter + 1,
					midi: {
						channel: undefined,
						device: undefined,
					},
					fx: [],
					fxCounter: 0,
				});
				draft.trackCount = draft.trackCount + 1;
				draft.instrumentCounter = draft.instrumentCounter + 1;
				break;
			case trackActions.CHANGE_INSTRUMENT:
				draft.tracks[action.payload.index].instrument = action.payload.instrument;
				draft.tracks[action.payload.index].options = getInitials(action.payload.instrument);
				break;
			case trackActions.REMOVE_INSTRUMENT:
				draft.tracks.splice(action.payload.index, 1);
				draft.trackCount = draft.trackCount - 1;
				break;
			case trackActions.SELECT_MIDI_CHANNEL:
				draft.tracks[action.payload.index].midi.channel = action.payload.channel;
				break;
			case trackActions.SELECT_MIDI_DEVICE:
				draft.tracks[action.payload.index].midi.device = action.payload.device;
				break;
			case trackActions.SHOW_INSTRUMENT:
				draft.selectedTrack = action.payload.index;
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
				draft.tracks[action.payload.trackIndex].fx.splice(action.payload.index, 1);
				break;
			case trackActions.INSERT_EFFECT:
				draft.tracks[action.payload.trackIndex].fx.splice(action.payload.index, 0, {
					fx: action.payload.effect,
					id: draft.tracks[action.payload.trackIndex].fxCounter + 1,
					options: getEffectsInitials(effectTypes.PINGPONGDELAY)
				});
				draft.tracks[action.payload.trackIndex].fxCounter =
					draft.tracks[action.payload.trackIndex].fxCounter + 1;
				break;
			case trackActions.CHANGE_EFFECT:
				const [trackId, effect, effectIndex] = [
					action.payload.trackId,
					action.payload.effect,
					action.payload.effectIndex
				]
				draft.tracks[trackId].fx[effectIndex].fx = effect;
				break;
			case trackActions.UPDATE_INSTRUMENT_STATE:
				[index, options] = [action.payload.track, action.payload.options];
				const props = propertiesToArray(options);
				props.forEach(
					prop => {
						let v = getNested(options, prop)
						setNestedArray(draft.tracks[index].options, prop, getNested(options, prop))
						// console.log('setting proeperty, ', props, v);
					}
				);
				break;
			case trackActions.INC_DEC_INST_PROP:
				[index, movement, cc, property, isContinuous] = [
					action.payload.track,
					action.payload.movement,
					action.payload.cc,
					action.payload.property,
					action.payload.isContinuous
				]
				const v = getNested(draft.tracks[index].options, property);
				let val;
				if (isContinuous) {
					val = cc ? valueFromCC(movement, v[1][0], v[1][1], v[4])
						: valueFromMouse(
							v[0],
							movement,
							v[1][0],
							v[1][1],
							v[4],
							property === 'volume' || property === 'detune'
								? property
								: undefined
						);
					if (val === -Infinity) {
						setNestedArray(draft.tracks[index].options, property, -Infinity)
					} else if (val >= v[1][0] && val <= v[1][1]) {
						setNestedArray(draft.tracks[index].options, property, Number(val.toFixed(4)))
					}
				} else {
					val = cc ? optionFromCC(movement, v[1]) : steppedCalc(movement, v[1], v[0])
					setNestedArray(draft.tracks[index].options, property, val)
				}
				break;
			case trackActions.UPDATE_ENVELOPE_CURVE:
				[index, target, curve] = [action.payload.track, action.payload.target, action.payload.curve]
				draft.tracks[index].options[target].decayCurve[0] = curve
				draft.tracks[index].options[target].attackCurve[0] = curve
				draft.tracks[index].options[target].releaseCurve[0] = curve
				break;
			// case trackActions.ENVELOPE_ATTACK:
			// 	[index, movement] = [action.payload.index, action.payload.amount]
			// 	let vi = state.tracks[index].options.envelope.attack;
			// 	draft.tracks[index].options.envelope.attack[0] = Number(valueFromMouse(vi[0], movement, vi[1][0], vi[1][1], curveTypes.EXPONENTIAL).toFixed(4))
			// 	break;
		}
	});
}
