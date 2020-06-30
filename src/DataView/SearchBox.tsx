import React from 'react';
import { withStyles, Theme, createStyles, WithStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import Tooltip from '@material-ui/core/Tooltip';

import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';
import SendIcon from '@material-ui/icons/Send';

const styles = (theme: Theme) => createStyles({
    searchInput: {
        fontSize: theme.typography.fontSize,
        backgroundColor: '#ffffff',
        padding: theme.spacing(0, 1),
        borderRadius: 0
    },
    
    block: {
        display: 'block',
    },
    searchControl: {
        marginBottom: 0,
        border: '1px solid rgba(0, 0, 0, 0.12)'
    }
});

interface SearchBoxProps extends WithStyles<typeof styles> {
    placeholder?: string
    disabled?: boolean,
    searchText?: string,
    onSubmit?(searchText: string): void
}

interface SearchBoxState {
    searchText: string,
    hasChanges: boolean
}

class SearchBox extends React.Component<SearchBoxProps, SearchBoxState> {
    constructor(props: SearchBoxProps) {
        super(props);
        this.state = {
            searchText: this.props.searchText || '',
            hasChanges: false
        };
    }

    handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({searchText: event.target.value, hasChanges: true});
    }

    handleClear = () => {
        this.setState({searchText: ''}, () => {
            this.submitSearch();
        });
    }

    handleSubmitClick = () => {
        this.submitSearch();
    }

    handleKeyDownEvent = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if(13 === event.keyCode && (this.state.searchText.length > 0 || this.state.hasChanges) && !this.props.disabled) {
            this.submitSearch();
        }
    }

    submitSearch = () => {
        this.setState({hasChanges: false}, () => {
            if(this.props.onSubmit){
                this.props.onSubmit(this.state.searchText);
            }
        });
    }

    render() {
        const { classes } = this.props;
        return (
            <FormControl fullWidth className={classes.searchControl}>
                <Input
                    type="text"
                    placeholder={this.props.placeholder || "Enter search term..."}
                    disableUnderline
                    className={classes.searchInput}
                    disabled={this.props.disabled}
                    value={this.state.searchText}
                    onChange={this.handleChange}
                    onKeyDown={this.handleKeyDownEvent}
                    startAdornment={
                        <InputAdornment position="start">
                            <SearchIcon color="disabled" className={classes.block} />
                        </InputAdornment>
                    }
                    endAdornment={
                        <InputAdornment position="end">
                            {this.state.searchText.length > 0 &&(
                            <Tooltip title="Clear">
                                <div>
                                    <IconButton onClick={this.handleClear}>
                                        <ClearIcon fontSize="small" className={classes.block} color="inherit" />
                                    </IconButton>
                                </div>
                            </Tooltip>
                            )}
                            <Tooltip title="Submit search">
                                <div>
                                    <IconButton onClick={this.handleSubmitClick} disabled={this.props.disabled || (this.state.searchText.length === 0 && false === this.state.hasChanges)}>
                                        <SendIcon fontSize="small" className={classes.block} color="inherit" />
                                    </IconButton>
                                </div>
                            </Tooltip>
                        </InputAdornment>
                    }
                />
            </FormControl>
        );
    }
}

export default withStyles(styles)(SearchBox);