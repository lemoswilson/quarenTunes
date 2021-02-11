import React, { useState, Suspense, lazy } from "react";
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import Header from './components/Layout/Header/Header';
import HomePage from './components/Layout/HomePage/HomePage';
import SignUp from './components/Layout/SignUp/SignUp';
import './App.scss';
// import Xolombrisx from './containers/Xolombrisx';

const Xolombrisx = lazy(() => import('./containers/Xolombrisx'))
const SuspenseFallback: React.FC = () => <div>Fallback</div>

export interface userData {
	isAuthenticated: boolean,
	token: string,
	errorMessage: string,
}

export interface userProps extends userData {
	updateUser: React.Dispatch<React.SetStateAction<userData>>,
}



const App: React.FC<{ children?: React.ReactNode }> = ({ children }) => {

	// check for token in local storage before setting the state

	const [user, updateUser] = useState<userData>({
		isAuthenticated: false,
		token: '',
		errorMessage: '',
	})

	return (
		<React.Fragment>
			<BrowserRouter>
				<Suspense fallback={<SuspenseFallback />}>
					{/* <Header {...user} updateUser={updateUser} /> */}
					<Switch>
						<Route path={'/app'} render={() => <Xolombrisx {...user} updateUser={updateUser} />}></Route>
						<Route path={'/signin'} render={() => <HomePage {...user} updateUser={updateUser} />}></Route>
						<Route path={'/signup'} render={() => <SignUp  {...user} updateUser={updateUser} />}></Route>
						<Route path={'/contact'} render={() => <HomePage {...user} updateUser={updateUser} />}></Route>
						<Route path={'/dashboard'} render={() => <HomePage {...user} updateUser={updateUser} />}></Route>
						<Route path={'/'} render={() => <HomePage {...user} updateUser={updateUser} />}></Route>
					</Switch>
				</Suspense>
			</BrowserRouter>
			{children}
		</React.Fragment>
	);
}

export default App;