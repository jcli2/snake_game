/**
 * Created by cheng on 2018/8/10.
 */

//构建并初始化食物
(function () {

    //每次初始化保存食物对象
    var foodelement=[];

    function removefood() {
        foodelement.length>0 && foodelement[0].parentNode.removeChild(foodelement[0]);
        foodelement = [];
    };

    //食物是一个对象,先写一个食物的构造函数
    function Food(width, height, bgcolor) {

        //宽
        this.width = width;
        //高
        this.height = height;
        //背景颜色
        this.bgColor = bgcolor;
        //x坐标初始化
        this.x = 0;
        //y坐标初始化
        this.y = 0;
    }

    //初始化
    Food.prototype.init = function (map) {
        //初始化之前删除,原有的食物
        removefood();

        if (!map) {
            alert("请传入地图!");
        }
        //保存地图
        this.map = map;

        //获取地图的宽和高,并取整
        var map_w = parseInt(this.map.offsetWidth);
        var map_h = parseInt(this.map.offsetHeight);

        //判断食物要小于地图的宽, map_w > 3 * food_w
        //判断食物要小于地图的高, map_h > 3 * food_h

        var flag = (this.width * 3 > map_w) && (this.height * 3 > map_h);
        if (flag) {
            alert("食物太大,容器太小,请重新设置!");
            return false;
        }

        //计算出x轴,y轴分别最多排列多少个食物
        var x_len = {min: 0, max: map_w / this.width};
        var y_len = {min: 0, max: map_h / this.height};

        //调用原型方法获取随机坐标
        this.getpostion(x_len, y_len);

    };

    //产生随机坐标
    Food.prototype.getpostion = function (x_len, y_len) {

        //创建一个div元素,作为随机食物
        var div = document.createElement("div");
        div.style.width = this.width + "px";
        div.style.height = this.height + "px";
        div.style.position = "absolute";
        div.style.backgroundColor = this.bgColor;

        var x = Math.floor((Math.random() + x_len.min) * (x_len.max - x_len.min)) * this.width;
        var y = Math.floor((Math.random() + y_len.min) * (y_len.max - y_len.min)) * this.height;
        console.warn(x, y);
        this.x = x;
        this.y = y;
        div.style.left = this.x + "px";
        div.style.top = this.y + "px";

        foodelement.push(div);

        this.map.appendChild(div);

    };

    window.Food = Food;
}());

//构建并初始化小蛇
(function () {

    var that;
    var elements = [];
    //蛇也是一个对象
    function Snake(width, height, direction) {
        that = this;
        this.width = width || 20;
        this.height = height || 20;
        this.direction = direction || "right";
        this.snakebody = [
            {x: 3, y: 2, color: "red"},    // 0
            {x: 2, y: 2, color: "orange"}, // 1
            {x: 1, y: 2, color: "orange"}  // 2
        ];
    };

    //删除小蛇的私有方法 , 先从尾巴删除
    function removesnake() {
        for (var i = elements.length - 1; i >= 0; i--) {
            elements[i].parentNode.removeChild(elements[i]);
            elements.splice(i, 1);
        }
    }

    //初始化蛇
    Snake.prototype.init = function (map, food) {
        removesnake();
        this.map = map;
        this.food = food;
        //创建小蛇,因脱离文档流,所以没有先后顺序问题,是按照坐标排序的
        for (var i = 0; i < this.snakebody.length; i++) {
            var oSnake = document.createElement("div");
            oSnake.style.position = "absolute";
            oSnake.style.width = this.width + "px";
            oSnake.style.height = this.height + "px";
            oSnake.style.background = this.snakebody[i].color;
            oSnake.style.left = this.snakebody[i].x * this.width + "px";
            oSnake.style.top = this.snakebody[i].y * this.height + "px";
            map.appendChild(oSnake);
            elements.push(oSnake);
        }
        elements[0].classList.add("she_tou");
    };


    Snake.prototype.move = function (map, food) {
        //改变小蛇身体部分
        for (var j = this.snakebody.length - 1; j > 0; j--) {
            this.snakebody[j].x = this.snakebody[j - 1].x;
            this.snakebody[j].y = this.snakebody[j - 1].y;
        }
        //判断方向
        switch (this.direction) {
            case "right":
                this.snakebody[0].x += 1;
                break;
            case "left":
                this.snakebody[0].x -= 1;
                break;
            case "top":
                this.snakebody[0].y -= 1;
                break;
            case "bottom":
                this.snakebody[0].y += 1;
                break;
        }
        var map_w = map.offsetWidth; //800
        var map_h = map.offsetHeight;//600

        var max_l = this.snakebody[0].x * this.width;
        var max_t = this.snakebody[0].y * this.height;

        var flag = (max_l < 0 || max_l > map_w - this.width) || (max_t < 0 || max_t > map_h - this.height);
        if (flag) {
            clearInterval(this.otimer);
            alert("Game Over!");
        }

        //console.log(food.x,food.y);
        console.log();

        if (food.x == max_l && food.y == max_t) {
            this.eatfood();
        }

        this.bindkeys();

    };

    Snake.prototype.eatfood = function () {
        //加长小蛇的身体
        //重新调用 food.init()生成新的食物

        console.log(this.snakebody);

        this.snakebody.push(
            {x: this.snakebody[this.snakebody.length-1].x, y: this.snakebody[this.snakebody.length-1].y, color: "orange"}
        );

        this.food.init(this.map);

    };

    //给document绑定事件,并且改变this的指向
    Snake.prototype.bindkeys = function () {
        document.addEventListener("keydown", function (e) {
            e = e || window.event;
            switch (e.keyCode) {
                case 37:
                    this.direction = "left";
                    break;
                case 38:
                    this.direction = "top";
                    break;
                case 39:
                    this.direction = "right";
                    break;
                case 40:
                    this.direction = "bottom";
                    break;
                default:
                    this.pause();

            }
        }.bind(that));
    };

    //开始玩游戏
    Snake.prototype.play = function () {
        var that = this;
        this.otimer = setInterval(function () {
            that.move(that.map, that.food);
            that.init(that.map, that.food);
        }, 150);
    };

    //游戏结束后,重新开始游戏
    Snake.prototype.restart = function () {
        clearInterval(this.otimer);
        this.otimer = null;
        this.direction = "right";
        this.snakebody = [
            {x: 3, y: 2, color: "red"},    // 0
            {x: 2, y: 2, color: "orange"}, // 1
            {x: 1, y: 2, color: "orange"}  // 2
        ];
        this.play(this.map, this.food);
    };

    //暂停游戏
    Snake.prototype.pause = function () {
        if (this.otimer) {
            clearInterval(this.otimer);
            this.otimer = null;
        } else {
            this.play(this.map, this.food);
        }
    };

    window.Snake = Snake;
}());

