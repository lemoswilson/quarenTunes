import React, { useState, Suspense, lazy } from "react";
import { BrowserRouter, Route, Switch } from 'react-router-dom'

import HomePage from './components/Layout/HomePage/HomePage';
import SignUp from './components/Layout/SignUp/SignUp';
import SignIn from './components/Layout/SignIn';
import Recover from './components/Layout/Recover';
import ResetPassword from './components/Layout/Recover/ResetPassword';
import Loading from './components/Loading';


import './App.scss';
import Projects from "./components/Layout/Projects";

const Xolombrisx = lazy(() => import('./containers/Xolombrisx'))
const SuspenseFallback = <Loading/>;

export interface userData {
	isAuthenticated: boolean,
	token: string | null,
	errorMessage: string,
}

export interface userProps extends userData {
	updateUser: React.Dispatch<React.SetStateAction<userData>>,
	signOut: () => void,
}

const App: React.FC<{ children?: React.ReactNode }> = ({ children }) => {

	const [user, updateUser] = useState<userData>({
		isAuthenticated: false,
		token: '',
		errorMessage: '',
	})

	const signOut = () => {
        localStorage.removeItem('xolombrisJWT')
        updateUser({
            errorMessage: '',
            isAuthenticated: false, 
            token: '',
        })
    }


	return (
		<React.Fragment>
			<BrowserRouter>
				<Suspense fallback={SuspenseFallback}>
					<Switch>
						<Route path={'/app'} render={( ) => <Xolombrisx {...user} updateUser={updateUser} signOut={signOut} />}></Route>
						<Route path={'/login'} render={() => <SignIn {...user} updateUser={updateUser} signOut={signOut} />}></Route>
						<Route path={'/signup'} render={() => <SignUp  {...user} updateUser={updateUser} signOut={signOut} />}></Route>
						<Route path={'/recover'} render={() => <Recover {...user} updateUser={updateUser} signOut={signOut} />}></Route>
						<Route path={'/reset'} render={() => <ResetPassword {...user} updateUser={updateUser} signOut={signOut} />}></Route>
						<Route path={'/projects'} render={() => <Projects {...user} updateUser={updateUser} signOut={signOut} />}></Route>
						<Route path={'/'} render={() => <HomePage {...user} updateUser={updateUser} signOut={signOut} />}></Route>
					</Switch>
				</Suspense>
			</BrowserRouter>
			{children}
		</React.Fragment>
	);
}

export default App;