import React from 'react';
import { Theme } from '@material-ui/core/styles';
import { withStyles, createStyles } from '@material-ui/styles';
import { CheckboxProps, Checkbox } from '@material-ui/core';

const RowCheckbox = withStyles((theme: Theme) => createStyles({
    root: {
        color: theme.palette.primary.main,
        '&$checked': {
            color: theme.palette.primary.main,
        },
    },
    checked: {},
}))((props: CheckboxProps) => <Checkbox color="default" {...props} />);

export default RowCheckbox;