//构建按钮并初始化
(function () {
    function Gamebtn(width, height, bgcolor) {
        this.width = width || 80;
        this.height = height || "auto";
        this.bgcolor = bgcolor || "orange";
    };

    //初始化按钮
    Gamebtn.prototype.init = function (map, snake) {
        this.map = map;

        var btncontainer = document.createElement("div");
        btncontainer.classList.add("btn_container");
        btncontainer.style.position = "absolute";
        btncontainer.style.backgroundColor = "rgb(0, 0, 0,0.2)";
        btncontainer.style.left = "60px";
        btncontainer.style.right = "60px";
        btncontainer.style.bottom = "-80px";
        btncontainer.style.height = "60px";
        btncontainer.style.display = "flex";
        btncontainer.style.justifyContent = "space-around";
        btncontainer.style.alignItems = "center";
        btncontainer.style.borderRadius = "3px";
        btncontainer.style.fontSize = "14px";

        var btnobj = [
            {class: "btn_start", bgcolor: "orange", color: "#fff", text: "开始游戏"},
            {class: "btn_pause", bgcolor: "orange", color: "#fff", text: "暂停游戏"},
            {class: "btn_restart", bgcolor: "orange", color: "#fff", text: "重新开始"}
        ];

        this.btnelearr = [];

        for (var i = 0; i < btnobj.length; i++) {
            var oSpan = document.createElement("span");
            oSpan.classList.add(btnobj[i].class);
            oSpan.style.backgroundColor = btnobj[i].bgcolor;
            oSpan.style.color = btnobj[i].color;
            oSpan.style.width = this.width + "px";
            oSpan.style.height = this.height + "px";
            oSpan.style.lineHeight = this.height + "px";
            oSpan.style.textAlign = "center";
            oSpan.style.display = "inline-block";
            oSpan.style.cursor = "pointer";
            oSpan.style.borderRadius = "20px";
            oSpan.innerHTML = btnobj[i].text;
            this.btnelearr.push(oSpan);
            btncontainer.appendChild(oSpan);
        }

        this.map.appendChild(btncontainer);

        this.addevent(this.btnelearr, snake);

    };

    Gamebtn.prototype.addevent = function (btns, snake) {
        var that = this;
        var snake = snake;
        btns.forEach(function (ele) {
            ele.addEventListener("click", function () {
                switch (this.classList[0]) {
                    case "btn_start":
                        clearInterval(snake.otimer);
                        snake.play(snake.map, snake.food);
                        break;
                    case "btn_pause":
                        clearInterval(snake.otimer);
                        snake.pause();
                        break;
                    case "btn_restart":
                        clearInterval(snake.otimer);
                        snake.restart();
                        break;
                }

            })
        })
    };

    window.Gamebtn = Gamebtn;
}());

//初始化游戏
(function () {

    //游戏构造函数
    function Game(map) {
        this.food = new Food(20, 20, "green"); //食物对象
        this.snake = new Snake(); //小蛇对象
        this.gamebtn = new Gamebtn(100, 36, "orange"); //小蛇对象
        this.map = map; //地图
    }

    //游戏初始化
    Game.prototype.init = function () {
        //初始化食物
        this.food.init(this.map);
        //初始化小蛇
        this.snake.init(this.map, this.food);
        this.snake.play(this.map, this.food);

        this.gamebtn.init(this.map, this.snake);
    };

    window.Game = Game;
}());

var map = document.querySelector(".map");
var game = new Game(map);
game.init();