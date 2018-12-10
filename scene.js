const PLANE_DIM = [200, 200];
const FPS = 20;
const FOOD_COLOR = [0xd7871f,0xc8b57a,0xd59a07,0xd7871f,0xc8b57a,0xd59a07];
const SNAKE_COLOR = [0xa81760,0x68961c,0xdc9960,0xc892f8,0xb02e7c,0xef4f1a];
const SNAKE_COLOR_ALT = [0x57E89F,0x9769E3,0x23669F,0x376D07,0x4FD183,0x10B0E5];

var now;
var then = Date.now();
var interval = 1000 / FPS;
var delta;
var animate;
var start = false;
var cpu = true;

var bgm = new Audio('audio/bgm.mp3');
bgm.addEventListener('timeupdate', function() {
    if(this.currentTime > this.duration - .39) {
        this.currentTime = 0;
        this.play();
    }
}, false);
var sfx = {
    food: new Audio('audio/food.mp3'),
    collide: new Audio('audio/obstacle.mp3')
};

scene = new THREE.Scene();
scene.background = new THREE.Color( 0xf5f2d0 );

var camera = new THREE.PerspectiveCamera(
    45, window.innerWidth / window.innerHeight, 1, 10000);
camera.rotation.y = 0;
camera.rotation.x = Math.PI / 4;
camera.rotation.z = 0;

renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var plane = new THREE.Mesh(
    new THREE.PlaneGeometry(PLANE_DIM[0], PLANE_DIM[1], 0),
    new THREE.MeshBasicMaterial( {color: 0xFFFFFF, side: THREE.DoubleSide})
);
plane.position.z = -20;

var border = [
        new THREE.Mesh(
            new THREE.PlaneGeometry(PLANE_DIM[0], 40, 40),
            new THREE.MeshBasicMaterial( {color: 0xbdbdbd, transparent:true, opacity: 0.5})
        ),
        new THREE.Mesh(
            new THREE.PlaneGeometry(PLANE_DIM[0], 40, 40),
            new THREE.MeshBasicMaterial( {color: 0xbdbdbd, transparent:true, opacity: 0.5})
        ),
        new THREE.Mesh(
            new THREE.PlaneGeometry(40, PLANE_DIM[0], 40),
            new THREE.MeshBasicMaterial( {color: 0xd3d3d3, transparent:true, opacity: 0.5})
        ),
        new THREE.Mesh(
            new THREE.PlaneGeometry(40, PLANE_DIM[0], 40),
            new THREE.MeshBasicMaterial( {color: 0xd3d3d3, transparent:true, opacity: 0.5})
        )
    ];
border[0].rotation.x = Math.PI /2;
border[0].position.y = PLANE_DIM[1] / 2;

border[1].rotation.x = Math.PI /2;
border[1].position.y = -PLANE_DIM[1] / 2;

border[2].rotation.y = Math.PI/2;
border[2].position.x = -PLANE_DIM[0] / 2;

border[3].rotation.y = -Math.PI/2;
border[3].position.x = PLANE_DIM[0] / 2;

var players = [new Snake(0, SNAKE_COLOR), new Snake(-40, SNAKE_COLOR_ALT)];

var food = Block(Math.floor(Math.random() * (PLANE_DIM[0]*.6)) - (PLANE_DIM[0]*.6)/2,
        Math.floor(Math.random() * (PLANE_DIM[1]*.6)) - (PLANE_DIM[1]*.6)/2 , FOOD_COLOR);

var light = new THREE.PointLight(0xffffff);
light.position.set(0, 250, 0);


border.forEach(function(e) {
    scene.add(e);
});
players.forEach(function(p) {
    p.body.forEach(function(b){
        scene.add(b);
    });
});
scene.add(food);
scene.add(plane);
scene.add(light);

var move = function(e, opponent) {
    e.move(opponent);

    if(Math.abs(e.body[0].position.x - food.position.x) < SIZE &&
        Math.abs(e.body[0].position.y - food.position.y) < SIZE) {
        var tail = Block(e.body[e.body.length -1].position.x,
                e.body[e.body.length -1].position.y, e.palette);
        e.body.push(tail);
        scene.add(tail);
        e.score += 10;
        food.position.x = Math.floor(Math.random() * (PLANE_DIM[0] * .6)) - (PLANE_DIM[0] * .6)/2 ;
        food.position.y = Math.floor(Math.random() * (PLANE_DIM[1] * .6)) - (PLANE_DIM[1] * .6)/2 ;
        sfx.food.play();
    }   
}

