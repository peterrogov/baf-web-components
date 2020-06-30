import React, { useState } from 'react';
import { LinearProgress } from '@material-ui/core';
import { DataSourceState } from './declarations';

export interface QueryProgressProps {
    state: DataSourceState;
}

const QueryProgress = (props: QueryProgressProps) =>
    props.state === "idle"
        ? <div style={{ height: 4 }}></div>
        : <LinearProgress color={props.state === "errors" ? "secondary" : "primary"} />

export default QueryProgress;
