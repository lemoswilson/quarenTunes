import React from 'react';

interface MenuButtonProps {
    onClick: () => void;
}

const MenuButton: React.FC<MenuButtonProps> = ({ onClick }) => {

    return (
       <div onClick={onClick}></div> 
    )
};


export default MenuButton;
