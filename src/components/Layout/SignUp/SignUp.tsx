import React, { useEffect, useRef, useState } from 'react';
import Div100vh from 'react-div-100vh';
import GoogleLogin from 'react-google-login';
import { Link, NavLink } from 'react-router-dom';
import { useHistory } from 'react-router'

import { userProps } from '../../../App';

import axios from 'axios';

import styles from './style.module.scss';
import Logo from '../Logo';

interface googleLogin {
    onClick: () => void,
    disabled?: boolean,
}

const SignUp: React.FC<userProps> = ({
    errorMessage,
    isAuthenticated,
    token,
    updateUser,
}) => {

    const history = useHistory()
    const username = useRef<HTMLInputElement>(null);
    const email = useRef<HTMLInputElement>(null);
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
                email: email.current?.value,
                password: password.current?.value,
                method: 'local'
            }

            if (data.password?.length && (data.password.length < 6 || data.password.length > 16)) {
                updateUser({
                    isAuthenticated,
                    token,
                    errorMessage: 'Password must have 6 to 16 characters.',
                })
                return
            }

            axios.post(process.env.REACT_APP_SERVER_URL + '/users/signup', data)
                .then(response => {
                    if (response.status === 200 && response.data.token) {
                        authenticate(response.data.token);
                    } else {
                        postError(response.data.error) 
                    }
                })
                .catch(e => { 

                    if (e.response.data.error.match('"username"'))
                        postError('Username must have between 6 and 20 characters') 
                    else if (e.response.data.error.match('"password"'))
                        postError('Password must have between 6 and 16 characeters')
                    else if (e.response.data.error.match('"email"'))
                        postError('Email must be a valid email');

                })

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
                                    <Link to={'/login'}>Sign In</Link>
                                }</span> 
                            </div>
                    </div>
                </div>
            </nav>
            <main className={styles.signUp}>
                <form className={styles.overlay}>
                    <div className={styles.join}> Join Xolombrisx </div>
                    <div className={styles.cacc}> Create your account </div>
                    <div className={styles.field}>
                        <h3>Username</h3>
                        <input ref={username} placeholder={'Username'} type={'text'}></input>
                    </div>

                    <div className={styles.field} style={{marginTop: '1.6rem'}}>
                        <h3>Email</h3>
                        <input ref={email} autoComplete={'email'} placeholder={'Email'} type={'email'}></input>
                    </div>

                    <div className={styles.field} style={{marginTop: '1.6rem'}}>
                        <h3>Password</h3>
                        <input ref={password} placeholder={'Password'} type={'password'}></input>
                    </div>

                    <p className={styles.p}> Password must have between 6 and 16 characters </p>

                    <button onClick={(e) => onSubmit(e)} className={styles.create}>Create Account</button>

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

export default SignUp;