import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Fab from '@material-ui/core/Fab';
import deepPurple from '@material-ui/core/colors/deepPurple';
import card from '@material-ui/core/Card';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@material-ui/core';
import { TextField } from '@material-ui/core';

import { Consumer } from '../../context';

const styles = {
    avatar: {
        margin: 10,
        width: 60,
        height: 60,
        color: '#fff',
        backgroundColor: deepPurple[500],
    },
};

// TODO: Editing functionality is the same on Comment, title, text. It can be HOC

export default class Comment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditorOpen: false,
        };
        this.editFieldRef = React.createRef();
    }

    onEditorClose = isCancelled => {
        if (!isCancelled) {
            const text = this.editFieldRef?.current?.value;
            // TODO: validation and shit
            try {
                Axios.put('/api/update-comment/', {
                    id: this.props.comment.id,
                    text,
                });
            } catch (err) {
                // TODO: validation and shit
                console.error(err);
            }
            this.props.onUpdate();
        }
        this.setState({ isEditorOpen: false });
    };

    onEditClick = ev => {
        ev.preventDefault();
        this.setState({ isEditorOpen: true });
    };

    onDeleteClick = async ev => {
        ev.preventDefault();
        try {
            await Axios.delete('/api/delete-comment', {
                data: {
                    id: this.props.comment.id,
                },
            });
        } catch (err) {
            console.error(err);
        }
        this.props.onUpdate();
    };

    render() {
        return (
            <Consumer>
                {({ user }) => (
                    <ListItem alignItems="flex-start" selected={this.props.selected}>
                        <ListItemAvatar>
                            <Avatar style={styles.avatar} src={this.props.comment.photoUrl}>
                                {this.props.comment.fullName[0]}
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={
                                <>
                                    <Typography
                                        component="span"
                                        color="textPrimary"
                                        variant="subtitle2"
                                        style={{ paddingRight: 10, display: 'inline', cursor: 'pointer' }}
                                        onClick={() => this.props.onAuthorNameClick(this.props.comment)}
                                    >
                                        {this.props.comment.fullName}
                                    </Typography>
                                    <Typography component="span" color="textSecondary" variant="subtitle2" style={{ display: 'inline' }}>
                                        {this.props.comment.timestamp}
                                    </Typography>
                                    {this.props.comment.replyToCommentId ? (
                                        <Typography color="textSecondary" variant="caption" gutterBottom>
                                            <a
                                                onClick={ev => {
                                                    ev.preventDefault();
                                                    this.props.highlightComment(this.props.comment.replyToCommentId);
                                                }}
                                                href=""
                                                style={{ textDecoration: 'none', color: 'inherit' }}
                                            >
                                                Reply to: {this.props.comment.replyToName}
                                            </a>
                                        </Typography>
                                    ) : null}
                                </>
                            }
                            secondary={
                                this.state.isEditorOpen ? (
                                    <>
                                        <TextField
                                            autoFocus
                                            margin="dense"
                                            multiline
                                            fullWidth
                                            defaultValue={this.props.comment.text}
                                            inputRef={this.editFieldRef}
                                        />
                                        <Button onClick={() => this.onEditorClose(false)} color="primary">
                                            OK
                                        </Button>
                                        <Button onClick={() => this.onEditorClose(true)} color="primary">
                                            Cancel
                                        </Button>
                                    </>
                                ) : (
                                    <Typography variant="body1">{this.props.comment.text}</Typography>
                                )
                            }
                            disableTypography
                        />
                        {user?.id === this.props.comment.authorId ? (
                            <ListItemSecondaryAction>
                                <IconButton edge="end" onClick={this.onEditClick}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton edge="end" onClick={this.onDeleteClick}>
                                    <DeleteIcon />
                                </IconButton>
                            </ListItemSecondaryAction>
                        ) : null}
                    </ListItem>
                )}
            </Consumer>
        );
    }
}
