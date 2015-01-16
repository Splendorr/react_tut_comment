/**
 * Created by nmauger on 16/01/2015.
 */
var Comment = React.createClass({
  handleClick: function(e){
    e.preventDefault();
    var commentId = this.props.comment.id;
    return this.props.onDelete(commentId);
  },
  render: function () {
    return (
      <div className="comment">
        <h4 className="commentAuthor">
          {this.props.comment.email}
        </h4>
          {this.props.comment.comment}
        <a onClick={this.handleClick}> &times; </a>
      </div>
    );
  }
});

var CommentList = React.createClass({
  handleDelete: function(commentId){
    return this.props.del(commentId);
  },
  render: function () {
    var commentNodes = this.props.comments.map(function (comment, index) {
      return (
        <Comment comment = {comment} onDelete = {this.handleDelete} key = {index} />
      );
    });

    return (
      <div className="commentList">
        {commentNodes}
      </div>
    );
  }
});

var CommentBox = React.createClass({
  getInitialState: function () {
    return {comments: []};
  },
  componentDidMount: function () {
    this.loadCommentsFromServer();
  },
  loadCommentsFromServer: function () {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      success: function (comments) {
        this.setState({comments: comments});
      }.bind(this),
      error: function (xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleCommentSubmit: function(comment) {
    var comments = this.state.comments;
    var newComments = comments.concat([comment]);
    this.setState({comments: newComments});
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: {"comment": comment},
      success: function(data) {
        this.loadCommentsFromServer();
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  delc: function(commentId){
    $.ajax({
      url: this.props.url,
      data: {"id" : commentId},
      type: 'DELETE',
      dataType: 'json',
      success: function (comments) {
        this.setState({comments: comments});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  render: function () {
    return (
      <div className="commentBox">
        <h1>Comments</h1>
        <CommentList del={this.delc} comments={this.state.comments} />
        <CommentForm onCommentSubmit={this.handleCommentSubmit}/>
      </div>
    );
  }
});

var CommentForm = React.createClass({
  handleSubmit: function() {
    var email = this.refs.email.getDOMNode().value.trim();
    var comment = this.refs.comment.getDOMNode().value.trim();
    this.props.onCommentSubmit({email: email, comment: comment});
    this.refs.email.getDOMNode().value = '';
    this.refs.comment.getDOMNode().value = '';
    return false;
  },

  render: function() {
    return (
      <form className="commentForm" onSubmit={this.handleSubmit}>
        <input type="email" placeholder="Your email" ref="email" />
        <input type="text" placeholder="Say something..." ref="comment" />
        <input type="submit" value="Post" />
      </form>
    );
  }
});

var ready = function () {
  React.renderComponent(
    <CommentBox url="18/comments.json" />,
    document.getElementById('art')
  );
};

$(document).ready(ready);

//Yes, or you can do .map(function(comment, index){ ... }.bind(this)) or .map(function(comment, index){ ... }, this)

