<template>
  <div class="maintenancePlanAdd">
    <div class="child-panel-title">
      <h2>图形标注DEMO</h2>
    </div>
    <div class="panel-body">
      <div class="demo">
        <canvas
          id="canvas"
          width="1280"
          height="720"
          >
        </canvas>
        <div class="draw-btn-group">
          <div :class="{active:drawType=='arrow'}" @click="drawTypeChange('arrow')">
            <i class="draw-icon icon-1"></i>
          </div>
          <div :class="{active:drawType=='text'}" @click="drawTypeChange('text')">
            <i class="draw-icon icon-2"></i>
          </div>
          <div :class="{active:drawType=='ellipse'}" @click="drawTypeChange('ellipse')">
            <i class="draw-icon icon-3"></i>
          </div>
          <div :class="{active:drawType=='rectangle'}" @click="drawTypeChange('rectangle')">
            <i class="draw-icon icon-4"></i>
          </div>
          <div
            :class="{active:drawType=='rectangle-text'}"
            @click="drawTypeChange('rectangle-text')"
          >
            <i class="draw-icon icon-5"></i>
          </div>
          <div :class="{active:drawType=='polygon'}" @click="drawPolygon">
            <i class="draw-icon icon-6"></i>
          </div>
          <div :class="{active:drawType=='pen'}" @click="drawTypeChange('pen')">
            <i class="draw-icon icon-7"></i>
          </div>

          <div @click="deleteObj">
            <i class="draw-icon icon-del"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "App",
  data() {
    return {
      rect: [],
      canvas: {},
      showMenu:false,
      x:'',
      y:'',

      mouseFrom: {},
      mouseTo: {},
      drawType: null,
      canvasObjectIndex: 0,
      textbox: null,
      rectangleLabel: "warning",
      drawWidth: 1, //笔触宽度
      color: "#E34F51", //画笔颜色
      drawingObject: null, //当前绘制对象
      moveCount: 1, //绘制移动计数器
      doDrawing: false, // 绘制状态

      //polygon 相关参数
      polygonMode: false,
      pointArray: [],
      lineArray: [],
      activeShape: false,
      activeLine: "",
      line: {}
    };
  },
  watch:{
    drawType(){
      this.canvas.selection = !this.drawType
    }
  },
  methods: {
    drawTypeChange(e) {
      this.drawType = e;
      if(e=='pen'){
        this.canvas.isDrawingMode = true;
      }else{
        this.canvas.isDrawingMode = false;
      }
    },
    mousedown(e) {
      var xy = this.transformMouse(e.e.offsetX, e.e.offsetY);
      this.mouseFrom.x = xy.x;
      this.mouseFrom.y = xy.y;
      this.doDrawing = true;
      if (this.drawType == "text") {
        this.drawing();
      }
      if (this.drawType == "rectangle-text") {
        this.textbox = new fabric.Textbox("", {
          left: this.mouseFrom.x,
          top: this.mouseFrom.y - 17,
          // width: 150,
          fontSize: 15,
          hasBorders: false,
          padding: 5,
          borderColor: this.color,
          fill: this.color,
          hasControls: false,
          textboxBorderColor: this.color,
          showTextBoxBorder: true,
          text: this.rectangleLabel
        });
        this.canvas.add(this.textbox);
      }
      if (this.drawType == "polygon") {
        try {
          if (e.target && e.target.id == this.pointArray[0].id) {
            this.generatePolygon();
          }
          if (this.polygonMode) {
            this.addPoint(e);
          }
        } catch (error) {
          console.log(error);
        }
      }
    },
    mouseup(e) {
      var xy = this.transformMouse(e.e.offsetX, e.e.offsetY);
      this.mouseTo.x = xy.x;
      this.mouseTo.y = xy.y;
      // drawing();
      this.drawingObject = null;
      this.moveCount = 1;
      if (this.drawType != "polygon") {
        this.doDrawing = false;
        this.drawType = null;
      }
    },
    mousemove(e) {
      if (this.moveCount % 2 && !this.doDrawing) {
        //减少绘制频率
        return;
      }
      this.moveCount++;
      var xy = this.transformMouse(e.e.offsetX, e.e.offsetY);
      this.mouseTo.x = xy.x;
      this.mouseTo.y = xy.y;
      if (this.drawType != "text" || this.drawType != "polygon") {
        this.drawing();
      }
      if (this.drawType == "polygon") {
        if (this.activeLine && this.activeLine.class == "line") {
          var pointer = this.canvas.getPointer(e.e);
          this.activeLine.set({ x2: pointer.x, y2: pointer.y });

          var points = this.activeShape.get("points");
          points[this.pointArray.length] = {
            x: pointer.x,
            y: pointer.y
          };
          this.activeShape.set({
            points: points
          });
          this.canvas.renderAll();
        }
        this.canvas.renderAll();
      }
    },
    deleteObj() {
      this.canvas.getActiveObjects().map(item => {
        this.canvas.remove(item);
      });
    },
    transformMouse(mouseX, mouseY) {
      return { x: mouseX / 1, y: mouseY / 1 };
    },
    drawPolygon() {
      this.drawType = "polygon";
      this.polygonMode = true;
      this.pointArray = new Array();
      this.lineArray = new Array();
      this.canvas.isDrawingMode = false;
    },
    addPoint(e) {
      var random = Math.floor(Math.random() * 10000);
      var id = new Date().getTime() + random;
      var circle = new fabric.Circle({
        radius: 5,
        fill: "#ffffff",
        stroke: "#333333",
        strokeWidth: 0.5,
        left: e.e.layerX / this.canvas.getZoom(),
        top: e.e.layerY / this.canvas.getZoom(),
        selectable: false,
        hasBorders: false,
        hasControls: false,
        originX: "center",
        originY: "center",
        id: id,
        objectCaching: false
      });
      if (this.pointArray.length == 0) {
        circle.set({
          fill: "red"
        });
      }
      var points = [
        e.e.layerX / this.canvas.getZoom(),
        e.e.layerY / this.canvas.getZoom(),
        e.e.layerX / this.canvas.getZoom(),
        e.e.layerY / this.canvas.getZoom()
      ];

      this.line = new fabric.Line(points, {
        strokeWidth: 2,
        fill: "#999999",
        stroke: "#999999",
        class: "line",
        originX: "center",
        originY: "center",
        selectable: false,
        hasBorders: false,
        hasControls: false,
        evented: false,
        objectCaching: false
      });
      if (this.activeShape) {
        var pos = this.canvas.getPointer(e.e);
        var points = this.activeShape.get("points");
        points.push({
          x: pos.x,
          y: pos.y
        });
        var polygon = new fabric.Polygon(points, {
          stroke: "#333333",
          strokeWidth: 1,
          fill: "#cccccc",
          opacity: 0.3,
          selectable: false,
          hasBorders: false,
          hasControls: false,
          evented: false,
          objectCaching: false
        });
        this.canvas.remove(this.activeShape);
        this.canvas.add(polygon);
        this.activeShape = polygon;
        this.canvas.renderAll();
      } else {
        var polyPoint = [
          {
            x: e.e.layerX / this.canvas.getZoom(),
            y: e.e.layerY / this.canvas.getZoom()
          }
        ];
        var polygon = new fabric.Polygon(polyPoint, {
          stroke: "#333333",
          strokeWidth: 1,
          fill: "#cccccc",
          opacity: 0.3,
          selectable: false,
          hasBorders: false,
          hasControls: false,
          evented: false,
          objectCaching: false
        });
        this.activeShape = polygon;
        this.canvas.add(polygon);
      }
      this.activeLine = this.line;

      this.pointArray.push(circle);
      this.lineArray.push(this.line);
      this.canvas.add(this.line);
      this.canvas.add(circle);
    },
    //绘制箭头方法
    drawArrow(fromX, fromY, toX, toY, theta, headlen) {
      theta = typeof theta != "undefined" ? theta : 30;
      headlen = typeof theta != "undefined" ? headlen : 6;
      var angle = (Math.atan2(fromY - toY, fromX - toX) * 180) / Math.PI,
        angle1 = ((angle + theta) * Math.PI) / 180,
        angle2 = ((angle - theta) * Math.PI) / 180,
        topX = headlen * Math.cos(angle1),
        topY = headlen * Math.sin(angle1),
        botX = headlen * Math.cos(angle2),
        botY = headlen * Math.sin(angle2);
      var arrowX = fromX - topX,
        arrowY = fromY - topY;
      var path = " M " + fromX + " " + fromY;
      path += " L " + toX + " " + toY;
      arrowX = toX + topX;
      arrowY = toY + topY;
      path += " M " + arrowX + " " + arrowY;
      path += " L " + toX + " " + toY;
      arrowX = toX + botX;
      arrowY = toY + botY;
      path += " L " + arrowX + " " + arrowY;
      return path;
    },
    generatePolygon() {
      var points = new Array();
      this.pointArray.map((point, index) => {
        points.push({
          x: point.left,
          y: point.top
        });
        this.canvas.remove(point);
      });
      this.lineArray.map((line, index) => {
        this.canvas.remove(line);
      });
      this.canvas.remove(this.activeShape).remove(this.activeLine);
      var polygon = new fabric.Polygon(points, {
        stroke: this.color,
        strokeWidth: this.drawWidth,
        fill: "rgba(255, 255, 255, 0)",
        opacity: 1,
        hasBorders: true,
        hasControls: false
      });
      this.canvas.add(polygon);

      this.activeLine = null;
      this.activeShape = null;
      this.polygonMode = false;
      this.doDrawing = false;
      this.drawType = null;
    },
    drawing() {
      if (this.drawingObject) {
        this.canvas.remove(this.drawingObject);
      }
      var canvasObject = null;
      var left = this.mouseFrom.x,
        top = this.mouseFrom.y,
        mouseFrom = this.mouseFrom,
        mouseTo = this.mouseTo;
      switch (this.drawType) {
        case "arrow": //箭头
          var x1 = mouseFrom.x,x2= mouseTo.x,y1 = mouseFrom.y,y2= mouseTo.y;
          var w = (x2-x1),h = (y2-y1),sh = Math.cos(Math.PI/4)*16
          var sin = h/Math.sqrt(Math.pow(w,2)+Math.pow(h,2))   
          var cos = w/Math.sqrt(Math.pow(w,2)+Math.pow(h,2)) 
          var w1 =((16*sin)/4),h1 = ((16*cos)/4),centerx=sh*cos,centery=sh*sin
          /**
           * centerx,centery 表示起始点，终点连线与箭头尖端等边三角形交点相对x，y
           * w1 ，h1用于确定四个点
          */ 
          var path = " M " + x1 + " " + (y1);
            path += " L " + (x2-centerx+w1) + " " + (y2-centery-h1);
            path += " L " + (x2-centerx+w1*2) + " " + (y2-centery-h1*2);
            path += " L " + (x2) + " " + y2;
            path += " L " + (x2-centerx-w1*2) + " " + (y2-centery+h1*2);
            path += " L " + (x2-centerx-w1) + " " + (y2-centery+h1);
            path += " Z";
          canvasObject = new fabric.Path(
            path,
            {
              stroke: this.color,
              fill: this.color,
              strokeWidth: this.drawWidth
            }
          );
          break;
        case "ellipse": //椭圆
          var radius =
            Math.sqrt(
              (mouseTo.x - left) * (mouseTo.x - left) +
                (mouseTo.y - top) * (mouseTo.y - top)
            ) / 2;
          canvasObject = new fabric.Ellipse({
            left: (mouseTo.x - left) / 2 + left,
            top: (mouseTo.y - top) / 2 + top,
            stroke: this.color,
            fill: "rgba(255, 255, 255, 0)",
            originX: "center",
            originY: "center",
            rx: Math.abs(left - mouseTo.x) / 2,
            ry: Math.abs(top - mouseTo.y) / 2,
            strokeWidth: this.drawWidth
          });
          break;
        case "rectangle": //长方形
          var path =
            "M " +
            mouseFrom.x +
            " " +
            mouseFrom.y +
            " L " +
            mouseTo.x +
            " " +
            mouseFrom.y +
            " L " +
            mouseTo.x +
            " " +
            mouseTo.y +
            " L " +
            mouseFrom.x +
            " " +
            mouseTo.y +
            " L " +
            mouseFrom.x +
            " " +
            mouseFrom.y +
            " z";
          canvasObject = new fabric.Path(path, {
            left: left,
            top: top,
            stroke: this.color,
            strokeWidth: this.drawWidth,
            fill: "rgba(255, 255, 255, 0)",
            hasControls: false
          });
          //也可以使用fabric.Rect
          break;
        case "rectangle-text": //长方形带标注框
          var path =
            "M " +
            mouseFrom.x +
            " " +
            mouseFrom.y +
            " L " +
            mouseTo.x +
            " " +
            mouseFrom.y +
            " L " +
            mouseTo.x +
            " " +
            mouseTo.y +
            " L " +
            mouseFrom.x +
            " " +
            mouseTo.y +
            " L " +
            mouseFrom.x +
            " " +
            mouseFrom.y +
            " z";
          canvasObject = new fabric.Path(path, {
            left: left,
            top: top,
            stroke: this.color,
            strokeWidth: this.drawWidth,
            fill: "rgba(255, 255, 255, 0)",
            hasControls: false
          });
          // this.textbox.enterEditing();
          // this.textbox.hiddenTextarea.focus();
          //也可以使用fabric.Rect
          break;
        case "text": //文本框
          this.textbox = new fabric.Textbox("", {
            left: mouseFrom.x,
            top: mouseFrom.y - 10,
            // width: 150,
            fontSize: 16,
            borderColor: this.color,
            fill: this.color,
            hasControls: false
          });
          this.canvas.add(this.textbox);
          this.textbox.enterEditing();
          this.textbox.hiddenTextarea.focus();
          break;

        default:
          break;
      }
      
      if (canvasObject) {
        // canvasObject.index = getCanvasObjectIndex();\
        this.canvas.add(canvasObject); //.setActiveObject(canvasObject)
        this.drawingObject = canvasObject;
      }
    },
  },
  mounted() {
    this.canvas = new fabric.Canvas("canvas", {
      // skipTargetFind: true,
      // selectable: false,
      // selection: false
    });
    this.canvas.selectionColor = 'rgba(0,0,0,0.05)' 
    this.canvas.on("mouse:down", this.mousedown);
    this.canvas.on("mouse:move", this.mousemove);
    this.canvas.on("mouse:up", this.mouseup);

    document.onkeydown = e=> {
      console.log(e)
      let key = window.event.keyCode;
      if(e.keyCode==46||e.keyCode==8){
        this.deleteObj()
      }
      if(e.keyCode==90&&e.ctrlKey){
        this.canvas.remove(this.canvas.getObjects()[this.canvas.getObjects().length-1]);
      }
    };

    // var originalRender = fabric.Textbox.prototype._render;
    // fabric.Textbox.prototype._render = function(ctx) {
    //   originalRender.call(this, ctx);
    //   //Don't draw border if it is active(selected/ editing mode)
    //   if (this.active) return;
    //   if(this.showTextBoxBorder){
    //     var w = this.width,
    //       h = this.height,
    //       x = -this.width / 2,
    //       y = -this.height / 2;
    //     ctx.beginPath();
    //     ctx.moveTo(x, y);
    //     ctx.lineTo(x + w, y);
    //     ctx.lineTo(x + w, y + h);
    //     ctx.lineTo(x, y + h);
    //     ctx.lineTo(x, y);
    //     ctx.closePath();
    //     var stroke = ctx.strokeStyle;
    //     ctx.strokeStyle = this.textboxBorderColor;
    //     ctx.stroke();
    //     ctx.strokeStyle = stroke;
    //   }
    // }
    // fabric.Textbox.prototype.cacheProperties = fabric.Textbox.prototype.cacheProperties.concat('active');
  }
};
</script>

