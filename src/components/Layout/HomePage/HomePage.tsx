import React from 'react';
import { userProps } from '../../../App';

const HomePage: React.FC<userProps> = ({
    errorMessage,
    isAuthenticated,
    token,
    updateUser
}) => {
    return (
        <div>
            HomePage
        </div>
    )
}

export default HomePage;