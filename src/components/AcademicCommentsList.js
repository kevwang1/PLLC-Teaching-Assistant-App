import React from 'react';
import * as firebase from 'firebase';
import * as FirebaseHelper from '../FirebaseHelper';
import { Feed, Image, Label, Modal, Button } from 'semantic-ui-react';
import moment from 'moment';

import AcademicCommentEditForm from './AcademicCommentEditForm';

class AcademicCommentFeedEvent extends React.Component {
  constructor() {
    super();
    this.state = {
      author: null,
      deleteConfirmationOpen: false
    };
  }

  componentWillMount() {
    this.getAuthorOfCommentFromFirebase();
  }

  deleteComment() {
    firebase
      .database()
      .ref(`comments/academic/${this.props.comment.uid}`)
      .remove();
    this.setState({
      deleteConfirmationOpen: false
    });
  }

  getAuthorOfCommentFromFirebase() {
    const authorId = this.props.comment.createdBy;
    firebase
      .database()
      .ref(`users/${authorId}`)
      .once('value', snapshot => {
        this.setState({
          author: FirebaseHelper.snapshotWithUid(snapshot)
        });
      });
  }

  setAttentionRequiredFalse() {
    const comment = Object.assign({}, this.props.comment);
    comment.attentionRequired = false;
    firebase
      .database()
      .ref(`comments/academic/${this.props.comment.uid}`)
      .set(comment);
  }

  render() {
    if (!this.state.author) {
      return (
        <div></div>
      );
    }

    return (
      <Feed.Event>
        <Feed.Label>
          <Image size='mini' shape='circular' src={this.state.author.photoURL} />
        </Feed.Label>
        <Feed.Content>
          <Feed.Meta>
            {this.props.comment.class}
          </Feed.Meta>
          <Feed.Summary>
            {this.props.comment.category}
            <Feed.Date>
              {moment(this.props.comment.dateCreated).format('MMM Do YYYY')}
            </Feed.Date>
            {this.props.comment.attentionRequired &&
              <Label
                as='a'
                color='grey'
                size='mini'
                tag
                style={{ left: '6px' }}
              >
                Attention Required
              </Label>
            }
          </Feed.Summary>
          {this.props.comment.text &&
            <Feed.Extra text>
              <div dangerouslySetInnerHTML={{ __html: this.props.comment.text }} />
            </Feed.Extra>
          }
          <Feed.Meta>
            Submitted by {this.state.author.displayName}
          </Feed.Meta>
          <br />
          <Feed.Meta>
            {this.props.comment.attentionRequired &&
              <a onClick={this.setAttentionRequiredFalse.bind(this)}>Resolve</a>
            }
            <Modal
              trigger={
                <a onClick={() => this.setState({ deleteConfirmationOpen: true })}>
                  Delete
                </a>
              }
              open={this.state.deleteConfirmationOpen}>
              <Modal.Header>
                Confirm Deletion
              </Modal.Header>
              <Modal.Content>
                Are you sure you wish to delete this comment? This action cannot be reversed.
              </Modal.Content>
              <Modal.Actions>
                <Button negative onClick={() => this.setState({ deleteConfirmationOpen: false })}>
                  No
                </Button>
                <Button onClick={this.deleteComment.bind(this)} positive content='Yes' />
              </Modal.Actions>
            </Modal>
            {this.props.student &&
              <AcademicCommentEditForm
                createdBy={this.props.user}
                student={this.props.student}
                comment={this.props.comment}
              />
            }
          </Feed.Meta>
        </Feed.Content>
      </Feed.Event>

    );
  }
}

class AcademicCommentsList extends React.Component {
  render() {
    return (
      <Feed>
        {this.props.comments.map((comment, index) => (
          <AcademicCommentFeedEvent
            comment={comment}
            key={index}
            user={this.props.user}
            student={this.props.student}
          />
        ))}
      </Feed>
    );
  }
}

export default AcademicCommentsList;