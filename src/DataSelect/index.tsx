import React, { useState } from 'react';
import AsyncSelect from 'react-select/async';
import { Styles } from 'react-select';
import { IDataRecord, IDataConnector } from '../dataInterfaces';

export interface IMasterDataRecord extends IDataRecord {
    name: string;
}

interface Props {
    styles?: Partial<Styles>;
    allowMultiSelect?: boolean;
    placeholder?: string;
    value?: IMasterDataRecord[];
    dataConnector: IDataConnector<IMasterDataRecord, any, any>;
    onChange?: (items: IMasterDataRecord[]) => void;
}

const Select = (props: Props) => {
    //const [items, setItems] = useState(0);

    const loadOptions = async (inputValue: string): Promise<any[]> => {
        const val = inputValue.trim();
        if (val.length < 3) {
            return [];
        }

        const result = await props.dataConnector.getPage({
            name_contains: val
        }, undefined, undefined, 100);

        if (result.isSuccessful && result.data && result.data.length) {
            return result.data.map(item => ({ value: item.id, label: item.name, data: item }));
        } else {
            return [];
        }
    }

    const handleChange = (value: any) => {
        if (!props.onChange) {
            return;
        }

        if (Array.isArray(value) && value.length) {
            const data: IMasterDataRecord[] = [];
            for (let x = 0; x < value.length; x++) {
                data.push(value[x].data);
            }
            props.onChange(data);
        } else if (value) {
            props.onChange([value.data]);
        } else {
            props.onChange([]);
        }
    }

    return (
        <AsyncSelect
            placeholder={props.placeholder}
            isClearable={true}
            loadOptions={loadOptions}
            tabSelectsValue={false}
            onChange={handleChange}
            isMulti={props.allowMultiSelect}
            styles={props.styles}
            defaultValue={props.value ? props.value.map(x => ({ value: x.id, label: x.name, data: x })) : undefined}
        />
    );
}

export default Select;