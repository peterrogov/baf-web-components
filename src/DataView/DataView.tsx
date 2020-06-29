import React, { Component, Fragment } from 'react';

import { IDataRecord, IDataSourceQueryStatus, IDataConnector } from '../dataInterfaces';

interface Props<TRecord extends IDataRecord> {
    data: TRecord[];
}

function DataView<TRecord extends IDataRecord>(props: Props<TRecord>) {
    return <div>DataView</div>
}

export default DataView;