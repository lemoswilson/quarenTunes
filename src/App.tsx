import React, { useRef, useEffect, FunctionComponent, ReactElement, useState } from "react";
import { BrowserRouter, Route } from 'react-router-dom'
import Header from './components/Layout/Header/Header';
import { Grommet, ThemeType } from 'grommet';
import HomePage from './components/Layout/HomePage/HomePage';
import SignUp from './components/Layout/SignUp/SignUp';
import Xolombrisx from './containers/Xolombrisx';
import styled from "styled-components";


export interface userData {
	isAuthenticated: boolean,
	token: string,
	errorMessage: string,
}

export interface userProps extends userData {
	updateUser: React.Dispatch<React.SetStateAction<userData>>,
}

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


const App: React.FC<{ children?: React.ReactNode }> = ({ children }) => {

	const [user, updateUser] = useState<userData>({
		isAuthenticated: false,
		token: '',
		errorMessage: '',
	})

	return (
		<React.Fragment>
			<Grommet theme={theme}>
				<BrowserRouter>
					<Header {...user} />
					<Route path={'/'} render={() => <HomePage {...user} updateUser={updateUser} />}></Route>
					<Route path={'/app'} render={() => <Xolombrisx {...user} updateUser={updateUser} />}></Route>
					<Route path={'/signin'} render={() => <HomePage {...user} updateUser={updateUser} />}></Route>
					<Route path={'/signup'} render={() => <SignUp  {...user} updateUser={updateUser} />}></Route>
					<Route path={'/contact'} render={() => <HomePage {...user} updateUser={updateUser} />}></Route>
					<Route path={'/dashboard'} render={() => <HomePage {...user} updateUser={updateUser} />}></Route>
				</BrowserRouter>
				{children}
			</Grommet>
		</React.Fragment>
	);
}

export default App;