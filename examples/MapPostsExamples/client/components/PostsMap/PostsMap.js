import React, { Component } from 'react';
import ReactDOMServer from 'react-dom/server';
import ReactDOM from 'react-dom';
import { YMaps, Map, Placemark } from 'react-yandex-maps';
import jsxToString from 'jsx-to-string';
import axios from 'axios';
import Post from '../Post/Post';
import PostForm from '../PostForm/PostForm';
import styles from './PostsMap.module.css';
import Modal from '@material-ui/core/Modal';
import DialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography';

export default class PostsMap extends Component {
    constructor(props) {
        super(props);
        this.apikey = `9d4c59f1-72a1-418f-a219-a1734042cd50`;
        this.state = {
            center: [55.771707, 37.678784],
            zoom: 7,
            controls: ['zoomControl', 'fullscreenControl'],
            posts: [],
            postContent: {},
            inPostAddingMode: false,
            isPostOpen: false,
        };
    }

    async componentDidMount() {
        console.log('This method is called twice every time'); // TODO: WHY componentDidMount is called twice? Because of redirect?
        await this.loadPosts();
    }

    async loadPosts() {
        const posts = await axios.get('/api/get-posts');
        this.setState({ posts: posts.data });
    }

    handleMapClick = async ev => {
        ev.preventDefault();
        if (!this.state.inPostAddingMode || !this.props.isAuthorized || !this.ymapsAPI || !this.mapInstance) {
            return;
        }
        this.togglePostAddingMode();
        const coords = ev.get('coords');
        this.mapInstance.balloon.open(coords, ReactDOMServer.renderToString(<PostForm coords={coords} />));
    };

    handleYmapsAPILoaded = ymaps => {
        this.ymapsAPI = ymaps;
        if (this.props.isAuthorized) {
            // Add "add post" button
            const addPostBtn = new ymaps.control.Button({
                data: {
                    content: 'Добавить пост',
                },
                options: {
                    maxWidth: [30, 100, 150],
                    selectOnClick: false,
                },
            });
            addPostBtn.events.add('click', this.togglePostAddingMode);
            this.mapInstance.controls.add(addPostBtn, { float: 'right' });
        }
    };

    togglePostAddingMode = ev => {
        ev?.preventDefault();
        if (!this.state.inPostAddingMode) {
            this.mapInstance.cursors.push('crosshair');
            this.setState({ inPostAddingMode: true });
        } else {
            this.mapInstance.cursors.push('grab');
            this.setState({ inPostAddingMode: false });
        }
    };

    handleMapLoaded = map => {
        this.mapInstance = map;
    };

    handlePlacemarkClick = post => ev => {
        ev.preventDefault();
        this.setState({ isPostOpen: !this.state.isPostOpen, postContent: post });
    };

    handlePostClose = ev => {
        this.setState({ isPostOpen: false });
    };

    render() {
        return (
            <div className={styles.mapContainer}>
                <Modal
                    aria-labelledby="simple-modal-title"
                    aria-describedby="simple-modal-description"
                    open={this.state.isPostOpen}
                    onClose={this.handlePostClose}
                >
                    <DialogContent>
                        <Post post={this.state.postContent} />
                    </DialogContent>
                </Modal>
                <YMaps query={{ apikey: this.apikey, load: 'package.full' }}>
                    <Map
                        onClick={this.handleMapClick}
                        onLoad={this.handleYmapsAPILoaded}
                        instanceRef={this.handleMapLoaded}
                        state={this.state}
                        width="100%"
                        height="100%"
                    >
                        {this.state.posts.map((post, i) => (
                            <Placemark
                                key={post.id}
                                defaultGeometry={[post.latitude, post.longitude]}
                                onClick={this.handlePlacemarkClick(post)}
                            />
                        ))}
                    </Map>
                </YMaps>
            </div>
        );
    }
}
