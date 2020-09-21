import React, { useRef, useEffect } from "react";
import Dummy from './containers/Dummy';
import Chain from './lib/fxChain';
import TriggContext, { triggContext } from './context/triggState';
import { instrumentTypes } from './store/Track'
import toneRefsContext, { toneRefs } from './context/toneRefsContext';
import triggEmitter, { triggEventTypes, ExtractTriggPayload } from './lib/triggEmitter';
import toneRefsEmitter, { trackEventTypes, toneRefsPayload, ExtractTrackPayload } from './lib/toneRefsEmitter';
import { Provider } from "react-redux";
import Tone from './lib/tone'
import styled from "styled-components";
import Transport from "./containers/Transport";
import Arranger from './containers/Arranger';
import Sequencer from './containers/Sequencer';
import Track from './containers/Track';
import { Instruments } from './containers/Track/Instruments'
import { Grommet, ThemeType } from "grommet";
import "./App.css";
import { combineReducers, createStore, compose } from "redux";
import { arrangerReducer, initialState as ArrInit } from "./store/Arranger";
import { trackReducer, initialState as TrkInit, toneEffects } from "./store/Track";
import { sequencerReducer, initialState as SeqInit } from "./store/Sequencer";
import { transportReducer, initialState as TrsState } from "./store/Transport";
import { AMSynth } from "tone";
import { getInitials } from "./containers/Track/defaults";

declare global {
	interface Window {
		__REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
	}
}


const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;



export const rootReducer = combineReducers({
	arranger: arrangerReducer,
	track: trackReducer,
	sequencer: sequencerReducer,
	transport: transportReducer,
});

const store = createStore(rootReducer, {
	arranger: ArrInit,
	sequencer: SeqInit,
	track: TrkInit,
	transport: TrsState,
}, composeEnhancers());

export type RootState = ReturnType<typeof rootReducer>;



const theme: ThemeType = {
	// 	global: {
	// 		colors: {
	// 			brand: "#FEFF",
	// 		},
	// 		font: {
	// 			family: "Roboto",
	// 			size: "12px",
	// 			height: "20px",
	// 		},
	// 	},
};

// const MyStyledMeter = styled(Meter)`
// 	width: 40px;
// 	margin: 0;
// `;

// const AppBar: FunctionComponent = (props) => (
// 	<Box
// 		tag='header'
// 		direction='row'
// 		align='center'
// 		justify='between'
// 		background='brand'
// 		pad={{ left: "medium", right: "small", vertical: "small" }}
// 		elevation='medium'
// 		draggable
// 		{...props}
// 	></Box>
// );

