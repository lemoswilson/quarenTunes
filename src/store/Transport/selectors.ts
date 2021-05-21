import { RootState } from '../../containers/Xolombrisx';

const isPlaySelector = (state: RootState) => state.transport.present.isPlaying;
const isRecSelector = (state: RootState) => state.transport.present.recording