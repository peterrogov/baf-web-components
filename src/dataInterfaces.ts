import { ReactNode } from 'react';

type RecordID = number | string;

export interface IDataRecord {
    id: RecordID;
}

export interface IDataSourceQueryStatus {
    isError?: boolean;
    code?: string;
    message?: string;
}

export interface IDataSourceResult<TRecord> {
    data: TRecord[];
    isError: boolean;
}

export interface IDataSetColumn<TRecord extends IDataRecord> {
    id: string;
    name: string;
    align?: "left" | "right" | "center";
    sortKey?: string;
    render(record: TRecord): ReactNode;
}

export type TStatusCallback = (status: IDataSourceQueryStatus, progress?: number) => void;

export interface IQueryError {
    code?: string;
    message?: string;
}

export interface QueryResult {
    isSuccessful: boolean;
};

export interface ICountResult extends QueryResult {
    count: number;
    errors: IQueryError[];
};

export interface IFetchResult<TRecord> extends QueryResult {
    data: TRecord[];
    //total: number;
    errors: IQueryError[];
};


export interface IDataConnector<TRecord extends IDataRecord, TFilter, TOrderBy> {
    makeFilter(filter?: TFilter, searchQuery?: string): TFilter | null;
    count(filter?: TFilter, statusCallback?: TStatusCallback): Promise<ICountResult>;
    getPage(filter?: TFilter, orderBy?: TOrderBy, pageNumber?: number, pageSize?: number, resolveFields?: string, statusCallback?: TStatusCallback): Promise<IFetchResult<TRecord>>;
    //getMany(filter?: TFilter, orderBy?: TOrderBy, resolveFields?: string, skip?: number, limit?: number, statusCallback?: TStatusCallback): Promise<GetManyRecordsResult<TRecord>>;
    //fetchMany(shouldContinue: () => boolean, filter?: TFilter, orderBy?: TOrderBy, resolveFields?: string, chunkSise?: number, statusCallback?: TStatusCallback): Promise<GetManyRecordsResult<TRecord>>;
    //getSingle(recordId: number, resolveFields?: string, statusCallback?: TStatusCallback): Promise<SingleRecordResult<TRecord>>;    
}