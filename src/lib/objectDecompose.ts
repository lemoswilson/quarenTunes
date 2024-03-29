const isObject = (val: any) => typeof val === 'object' && !Array.isArray(val);

const addDelimiter = (a: string, b: string) => a ? `${a}.${b}` : b;

export function propertiesToArray(obj: any): string[] {
    const paths = (obj: any, head: string = ''): string[] => {
        return Object.entries(obj)
            .reduce((product: any, [key, value]) => {
                let fullPath = addDelimiter(head, key)
                return isObject(value) ?
                    product.concat(paths(value, fullPath))
                    : product.concat(fullPath)
            }, []);
    }

    return paths(obj);
};

export function deleteProperty(obj: any, property: string): void {
    const fields: string[] = property.split('.');
    let cur = obj,
        last = fields.pop();

    fields.forEach((field, idx, arr) => {
        if (!cur[field]) return
        cur = cur[field]
    });

    if (last && cur[last])
        delete cur[last]
}

export function setNestedArray(obj: any, property: string, val: any): any {
    if (typeof obj !== 'object') return
    const fields = property.split('.');

    let cur = obj,
        last = fields.pop();

    fields.forEach((field) => {
        if (!cur[field]) {
            cur[field] = {};
        }
        cur = cur[field];
    });

    if (last) cur[last][0] = val;

    return obj;
}

export function setNestedValue(accessment: string, val: any, obj: any = {}): any {
    if (typeof obj !== 'object') return
    const fields = accessment.split('.');

    let cur = obj,
        last = fields.pop();

    fields.forEach((field: string) => {
        if (!cur[field]) {
            cur[field] = {};
        }
        cur = cur[field];
    });
    if (last) cur[last] = val;

    return obj;
}

export function getNested(obj: any, property: string): any {
    if (typeof obj !== 'object') return
    const fields = property.split('.');

    let cur = obj,
        last = fields.pop();

    if (fields.length >= 1) {
        fields.forEach((field: string) => {
            if (cur[field]) cur = cur[field];
            else return false
        });
    }

    if (last) return cur[last];
    else return undefined;

}

export function copyToNew(obj: any, property: string): any {
    return setNestedValue(property, getNested(obj, property));

}

export function copyPropertyFromTo(from: any, to: any, property: string){
    setNestedValue(property, getNested(from, property), to);
}

export function onlyValues(obj: any, temp: any = {}): any {
    if (typeof obj !== 'object') return

    let entries = Object.entries(obj);
    entries.forEach(([key, value]: [string, any]) => {
        if (Array.isArray(value) || typeof value !== 'object') {
            temp[key] = Array.isArray(value) ? value[0] : value;
        } else {
            temp[key] = {};
            onlyValues(obj[key], temp[key]);
        }
    })

    return temp
};