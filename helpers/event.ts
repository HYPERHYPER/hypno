import { EventMicrosite } from "@/types/event";
import _ from "lodash";

export const isCustomGallery = (custom_frontend: EventMicrosite) => {
    const { logo_image, primary_color, home_background_image, enable_legal, data_capture } = custom_frontend;
    const customGalleryConfig = {
        logo_image, home_background_image, enable_legal, data_capture
    }

    console.log(primary_color != '#00FF99')
    return _.some(customGalleryConfig, _.identity) || primary_color != '#00FF99';
}

interface FieldItem {
    name: string;
    type: string;
    required: boolean;
}
interface FieldObject {
    [key: string]: {
        type: string;
        required: boolean;
    };
}
export function convertFieldArrayToObject(array: Array<string>): FieldObject {
    const result: FieldObject = {};

    _.forEach(array, (item, i) => {
        // TODO once update data capture form
        // const { name, ...rest } = item;
        // result[name] = rest;
        result[item] = { required: false, type: 'text' }
    })

    return result;
}

export function convertFieldObjectToArray(obj: FieldObject): Array<FieldItem> {
    const result = [];

    for (const name in obj) {
        if (obj.hasOwnProperty(name)) {
            const item = { name, ...obj[name] };
            result.push(item);
        }
    }

    return result;
}