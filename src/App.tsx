import React, { useRef } from "react";
import TriggContext, { triggContext } from './context/triggState';
import { Provider } from "react-redux";
import Tone from './lib/tone'
// import store from "./store";
import styled from "styled-components";
import Transport from "./containers/Transport";
import Arranger from './containers/Arranger';
import { Grommet, ThemeType } from "grommet";
import "./App.css";
import { combineReducers, createStore, compose } from "redux";
import { arrangerReducer, initialState as ArrInit } from "./store/Arranger";
import { trackReducer, initialState as TrkInit } from "./store/Track";
import { sequencerReducer, initialState as SeqInit } from "./store/Sequencer";
import { transportReducer, initialState as TrsState } from "./store/Transport";

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
	let triggRef = useRef<triggContext>({
		0: {
			0: new Tone.Part(),
		}
	})
	return (
		<TriggContext.Provider value={triggRef}>
			<Provider store={store}>
				<Grommet theme={theme}>
					<Arranger></Arranger>
					<Transport></Transport>
				</Grommet>
			</Provider>
		</TriggContext.Provider>
	);
}
