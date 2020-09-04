import { accessNestedProperty, propertiesToArray, setNestedPropertyValue, setNestedPropertyFirstEntry } from '../../lib/objectDecompose'
import { getInitials } from '../../containers/Track/defaults'
import {
	trackActionTypes,
	trackActions,
	Track,
	instrumentTypes,
} from "./types";
import produce from "immer";

export const initialState: Track = {
	instrumentCounter: 0,
	selectedTrack: 0,
	trackCount: 1,
	tracks: [
		{
			instrument: instrumentTypes.FMSYNTH,
			options: getInitials(instrumentTypes.FMSYNTH),
			id: 0,
			fx: [],
			fxCounter: 0,
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
				const [index, options] = [action.payload.index, action.payload.options];
				const props = propertiesToArray(options);
				props.forEach(
					prop => setNestedPropertyFirstEntry(draft.tracks[0].options, prop, accessNestedProperty(options, prop))
				);
		}
	});
}
