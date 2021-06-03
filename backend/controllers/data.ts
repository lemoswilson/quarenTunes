import { Response, Request } from 'express'

import{ UserModelType } from '../models/user.model'
import ProjectModel from '../models/project.model'
import InstrumentModel from '../models/instrument.model'
import EffectModel from '../models/effect.model';

import { messages, modelTypes } from '../helpers/routeHelpers'

export async function getData(
    res: Response<any>,
    req: Request<any>,
) {
    try {
        const user: UserModelType | null | undefined = req.user;
        const name: string = req.body.name;

        if (user) {
            const modelType = req.body.modelType;
            if (modelType === modelTypes.PROJECT){
                const project = await ProjectModel.findOne({user: user._id, name: name}).exec()
                res.status(200).json({track: project?.Track, sequencer: project?.Sequencer}) 

            } else if (modelType === modelTypes.INSTRUMENT){
                const type = req.body.type;
                const instrument = await InstrumentModel.findOne({user: user._id, type: type, name: name}).exec();
                res.status(200).json({instrument: instrument?.options})

            } else if (modelType === modelTypes.EFFECT) {
                const type = req.body.type;
                const effect = await EffectModel.findOne({user: user._id, type: type, name: name}).exec();
                res.status(200).json({effects: effect?.options});

            }
        } 
        
        else 
            res.status(400).json({error: messages.UNKOWN_USER_PASS});

    } catch (e) {
        res.status(400).json({error: messages.INFORMATION_RETRIEVAL_ERROR})
    }
}

export async function getDataList(
    res: Response<any>,
    req: Request<any>,
) {
    try {
        const user: UserModelType | null | undefined = req.user;

        if (user) {
            const modelType = req.body.modelType;
            if (modelType === modelTypes.PROJECT){
                const projects = await ProjectModel.find({user: user._id}).exec()
                res.status(200).json({projects: projects.map(v => v.name)}) 

            } else if (modelType === modelTypes.INSTRUMENT){
                const type = req.body.type;
                const instruments = await InstrumentModel.find({user: user._id, type: type}).exec();
                res.status(200).json({instruments: instruments.map(m => m.name)})

            } else if (modelType === modelTypes.EFFECT) {
                const type = req.body.type;
                const effects = await EffectModel.find({user: user._id, type: type}).exec();
                res.status(200).json({effects: effects.map(e => e.name)});

            }
        } 
        
        else 
            res.status(400).json({error: messages.UNKOWN_USER_PASS});

    } catch (e) {
        res.status(400).json({error: messages.INFORMATION_RETRIEVAL_ERROR})
    }

}

export async function saveData(
    req: Request<any>,
    res: Response<any>,
) {
    try {
        const user: UserModelType | undefined | null = req.user;

        if (user) {
            let name: string = req.body.name
            const modelType = req.body.modelType;

                if (modelType === modelTypes.PROJECT){
    
                    const project: any = req.body.project
                    const existName = await ProjectModel.find({user: user._id, name: name}).exec();
                    const Project = new ProjectModel({
                        user: user._id, 
                        sequencer: project.sequencer, 
                        track: project.track, 
                        name: existName ? `${name}_2` : name
                    })

                    Project.save()
                        .then(_ => { res.status(200).send({message: messages.PROJECT_SAVED})})
                        .catch(e => {res.send({ error: e })})
    
                } else if (modelType === modelTypes.INSTRUMENT){
    
                    const options: any = req.body.options
                    const instrumentType = req.body.type;
                    const existName = await InstrumentModel.find({user: user._id, name: name}).exec();
                    const Instrument = new InstrumentModel({
                        user: user._id, 
                        options: options,
                        name: existName ? `${name}_2` : name,
                        type: instrumentType,
                    })
                    Instrument.save()
                        .then(_ => { res.status(200).send({message: messages.INSTRUMENT_SAVED})})
                        .catch(e => {res.send({ error: e })})
    
                } else if (modelType === modelTypes.EFFECT) {
    
                    const options: any = req.body.options
                    const effectType = req.body.type;
                    const existName = await EffectModel.find({user: user._id, name: name}).exec();
                    const Effect = new EffectModel({
                        user: user._id, 
                        options: options,
                        name: existName ? `${name}_2` : name,
                        type: effectType,
                    })
                    Effect.save()
                        .then(_ => { res.status(200).send({message: messages.EFFECT_SAVED})})
                        .catch(e => {res.send({ error: e })})
    
                }

        } else {
            res.status(202).json({error: messages.UNKOWN_USER_PASS});
        }


    } catch(e) {
        res.status(402).send({error: e});
    }
}

export async function updateData(
    req: Request<any>,
    res: Response<any>,
) {
    try {
        const User: UserModelType | undefined | null = req.user;
        if (User){
            const updateValue: boolean = req.body.updateValue;
            const rename: boolean = req.body.rename
            const modelType = req.body.modelType;
            const name: string = req.body.name;
    
            if (modelType === 'projects'){
                const Project = await ProjectModel.findOne({name: name, user: User._id}).exec();

                if (Project && updateValue){
                    Project.Track = req.body.project.track;
                    Project.Sequencer = req.body.project.project.sequencer;
                }
                if (Project && rename) {
                    Project.name = req.body.newName;
                }
        
                Project?.save()
                    .then(_ => {res.status(200).json({message: messages.PROJECT_SAVED })})
                    .catch(e => {res.json({error: e})})

            } else if (modelType === 'instrument') {

                const Instrument = await InstrumentModel.findOne({name: name, user: User._id}).exec();
                if (Instrument && updateValue)
                    Instrument.options = req.body.options;
                
                if (Instrument && rename)
                    Instrument.name = req.body.newName

                Instrument?.save()
                    .then(_ => {res.status(200).json({message: messages.INSTRUMENT_SAVED })})
                    .catch(e => {res.json({error: e})})

            } else if (modelType === 'effect') {

                const Effect = await EffectModel.findOne({name: name, user: User._id}).exec();
                if (Effect && updateValue)
                    Effect.options = req.body.options;
                
                if (Effect && rename)
                    Effect.name = req.body.newName

                Effect?.save()
                    .then(_ => {res.status(200).json({message: messages.EFFECT_SAVED })})
                    .catch(e => {res.json({error: e})})
            }

        }

    } catch (e) {
        res.status(402).json({error: e});
    }
}