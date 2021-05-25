import React, { useContext } from 'react';
import useDropdownEmitter from '../../hooks/emitters/useDropdownEmitter';
import DropdownContext from '../../context/DropdownContext';

const DropdownEmitterComponent = () => {
    const ref_dropdowns = useContext(DropdownContext);

    useDropdownEmitter(ref_dropdowns);

    return (
        <React.Fragment></React.Fragment>
    )
};

export default DropdownEmitterComponent;