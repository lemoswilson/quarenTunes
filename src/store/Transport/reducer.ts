import { Transport, transportActionTypes, transportActions } from "./types";
import produce from "immer";

export const initialState: Transport = {
	isPlaying: false,
	recording: false,
	bpm: 120,
	metronome: false,
};

export function transportReducer(
	state: Transport = initialState,
	action: transportActionTypes
): Transport {
	return produce(state, (draft) => {
		switch (action.type) {
			case transportActions.START:
				if (!state.isPlaying) draft.isPlaying = true;
				break;
			case transportActions.STOP:
				if (state.isPlaying) draft.isPlaying = false;
				break;
			case transportActions.RECORD:
				draft.recording = !state.recording;
				break;
			case transportActions.SET_BPM:
				draft.bpm = action.payload.bpm;
				break;
			case transportActions.INC_DEC_BPM:
				draft.bpm = draft.bpm + action.payload.amount;
				break;
			case transportActions.TOGGLE_METRONOME:
				draft.metronome = !draft.metronome;
				break;
		}
	});
}
