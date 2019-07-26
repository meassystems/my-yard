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
            selectedPostId: null,
            currentPostIdx: 0,
            inPostAddingMode: false,
            isPostOpen: false,
        };
    }

    async componentDidMount() {
        console.log('This method is called twice every time'); // TODO: WHY componentDidMount is called twice? Because of redirect?
        await this.loadPosts();
    }

    componentDidUpdate(prevProps) {
        const { selectedPostId } = this.props;
        if (selectedPostId && prevProps.selectedPostId !== selectedPostId) {
            const selectedPost = this.state.posts.find(p => p.id === selectedPostId);
            const coords = [selectedPost.latitude, selectedPost.longitude];
            this.setState({
                selectedPostId,
                center: coords,
                zoom: 13, // Works if user didnt change zoom manualy
            });
        }
    }

    async loadPosts() {
        const posts = await axios.get('/api/get-post-positions');
        this.setState({ posts: posts.data });
    }

    handleMapClick = async ev => {
        ev.preventDefault();
        if (!this.state.inPostAddingMode || !this.props.isAuthenticated || !this.ymapsAPI || !this.mapInstance) {
            return;
        }
        this.togglePostAddingMode();
        const coords = ev.get('coords');
        this.mapInstance.balloon.open(coords, ReactDOMServer.renderToString(<PostForm coords={coords} />));
    };

    handleYmapsAPILoaded = ymaps => {
        this.ymapsAPI = ymaps;
        if (this.props.isAuthenticated) {
            // Add "add post" button
            const addPostBtn = new ymaps.control.Button({
                data: {
                    content: 'Добавить пост',
                },
                options: {
                    maxWidth: [30, 100, 150],
                    selectOnClick: false,
                    position: {
                        // 'auto' not working
                        right: '10px',
                        top: '100px',
                    },
                },
            });
            addPostBtn.events.add('click', this.togglePostAddingMode);
            this.mapInstance.controls.add(addPostBtn /*, { float: 'right' }*/); // float right not working for reason unclear
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

    handlePlacemarkClick = postIdx => ev => {
        ev.preventDefault();
        this.setState({ isPostOpen: !this.state.isPostOpen, currentPostIdx: postIdx, selectedPostId: null });
    };

    handlePostClose = ev => {
        this.setState({ isPostOpen: false });
    };

    render() {
        return (
            <div className={styles.mapContainer}>
                <Modal open={this.state.isPostOpen} onClose={this.handlePostClose}>
                    {this.state.isPostOpen ? (
                        <Post
                            postId={this.state.posts[this.state.currentPostIdx].id}
                            isAuthenticated={this.props.isAuthenticated}
                            closePost={this.handlePostClose}
                        />
                    ) : null}
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
                        {this.state.posts.map((post, postIdx) => (
                            <Placemark
                                key={post.id}
                                defaultGeometry={[post.latitude, post.longitude]}
                                onClick={this.handlePlacemarkClick(postIdx)}
                                options={{
                                    iconColor: post.id === this.state.selectedPostId ? 'red' : 'blue',
                                }}
                            />
                        ))}
                    </Map>
                </YMaps>
            </div>
        );
    }
}
