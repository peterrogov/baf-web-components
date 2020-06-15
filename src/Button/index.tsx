import React from 'react';
import { Button as MuiButton } from '@material-ui/core';
import { ButtonProps as MuiButtonProps } from '@material-ui/core/Button'
import { withStyles, Theme, createStyles, WithStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import { green } from '@material-ui/core/colors';
import { emphasize, fade } from '@material-ui/core/styles/colorManipulator';

const styles = (theme: Theme) => createStyles({
    buttonSuccess: {
        backgroundColor: green[500],
        color: theme.palette.common.white,
        "&:hover, &:focus": {
            backgroundColor: green[700]
        },
        "&:active": {
            boxShadow: theme.shadows[1],
            backgroundColor: emphasize(green[500], 0.12),
        }
    }
});

type BafButtonProps = Omit<MuiButtonProps, "color"> & WithStyles<typeof styles> & {
    color?: 'inherit' | 'primary' | 'secondary' | 'default' | "error" | "success",
    component?: React.ElementType
}

class BafButton extends React.PureComponent<BafButtonProps> {
    render() {
        const { classes, color, className, ...rest } = this.props;
        if (color === undefined || color === "default" || color === "primary" || color === "secondary") {
            return (
                className
                    ? (<MuiButton className={className} color={color as any} {...rest}>{this.props.children}</MuiButton>)
                    : (<MuiButton color={color as any} {...rest}>{this.props.children}</MuiButton>)
            );
        } else if (color === "success") {
            return (<MuiButton className={classNames(className, classes.buttonSuccess)} {...rest}>{this.props.children}</MuiButton>);
        }

        return null;
    }
}


export default withStyles(styles)(BafButton);
