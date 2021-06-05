import { indicators } from "../containers/Track/defaults";
import { triggs } from '../context/ToneObjectsContext';
import { Sequencer } from '../store/Sequencer';

export enum messages {
  UNKOWN_USER = "Unknown user",
  CREATED_GOOGLE = "Account linked to google, first create a password in options",
  USER_ALREADY_EXISTS = "Username already exists",
  DATA_VALIDATION_ERROR = "Data validation error",
  USER_DELETED = "User deleted",
  NO_EMAIL_VERIFIED = 'no email verified, and no user id found on account'
}

export function range(size: number, startAt: number = 0): number[] {
    return [...Array(size).keys()].map(i => i + startAt);
};

export function startEndRange(start: number, end: number): number[] {
    return Array(end - start + 1).fill(null).map((_, idx) => start + idx)
}

export function timeObjFromEvent(step: number, event: any, isEvent: boolean = true): any {
    return {
        '16n': step,
        '128n': isEvent && event.offset ? event.offset : event ? event : 0,
    };
}

export function typeMovement(ind: indicators, e: any): number {
    return e.movementY
};

export function getFinalStep(activePage: number, trackLen: number){
  const pageInit = activePage * 16
  const stepAmount = trackLen - pageInit
  return pageInit + Math.min(16, stepAmount) - 1 
}

export function bisect(sortedList: number[], el: number){
    if(!sortedList.length) return 0;
  
    if(sortedList.length == 1) {
      return el > sortedList[0] ? 1 : 0;
    }
  
    let lbound = 0;
    let rbound = sortedList.length - 1;
    return bisect(lbound, rbound);
  
  // note that this function depends on closure over lbound and rbound
  // to work correctly
    function bisect(lb: number, rb: number): number{
      if(rb - lb == 1){
        if(sortedList[lb] < el && sortedList[rb] >= el){
          return lb + 1;
        }
  
        if(sortedList[lb] == el){
          return lb;
        }
      }
  
      if(sortedList[lb] > el){
        return 0;
      }
  
      if(sortedList[rb] < el){
        return sortedList.length
      }
  
      let midPoint = lb + (Math.floor((rb - lb) / 2));
      let midValue = sortedList[midPoint];
  
      if(el <= midValue){
        rbound = midPoint
      }
  
      else if(el > midValue){
        lbound = midPoint
      }
  
      return bisect(lbound, rbound);
    }
}

export const bbsFromSixteenth = (value: number | string): string => {
	return `0:0:${value}`;
};

export const sixteenthFromBBSOG = (time: string): number => {
	return sixteenthFromBBS(time.split('.')[0])
}

export const sixteenthFromBBS = (time: string): number => {
	let result: number = Number();
	const timeArray: number[] = time.split(':').map(v => parseInt(v));

	timeArray.forEach((v, idx, arr) => {
		if (idx === 0) {
			result = result + v * 16;
		} else if (idx === 1) {
			result = result + v * 4;
		} else {
			result = result + v
		}
	});
	return result
}

export function scheduleStartEnd(
  triggs: triggs[],
  start?: any,
  end?: any,
  callbackInstruments?: (...args: any[]) => void,
  instrumentArgs?: any[],
  copy?: boolean,
  callbackEffects?: (...args: any[]) => void,
  effectsArgs?: any[],
  cancel?: boolean,
) {
    for (let i of startEndRange(0, triggs.length-1)){

      triggs[i].instrument.mute = false;

      if (cancel)
        triggs[i].instrument.cancel() 
      if (start || start === 0)
        triggs[i].instrument.start(start) 
      if (end === 'now')
        triggs[i].instrument.stop()
      else if (end || end === 0)
        triggs[i].instrument.stop(end)

      const instArgs = instrumentArgs ? [...instrumentArgs] : [];
      const baseArg = copy && instArgs ? instArgs : [];
      const fxArgs = effectsArgs ? [...effectsArgs] : baseArg;

      callbackInstruments?.(
        start, 
        triggs[i].instrument, 
        ...instArgs
      );

        for (let j of startEndRange(0, triggs[i].effects.length-1)){
          triggs[i].effects[j].mute = false;
          if (cancel)
            triggs[i].effects[j].cancel() 
          if (start || start === 0)
            triggs[i].effects[j].start(start)
          if (end === 'now')
            triggs[i].effects[j].stop()
          else if (end || end === 0)
            triggs[i].effects[j].stop(end)

          callbackEffects?.(
            start, 
            triggs[i].effects[j], 
            ...fxArgs
          );
        }
    }

}

export function extend(from: any, to?: any)
{
    if (from == null || typeof from != "object") return from;
    if (from.constructor != Object && from.constructor != Array) return from;
    if (from.constructor == Date || from.constructor == RegExp || from.constructor == Function ||
        from.constructor == String || from.constructor == Number || from.constructor == Boolean)
        return new from.constructor(from);

    to = to || new from.constructor();

    for (var name in from)
    {
        to[name] = typeof to[name] == "undefined" ? extend(from[name], null) : to[name];
    }

    return to;
}

export function serializeSequencer(sequencer: Sequencer){
  const p: any = extend(sequencer);
  const a: any[] = []
  Object.keys(sequencer.patterns).forEach(pattern => {
    p.patterns[Number(pattern)].patternId = Number(pattern);
    a.push(p.patterns[Number(pattern)])
  })
  p.patterns = a;
  return p
}

export function deserializeSequencer(sequencer: any){
  const seq = extend(sequencer);
  const patObj: any = {};
  sequencer.patterns.forEach((p: any) => {
    patObj[p.patternId] = p
    delete patObj[p.patternId].patternId
  })
  seq.patterns = patObj;
  return recursivelyDeleteId(seq);
}

export function recursivelyDeleteId(obj: any){
  if (!obj)
    return
  const keys = Object.keys(obj);

  if (keys.includes('_id')) {
    delete obj._id
    keys.splice(keys.indexOf('_id'), 1)
  }

  if (keys.length > 0){
    keys.forEach(key => {
      const curr = obj[key]
      recursivelyDeleteId(curr);
    })
  }

  return obj
}

export function clean(obj: any) {
  for (var propName in obj) {
    if (obj[propName] === null || obj[propName] === undefined) {
      delete obj[propName];
    }
  }
  return obj
}