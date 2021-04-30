import React from 'react';

export interface dropDownContext {
    [key: string]: () => void
}

const DropdownContext = React.createContext<any>({})

export default DropdownContext