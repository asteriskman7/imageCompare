"use strict";

class App {
  constructor() {
    this.canvas = document.getElementById('cmain');
    this.ctx = this.canvas.getContext('2d');
    this.cresult = document.getElementById('cresult');
    this.ctxr = this.cresult.getContext('2d');
    this.img = document.getElementById('pastedImage');
    this.il = document.getElementById('il');
    this.ir = document.getElementById('ir');
    this.iy = document.getElementById('iy');
    this.running = false;
    this.mousec = {x: 0, y: 0};
    this.mouser = {x: 0, y: 0};
    this.mouseInC = false;
    this.mouseInR = false;

    this.canvas.onmouseenter = e => this.mouseenterc();
    this.canvas.onmouseleave = e => this.mouseleavec();
    this.cresult.onmouseenter = e => this.mouseenterr();
    this.cresult.onmouseleave = e => this.mouseleaver();
    this.canvas.onmousedown = e => this.mousedown(e);
    this.canvas.onmousemove = e => this.mousemovec(e);
    this.cresult.onmousemove = e => this.mousemover(e);
    this.il.onchange = () => this.ilchange();
    this.ir.onchange = () => this.irchange();
    this.iy.onchange = () => this.iychange();
    document.getElementById('boptimize').onclick = () => this.optimize();

    document.getElementById('pasteArea').onpaste = (e) => this.onpaste(e);
  }

