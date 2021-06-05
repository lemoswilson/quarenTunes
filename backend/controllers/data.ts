import { Response, Request, request } from 'express'

import { UserModelType } from '../models/user.model'
import ProjectModel, { defaultProject } from '../models/project.model'
import InstrumentModel from '../models/instrument.model'
import EffectModel from '../models/effect.model';

import { messages, modelTypes } from '../helpers/routeHelpers'

export async function getData(
    req: Request<any>,
    res: Response<any>,
) {
    try {
        const user: UserModelType | null | undefined = req.user;
        const name: string = req.body.name;

        if (user) {
            const modelType = req.body.modelType;
            if (modelType === modelTypes.PROJECT){
                const project = await ProjectModel.findOne({user: user._id, name: name}).exec()
                res.status(200).json({track: project?.track, sequencer: project?.sequencer}) 

            } else if (modelType === modelTypes.INSTRUMENT){
                const type = req.body.type;
                const instrument = await InstrumentModel.findOne({user: user._id, type: type, name: name}).exec();
                res.status(200).json({options: instrument?.options})

            } else if (modelType === modelTypes.EFFECT) {
                const type = req.body.type;
                const effect = await EffectModel.findOne({user: user._id, type: type, name: name}).exec();
                res.status(200).json({options: effect?.options});

            }
        } 
        
        else 
            res.status(400).json({error: messages.UNKOWN_USER_PASS});

    } catch (e) {
        res.status(400).json({error: messages.INFORMATION_RETRIEVAL_ERROR})
    }
}