export default function App() {

	// const addPattern = (payload: triggPayload): void => {
	const addPattern = (payload: ExtractTriggPayload<triggEventTypes.ADD_PATTERN>): void => {
		let patN = payload.pattern
		triggRef.current[patN] = [];
		[...Array(store.getState().track.trackCount).keys()].forEach(track => {
			triggRef.current[patN][track] = new Tone.Part();
		});
	};

	const duplicatePattern = (payload: ExtractTriggPayload<triggEventTypes.DUPLICATE_PATTERN>): void => {
		let patN = payload.pattern
		let counter = store.getState().sequencer.counter;
		[...Array(store.getState().track.trackCount).keys()]
			.forEach(track => {
				triggRef.current[counter][track] = new Tone.Part()
				let events = store.getState().sequencer.patterns[patN].tracks[track].events
				events.forEach((e, idx, arr) => {
					let time = {
						'16n': idx,
						'128n': e.offset
					}
					triggRef.current[counter][track].at(time, e);
				});
			})
	}


	const removePattern = (payload: ExtractTriggPayload<triggEventTypes.REMOVE_PATTERN>): void => {
		let patN: number = payload.pattern;
		triggRef.current[patN].forEach(part => part.dispose())
		delete triggRef.current[patN];
	};


	const addTrack = (): void => {
		Object.keys(triggRef.current).forEach(patt => {
			triggRef.current[parseInt(patt)].push(new Tone.Part());
		});
	};


	const removeTrack = (payload: ExtractTriggPayload<triggEventTypes.REMOVE_TRACK>): void => {
		let trackN: number = payload.track;
		Object.keys(triggRef.current).forEach(patt => {
			triggRef.current[parseInt(patt)][trackN].dispose();
			triggRef.current[parseInt(patt)].splice(trackN, 1);
		});
		toneObjRef.current[trackN].instrument?.dispose();
		toneObjRef.current[trackN].effects.forEach(v => v.dispose());
		toneObjRef.current[trackN].chain.dispose();

	};

	const addEffect = (payload: ExtractTrackPayload<trackEventTypes.ADD_EFFECT>): void => {
		const [trackId, effect] = [
			payload.trackId,
			payload.effect,
		];
		let lgth: number = toneObjRef.current[trackId].effects.length;
		let chain: Chain = toneObjRef.current[trackId].chain;
		if (lgth > 0) {
			let lastFx = toneObjRef.current[trackId].effects[lgth - 1];
			lastFx.disconnect();
			lastFx.connect(effect);
			effect.connect(chain.out);
		} else {
			chain.in.disconnect();
			chain.in.connect(effect);
			effect.connect(chain.out);
		}
		toneObjRef.current[trackId].effects.push(effect);
	};

	const addInstrument = (payload: ExtractTrackPayload<trackEventTypes.ADD_INSTRUMENT>): void => {
		const [trackId, instrument] = [
			payload.trackId,
			payload.instrument,
		];
		toneObjRef.current[trackId] = {
			effects: [],
			instrument: instrument,
			chain: new Chain()
		}
		instrument.connect(toneObjRef.current[trackId].chain.in);
	};

	const changeEffect = (payload: ExtractTrackPayload<trackEventTypes.CHANGE_EFFECT>): void => {
		const [trackId, effect, effectIndex] = [
			payload.trackId,
			payload.effect,
			payload.effectsIndex
		];
		const chain: Chain = toneObjRef.current[trackId].chain
		const effects: toneEffects[] = toneObjRef.current[trackId].effects;
		let prev, next: Tone.Gain | toneEffects;
		if (effectIndex === toneObjRef.current[trackId].effects.length - 1) {
			next = chain.out
			if (effectIndex === 0) prev = chain.in;
			else prev = effects[effectIndex - 1];
		} else {
			next = effects[effectIndex + 1]
			if (effectIndex === 0) prev = chain.in
			else prev = effects[effectIndex - 1]

		}
		effects[effectIndex].disconnect();
		prev.disconnect()
		prev.connect(effect);
		effect.connect(next)
		effects[effectIndex].dispose();
		effects[effectIndex] = effect;
	};

	const changeEffectIndex = (payload: ExtractTrackPayload<trackEventTypes.CHANGE_EFFECT_INDEX>): void => {
		const [trackId, from, to] = [
			payload.trackId,
			payload.from,
			payload.to
		]
		let prevFrom, prevTo, nextFrom, nextTo: Tone.Gain | toneEffects;

		if (to !== from) {
			const chain: Chain = toneObjRef.current[trackId].chain
			const effects: toneEffects[] = toneObjRef.current[trackId].effects;
			effects[from].disconnect();
			effects[to].disconnect()


			if (from === 0) prevFrom = chain.in;
			else prevFrom = effects[from - 1];

			if (to === 0) prevTo = chain.in;
			else prevTo = effects[to - 1];

			if (effects[from + 1]) nextFrom = effects[from + 1];
			else nextFrom = chain.out

			if (!effects[to + 1]) nextTo = effects[to + 1];
			else nextTo = chain.out

			if (to - from === 1) {
				prevFrom.connect(nextFrom);
				effects[from].connect(nextTo);
				effects[to].connect(effects[from])
			} else if (from - to === 1) {
				prevFrom.connect(nextFrom);
				effects[from].connect(nextTo);
				effects[to].connect(effects[from])
			}
			else {
				prevFrom.connect(effects[to]);
				effects[to].connect(nextFrom);
				prevTo.connect(effects[from]);
				effects[from].connect(nextTo);
				[effects[to], effects[from]] = [effects[from], effects[to]];
			}

		}
	};

	const changeInstrument = (payload: ExtractTrackPayload<trackEventTypes.CHANGE_INSTRUMENT>): void => {
		const [trackId, instrument] = [payload.trackId, payload.instrument];
		const chain: Chain = toneObjRef.current[trackId].chain;
		toneObjRef.current[trackId].instrument?.disconnect();
		toneObjRef.current[trackId].instrument?.dispose();
		instrument.connect(chain.in);
		toneObjRef.current[trackId].instrument = instrument;
	};

	const removeEffect = (payload: ExtractTrackPayload<trackEventTypes.REMOVE_EFFECT>): void => {
		const [trackId, effectIndex] = [
			payload.trackId,
			payload.effectsIndex
		];
		let prev, next: Tone.Gain | toneEffects;
		let chain: Chain = toneObjRef.current[trackId].chain;
		let effects: toneEffects[] = toneObjRef.current[trackId].effects

		if (effectIndex === effects.length - 1) next = chain.out
		else next = effects[effectIndex + 1]
		if (effectIndex === 0) prev = chain.in
		else prev = effects[effectIndex - 1]

		prev.disconnect();
		effects[effectIndex].disconnect();
		effects[effectIndex].dispose()
		effects.splice(effectIndex, 1)
		prev.connect(next);
	};

	const removeInstrument = (payload: ExtractTrackPayload<trackEventTypes.REMOVE_INSTRUMENT>): void => {
		const [trackId] = [payload.trackId];
		if (trackId) {
			toneObjRef.current[trackId].effects.forEach(v => { v.dispose() });
			toneObjRef.current[trackId].instrument?.dispose()
			delete toneObjRef.current[trackId];
		}
	};

	useEffect(() => {
		triggEmitter.on(triggEventTypes.ADD_PATTERN, addPattern);
		triggEmitter.on(triggEventTypes.REMOVE_PATTERN, removePattern);
		triggEmitter.on(triggEventTypes.ADD_TRACK, addTrack);
		triggEmitter.on(triggEventTypes.REMOVE_TRACK, removeTrack);
		triggEmitter.on(triggEventTypes.DUPLICATE_PATTERN, duplicatePattern);

		toneRefsEmitter.on(trackEventTypes.ADD_EFFECT, addEffect);
		toneRefsEmitter.on(trackEventTypes.ADD_INSTRUMENT, addInstrument);
		toneRefsEmitter.on(trackEventTypes.CHANGE_EFFECT, changeEffect);
		toneRefsEmitter.on(trackEventTypes.CHANGE_EFFECT_INDEX, changeEffectIndex);
		toneRefsEmitter.on(trackEventTypes.CHANGE_INSTRUMENT, changeInstrument);
		toneRefsEmitter.on(trackEventTypes.REMOVE_EFFECT, removeEffect);
		toneRefsEmitter.on(trackEventTypes.REMOVE_INSTRUMENT, removeInstrument);
		return () => {
			triggEmitter.off(triggEventTypes.ADD_PATTERN, addPattern);
			triggEmitter.off(triggEventTypes.REMOVE_PATTERN, removePattern);
			triggEmitter.off(triggEventTypes.ADD_TRACK, addTrack);
			triggEmitter.off(triggEventTypes.REMOVE_TRACK, removeTrack);
			triggEmitter.off(triggEventTypes.DUPLICATE_PATTERN, duplicatePattern);


			toneRefsEmitter.off(trackEventTypes.ADD_EFFECT, addEffect);
			toneRefsEmitter.off(trackEventTypes.ADD_INSTRUMENT, addInstrument);
			toneRefsEmitter.off(trackEventTypes.CHANGE_EFFECT, changeEffect);
			toneRefsEmitter.off(trackEventTypes.CHANGE_EFFECT_INDEX, changeEffectIndex);
			toneRefsEmitter.off(trackEventTypes.CHANGE_INSTRUMENT, changeInstrument);
			toneRefsEmitter.off(trackEventTypes.REMOVE_EFFECT, removeEffect);
			toneRefsEmitter.off(trackEventTypes.REMOVE_INSTRUMENT, removeInstrument);
		}
	}, [])

	let triggRef = useRef<triggContext>({
		0: [new Tone.Part()]
	})


	let toneObjRef = useRef<toneRefs>({
		0: {
			effects: [],
			chain: new Chain(),
		}
	});


	return (
		<toneRefsContext.Provider value={toneObjRef}>
			<TriggContext.Provider value={triggRef}>
				<Provider store={store}>
					<Grommet theme={theme}>
						<Arranger></Arranger>
						<Transport></Transport>
						<Dummy></Dummy>
						{/* <Instruments id={0} index={0} midi={{ channel: undefined, device: undefined }} voice={instrumentTypes.FMSYNTH} options={getInitials(instrumentTypes.FMSYNTH)}></Instruments> */}
					</Grommet>
				</Provider>
			</TriggContext.Provider>
		</toneRefsContext.Provider>
	);
}
