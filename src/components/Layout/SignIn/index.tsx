import React, { useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import GoogleLogin from 'react-google-login';
import Div100vh from 'react-div-100vh';
import { useHistory } from 'react-router'
import { userProps } from '../../../App';
import styles from './style.module.scss';

import axios from 'axios';

import Logo from '../Logo';

const SignIn: React.FC<userProps> = ({
    errorMessage,
    isAuthenticated,
    token,
    updateUser,
}) => {

    const history = useHistory()
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
                .catch(postError)
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
                .catch(e => { postError('There was a problem with the password or username entered')});

        } catch (err) {
            postError(err?.response?.data?.error);
        }
    }

    return (
        <Div100vh className={styles.home}>
        <nav className={styles.nav}>
            <div className={styles.logo}>
                <Logo className={styles.xolombrisx} />
            </div>
            <div className={styles.links}>
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
            <form className={styles.overlay}>

                <div className={styles.join}> Log in  </div>

                <div className={styles.field}>
                    <h3>Username</h3>
                    <input ref={username} autoComplete={'username'} placeholder={'Username'} type={'text'}></input>
                </div>

                <div className={styles.field} style={{marginTop: '1.6rem'}}>
                    <h3>Password</h3>
                    <input ref={password} autoComplete={'current-password'} placeholder={'Password'} type={'password'}></input>
                </div>

                <p className={styles.forgot}> Forgot your password? reset it <Link onClick={() => { updateUser({errorMessage: '', isAuthenticated, token})}} to={'/recover'}>here</Link></p>

                <button onClick={(e) => onSubmit(e)} className={styles.login}>Login</button>
                <div className={styles.division}></div>

                <p className={styles.or}> or authenticate with </p>

                <GoogleLogin
                    clientId={'860801707225-igbgn7p48ffqqu6mgfds39o4q7md2rvr.apps.googleusercontent.com'}
                    buttonText='Google'
                    onSuccess={responseGoogle}
                    onFailure={() => {}}
                ></GoogleLogin>

                <div className={styles.errorMessage}>{ errorMessage && errorMessage.length > 0 ? errorMessage : ''}</div>
                

            </form>
        </main>
    </Div100vh>
    )
}

export default SignIn;