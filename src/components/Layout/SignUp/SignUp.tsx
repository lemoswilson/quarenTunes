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


    const history = useHistory()
    const username = useRef<HTMLInputElement>(null);
    const email = useRef<HTMLInputElement>(null);
    const password = useRef<HTMLInputElement>(null);
    const confirmationPassword = useRef<HTMLInputElement>(null);
    const firstName = useRef<HTMLInputElement>(null);
    const lastName = useRef<HTMLInputElement>(null);

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
    const responseGoogle = async (res: any) => {
        try {
            console.log('response Google', res.tokenId)
            const token = res.tokenId
            const userId = res.googleId
            axios.post(process.env.REACT_APP_SERVER_URL + '/users/auth/google', { token: token, access: res.accessToken, id: userId })
                .then((response) => {
                    console.log(response.data.token);
                    authenticate(response.data.token)
                }).catch(postError)
        } catch (error) {
            postError(error)
        }
    };

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
            const response = axios.post(process.env.REACT_APP_SERVER_URL + '/users/signup', data).then((res) => {
                if (res.status === 200 && res.data.token) {
                    authenticate(res.data.token);
                }
            }).catch(postError)

        } catch (error) {
            postError(error);
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
                buttonText='Google'
                onSuccess={responseGoogle}
                onFailure={responseGoogle}
            ></GoogleLogin>
            <button>facebook</button>
        </div>
    )
}

export default SignUp;