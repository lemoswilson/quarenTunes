import React, { useEffect, useState, useContext, useRef, ChangeEvent } from 'react';
import axios from 'axios';
import { userData } from '../../App';
import UserData from '../../context/userDataContext';
import { useHistory, useLocation } from 'react-router-dom';
import { batch, useDispatch, useSelector } from 'react-redux';
import { effectNameSelector, trackNameSelector } from '../../store/Track/selectors';
import { resetDevice, setName, setOptionsArray, updateEffectState, updateInstrumentState, xolombrisxInstruments } from '../../store/Track';
import { extend } from '../../lib/utility';
import useQuickRef from '../lifecycle/useQuickRef';


export const useVerify = (
    user: userData,
    updateUser: React.Dispatch<React.SetStateAction<userData>>,
    setProjects?: boolean,
    pushHome?: boolean,
) => {
    
    const history = useHistory();
    const location = useLocation().pathname;

    useEffect(() => {
        async function verify(){
            const res = await axios.post(
				process.env.REACT_APP_SERVER_URL + '/users/auth/verify', 
				undefined
				, {
					headers: {
						authorization: localStorage.getItem('xolombrisJWT') 
					}
				} 
			)
            return res;
        }

		if (localStorage.getItem('xolombrisJWT') && !user.isAuthenticated){
            const res = verify() 

			res.then((res) => {
				if (res.status === 200){
					updateUser({
						errorMessage: '',
						isAuthenticated: true,
						token: localStorage.getItem('xolombrisJWT')
					})
				}
			}).catch((err) => {
				updateUser({
					errorMessage: err, 
					isAuthenticated: false,
					token: '',
				})
                if (pushHome)
                    history.push('/')
			});


		}
	}, [])
};

export function useSignOut(
    updateUser: React.Dispatch<React.SetStateAction<userData>>,
){
    function signOut(){
        localStorage.removeItem('xolombrisJWT')
        updateUser({
            errorMessage: '',
            isAuthenticated: false, 
            token: '',
        })
    }

    return signOut
}

const useFetchProjects = (
    token: string,
    setProjects?: (value: React.SetStateAction<string[]>) => void,
    postError?: (err: any) => void,
) => {

    async function fetchProjects(){
        axios.post(process.env.REACT_APP_SERVER_URL + '/users/userDataList', {modelType: 'project'}, {headers: {authorization: token}})        
        .then(response => { setProjects?.(response.data.projects)})
        .catch(response => { postError?.(response)})
    }
}

export const useDeviceLoader = (
    options: any,
    trackIndex: number,
    deviceType: string,
    modelType: 'instrument' | 'effect',
    fxIndex?: number,
) => {
    const dispatch = useDispatch();
    const selectedInstrumentName = useSelector(trackNameSelector(trackIndex));
    const selectedEffectName  = useSelector(effectNameSelector(trackIndex, fxIndex))
    const name = selectedEffectName ? selectedEffectName : selectedInstrumentName ;
    const [presets, setPresets] = useState<string[][]>([]) ;
    const user = useContext(UserData);
    const [textValue, setTextValue] = useState('');
    const ref_textValue = useQuickRef(textValue);

    useEffect(() => {
        setTextValue(name);
    },[])

    const onChange = (e: ChangeEvent) =>  {
       if (e.target.nodeValue)
        setTextValue(e.target.nodeValue) 
    }


    useEffect(() => {
        if (user.token)
            fetchList()
    }, [user.token])

    const saveDevice = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const input = e.currentTarget.getElementsByTagName('input')[0];

        save(input)
    }

    const save = (input: HTMLInputElement) => {
        if (user.isAuthenticated && user.token){
            if (
                (input.value === 'newInstrument' && modelType === 'instrument' ) 
                || input.value === 'init'
                || (input.value === 'newEffect' && modelType === 'effect')
                || input.value === ""
            ){
                input.value = name;
                input.blur()
                alert(`the name ${input.value} is not a valid preset name, please rename the instrument and try again`)
                return;
            }
    
            const opt = extend(options);
            opt.name = input.value;
    
            axios.post(
                process.env.REACT_APP_SERVER_URL + '/users/saveData',
                {rename: true, type: deviceType, modelType: modelType, name: name, newName: input.value, options: opt},
                {headers: {authorization: user.token}}
            ).then(res => {
                dispatch(setName(input.value, modelType, trackIndex, fxIndex))
            }).catch()
        }
    }

    const newDevice = () => {
        dispatch(setName(
            modelType === 'effect'
            ? 'newEffect'
            : 'newInstrument',
            modelType,
            trackIndex,
            fxIndex
        ))
    }

    const fetchDevice = (key: string) => {
        if (key === 'init') {
            dispatch(resetDevice(trackIndex, fxIndex));
            return
        }

        if ( user.token && user.token.length > 0)
            if (
                !(modelType === 'instrument' && (key === 'newInstrument' || key === 'init'))
                && !(modelType === 'effect' && (key === 'newEffect' || key === 'init'))
            )
                axios.post(
                    process.env.REACT_APP_SERVER_URL + '/users/getData',
                    {modelType: modelType, type: deviceType, name: key},
                    {headers: {authorization: user.token}}
                ).then(res => {
                    const v: any = res.data.options;
                    // delete v._id
                    batch(() => {
                        dispatch( setName(key, modelType, trackIndex, fxIndex) )
                        dispatch ( setOptionsArray(v, trackIndex, modelType, fxIndex))
                    })
                }).catch()
    }

    const removeDevice = () => {
        if (user.token && user.token.length > 0)
            axios.post(
                process.env.REACT_APP_SERVER_URL + '/users/deleteData',
                {name: selectedInstrumentName, modelType: modelType, type: deviceType},
                {headers: {authorization: user.token}}
            ).then(res => {
                setName('init', modelType, trackIndex);
            })
    }

    const fetchList = () => {
        if (user.token && user.token.length > 0)
            axios.post(
                process.env.REACT_APP_SERVER_URL + '/users/userDataList',
                {modelType: modelType, type: deviceType},
                {headers: {authorization: user.token}}
            ).then(res => {
                setPresets(res.data.dataList.map((v: string) => [v,v]))
            }).catch(e => {

            })
    }

    return { fetchDevice, removeDevice, saveDevice, save, presets, name, newDevice, fetchList, onChange, textValue: ref_textValue }
}

