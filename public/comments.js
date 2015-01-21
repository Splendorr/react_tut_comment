/**
 * Created by nmauger on 15/01/2015.
 */

// TODO: have a local version of libraries needed
// TODO: Serialize data to the disk (Node Server)
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
      type: 'POST',
      dataType: 'json',
      data: comment,
      success: function(comments) {
        this.setState({data: comments});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  deleteComment: function(commentIndex){
    var comments = this.state.data;

    // These 2 lines just to refresh faster: i.e without waiting for server response.
    var newComments = comments.splice(commentIndex, 1);
    this.setState({data: newComments});

    $.ajax({
      url: this.props.url,
      port: 3000,
      type: 'DELETE',
      dataType: 'json',
      data: {"index" : commentIndex},
      success: function (comments) {
        this.setState({data: comments});
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
        <CommentList deleteElement = {this.deleteComment} data={this.state.data} />
        <CommentForm onCommentSubmit={this.handleCommentSubmit} />
      </div>
    );
  }
});

var CommentList = React.createClass({
  handleDelete: function(commentIndex){
    return this.props.deleteElement(commentIndex);
  },
  render: function() {
    var commentNodes = this.props.data.map(function (comment, index) {
      return (
        <Comment comment = {comment} onDelete = {this.handleDelete} index = {index} key = {index} />
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
    this.refs.author.getDOMNode().focus();

    return;
  },
  render: function() {
    return (
      <form className="commentForm" onSubmit={this.handleSubmit}>
        <input type="text" placeholder="Your name" ref="author"/>
        <input type="text" placeholder="Say something..." ref="text" />
        <input type="submit" value="Post" />
      </form>
    );
  }
});

var converter = new Showdown.converter();
var Comment = React.createClass({
  handleClick: function(e){
    e.preventDefault();
    var commentIndex = this.props.index;
    return this.props.onDelete(commentIndex);
  },
  render: function() {
    var rawMarkup = converter.makeHtml(this.props.comment.text.toString());
    return (
      <div className="comment">
        <a onClick={this.handleClick}>[x]</a>
        <h3 className="commentAuthor">
          {this.props.comment.author}
        </h3>
        <span dangerouslySetInnerHTML={{__html: rawMarkup}} />

      </div>
    );
  }
});

React.render(
  <CommentBox url="comments.json" pollInterval={2000} />,
  document.getElementById('content')
);