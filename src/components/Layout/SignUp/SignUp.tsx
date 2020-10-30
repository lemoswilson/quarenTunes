import React, { FormEvent, useRef } from 'react';
import { useHistory } from 'react-router'
import { userProps } from '../../../App';
import axios, { AxiosResponse } from 'axios';
import GoogleLogin, { GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';

const SignUp: React.FC<userProps> = ({
    errorMessage,
    isAuthenticated,
    token,
    updateUser,
}) => {

    const responseGoogle = (res: any) => {
        console.log('response Google', res.tokenId)
        axios.post('http://localhost:5000/users/auth/google', { token: res.tokenId })
    };

    const history = useHistory()
    const username = useRef<HTMLInputElement>(null);
    const email = useRef<HTMLInputElement>(null);
    const password = useRef<HTMLInputElement>(null);
    const confirmationPassword = useRef<HTMLInputElement>(null);
    const firstName = useRef<HTMLInputElement>(null);
    const lastName = useRef<HTMLInputElement>(null);

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        try {
            e.preventDefault()
            const data = {
                username: username.current?.value,
                email: email.current?.value,
                password: password.current?.value,
                confirmationPassword: confirmationPassword.current?.value,
                firstName: firstName.current?.value,
                lastName: lastName.current?.value,
                method: 'local'
            }
            const response = axios.post('http://localhost:5000/users/signup', data).then((res) => {
                console.log('login axios response', res);
                if (res.status === 200 && res.data.token) {
                    updateUser({
                        errorMessage: '',
                        isAuthenticated: true,
                        token: res.data.token
                    })
                    localStorage.setItem('xolombrisJWT', res.data.token);
                    history.push({
                        pathname: '/',
                        state: {
                            response: 'authenticated'
                        }
                    })
                }
            }).catch((err) => {
                updateUser({
                    errorMessage: err,
                    isAuthenticated: false,
                    token: ''
                })
                // display error to the user
            })

        } catch (error) {
            // display error to the user 
        }
    }

    return (
        <div>
            <form onSubmit={onSubmit}>
                <input ref={username} placeholder='username' type="text" />
                <input ref={email} placeholder='email' type="email" />
                <input ref={password} placeholder='password' type="password" />
                <input ref={confirmationPassword} placeholder='password' type="password" />
                <input ref={firstName} placeholder='first name' type="text" />
                <input ref={lastName} placeholder='last name' type="text" />
                {errorMessage ? `not possible to create user${errorMessage}` : null}
                <button type='submit'> Submit </button>
            </form>
            <GoogleLogin
                clientId={'860801707225-igbgn7p48ffqqu6mgfds39o4q7md2rvr.apps.googleusercontent.com'}
                autoLoad={true}
                buttonText='Google'
                onSuccess={responseGoogle}
                onFailure={responseGoogle}
            ></GoogleLogin>
            <button>facebook</button>
        </div>
    )
}

export default SignUp;