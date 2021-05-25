import React from 'react';

export interface dropdownContext {
    [key: string]: () => void
}

const DropdownContext = React.createContext<any>({})

export default DropdownContext