import React from 'react';
import { userData } from '../App';


const UserDataContext = React.createContext<userData>({
    errorMessage: '',
    isAuthenticated: false,
    token: ''
})

export default UserDataContext;