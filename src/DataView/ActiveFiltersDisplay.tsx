import React from 'react';
import { withStyles, Theme } from '@material-ui/core/styles';
import { AppBar, AppBarProps, Toolbar, Grid, Button, Typography } from '@material-ui/core';
import FilterListIcon from '@material-ui/icons/FilterList';
import ClearIcon from '@material-ui/icons/Clear';
import { IColumnFiltersData, IDataViewColumn } from './declarations';
import { IDataRecord } from '../dataInterfaces';

export interface ActiveFiltersDisplayProps {
    columnFilters: IColumnFiltersData;
    viewColumns: IDataViewColumn<IDataRecord, any>[];
    onClearFilter: () => void;
}

const ActiveFiltersDisplay = (props: ActiveFiltersDisplayProps) => {
    const filterColumns = Object.keys(props.columnFilters);
    const columnNames = filterColumns
        .map(columnId => {
            const column = props.viewColumns.find(x => x.id === columnId);
            return column ? column.id : null;
        })
        .filter(x => x !== null)
        .join(', ');

    return (
        <Grid item sm={12} md={6}>
            <Grid container spacing={2} alignItems="center" justify="flex-start">
                <Grid item>
                    <FilterListIcon color="primary" fontSize="default" />
                </Grid>
                <Grid item>
                    <Typography color="primary" variant="subtitle2" component="span">Filter enabled on {filterColumns.length} columns: {columnNames}</Typography>
                </Grid>
                <Grid item>
                    <Button
                        size="small"
                        variant="text"
                        color="secondary"
                        onClick={props.onClearFilter}
                        startIcon={<ClearIcon />}>Clear filter</Button>
                </Grid>
            </Grid>
        </Grid>
    );
}

export default ActiveFiltersDisplay;