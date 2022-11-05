const assets = [
  "assets/01.png",
  "assets/02.png",
  "assets/03.png",
  "assets/04.png",
  "assets/05.png",
  "assets/06.png",
  "assets/07.png",
  "assets/08.png",
  "assets/09.png",
  "assets/010.png",
  "assets/011.png",
  "assets/012.png",
  "assets/013.png",
  "assets/014.png",
  "assets/015.png",
  "assets/016.png",
  "assets/017.png",
  "assets/018.png",
  "assets/019.png"
 ];

class Collider {
  constructor(type, x, y) {
    this._type = type;
    this.x = x;
    this.y = y;
  }
  
  get type() { return this._type; }
}

class RectangleCollider extends Collider {
  constructor(x, y, width, height) {
    super('rectangle', x, y);
    this.width = width;
    this.height = height;
  }
  
  
  // 位置の平行移動。
  // ローカル空間からグローバル空間への変換に使う。
  translate(dx, dy) {
    return new RectangleCollider(this.x + dx, this.y + dy, this.width, this.height);
  }
  
  // 各種getter。
  // なくてもいいが、あったほうが楽。
  get top() { return this.y; }
  get bottom() { return this.y + this.height; }
  get left() { return this.x; }
  get right() { return this.x + this.width; }
}

class Actor {
  constructor(option = {collider: null}) {
    this.x = 0;
    this.y = 0;
    this._collider = option.collider;
  }
  update(info) {}
  render(context) { }
  hit(other) {}
  
  get collider() { return this._collider; }

  get globalCollider() {
    return this._collider.translate(this.x, this.y)
  }
}

class RectangleActor extends Actor {
  constructor(x, y, texture) {
    
    const collider = new RectangleCollider(0, 0, 60, 60);
    super({collider});
    
    this.texture = new PIXI.Texture.from(texture);
    this.sprite = new PIXI.Sprite(this.texture);
    this.sprite.alpha = 1;
    
    this.x = x;
    this.y = y;
    this.sprite.x = this.x;
    this.sprite.y = this.y;

    this.count = 0;
        
    // 移動速度。ランダム。
    this._vx = Math.random() * 10 - 5;
    this._vy = Math.random() * 10 - 5;
    
  }
  
  // 更新メソッド。
  update(worldWidth,worldHeight) {
    this.sprite.alpha = 1;
    // 速度分だけ移動する。
    this.sprite.x += this._vx;
    this.sprite.y += this._vy;

    this.x = this.sprite.x;
    this.y = this.sprite.y;
    
    // 画面から外れたら、速度を反転する。
    if(this.sprite.x < 0 || this.sprite.x > worldWidth-60) {
      this._vx = -this._vx;
    }
    
    if(this.sprite.y < 0 || this.sprite.y > worldHeight-60) {
      this._vy = -this._vy;
    }
  }
  
  // 衝突メソッド
  hit(other) {
    this.sprite.alpha = 0.5;

    this.count += 1;
    this._vx = -this._vx;
    this._vy = -this._vy;   
    if(this.count < assets.length){
        this.sprite.texture = PIXI.Texture.from(assets[this.count]);
    }else{
      this.count = 0;
    }

  }

  reflect(){

  }

}

// 当たり判定の検出器。
class CollisionDetector {
  detectCollision(actor1, actor2) {
    const c1 = actor1.globalCollider;
    const c2 = actor2.globalCollider;
    
    if(c1.type == 'rectangle' && c2.type=='rectangle') {
      return this.detectRectangleCollision(c1, c2);
    }
    
    return false;
  }
  
  detectRectangleCollision(rect1, rect2) {
    const horizontal = (rect2.left < rect1.right) && (rect1.left < rect2.right);
    const vertical = (rect2.top < rect1.bottom) && (rect1.top < rect2.bottom);

    return (horizontal && vertical);
  }
}


window.addEventListener('load',init);

let canvas;
let app;

function init(){
  canvas = document.getElementById('myCanvas');

   app = new PIXI.Application({ 
    view: canvas,
    width: window.innerWidth,
    height: window.innerHeight,
    resolution: window.devicePixelRatio,
    autoDensity: true,
    antialias: true,
    backgroundColor: 0xFFF000
  });
   document.body.appendChild(app.view);
   
   window.addEventListener('resize',() => {
    handleResize(app);
   });

   let _detector = new CollisionDetector();

   let emojiList = [];

   app.loader.add(assets).load(() => {
      for(let i = 0; i < 50; i++){
        const x = getRandom(120,app.renderer.screen.width-120)
        const y = getRandom(120,app.renderer.screen.height-120)
        const rect = new RectangleActor(x, y, assets[0]);
        emojiList.push(rect);
        app.stage.addChild(emojiList[i].sprite);
      }
      app.ticker.add(animate);
  });

  function _hitTest(_actors,_detector){
    const length = _actors.length;
    for(let i=0; i<length-1; i++) {
        for(let j=i+1; j<length; j++) {
            const a1 = _actors[i];
            const a2 = _actors[j];
            const hit = _detector.detectCollision(a1, a2)  
            if(hit) {
                a1.hit(a2);
                a2.hit(a1);
              a1.sprite.x += 5;
              a2.sprite.x -= 5;
              a1.sprite.y += 5;
              a2.sprite.y -= 5;
            }
        }
    }
}

   function animate() {
    emojiList.forEach((a) => {
        a.update(
          app.renderer.screen.width,
          app.renderer.screen.height
        );
    });
    _hitTest(emojiList,_detector);
    
   }

}

function handleResize(app) {
  app.renderer.resize(window.innerWidth, window.innerHeight);
}

function getRandom(min, max) {
  return Math.random() * (max - min) + min; //The maximum is exclusive and the minimum is inclusive
}