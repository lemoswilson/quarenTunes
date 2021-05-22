import { RootState } from '../../containers/Xolombrisx';

export const isPlaySelector = (state: RootState) => state.transport.present.isPlaying;
export const isRecSelector = (state: RootState) => state.transport.present.recording