var update = function() {
    for(var i = 0; i < players.length; i++) {
        if(!players[i].wait) {
            if(cpu && i == 1) {
                switch(Math.floor(Math.random() * 4) + 36)  {
                    case 37:
                        if(players[i].dir[0] == 0)
                            players[i].dir = [-1, 0, 0];
                        break;
                    case 38:
                        if(players[i].dir[1] == 0)
                            players[i].dir = [0, 1, 0];
                        break;
                    case 39:
                        if(players[i].dir[0] == 0)
                            players[i].dir = [1, 0, 0];
                        break;
                    case 40:
                        if(players[i].dir[1] == 0)
                            players[i].dir = [0, -1, 0];
                        break;
                }
            }
            move(players[i],players[Math.abs(i-1)]);
        } else if(players[i].timeout-- <= 0) {
            border[0].material.color.setHex(0xbdbdbd);
            border[1].material.color.setHex(0xbdbdbd);
            border[2].material.color.setHex(0xd3d3d3);
            border[3].material.color.setHex(0xd3d3d3);
            players[i].body.forEach(function(e) {
                scene.remove(e);
            });
            players[i] = new Snake(i * -40, players[i].palette);
            players[i].body.forEach(function(e) {
                scene.add(e);
            });
        }
    }
    var p1 = document.getElementById('score-0');
    p1.innerHTML = players[0].score;
    if(players[0].wait)
        p1.innerHTML += ' ('+players[0].timeout+')';

    var p2 = document.getElementById('score-1');
    p2.innerHTML = players[1].score;
    if(players[1].wait)
        p2.innerHTML += ' ('+players[1].timeout+')';
};

var render = function() {
    camera.position.set(0, -PLANE_DIM[0], PLANE_DIM[0]);
    renderer.render(scene, camera);
};

var GameLoop = function() {
    animate = requestAnimationFrame(GameLoop);

    now = Date.now();
    delta = now - then;
    if(delta > interval) {
        then = now - (delta % interval);
        if(start) 
            update();
        render();
    }
}
GameLoop();

var cpu = function(e) {
    if(!start) {
        start = true;
        document.querySelector('.dialog').style.display = "none";
        document.querySelector('.static').innerHTML = `
            <li>Your Score: <span id="score-0"></span></li>
            <li>Computer's Score: <span id="score-1"></span></li>
        `;
    }
    if(!players[0].wait)
        switch(e.keyCode) {
            case 37:
                if(players[0].dir[0] == 0)
                    players[0].dir = [-1, 0, 0];
                break;
            case 38:
                if(players[0].dir[1] == 0)
                    players[0].dir = [0, 1, 0];
                break;
            case 39:
                if(players[0].dir[0] == 0)
                    players[0].dir = [1, 0, 0];
                break;
            case 40:
                if(players[0].dir[1] == 0)
                    players[0].dir = [0, -1, 0];
                break;
        }

}

var vs = function(e) {
    if(!start) {
        start = true;
        document.querySelector('.dialog').style.display = "none";
        document.querySelector('.static').innerHTML = `
            <li>Purple Score: <span id="score-0"></span></li>
            <li>Green Score: <span id="score-1"></span></li>
        `;
        players[0].wait = true;
        players[1].wait = true;
    }
    if(!players[0].wait)
        switch(e.keyCode) {
            case 37:
                if(players[0].dir[0] == 0)
                    players[0].dir = [-1, 0, 0];
                break;
            case 38:
                if(players[0].dir[1] == 0)
                    players[0].dir = [0, 1, 0];
                break;
            case 39:
                if(players[0].dir[0] == 0)
                    players[0].dir = [1, 0, 0];
                break;
            case 40:
                if(players[0].dir[1] == 0)
                    players[0].dir = [0, -1, 0];
                break;
        }

    if(!players[1].wait)
        switch(e.keyCode) {
            case 65:
                if(players[1].dir[0] == 0)
                    players[1].dir = [-1, 0, 0];
                break;
            case 87:
                if(players[1].dir[1] == 0)
                    players[1].dir = [0, 1, 0];
                break;
            case 68:
                if(players[1].dir[0] == 0)
                    players[1].dir = [1, 0, 0];
                break;
            case 83:
                if(players[1].dir[1] == 0)
                    players[1].dir = [0, -1, 0];
                break;
        }

    // switch(e.keyCode) {
    //     case 27:
    //         start = false;
    //         var dialog = document.querySelector('.dialog');
    //         dialog.style.display = "block";
    //         dialog.innerHTML = `
    //           <h1>SNAKE!</h1>
    //           <p>Choose a game mode</p>
    //           <span class="btn" id="vs">P1 v P2</span>
    //           <span class="btn" id="cpu">P1 v CPU</span>
    //           `;
    //         break;
    // }
}

document.getElementById('vs').onclick = function () {
    if(!start) {
        bgm.play();
        document.querySelector('.dialog').innerHTML = `
        <h1>Controls</h1>
        <p>Player 1 (Purple) => Arrow Keys</p>
        <p>Player 2 (Green) => WASD</p>
        <p>Press any key to begin the countdown</p>
        `;
        cpu = false;
        document.onkeydown = vs;
    }
    
};

document.getElementById('cpu').onclick = function () {
    if(!start) {
        bgm.play();

        document.querySelector('.dialog').innerHTML = `
        <h1>Controls</h1>
        <p>Use the arrow keys to move. You are purple.</p>
        <p>Press any key to start the game</p>
        `;
        document.onkeydown = cpu;
    }
};
