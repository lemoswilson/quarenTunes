import React, { FC, Fragment } from 'react';
import { userData, userProps } from '../../../App';
import { Link, useHistory } from 'react-router-dom';

const Header: FC<userProps> = ({
    errorMessage,
    isAuthenticated,
    token,
    updateUser,
    children
}) => {

    const history = useHistory()

    const signOut = () => {
        localStorage.removeItem('xolombrisJWT')
        updateUser({ errorMessage: '', isAuthenticated: false, token: '' })
        history.push('/')
    };


    return (
        <Fragment>
            <ul>
                <li>
                    <Link to={'/app'}>Make Music</Link>
                </li>
                <li>
                    <Link to={'/signin'}>Sign In</Link>
                </li>
                <li>
                    <Link to={'/signup'}>Sign Up</Link>
                </li>
                <li>
                    <Link to={'/contact'}>Contact</Link>
                </li>
                <li>
                    <Link onClick={signOut} to={'#'}>SignOut</Link>
                </li>
                <li>
                    <Link to={'/'}>Home</Link>
                </li>
            </ul>
        </Fragment>
    )
}

export default Header;