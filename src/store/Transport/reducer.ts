import { Transport, transportActionTypes, transportActions } from "./types";
import produce from "immer";

export const initialState: Transport = {
	isPlaying: false,
	recording: false,
	bpm: 120,
};

export function transportReducer(
	state: Transport = initialState,
	action: transportActionTypes
): Transport {
	return produce(state, (draft) => {
		switch (action.type) {
			case transportActions.START:
				if (!state.isPlaying) state.isPlaying = true;
				break;
			case transportActions.STOP:
				if (state.isPlaying) state.isPlaying = false;
				break;
			case transportActions.RECORD:
				state.recording = !state.recording;
				break;
			case transportActions.SET_BPM:
				state.bpm = action.payload.bpm;
		}
	});
}
