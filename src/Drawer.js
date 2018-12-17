import React, { Component } from "react";
import Rect from "./Rect";

import "./styles.css";

export default class App extends Component {
  state = {
    size: { imageWidth: 0, imageHeight: 0 },
    dragging: false,
    move: [0, 0],
    box: 0
  };

  componentDidMount() {
    window.addEventListener("resize", this.handleWindowResize);
    document.addEventListener("mouseup", this.handleDragEnd);
    document.addEventListener("mousemove", this.handleMouseMove);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleWindowResize);
    document.removeEventListener("mouseup", this.handleDragEnd);
    document.removeEventListener("mousemove", this.handleMouseMove);
  }

  handleMouseDown = (e, index) => {
    // Start drag if it was a left click.
    if (e.button === 0) {
      const id = e.target.id;
      const move = [0, 0];
      if (id.startsWith("0")) {
        move[0] = 0;
      } else {
        move[0] = 1;
      }
      if (id.endsWith("0")) {
        move[1] = 0;
      } else {
        move[1] = 1;
      }
      this.setState({
        dragging: true,
        move: move,
        box: index
      });
    }
  };

  handleMouseMove = e => {
    const { onCoordinatesChanged, bboxes } = this.props;
    const { dragging, move, box, size } = this.state;
    const { x, y, x2, y2 } = bboxes[box];
    const { imageWidth, imageHeight } = size;

    if (!dragging) {
      return;
    }

    const rect = this.cavasRef.getBoundingClientRect();
    const mX = (e.clientX - rect.left) / imageWidth;
    const mY = (e.clientY - rect.top) / imageHeight;

    let newX;
    let newY;
    let newX2;
    let newY2;

    if (move[0] === 0) {
      newX = mX;
      newX2 = x2;
    } else {
      newX = x;
      newX2 = mX;
    }

    if (move[1] === 0) {
      newY = mY;
      newY2 = y2;
    } else {
      newY = y;
      newY2 = mY;
    }

    onCoordinatesChanged(
      {
        x: Math.min(1, Math.max(0, newX)),
        y: Math.min(1, Math.max(0, newY)),
        x2: Math.min(1, Math.max(0, newX2)),
        y2: Math.min(1, Math.max(0, newY2))
      },
      box
    );
  };

  handleDragEnd = e => {
    const { onCoordinatesChanged, bboxes } = this.props;
    const { dragging, box } = this.state;
    const { x, y, x2, y2 } = bboxes[box];

    if (!dragging) {
      return;
    }
    onCoordinatesChanged(
      {
        x: Math.min(x, x2),
        y: Math.min(y, y2),
        x2: Math.max(x, x2),
        y2: Math.max(y, y2)
      },
      box
    );
    this.setState({ dragging: false });
  };

  handleWindowResize = e => {
    this.setState({
      size: {
        imageWidth: this.cavasRef.width,
        imageHeight: this.cavasRef.height
      }
    });
  };

  handleOnImageLoad = e => {
    this.setState({
      size: { imageWidth: e.target.width, imageHeight: e.target.height }
    });
  };

  render() {
    return (
      <div className="Canvas">
        <img
          alt="cats"
          draggable={false}
          src={this.props.image}
          onLoad={this.handleOnImageLoad}
          ref={ref => {
            this.cavasRef = ref;
          }}
          onDragStart={e => {
            e.preventDefault();
          }}
        />
        {this.props.bboxes.map((bbox, i) => (
          <Rect
            key={i}
            index={i}
            bbox={bbox}
            onCornerGrabbed={this.handleMouseDown}
            imageSize={this.state.size}
          />
        ))}
      </div>
    );
  }
}
