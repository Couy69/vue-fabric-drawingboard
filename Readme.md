大家经常会遇到需要前端来做图形标注或者类似画板的一些需求，但是我在github上也没有找到可用的库，于是决定自己实现一个，选型方面，直接基于canvas的api的话，调用太复杂，所以决定使用Fabric.js，Fabric.js是一个可以简化Canvas程序编写的库，下面说一下我的实现。
## Fabric.js安装
--- 
这里我是基于vue来使用的，先安装上Fabric.js
``` sh
 npm install fabric 
```
在main.js中
``` sh
import fabric from 'fabric'
Vue.use(fabric);
```
## 项目预览
可以[点击这里](http://couy.xyz/fabricDrawingBoard)直接在线预览：下面是预览图，大概功能和微信，qq之类的截图类似。
![ezgif.com-optimize.gif](https://upload-images.jianshu.io/upload_images/14226327-d4d8e787ec2a1fad.gif?imageMogr2/auto-orient/strip)
## 基础功能
基础功能可以通过点击下面的按钮，支持选中后按delete删除或者ctrl+z撤销上一步操作
 - 拖拽
 - 箭头
 - 文字
 - 圆 （按住shift画圆，否则是椭圆）
 - 矩形 （按住shift画正方形，否则是椭圆）
 - 带文字描述的矩形(删掉了)
 - 多边形
 - 画笔
 - 五角星
 - 图片上传
 - 加载背景图
 - 保存并下载
## 实现
Fabric.js提供了很详细的canvas操作api，这个画面也全部基于Fabric.js来实现，这里我稍微说一下遇到的坑
#### 箭头
箭头的话，是通过绘制路径Path来实现，Fabric.js中的Path包括一系列的命令，这基本上模仿一个笔从一个点到另一个。在“移动”，“线”，“曲线”，或“弧”等命令的帮助下，路径可以形成令人难以置信的复杂形状。同组的路径（路径组的帮助），开放更多的可能性，基本的为：
“M” 代表 “move” 命令, 告诉笔到 0, 0 点
“L” 代表 “line” 画一条0, 0 到 200, 100 的线
'Z' 代表闭合路径
这里的箭头就是通过一些简单的计算来描绘路径，实现箭头,mouseFrom表示鼠标起始点，mouseTo表示鼠标终点
``` js
let x1 = mouseFrom.x,x2= mouseTo.x,y1 = mouseFrom.y,y2= mouseTo.y;
let w = (x2-x1),h = (y2-y1),sh = Math.cos(Math.PI/4)*16
let sin = h/Math.sqrt(Math.pow(w,2)+Math.pow(h,2))   
let cos = w/Math.sqrt(Math.pow(w,2)+Math.pow(h,2)) 
let w1 =((16*sin)/4),h1 = ((16*cos)/4),centerx=sh*cos,centery=sh*sin
/**
 * centerx,centery 表示起始点，终点连线与箭头尖端等边三角形交点相对x，y
 * w1 ，h1用于确定四个点
*/ 
let path = " M " + x1 + " " + (y1);
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
this.canvas.add(canvasObject);
```
#### 手动绘制多边形
这个在Fabric.js官网上本来是有一个demo的，但是不知为何单单这个demo页面404，其余demo都在，没办法，只能自己写一个,代码太多我就补贴上来了，我说一下实现思路（伪代码）
- 点击第一个点时，在canvas上绘制一个小圆点，作为初始点
- 点击第二下的时候，使用new fabric.Line方法绘制一条线
- 点击第三下时，根据这三个点使用new fabric.Polygon方法绘制多边形
- 当点击最开始那个小圆点的时候，重新绘制最终的多边形，否处重复第三步
#### 事件绑定
使用Fabric.js，需要将事件绑定到canvas对象上时，需要使用Fabric.js提供的api
``` js
  this.canvas.on("mouse:down", this.mousedown);
  this.canvas.on("mouse:move", this.mousemove);
  this.canvas.on("mouse:up", this.mouseup);
```
而不能直接在canvas上监听事件，因为可以看到canvas上还有一层canvas
![Snipaste_2020-04-01_11-01-12.png](https://upload-images.jianshu.io/upload_images/14226327-bed298a9d5447a2f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