<style lang="scss" scoped>
.el-container {
  flex-direction: column;
}
.demo {
  display: flex;
  flex-direction: column;
  align-items: center;
}
canvas {
  border: 1px dashed black;
}
.draw-btn-group {
  width: 1270px;
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  & > div {
    background: #fafafa;
    cursor: pointer;
    &:hover {
      background: #eee;
    }
    i {
      display: flex;
      background-repeat: no-repeat;
      background-size: 80%;
      background-position: 50% 50%;
      height: 30px;
      width: 30px;
    }
    .icon-1 {
      background-image: url("./assets/icons/draw/1.png");
    }
    .icon-2 {
      background-image: url("./assets/icons/draw/2.png");
    }
    .icon-3 {
      background-image: url("./assets/icons/draw/3.png");
    }
    .icon-4 {
      background-image: url("./assets/icons/draw/4.png");
    }
    .icon-5 {
      background-image: url("./assets/icons/draw/5.png");
      background-size: 75%;
    }
    .icon-6 {
      background-image: url("./assets/icons/draw/6.png");
    }
    .icon-7 {
      background-image: url("./assets/icons/draw/7.png");
      background-size: 90%;
    }
    .icon-del {
      background-image: url("./assets/icons/draw/del.png");
      background-size: 90%;
    }
  }
  .active {
    background: #eee;
  }
}
</style>
