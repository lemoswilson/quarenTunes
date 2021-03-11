export default class EventEmitter {
    _events: { [event: string]: ((data: any) => any)[] }
    constructor() {
        this._events = {}
    }
    emit(event: string, data: any) {
        if (!this._events[event]) return;
        this._events[event].forEach(callback => callback(data))
    };
    on(event: string, callback: (data: any) => any) {
        if (!this._events[event]) this._events[event] = [];
        this._events[event].push(callback);
    }
    off(event: string, callback: (data: any) => any) {
        if (!this._events[event]) return;
        const idx = this._events[event].findIndex(registred => {
            return '' + registred == '' + callback;
        })
        this._events[event].splice(idx, 1)
    }
}