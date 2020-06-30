import React from 'react';
import { Theme } from '@material-ui/core/styles';
import { makeStyles, createStyles } from '@material-ui/styles';
import { IconButton, Tooltip, Grid } from '@material-ui/core';

import RefreshIcon from '@material-ui/icons/Refresh';
import ViewColumnIcon from '@material-ui/icons/ViewColumn';
import FilterListIcon from '@material-ui/icons/FilterList';

export interface ToolbarProps {
    onRefreshClick?: () => void;
    disableSelectColumns?: boolean;
    disableFilter?: boolean;
}

const style = (theme: Theme) => createStyles({
    block: {
        display: 'block',
    },
});

const useStyles = makeStyles(style);

const Toolbar = (props: ToolbarProps) => {
    const classes = useStyles();
    return (
        <Grid item>
            <Tooltip title="Refresh data">
                <IconButton onClick={props.onRefreshClick}>
                    <RefreshIcon className={classes.block} />
                </IconButton>
            </Tooltip>
            {props.disableSelectColumns !== true && (
                <Tooltip title="Select columns">
                    <IconButton>
                        <ViewColumnIcon className={classes.block} />
                    </IconButton>
                </Tooltip>
            )}
            {props.disableFilter !== true && (
                <Tooltip title="Filter">
                    <IconButton>
                        <FilterListIcon className={classes.block} />
                    </IconButton>
                </Tooltip>
            )}
        </Grid>
    );
}

export default Toolbar;