export async function getDataList(
    req: Request<any>,
    res: Response<any>,
) {
    try {
        const user: UserModelType | null | undefined = req.user;

        if (user) {
            const modelType = req.body.modelType;

            res.status(200)
            if (modelType === modelTypes.PROJECT){
                const projects = await ProjectModel.find({user: user._id}).exec()
                res.json({projects: projects.map(v => v.name)}) 

            } else if (modelType === modelTypes.INSTRUMENT){
                const type = req.body.type;
                const instruments = await InstrumentModel.find({user: user._id, type: type}).exec();
                res.json({dataList: instruments.map(m => m.name)})

            } else if (modelType === modelTypes.EFFECT) {
                const type = req.body.type;
                const effects = await EffectModel.find({user: user._id, type: type}).exec();
                res.json({dataList: effects.map(e => e.name)});

            }
        } 
        else 
            res.status(400).json({error: messages.UNKOWN_USER_PASS});

    } catch (e) {

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
            const rename = req.body.rename;

                if (modelType === modelTypes.PROJECT){

                    const project: any = req.body.project
                    const existingProject = await ProjectModel.findOne({user: user._id, name: name}).exec();

                    if (existingProject && rename){
                        if (req.body.newName)
                            existingProject.name = req.body.newName 

                        existingProject.sequencer = project.sequencer                        
                        existingProject.track = project.track;

                        existingProject.save()
                        .then(_ => { res.status(200).send({message: messages.PROJECT_SAVED})})
                        .catch(e => { res.send({ error: e })})
                    } else {

                        const Project = new ProjectModel({
                            user: user._id, 
                            sequencer: project.sequencer, 
                            track: project.track, 
                            name: existingProject ? `${name}_2` : name === 'newInstrument' ? req.body.newName : name
                        })
                        
                        Project.save()
                            .then(_ => { res.status(200).send({message: messages.PROJECT_SAVED})})
                            .catch(e => { res.send({ error: e })})
    
                    }
                    
    
                } else if (modelType === modelTypes.INSTRUMENT){
    
                    const existingInstrument = await InstrumentModel.findOne({name: name, type: req.body.type, user: user._id}).exec();

                    if (existingInstrument && (rename || req.body.options)){

                        if (req.body.newName)
                            existingInstrument.name = req.body.newName;

                        if (req.body.options)
                            existingInstrument.options = req.body.options

                        existingInstrument.save()
                        .then(_ => { res.status(200).send({message: messages.INSTRUMENT_SAVED})})
                        .catch(e => { res.send({ error: e })})
                    } else {
                        
                        const Instrument = new InstrumentModel({
                            user: user._id, 
                            options: req.body.options,
                            name: req.body.newName,
                            type: req.body.type,
                        })
                        Instrument.save()
                            .then(_ => { res.status(200).send({message: messages.INSTRUMENT_SAVED})})
                            .catch(e => { res.send({ error: e })})

                    }

    
                } else if (modelType === modelTypes.EFFECT) {
    
                    const existingEffect = await EffectModel.findOne({name: name, type: req.body.type, user: user._id}).exec();

                    if (existingEffect && (rename || req.body.options)){

                        if (req.body.newName)
                            existingEffect.name = req.body.newName;

                        if (req.body.options)
                            existingEffect.options = req.body.options

                        existingEffect.save()
                        .then(_ => { res.status(200).send({message: messages.INSTRUMENT_SAVED})})
                        .catch(e => { res.send({ error: e })})
                    } else {
                        

                        const Effect = new EffectModel({
                            user: user._id, 
                            options: req.body.options,
                            name: req.body.newName,
                            type: req.body.type,
                        })
                        Effect.save()
                            .then(_ => { res.status(200).send({message: messages.INSTRUMENT_SAVED})})
                            .catch(e => { res.send({ error: e })})

                    }
    
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
    
            if (modelType === modelTypes.PROJECT){
                const Project = await ProjectModel.findOne({name: name, user: User._id}).exec();

                if (Project && updateValue){
                    Project.track = req.body.project.track;
                    Project.sequencer = req.body.project.project.sequencer;
                }
                if (Project && rename) {
                    Project.name = req.body.newName;
                }
        
                Project?.save()
                    .then(_ => {res.status(200).json({message: messages.PROJECT_SAVED })})
                    .catch(e => {res.json({error: e})})

            } else if (modelType === modelTypes.INSTRUMENT) {

                const Instrument = await InstrumentModel.findOne({name: name, user: User._id}).exec();
                if (Instrument && updateValue)
                    Instrument.options = req.body.options;
                
                if (Instrument && rename)
                    Instrument.name = req.body.newName

                Instrument?.save()
                    .then(_ => {res.status(200).json({message: messages.INSTRUMENT_SAVED })})
                    .catch(e => {res.json({error: e})})

            } else if (modelType === modelTypes.EFFECT) {

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

export async function deleteData(res: Response, req: Request){
    try {
        const User: UserModelType | undefined | null = req.user;
        if (User){
            const modelType = req.body.modelType;
            const name: string = req.body.name;
    
            if (modelType === modelTypes.PROJECT){

                ProjectModel.findOneAndDelete({name: name, user: User._id})
                .then(_ => {res.status(200).send({ message: messages.PROJECT_DELETED })})
                .catch(_ => {res.status(402).send({ message: messages.GENERAL_ERROR})})

            } else if (modelType === modelTypes.INSTRUMENT) {

                InstrumentModel.findOneAndDelete({name: name, user: User._id, type: req.body.type})
                .then(_ => {res.status(200).send({ message: messages.INSTRUMENT_DELETED })})
                .catch(_ => {res.status(402).send({ message: messages.GENERAL_ERROR})})

            } else if (modelType === modelTypes.EFFECT) {

                EffectModel.findOneAndDelete({name: name, user: User._id, type: req.body.type})
                .then(_ => {res.status(200).send({ message: messages.EFFECT_DELETED })})
                .catch(_ => {res.status(402).send({ message: messages.GENERAL_ERROR})})
            }

        }
    } catch(e){

    }
}

export async function newProject(res: Response<any>, req: Request<any>) {
    try {
        if (req.user){
            const Project = new ProjectModel({
                name: req.body.name, 
                track: defaultProject.track, 
                sequencer: defaultProject.sequencer,
                user: req.user._id
            })
            Project.save()
                .then(p => { res.status(200).json({track: p.track, sequencer: p.sequencer, name: p.name})})
                .catch(e => { res.json({error: e})})
        } else {
            res.json({error: messages.DATA_VALIDATION_ERROR})
        }
    } catch (error) {
        res.status(402).json({error: messages.DATA_VALIDATION_ERROR});
    }
}
