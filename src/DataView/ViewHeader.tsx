import React from 'react';
import { Theme } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/styles';
import { AppBar, AppBarProps, Toolbar, Grid } from '@material-ui/core';

type ViewHeaderProps = Exclude<AppBarProps, "component" | "position" | "color" | "elevation">;

const ViewHeader = (props: ViewHeaderProps) => (
    <AppBar component="div" position="static" elevation={0} {...props}>
        <Toolbar variant="dense">
            <Grid container spacing={1} alignItems="center" justify="space-between">
                {props.children}
            </Grid>
        </Toolbar>
    </AppBar>
);

const styles = (theme: Theme) => ({
    root: {
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        backgroundColor: 'rgba(0, 0, 0, .03)'
    }
});

export default withStyles(styles)(ViewHeader);