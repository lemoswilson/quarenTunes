import React, { useState, Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Route, Switch } from 'react-router-dom'

import HomePage from './components/Layout/HomePage/HomePage';
import SignUp from './components/Layout/SignUp/SignUp';
import SignIn from './components/Layout/SignIn';
import Recover from './components/Layout/Recover';
import ResetPassword from './components/Layout/Recover/ResetPassword';

import axios from 'axios';

import './App.scss';
import Projects from "./components/Layout/Projects";

const Xolombrisx = lazy(() => import('./containers/Xolombrisx'))
const SuspenseFallback: React.FC = () => <div>Fallback</div>

export interface userData {
	isAuthenticated: boolean,
	token: string | null,
	errorMessage: string,
}

export interface userProps extends userData {
	updateUser: React.Dispatch<React.SetStateAction<userData>>,
}

const App: React.FC<{ children?: React.ReactNode }> = ({ children }) => {

	const [user, updateUser] = useState<userData>({
		isAuthenticated: false,
		token: '',
		errorMessage: '',
	})

	useEffect(() => {
		if (localStorage.getItem('xolombrisJWT') && !user.isAuthenticated){
			axios.post(
				process.env.REACT_APP_SERVER_URL + '/users/auth/verify', 
				undefined
				, {
					headers: {
						authorization: localStorage.getItem('xolombrisJWT') 
					}
				} 
			).then((res) => {
				if (res.status === 200){
					console.log('data received from verify is', res)
					updateUser({
						errorMessage: '',
						isAuthenticated: true,
						token: localStorage.getItem('xolombrisJWT')
					})
				}
			}).catch((err) => {
				updateUser({
					errorMessage: err, 
					isAuthenticated: false,
					token: '',
				})
			});
		}
	}, [])

	return (
		<React.Fragment>
			<BrowserRouter>
				<Suspense fallback={<SuspenseFallback />}>
					<Switch>
						<Route path={'/app'} render={( ) => <Xolombrisx {...user} updateUser={updateUser} />}></Route>
						<Route path={'/login'} render={() => <SignIn {...user} updateUser={updateUser} />}></Route>
						<Route path={'/signup'} render={() => <SignUp  {...user} updateUser={updateUser} />}></Route>
						<Route path={'/recover'} render={() => <Recover {...user} updateUser={updateUser} />}></Route>
						<Route path={'/reset'} render={() => <ResetPassword {...user} updateUser={updateUser} />}></Route>
						<Route path={'/projects'} render={() => <Projects {...user} updateUser={updateUser} />}></Route>
						<Route path={'/'} render={() => <HomePage {...user} updateUser={updateUser} />}></Route>

					</Switch>
				</Suspense>
			</BrowserRouter>
			{children}
		</React.Fragment>
	);
}

export default App;