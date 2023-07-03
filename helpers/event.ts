import { EventMicrosite } from "@/types/event";
import _ from "lodash";

export const isCustomGallery = (custom_frontend: EventMicrosite) => {
    const { logo_image, primary_color, home_background_image, enable_legal, data_capture } = custom_frontend;
    const customGalleryConfig = {
        logo_image, home_background_image, enable_legal, data_capture
    }

    return _.some(customGalleryConfig, _.identity) || primary_color != '#00FF99';
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
        let id = rest.type == 'checkbox' ? 'opt-in-'+i : `${(name || rest.type).replaceAll(' ', '-')}-${i}`; // unique name
        let required = _.includes(rest.type, '-') && !_.includes(rest.type, 'checkbox') ? true : rest.required; // always require on age validation
        result[id] = { ...rest, name: name || rest.type, required, index: i };
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