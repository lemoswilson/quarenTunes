import React, { useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import GoogleLogin from 'react-google-login';
import Div100vh, { use100vh } from 'react-div-100vh';
import { isMobile, isMobileOnly, isSafari } from 'react-device-detect';
import { useHistory } from 'react-router'
import { userProps } from '../../../App';
import useSidebar, { pagesInfo } from '../../../hooks/components/useSidebar';
import styles from './style.module.scss';
import google from '../../../assets/google.svg';

import axios from 'axios';

import Logo from '../Logo';
import Burger from '../../UI/Burger';

const SignIn: React.FC<userProps> = ({
    errorMessage,
    isAuthenticated,
    token,
    updateUser,
}) => {

    const history = useHistory()
    const { Sidebar, sidebarClass, toggleSidebar, closeSidebar} = useSidebar();
    const username = useRef<HTMLInputElement>(null);
    const password = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isAuthenticated){
            updateUser({errorMessage: '', isAuthenticated, token})
            history.push('/');
        }
    }, [])

    useEffect(() => {})

    const postError = (err: any) => {
        updateUser({
            errorMessage: err,
            isAuthenticated: false,
            token: ''
        });
    };

    const authenticate = (token: string) => {
        updateUser({
            errorMessage: '',
            isAuthenticated: true,
            token: token,
        })
        localStorage.setItem('xolombrisJWT', token);
        history.push({
            pathname: '/',
            state: {
                response: 'authenticated'
            }
        })
    }

    // const responseGoogle = (res: GoogleLoginResponse) => {
    // const responseGoogle = (res: GoogleLoginResponse | GoogleLoginResponseOffline) => {
    // type seems not to be making sense, if using any of these two up here
    // it raises a type error
    const responseGoogle = async (res: any) => {
        try {
            const data = {
                token: res.tokenId,
                access: res.accessToken,
                id: res.googleId
            }
            axios.post(process.env.REACT_APP_SERVER_URL + '/users/auth/google', data, {})
                .then((response) => { authenticate(response.data.token) })
                .catch((e) => {
                    if (!e.status){
                        postError('The server did not respond, please try again later')
                    } else 
                        postError(e)
                })
        } catch (error) {
            postError(error)
        }
    };

    const onSubmit = async (e: React.MouseEvent) => {
        try {
            e.preventDefault()
            const data = {
                username: username.current?.value,
                password: password.current?.value,
            }

            axios.post(process.env.REACT_APP_SERVER_URL + '/users/signin', data)
                .then(response => {

                    if (response.status === 200 && response.data.token) {
                        authenticate(response.data.token);
                    } 
                })
                .catch(e => { 
                    postError(
                        !e.status 
                        ? 'The server did not respond, please try again later'
                        : 'There was a problem with the password or username entered'
                    )
                });

        } catch (err) {
            // postError(err?.response?.data?.error);
        }
    }

    const pages: pagesInfo = {
        music: {
            text: 'Make Music',
            path: '/app',
        },
        signUp: {
            text: 'Sign Up',
            path: '/signup'
        },
        home: {
            text: 'Home',
            path: '/'
        }
    }

    return (
        <Div100vh className={styles.home}>
            <Sidebar openClose={toggleSidebar} pages={pages} className={sidebarClass} style={!isMobileOnly ? {display: 'none'} : {}} />            

            <nav className={styles.nav}>
                <div className={styles.logo}>
                    <Logo className={styles.xolombrisx} style={isMobileOnly ? {width: '3vmax', height: '3vmax', marginTop: '1.5vmax', marginLeft: '1.5vmax'} : isMobile ? {width: '3rem', height: '3rem'} : isSafari ? {width: '2rem', height: '2rem', marginLeft: '1rem', marginTop: '1rem;'} : {}} />
                </div>

                <Burger onClick={toggleSidebar} style={!isMobileOnly ? {display: 'none'} : {}}/>                

                <div style={isMobileOnly ? {display: 'none'} : {}} className={styles.links}>
                    <div className={styles.navBox}> 
                        <div className={`${ styles.text }`}>
                            <NavLink 
                            onClick={() => {updateUser({errorMessage: '', isAuthenticated, token})}}
                                className={styles.ss}  
                                activeStyle={{
                                    textDecoration: 'none', 
                                    color: '#ffffff', 
                                    borderBottom: '0.5px solid white'
                                }} to={'/'}> Home </NavLink>
                        </div>
                    </div>
                    <div className={styles.navBox}>
                            <div className={styles.text}>
                                <span className={styles.ss}>{
                                    <Link onClick={() => { updateUser({errorMessage: '', isAuthenticated, token})}} to={'/signup'}>Sign Up</Link>
                                }</span> 
                            </div>
                    </div>
                </div>
            </nav>
            <main className={styles.signUp}>
                <form onClick={closeSidebar} className={styles.overlay}>

                    <div className={styles.join}> Sign in to Xolombrisx  </div>

                    <div className={styles.field}>
                        <h3>Username</h3>
                        <input ref={username} autoComplete={'username'} type={'text'}></input>
                    </div>

                    <div className={styles.field} style={{marginTop: '1.6rem'}}>
                        <h3>Password</h3>
                        <input ref={password} autoComplete={'current-password'} type={'password'}></input>
                    </div>

                    <p className={styles.forgot}> Forgot your password? reset it <Link onClick={() => { updateUser({errorMessage: '', isAuthenticated, token})}} to={'/recover'}><u>here</u></Link></p>

                    <button onClick={(e) => onSubmit(e)} className={styles.login}>Login</button>

                    <div className={styles.google}>
                        <p className={styles.or}> or authenticate with </p>

                        <GoogleLogin
                            clientId={'860801707225-igbgn7p48ffqqu6mgfds39o4q7md2rvr.apps.googleusercontent.com'}
                            buttonText='Google'
                            render={renderProps => (
                                <button disabled={renderProps.disabled} onClick={renderProps.onClick} className={styles.googlota}>
                                    <img src={google} width={'30rem'} height={'30rem'} />
                                </button>
                            )}
                            onSuccess={responseGoogle}
                            onFailure={() => {}}
                        ></GoogleLogin>

                    </div>


                    <div className={styles.errorMessage}>{ errorMessage && errorMessage.length > 0 ? errorMessage : ''}</div>
                    

                </form>
            </main>
        </Div100vh>
    )
}

export default SignIn;