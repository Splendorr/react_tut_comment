/**
 * Created by nmauger on 15/01/2015.
 */

// TODO: have a local version of libraries needed.
var data = [
  {author: "NO DATA", text: "Please fill the comments.json"}
];

var CommentBox = React.createClass({
  getInitialState: function() {
    return {data: data};
  },
  loadCommentFromServer: function() {
    $.ajax({
      url: this.props.url,
      port: 3000,
      dataType: 'json',
      cache: false, // This parameter is mandatory, otherwise, the data will not be refreshed by the poll every 2 sec.
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleCommentSubmit: function(comment) {
    var comments = this.state.data;

    // These 2 lines just to refresh faster: i.e without waiting for server response.
    var newComments = comments.concat([comment]);
    this.setState({data: newComments});

    // submit to the server and refresh the list
    $.ajax({
      url: this.props.url,
      port: 3000,
      dataType: 'json',
      type: 'POST',
      data: comment,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  deleteComment: function(commentId){
    $.ajax({
      url: this.props.url,
      port: 3000,
      data: {"id" : commentId},
      dataType: 'json',
      type: 'DELETE',
      success: function (comments) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  componentDidMount: function() {
    this.loadCommentFromServer();
    setInterval(this.loadCommentFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className="commentBox">
        <h1>Comments</h1>
        <CommentList deleteC = {this.deleteComment} data={this.state.data} />
        <CommentForm onCommentSubmit={this.handleCommentSubmit} />
      </div>
    );
  }
});

var CommentList = React.createClass({
  handleDelete: function(commentId){
    return this.props.deleteC(commentId);
  },
  render: function() {
    // TODO: Problem id = {index} or key = {index} as stated originally ?
    var commentNodes = this.props.data.map(function (comment, index) {
      return (
        <Comment comment = {comment} onDelete = {this.handleDelete} key = {index} />
      );
    }.bind(this));
    return (
      <div className="commentList">
        {commentNodes}
      </div>
    );
  }
});

var CommentForm = React.createClass({
  handleSubmit: function(e) {
    e.preventDefault();
    var author = this.refs.author.getDOMNode().value.trim();
    var text = this.refs.text.getDOMNode().value.trim();
    if (!text || !author) {
      return;
    }
    // send request to the server
    this.props.onCommentSubmit({author: author, text: text});

    this.refs.author.getDOMNode().value = '';
    this.refs.text.getDOMNode().value = '';
    return;
  },
  render: function() {
    return (
      <form className="commentForm" onSubmit={this.handleSubmit}>
        <input type="text" placeholder="Your name" ref="author" />
        <input type="text" placeholder="Say something..." ref="text" />
        <input type="submit" value="Post" />
      </form>
    );
  }
});

//var converter = new Showdown.converter();
var Comment = React.createClass({
  handleClick: function(e){
    e.preventDefault();
    var commentId = this.props.comment.id; // TODO: Why not this.props.key according to commentList (within map function)
    return this.props.onDelete(commentId);
  },
  render: function() {
    //var rawMarkup = converter.makeHtml(this.props.children.toString());
    return (
      <div className="comment">
        <h2 className="commentAuthor">
          {this.props.comment.author}
        </h2>
        {this.props.comment.text}
        <a onClick={this.handleClick}> &times; </a>
      </div>
    );
  }
});

React.render(
  <CommentBox url="comments.json" pollInterval={2000} />,
  document.getElementById('content')
);