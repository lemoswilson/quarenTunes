import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Div100vh from 'react-div-100vh';
import { useHistory } from 'react-router'
import { userProps } from '../../../App';
import axios, { AxiosResponse } from 'axios';
import styles from './style.module.scss';
import Logo from '../Logo';
import { Link, NavLink } from 'react-router-dom';
import { isMobileOnly, isMobile } from 'react-device-detect';

interface googleLogin {
    onClick: () => void,
    disabled?: boolean,
}


const Recover: React.FC<userProps> = ({
    errorMessage,
    isAuthenticated,
    token,
    updateUser,
}) => {

    const history = useHistory()
    const field = useRef<HTMLInputElement>(null);
    const [option, setOption] = useState<'username' | 'email'>('username')
    const [message, setMessage] = useState<string>('')

    useEffect(() => {
        if (isAuthenticated){
            updateUser({errorMessage: '', isAuthenticated, token})
            history.push('/');
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
                data: field.current?.value,
                type: option,
                // method: 'local'
            }

            const response = await axios.post(process.env.REACT_APP_SERVER_URL + '/users/recover', data)

            if (response.status === 200 && response.data) {
                updateUser({errorMessage: '', isAuthenticated, token})
                setMessage(response.data.data)
            } else {
                postError(response.data.error) 
            }

        } catch (err) {
            postError(err?.response?.data?.error);
        }
    }

    const select = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {

        const data = (e.target as any).value;

        if (data === 'username'){
            setOption('username')
        } else if (data === 'email') {
            setOption('email')
        }
    }

    return (
        <Div100vh className={styles.home}>
            <nav className={styles.nav}>
                <div className={styles.logo}>
                <Logo className={styles.xolombrisx} style={isMobileOnly ? {width: '6rem', height: '6rem', marginTop: '3rem', marginLeft: '3rem'} : isMobile ? {width: '3rem', height: '3rem'} : {}} />
                </div>
                <div style={isMobileOnly ? {display: 'none'} : {}} className={styles.links}>
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
                </div>
            </nav>
            <main className={styles.signUp}>
                <form className={styles.overlay}>
                    <div className={styles.join}> Reset your password </div>
                    <div onClick={select} className={styles.radio}>

                        <div className={styles.option}>
                            <input onChange={() => {}} type={'radio'} id={'username'} name={'username'} value={'username'} checked={option === 'username'}/>
                            <label htmlFor={'username'}>Username</label>
                        </div>

                        <div className={styles.option}>
                            <input onChange={() => {}} className={styles.email} type={'radio'} id={'email'} name={'email'} value={'email'} checked={option === 'email'}/>
                            <label htmlFor={'email'}>Email</label>
                        </div>

                    </div>
                    <div className={styles.field}>
                        <input ref={field} type={ option === 'username' ? 'text' : 'email'}/>
                    </div>
                    
                    <button onClick={(e) => onSubmit(e)} className={styles.login}>Recover Password</button>

                    <div className={styles.errorMessage}>{ errorMessage && errorMessage.length > 0 ? errorMessage : ''}</div>
                    <div className={styles.errorMessage}>{ message }</div>
                    

                </form>
            </main>
        </Div100vh>
    )
}

export default Recover;