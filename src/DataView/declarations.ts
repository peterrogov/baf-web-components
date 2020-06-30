import { IDataRecord, IDataConnector } from '../dataInterfaces';
import { IMasterDataRecord } from '../DataSelect';

export interface IColumnFiltersData {
    [key: string]: ColumnFilterEditResult
}

export type FilterRuleString = "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "STARTS_WITH" | "ENDS_WITH";
export type FilterRuleNumber = "EQUALS" | "NOT_EQUALS" | "GTE" | "LTE" | "RANGE";
export type FilterRuleDate = "EQUALS" | "NOT_EQUALS" | "GTE" | "LTE" | "RANGE";
export type FilterRuleReference = "EVERY" | "SOME" | "NONE";
export type FilterRuleEnum = "INCLUDE" | "EXCLUDE";

export interface ColumnFilterEditResult {

    boolean?: {
        value: boolean;
    },

    string?: {
        rule?: FilterRuleString;
        value: string;
    },

    number?: {
        rule?: FilterRuleNumber;
        minValue: number;
        maxValue: number;
    },

    date?: {
        rule?: FilterRuleDate;
        minValue: Date;
        maxValue: Date;
    },

    reference?: {
        rule?: FilterRuleReference;
        value: IDataRecord[];
    },

    select?: {
        rule?: FilterRuleEnum;
        value: string[];
    }
}

export type ColumnDataType = "BOOLEAN" | "INTEGER" | "DECIMAL" | "DATE" | "STRING" | "REFERENCE" | "ENUM";

export interface FilterEditorSelectOption {
    value: string;
    label: string;
}

export interface IDataViewColumn<TRecord extends IDataRecord, TWhereInput> {
    id: string;
    name: string;
    align?: "left" | "right" | "center";
    sortKey?: string;
    render(record: TRecord): React.ReactNode;
    applyReferenceFilter?: (rule: FilterRuleReference, input: IDataRecord[]) => TWhereInput;
    filterKey?: string;
    filterActive?: boolean;
    filterDataType?: ColumnDataType;
    filterSelectOptions?: FilterEditorSelectOption[];
    filterConnector?: IDataConnector<IMasterDataRecord, any, any>;
}

export type DataSourceState = "idle" | "busy" | "errors";
export type DataViewSelectionMode = "none" | "single" | "multiple";
