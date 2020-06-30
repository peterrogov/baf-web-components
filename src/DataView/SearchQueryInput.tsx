import React from 'react';
import { Theme } from '@material-ui/core/styles';
import { makeStyles, createStyles } from '@material-ui/styles';
import { Grid } from '@material-ui/core';
import SearchBox from './SearchBox';

const style = (theme: Theme) => createStyles({
    container: {
        [theme.breakpoints.down('md')]: {
            marginTop: theme.spacing(1)
        }
    }
});

const useStyles = makeStyles(style);

export interface SearchQueryInputProps {
    disabled?: boolean;
    onChange?: (query: string) => void;
}

const SearchQueryInput = (props: SearchQueryInputProps) => {
    const classes = useStyles();
    return (
        <Grid item sm={12} md={6}>
            <div className={classes.container}>
                <SearchBox disabled={props.disabled} onSubmit={props.onChange} />
            </div>
        </Grid>
    )
}

export default SearchQueryInput;