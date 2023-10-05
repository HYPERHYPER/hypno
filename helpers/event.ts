import _ from "lodash";

export const isCustomGallery = (custom_gallery_assigned: string) => {
    // custom_gallery_assigned = '0' | '1' | null
    // 1 -> true
    // 0 -> false
    return custom_gallery_assigned == '1';
}

interface FieldItem {
    name: string;
    type: string;
    required: boolean;
    label?: string; // for checkbox text
    index?: number;
}

export function convertFieldArrayToObject(array: Array<FieldItem>): any {
    const result: any = {};
    _.forEach(array, (item, i) => {
        const { name, ...rest } = item;
        let id = rest.type == 'checkbox' ? 'opt-in-'+i : `${(name || rest.type).replaceAll(' ', '-').toLowerCase()}-${i}`; // unique name
        let required = _.includes(rest.type, '-') && !_.includes(rest.type, 'checkbox') ? true : rest.required; // always require on age validation
        result[id] = { 
            name: name || rest.type, 
            required, 
            index: i,
            label: rest.label, 
            type: rest.type,
        };
    })
    return result;
}

export function convertFieldObjectToArray(obj: any): Array<FieldItem> {
    const result = [];
    for (const name in obj) {
        if (obj.hasOwnProperty(name)) {
            const item = { id: name, ...obj[name] };
            result.push(item);
        }
    }

    // Sort the result array by the index field
    result.sort((a, b) => a.index - b.index);

    return result;
}

export const blendModes = [
    { name: 'normal', value: 'kCGBlendModeNormal' },
    { name: 'multiply', value: 'kCGBlendModeMultiply'},
    { name: 'screen', value: 'kCGBlendModeScreen' },
    { name: 'overlay', value: 'kCGBlendModeOverlay' },
    { name: 'darken', value: 'kCGBlendModeDarken' },
    { name: 'lighten', value: 'kCGBlendModeLighten' },
    { name: 'color dodge', value: 'kCGBlendModeColorDodge' },
    { name: 'color burn', value: 'kCGBlendModeColorBurn' },
    { name: 'soft light', value: 'kCGBlendModeSoftLight' },
    { name: 'hard light', value: 'kCGBlendModeHardLight' },
    { name: 'difference', value: 'kCGBlendModeDifference' },
    { name: 'excursion', value: 'kCGBlendModeExclusion' },
    { name: 'hue', value: 'kCGBlendModeHue' },
    { name: 'saturation', value: 'kCGBlendModeSaturation' },
    { name: 'color', value: 'kCGBlendModeColor' },
    { name: 'luminosity', value: 'kCGBlendModeLuminosity' },
    // { name: 'clear', value: 'kCGBlendModeClear' },
    // { name: 'copy', value: 'kCGBlendModeCopy' },
    // { name: 'source in', value: 'kCGBlendModeSourceIn' },
    // { name: 'source out', value: 'kCGBlendModeSourceOut' },
    // { name: 'source atop', value: 'kCGBlendModeSourceAtop' },
    // { name: 'destination over', value: 'kCGBlendModeDestinationOver' },
    // { name: 'destination in', value: 'kCGBlendModeDestinationIn' },
    // { name: 'destination out', value: 'kCGBlendModeDestinationOut' },
    // { name: 'destination atop', value: 'kCGBlendModeDestinationAtop' },
    // { name: 'xor', value: 'kCGBlendModeXOR' },
    // { name: 'plus darker', value: 'kCGBlendModePlusDarker' },
    // { name: 'plus lighter', value: 'kCGBlendModePlusLighter' },
]