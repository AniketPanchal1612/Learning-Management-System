import React from 'react'
import { Provider } from 'react-redux'

import {store} from '../redux/store'

interface ProvidePros{
    // children :ReactNode
    children :any

}

export function Providers({children}:ProvidePros){
    return <Provider store={store} >
        {children}
    </Provider>
}