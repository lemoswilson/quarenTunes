import React, { useEffect, useRef, useState } from 'react';
import { useLocation, Link, NavLink  } from 'react-router-dom';
import Div100vh from 'react-div-100vh';

import { useHistory } from 'react-router'
import { userProps } from '../../../App';

import styles from './reset.module.scss';
import Logo from '../Logo';
import axios from 'axios';

const ResetPassword: React.FC<userProps> = ({
    errorMessage,
    isAuthenticated,
    token,
    updateUser,
}) => {

    const history = useHistory()
    const location =  useLocation();
    const password = useRef<HTMLInputElement>(null);
    const confirmPassword = useRef<HTMLInputElement>(null);
    const [user, setUser] = useState<{[key: string]: string}>({})
    const [message, setMessage] = useState<string>('')

    useEffect(() => {
        if (isAuthenticated){
            updateUser({errorMessage: '', isAuthenticated, token})
            history.push('/');
        }
    }, [])

    useEffect(() => {
        let query = location.search;
        const data: {[key: string]: string} = {};

        if (!query){
            updateUser({errorMessage: '', isAuthenticated, token})
            history.push('/')
        } else {
            query = query.slice(1)
            query.split('&').forEach((kv, idx, arr) => {
                const res = kv.split('=')
                if (res[0] === 'user' || res[0] === 'rcp'){
                    data[res[0]] = res[1]
                }  
            })

            axios.post(process.env.REACT_APP_SERVER_URL + '/users/checkLink', data)
                .then((res) => {
                    if (res.status === 200){
                        setUser({username: data.user, secret: data.rcp})
                    } else {
                        alert('Expired link, redirecting to home page');
                        updateUser({errorMessage: '', isAuthenticated, token})
                        history.push('/');
                    }
                })
                .catch(e => {postError(e)})
        }
    }, [])


    const postError = (err: any) => {
        updateUser({
            errorMessage: err,
            isAuthenticated: false,
            token: ''
        });
    };


    const onSubmit = async (e: React.MouseEvent) => {
        try {
            e.preventDefault()
            const data = {
                password: password.current?.value,
                confirmationPassword: confirmPassword.current?.value,
                ...user,
            }

            if (data.password !== data.confirmationPassword){
                postError('The passwords entered don\'t match')
                return
            }

            const response = await axios.post(
                process.env.REACT_APP_SERVER_URL + '/users/resetPassword', 
                data
            )

            if (response.status === 200 && response.data.data === 'reseted') {
                alert('Your password has been reseted, you are being redirected to login');
                updateUser({errorMessage: '', isAuthenticated, token})
                history.push('/login')
            } else {
                postError(response.data.error) 
            }

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
                                    <Link to={'/signup'}>Sign Up</Link>
                                }</span> 
                            </div>
                    </div>
                    <div className={styles.navBox}>
                            <div className={styles.text}>
                                <span className={styles.ss}>{
                                    <Link to={'/signin'}>Sign In</Link>
                                }</span> 
                            </div>
                    </div>
                </div>
            </nav>
            <main className={styles.reset}>
                <form className={styles.overlay}>
                    <div className={styles.join}> Reset your password </div>

                    <div className={`${ styles.field }`}>
                        <h3>Password</h3>
                        <input ref={password} placeholder={'password'} type={'password'}/>
                    </div>

                    <div className={`${ styles.field } ${styles.downer}`}>
                        <h3>Confirm Password</h3>
                        <input ref={confirmPassword} placeholder={'confirm password'} type={'password'}/>
                    </div>

                    <button onClick={(e) => onSubmit(e)} className={styles.login}>Reset Password</button>

                    <div className={styles.errorMessage}>{ errorMessage && errorMessage.length > 0 ? errorMessage : ''}</div>
                    <div className={styles.errorMessage}>{ message }</div>
                    
                </form>
            </main>
        </Div100vh>
    )
}

export default ResetPassword;