  onpaste(event) {
    //from http://jsfiddle.net/bt7BU/225/
    // use event.originalEvent.clipboard for newer chrome versions
    var items = (event.clipboardData  || event.originalEvent.clipboardData).items;
    //console.log(JSON.stringify(items)); // will give you the mime types
    // find pasted image among pasted items
    var blob = null;
    for (var i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") === 0) {
        blob = items[i].getAsFile();
      }
    }
    // load image if there is a pasted image
    if (blob !== null) {
      var reader = new FileReader();
      reader.onload = function(event) {
        //console.log(event.target.result); // data url!
        document.getElementById("pastedImage").src = event.target.result;
        setTimeout(app.startCompare, 10);
      };
      reader.readAsDataURL(blob);
    }
  }

  startCompare() {
    app.canvas.width = app.img.width;
    app.canvas.height = app.img.height;
    app.cresult.width = app.img.width / 2;
    app.cresult.height = app.img.height
    app.pleft = 0;
    app.il.value = app.pleft;
    app.pright = app.img.width / 2;
    app.ir.value = app.pright;
    app.py = 0;
    app.iy.value = app.py;
    if (!app.running) {
      setInterval(() => app.tick(), 1000 / 10); 
      app.running = true;
    }
    app.updateCmpImgs();
  }

  tick() {
    this.update();
    this.draw();
  }

  update() {
  }

  draw() {
    const ctx = this.ctx;
    const ctxr = this.ctxr;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    //draw image
    ctx.drawImage(this.img, 0, 0);

    //draw left and right markers
    ctx.strokeStyle = 'yellow';
    ctx.beginPath();
    ctx.moveTo(this.pleft, 0);
    ctx.lineTo(this.pleft, this.canvas.height);
    ctx.stroke();

    ctx.strokeStyle = 'green';
    ctx.beginPath();
    ctx.moveTo(this.pright, 0);
    ctx.lineTo(this.pright, this.canvas.height);
    ctx.stroke();

    //draw comparison
    ctxr.save();
    ctxr.drawImage(this.img, 0, 0);
    ctxr.globalCompositeOperation = 'difference';
    ctxr.drawImage(this.img, this.pleft - this.pright, this.py);
    ctxr.restore();
    ctxr.clearRect(this.pright, 0, this.canvas.width, this.canvas.height);

    //draw comparison point on both parts of reference image
    if (this.mouseInR) {
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.beginPath();
      ctx.arc(this.mouser.x, this.mouser.y, 5, 0, 2 * Math.PI);
      ctx.moveTo(this.mouser.x + (this.pright - this.pleft) + 5, this.mouser.y - this.py);
      ctx.arc(this.mouser.x + (this.pright - this.pleft), this.mouser.y - this.py, 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }

    //draw reference point on comparison image
    if (this.mouseInC) {
      ctxr.fillStyle = 'white';
      ctxr.strokeStyle = 'black';
      ctxr.beginPath();
      ctxr.arc(this.mousec.x, this.mousec.y, 5, 0, 2 * Math.PI);
      ctxr.moveTo(this.mousec.x - (this.pright - this.pleft) + 5, this.mousec.y + this.py);
      ctxr.arc(this.mousec.x - (this.pright - this.pleft), this.mousec.y + this.py, 5, 0, 2 * Math.PI);
      ctxr.fill();
      ctxr.stroke();
    }


  }

  mousedown(e) {
    const rect = e.target.getBoundingClientRect();
    if (e.button === 0) {
      this.pleft = e.clientX - rect.left;
      this.il.value = this.pleft;
    } else {
      this.pright = e.clientX - rect.left;
      this.ir.value = this.pright;
    }
    this.updateCmpImgs();
  }

  ilchange() {
    this.pleft = parseInt(this.il.value);
    this.updateCmpImgs();
  }

  irchange() {
    this.pright = parseInt(this.ir.value);
    this.updateCmpImgs();
  }

  iychange() {
    this.py = parseInt(this.iy.value);
    this.updateCmpImgs();
  }

  mousemovec(e) {
    const rect = e.target.getBoundingClientRect();
    this.mousec.x = e.clientX - rect.left;
    this.mousec.y = e.clientY - rect.top;
  }

  mousemover(e) {
    const rect = e.target.getBoundingClientRect();
    this.mouser.x = e.clientX - rect.left;
    this.mouser.y = e.clientY - rect.top;
  }

  mouseenterc() { this.mouseInC = true; }
  mouseleavec() { this.mouseInC = false; }
  mouseenterr() { this.mouseInR = true; }
  mouseleaver() { this.mouseInR = false; }

  scoreOffset(imageData, left, right, y) {

    //compare pixels and return score for how much the overlap matches
    const cwidth = this.canvas.width;
    const baseLeftx = 0;
    const baseRightx = baseLeftx + right - left;
    const width = cwidth - right + left;
    const baseLefty = y < 0 ? 0 : y;
    const baseRighty = y < 0 ? -y : 0;
    const height = this.canvas.height - Math.abs(y);

    let totalDiff = 0;
    const maxStep = 32;
    let checkedPixelCount = 0;
    for (let dx = 0; dx < width; dx += 1 + Math.floor(Math.random() * maxStep)) {
      const xl = baseLeftx + dx;
      const xr = baseRightx + dx;
      for (let dy = 0; dy < height; dy += 1 + Math.floor(Math.random() * maxStep)) {
        const yl = baseLefty + dy;
        const yr = baseRighty + dy;
        const il = (xl + yl * cwidth) * 4;
        const ir = (xr + yr * cwidth) * 4;
        const rl = imageData[il + 0];
        const gl = imageData[il + 1];
        const bl = imageData[il + 2];
        const rr = imageData[ir + 0];
        const gr = imageData[ir + 1];
        const br = imageData[ir + 2];
        const diff = Math.abs(rl - rr) + Math.abs(gl - gr) + Math.abs(bl - br);
        totalDiff += diff;
        checkedPixelCount++;
      }
    }
    return totalDiff / checkedPixelCount;

  }

  optimize() {

    let bestValue = Infinity;
    let bestPos;
    const left = this.pleft;

    const canvas = document.getElementById('cscore');
    const ctx = canvas.getContext('2d');
    canvas.width = this.canvas.width;
    canvas.height = this.canvas.height;
    ctx.drawImage(this.img, 0, 0);

    const imageData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).data;
    const range = 16;
    for (let dr = -range; dr <= range; dr++) {
      const right = this.pright + dr;
      for (let dy = -range; dy <= range; dy++) {
        const y = this.py + dy;
        const score = this.scoreOffset(imageData, left, right, y);
        let best = false;
        if (score < bestValue) {
          best = true;
          bestValue = score;
          bestPos = {left, right, y};
        }
      }
    }
    console.log(bestValue);

    this.pright = bestPos.right;
    this.ir.value = bestPos.right;
    this.py = bestPos.y;
    this.iy.value = bestPos.y;

    this.updateCmpImgs();
    
  }

  updateCmpImgs() {
    const tmpc = document.createElement('canvas');
    tmpc.width = this.canvas.width;
    tmpc.height = this.canvas.height;
    const imgl = document.getElementById('imgl');
    const imgr = document.getElementById('imgr');

    imgl.src = this.img.src;
    const ctx = tmpc.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.drawImage(this.img, this.pleft - this.pright, this.py);
    imgr.src = tmpc.toDataURL();

    //https://image-compare-viewer.netlify.app/
    const wrapper = document.getElementById('image-compare');
    const options = {
      controlShadow: true,
      addCircle: true,
      addCircleBlur: false,
      controlShadow: true,
      smoothing: true,
      smoothingAmount: 50
    };
    this.viewer = new ImageCompare(wrapper, options).mount();

    const targetWidth = this.img.width / 2;
    const targetHeight = this.img.height;

    wrapper.style.width = `${targetWidth}px`;
    wrapper.style.height = `${targetHeight}px`;
    imgl.style.width = `${targetWidth}px`;
    imgl.style.height = `${targetHeight}px`;
    imgl.style.objectFit = 'cover';
    imgl.style.objectPosition = 'left';
    imgr.style.width = `${targetWidth}px`;
    imgr.style.height = `${targetHeight}px`;
    imgr.style.objectFit = 'cover';
    imgr.style.objectPosition = 'left';

  }
}

const app = new App();
