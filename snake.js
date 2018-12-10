
const SIZE = 5;
var Block = function(x,y,palette) {
    var geometry = new THREE.BoxGeometry(SIZE,SIZE,SIZE);
    for ( var i = 0; i < geometry.faces.length; i ++ ) {
        geometry.faces[ i ].color.setHex( palette[i/2 | 0] );
    }
    var block = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({ vertexColors: THREE.FaceColors }));
    
    block.position.set(x,y,SIZE);
    return block;
}
class Snake
{
    constructor(pos, palette)
    {
        this.palette = palette;
        this.size = 2;
        this.dir = [1,0,0];
        this.body = [];
        for(var i = 0; i < this.size; i++) {
            this.body.push(Block(i * SIZE, pos, palette));
        }
        this.lose = false;
        this.wait = false;
        this.timeout = 20;
        this.score = 0;
    }

    move(opponent)
    {
        var next = this.body.pop();
        var head = this.body[0];

        next.position.x = head.position.x + this.dir[0]*SIZE;
        next.position.y = head.position.y + this.dir[1]*SIZE;
        next.position.z = head.position.z + this.dir[2]*SIZE;

        if( this.checkCollision(next, opponent) ) {
            this.lose = true;
            this.wait = true;
            sfx.collide.play();
        }
    
        this.body.unshift(next);
    }

    checkCollision(e, opponent)
    {
        var snakeCollide = this.body.some(function(el) {
            return (e.position.x == el.position.x && 
                    e.position.y == el.position.y && 
                    e.position.z == el.position.z);
        });
        snakeCollide |= opponent.body.some(function(el) {
            return (e.position.x == el.position.x && 
                    e.position.y == el.position.y && 
                    e.position.z == el.position.z);
        });
        if( e.position.x <= -PLANE_DIM[0] / 2 + SIZE ) {
            border[2].material.color.setHex(0xff0000);
        } else if( e.position.x >= PLANE_DIM[0] / 2 - SIZE ) {
            border[3].material.color.setHex(0xff0000);
        } else if( e.position.y <= -PLANE_DIM[1] / 2 + SIZE ) {
            border[1].material.color.setHex(0xff0000);
        } else if( e.position.y >= PLANE_DIM[1] / 2 - SIZE * 4 ) {
            border[0].material.color.setHex(0xff0000);
        } else if( snakeCollide) {
            
        } else {
            return false;
        }
        return true;
    }
}