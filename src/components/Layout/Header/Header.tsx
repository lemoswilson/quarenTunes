import React, { FC, Fragment } from 'react';
import { userData } from '../../../App';
import { Link } from 'react-router-dom';

const Header: FC<userData> = ({
    errorMessage,
    isAuthenticated,
    token,
    children
}) => {
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
                    <Link to={'/'}>Home</Link>
                </li>
            </ul>
        </Fragment>
    )
}

export default Header;