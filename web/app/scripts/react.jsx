'use strict';

var React       = require('react');
var ReactDOM    = require('react-dom');
var ClassNames  = require('classnames');

var tmp = React.createClass({
	render() {
        /*var dynamicClass = ClassNames({ [this.state.type] : true });
		return (
			<div className={dynamicClass}>
				{this.props.messgae} 
			</div>
		);*/
        console.log(this.state, this.props, "react log");
        return (<div>test</div>);
	}
});

var Message = React.createClass({
        render: function() {
            console.log(this.state, this.props, "react log");
            return (
                React.createElement('div', {className: "commentBox"},
                "Hello, world! I am a CommentBox."
            )
        );
    }
});

/*ReactDOM.render(
    React.createElement(Message, $('#result').val()), document.getElementById('message')
);*/
