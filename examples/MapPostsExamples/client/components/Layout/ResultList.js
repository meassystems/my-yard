import React, { Component } from 'react';
import { makeStyles, useTheme, withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import {
    List,
    ListItem,
    ListSubheader,
    ListItemText,
    ExpansionPanel,
    ExpansionPanelSummary,
    ExpansionPanelDetails,
    ExpansionPanelActions,
    Select,
    MenuItem,
} from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import { Card, CardContent, CardHeader } from '@material-ui/core';
import { Grid } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const useStyles = theme => ({
    searchResultsCard: {
        cursor: 'pointer',
    },
    resultListSubheader: {
        background: theme.palette.background.default,
    },
});

class ResultList extends Component {
    state = {
        selectedPostId: null,
        sortingOptions: {
            by: 'none',
            direction: 'desc',
        },
    };

    componentWillUnmount() {
        this.props.onSearchResultClick(null);
    }

    onSelectChange = selectName => ev => {
        this.setState({
            sortingOptions: {
                ...this.state.sortingOptions,
                [selectName]: ev.target.value,
            },
        });
    };

    render() {
        const { classes, searchResults } = this.props;

        return (
            <>
                <Grid item>{this.sortingOptions}</Grid>
                <Grid item>
                    <List style={{ width: '100%' }}>
                        <ListSubheader className={classes.resultListSubheader}>
                            <Typography variant="h6" gutterBottom>
                                Results:
                            </Typography>
                            <Divider />
                        </ListSubheader>
                        {searchResults.map(item => (
                            <ListItem key={item.postId}>
                                <ListItemText>
                                    <Card
                                        className={classes.searchResultsCard}
                                        raised={item.postId === this.state.selectedPostId}
                                        onClick={() => {
                                            this.setState(
                                                {
                                                    selectedPostId: item.postId,
                                                },
                                                () => this.props.onSearchResultClick(item.postId)
                                            );
                                        }}
                                    >
                                        <CardHeader title={item.title} />
                                        <CardContent>
                                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                                {item.description}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </ListItemText>
                            </ListItem>
                        ))}
                    </List>
                </Grid>
            </>
        );
    }

    get sortingOptions() {
        return (
            <ExpansionPanel>
                <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>Options</ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <Grid container direction="column">
                        <Grid item>
                            <Divider />
                        </Grid>
                        <Grid item container spacing={2}>
                            <Grid item xs={3}>
                                <Typography>Sort by</Typography>
                            </Grid>
                            <Grid item xs={9} container direction="column" alignItems="flex-end">
                                <Grid item>
                                    <Select value={this.state.sortingOptions.by} onChange={this.onSelectChange('by')}>
                                        <MenuItem value="none">None</MenuItem>
                                        <MenuItem value="distance">Distance</MenuItem>
                                        <MenuItem value="subcount">Subscribers number</MenuItem>
                                        <MenuItem value="timebefore">Time before event</MenuItem>
                                    </Select>
                                </Grid>
                                <Grid item>
                                    <Select value={this.state.sortingOptions.direction} onChange={this.onSelectChange('direction')}>
                                        <MenuItem value="asc">Ascending</MenuItem>
                                        <MenuItem value="desc">Descending</MenuItem>
                                    </Select>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item>
                            <Divider />
                        </Grid>
                    </Grid>
                </ExpansionPanelDetails>
            </ExpansionPanel>
        );
    }
}

export default withStyles(useStyles)(ResultList);
