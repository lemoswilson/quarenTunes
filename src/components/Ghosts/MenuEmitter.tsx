import React, { useContext } from 'react';
import useMenuEmitter from '../../hooks/emitters/useMenuEmitter';
import MenuContext from '../../context/MenuContext';


const MenuEmitterComponent = () => {
    const ref_menus = useContext(MenuContext);

    useMenuEmitter(ref_menus);

    return (
        <React.Fragment></React.Fragment>
    )
}

export default MenuEmitterComponent;