/*jslint browser: true, undef: true, eqeqeq: true, nomen: true, white: true */
/*global window: false, document: false */

/*
 * fix looped audio
 * add fruits + levels
 * fix what happens when a ghost is eaten (should go back to base)
 * do proper ghost mechanics (blinky/wimpy etc)
 */

var NONE        = 4,
    UP          = 3,
    LEFT        = 2,
    DOWN        = 1,
    RIGHT       = 11,
    WAITING     = 5,
    PAUSE       = 6,
    PLAYING     = 7,
    COUNTDOWN   = 8,
    EATEN_PAUSE = 9,
    DYING       = 10,
    Pacman      = {};

Pacman.FPS = 30;

Pacman.Ghost = function (game, map, colour) {

    var position  = null,
        direction = null,
        eatable   = null,
        eaten     = null,
        due       = null;
    
    function getNewCoord(dir, current) { 
        
        var baseSpeed = 2 + Math.floor((game.getLevel ? game.getLevel() : 0) / 2);
        var speed  = isVunerable() ? 1 : isHidden() ? baseSpeed + 2 : baseSpeed,
            xSpeed = (dir === LEFT && -speed || dir === RIGHT && speed || 0),
            ySpeed = (dir === DOWN && speed || dir === UP && -speed || 0);
    
        return {
            "x": addBounded(current.x, xSpeed),
            "y": addBounded(current.y, ySpeed)
        };
    };

    /* Collision detection(walls) is done when a ghost lands on an
     * exact block, make sure they dont skip over it 
     */
    function addBounded(x1, x2) { 
        var rem    = x1 % 10, 
            result = rem + x2;
        if (rem !== 0 && result > 10) {
            return x1 + (10 - rem);
        } else if(rem > 0 && result < 0) { 
            return x1 - rem;
        }
        return x1 + x2;
    };
    
    function isVunerable() { 
        return eatable !== null;
    };
    
    function isDangerous() {
        return eaten === null;
    };

    function isHidden() { 
        return eatable === null && eaten !== null;
    };
    
    function getRandomDirection() {
        var moves = (direction === LEFT || direction === RIGHT) 
            ? [UP, DOWN] : [LEFT, RIGHT];
        return moves[Math.floor(Math.random() * 2)];
    };
    
    function reset() {
        eaten = null;
        eatable = null;
        position = {"x": 90, "y": 80};
        direction = getRandomDirection();
        due = getRandomDirection();
    };
    
    function onWholeSquare(x) {
        return x % 10 === 0;
    };
    
    function oppositeDirection(dir) { 
        return dir === LEFT && RIGHT ||
            dir === RIGHT && LEFT ||
            dir === UP && DOWN || UP;
    };

    function makeEatable() {
        direction = oppositeDirection(direction);
        eatable = game.getTick();
    };

    function eat() { 
        eatable = null;
        eaten = game.getTick();
    };

    function pointToCoord(x) {
        return Math.round(x / 10);
    };

    function nextSquare(x, dir) {
        var rem = x % 10;
        if (rem === 0) { 
            return x; 
        } else if (dir === RIGHT || dir === DOWN) { 
            return x + (10 - rem);
        } else {
            return x - rem;
        }
    };

    function onGridSquare(pos) {
        return onWholeSquare(pos.y) && onWholeSquare(pos.x);
    };

    function secondsAgo(tick) { 
        return (game.getTick() - tick) / Pacman.FPS;
    };

    function getColour() { 
        if (eatable) { 
            if (secondsAgo(eatable) > 5) { 
                return game.getTick() % 20 > 10 ? "#FFFFFF" : "#0000BB";
            } else { 
                return "#0000BB";
            }
        } else if(eaten) { 
            return "#222";
        } 
        return colour;
    };

    function draw(ctx) {
  
        var s    = map.blockSize, 
            top  = (position.y/10) * s,
            left = (position.x/10) * s;
    
        if (eatable && secondsAgo(eatable) > 8) {
            eatable = null;
        }
        
        if (eaten && secondsAgo(eaten) > 3) { 
            eaten = null;
        }
        
        var tl = left + s;
        var base = top + s - 3;
        var inc = s / 10;

        var high = game.getTick() % 10 > 5 ? 3  : -3;
        var low  = game.getTick() % 10 > 5 ? -3 : 3;

        ctx.fillStyle = getColour();
        ctx.beginPath();

        ctx.moveTo(left, base);

        ctx.quadraticCurveTo(left, top, left + (s/2),  top);
        ctx.quadraticCurveTo(left + s, top, left+s,  base);
        
        // Wavy things at the bottom
        ctx.quadraticCurveTo(tl-(inc*1), base+high, tl - (inc * 2),  base);
        ctx.quadraticCurveTo(tl-(inc*3), base+low, tl - (inc * 4),  base);
        ctx.quadraticCurveTo(tl-(inc*5), base+high, tl - (inc * 6),  base);
        ctx.quadraticCurveTo(tl-(inc*7), base+low, tl - (inc * 8),  base); 
        ctx.quadraticCurveTo(tl-(inc*9), base+high, tl - (inc * 10), base); 

        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = "#FFF";
        ctx.arc(left + 6,top + 6, s / 6, 0, 300, false);
        ctx.arc((left + s) - 6,top + 6, s / 6, 0, 300, false);
        ctx.closePath();
        ctx.fill();

        var f = s / 12;
        var off = {};
        off[RIGHT] = [f, 0];
        off[LEFT]  = [-f, 0];
        off[UP]    = [0, -f];
        off[DOWN]  = [0, f];

        ctx.beginPath();
        ctx.fillStyle = "#000";
        ctx.arc(left+6+off[direction][0], top+6+off[direction][1], 
                s / 15, 0, 300, false);
        ctx.arc((left+s)-6+off[direction][0], top+6+off[direction][1], 
                s / 15, 0, 300, false);
        ctx.closePath();
        ctx.fill();

    };

    function pane(pos) {

        if (pos.y === 100 && pos.x >= 190 && direction === RIGHT) {
            return {"y": 100, "x": -10};
        }
        
        if (pos.y === 100 && pos.x <= -10 && direction === LEFT) {
            return position = {"y": 100, "x": 190};
        }

        return false;
    };
    
    function move(ctx) {
        
        var oldPos = position,
            onGrid = onGridSquare(position),
            npos   = null;
        
        if (due !== direction) {
            
            npos = getNewCoord(due, position);
            
            if (onGrid &&
                map.isFloorSpace({
                    "y":pointToCoord(nextSquare(npos.y, due)),
                    "x":pointToCoord(nextSquare(npos.x, due))})) {
                direction = due;
            } else {
                npos = null;
            }
        }
        
        if (npos === null) {
            npos = getNewCoord(direction, position);
        }
        
        if (onGrid &&
            map.isWallSpace({
                "y" : pointToCoord(nextSquare(npos.y, direction)),
                "x" : pointToCoord(nextSquare(npos.x, direction))
            })) {
            
            due = getRandomDirection();            
            return move(ctx);
        }

        position = npos;        
        
        var tmp = pane(position);
        if (tmp) { 
            position = tmp;
        }
        
        due = getRandomDirection();
        
        return {
            "new" : position,
            "old" : oldPos
        };
    };
    
    return {
        "eat"         : eat,
        "isVunerable" : isVunerable,
        "isDangerous" : isDangerous,
        "makeEatable" : makeEatable,
        "reset"       : reset,
        "move"        : move,
        "draw"        : draw
    };
};

Pacman.User = function (game, map) {
    
    var position  = null,
        direction = null,
        eaten     = null,
        due       = null, 
        lives     = null,
        score     = 5,
        keyMap    = {};
    
    keyMap[KEY.ARROW_LEFT]  = LEFT;
    keyMap[KEY.ARROW_UP]    = UP;
    keyMap[KEY.ARROW_RIGHT] = RIGHT;
    keyMap[KEY.ARROW_DOWN]  = DOWN;

    function addScore(nScore) { 
        score += nScore;
        if (score >= 10000 && score - nScore < 10000) { 
            lives += 1;
        }
    };

    function theScore() { 
        return score;
    };

    function loseLife() { 
        lives -= 1;
    };

    function addLife() {
        lives += 1;
        console.log("Pacman: Extra life added! Lives now: " + lives);
    };

    function getLives() {
        return lives;
    };

    function initUser() {
        score = 0;
        lives = 2;
        newLevel();
    }
    
    function newLevel() {
        resetPosition();
        eaten = 0;
    };
    
    function resetPosition() {
        position = {"x": 90, "y": 120};
        direction = LEFT;
        due = LEFT;
    };
    
    function reset() {
        initUser();
        resetPosition();
    };        
    
    function keyDown(e) {
        if (typeof keyMap[e.keyCode] !== "undefined") { 
            due = keyMap[e.keyCode];
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        return true;
	};

    function getNewCoord(dir, current) {   
        return {
            "x": current.x + (dir === LEFT && -2 || dir === RIGHT && 2 || 0),
            "y": current.y + (dir === DOWN && 2 || dir === UP    && -2 || 0)
        };
    };

    function onWholeSquare(x) {
        return x % 10 === 0;
    };

    function pointToCoord(x) {
        return Math.round(x/10);
    };
    
    function nextSquare(x, dir) {
        var rem = x % 10;
        if (rem === 0) { 
            return x; 
        } else if (dir === RIGHT || dir === DOWN) { 
            return x + (10 - rem);
        } else {
            return x - rem;
        }
    };

    function next(pos, dir) {
        return {
            "y" : pointToCoord(nextSquare(pos.y, dir)),
            "x" : pointToCoord(nextSquare(pos.x, dir)),
        };                               
    };

    function onGridSquare(pos) {
        return onWholeSquare(pos.y) && onWholeSquare(pos.x);
    };

    function isOnSamePlane(due, dir) { 
        return ((due === LEFT || due === RIGHT) && 
                (dir === LEFT || dir === RIGHT)) || 
            ((due === UP || due === DOWN) && 
             (dir === UP || dir === DOWN));
    };

    function move(ctx) {
        
        var npos        = null, 
            nextWhole   = null, 
            oldPosition = position,
            block       = null;
        
        if (due !== direction) {
            npos = getNewCoord(due, position);
            
            if (isOnSamePlane(due, direction) || 
                (onGridSquare(position) && 
                 map.isFloorSpace(next(npos, due)))) {
                direction = due;
            } else {
                npos = null;
            }
        }

        if (npos === null) {
            npos = getNewCoord(direction, position);
        }
        
        if (onGridSquare(position) && map.isWallSpace(next(npos, direction))) {
            direction = NONE;
        }

        if (direction === NONE) {
            return {"new" : position, "old" : position};
        }
        
        if (npos.y === 100 && npos.x >= 190 && direction === RIGHT) {
            npos = {"y": 100, "x": -10};
        }
        
        if (npos.y === 100 && npos.x <= -12 && direction === LEFT) {
            npos = {"y": 100, "x": 190};
        }
        
        position = npos;        
        nextWhole = next(position, direction);
        
        block = map.block(nextWhole);        
        
        if ((isMidSquare(position.y) || isMidSquare(position.x)) &&
            block === Pacman.BISCUIT || block === Pacman.PILL) {
            
            map.setBlock(nextWhole, Pacman.EMPTY);           
            addScore((block === Pacman.BISCUIT) ? 10 : 50);
            eaten += 1;
            
            if (eaten === 182) {
                game.completedLevel();
            }
            
            if (block === Pacman.PILL) { 
                game.eatenPill();
            }
        }   
                
        return {
            "new" : position,
            "old" : oldPosition
        };
    };

    function isMidSquare(x) { 
        var rem = x % 10;
        return rem > 3 || rem < 7;
    };

    function calcAngle(dir, pos) { 
        if (dir == RIGHT && (pos.x % 10 < 5)) {
            return {"start":0.25, "end":1.75, "direction": false};
        } else if (dir === DOWN && (pos.y % 10 < 5)) { 
            return {"start":0.75, "end":2.25, "direction": false};
        } else if (dir === UP && (pos.y % 10 < 5)) { 
            return {"start":1.25, "end":1.75, "direction": true};
        } else if (dir === LEFT && (pos.x % 10 < 5)) {             
            return {"start":0.75, "end":1.25, "direction": true};
        }
        return {"start":0, "end":2, "direction": false};
    };

    function drawDead(ctx, amount) { 

        var size = map.blockSize, 
            half = size / 2;

        if (amount >= 1) { 
            return;
        }

        ctx.fillStyle = "#FFFF00";
        ctx.beginPath();        
        ctx.moveTo(((position.x/10) * size) + half, 
                   ((position.y/10) * size) + half);
        
        ctx.arc(((position.x/10) * size) + half, 
                ((position.y/10) * size) + half,
                half, 0, Math.PI * 2 * amount, true); 
        
        ctx.fill();    
    };

    function draw(ctx) { 

        var s     = map.blockSize, 
            angle = calcAngle(direction, position);

        ctx.fillStyle = "#FFFF00";

        ctx.beginPath();        

        ctx.moveTo(((position.x/10) * s) + s / 2,
                   ((position.y/10) * s) + s / 2);
        
        ctx.arc(((position.x/10) * s) + s / 2,
                ((position.y/10) * s) + s / 2,
                s / 2, Math.PI * angle.start, 
                Math.PI * angle.end, angle.direction); 
        
        ctx.fill();    
    };
    
    initUser();

    return {
        "draw"          : draw,
        "drawDead"      : drawDead,
        "loseLife"      : loseLife,
        "addLife"       : addLife,
        "getLives"      : getLives,
        "score"         : score,
        "addScore"      : addScore,
        "theScore"      : theScore,
        "keyDown"       : keyDown,
        "move"          : move,
        "newLevel"      : newLevel,
        "reset"         : reset,
        "resetPosition" : resetPosition
    };
};

Pacman.Map = function (size) {
    
    var height    = null, 
        width     = null, 
        blockSize = size,
        pillSize  = 0,
        map       = null;
    
    function withinBounds(y, x) {
        return y >= 0 && y < height && x >= 0 && x < width;
    }
    
    function isWall(pos) {
        return withinBounds(pos.y, pos.x) && map[pos.y][pos.x] === Pacman.WALL;
    }
    
    function isFloorSpace(pos) {
        if (!withinBounds(pos.y, pos.x)) {
            return false;
        }
        var peice = map[pos.y][pos.x];
        return peice === Pacman.EMPTY || 
            peice === Pacman.BISCUIT ||
            peice === Pacman.PILL;
    }
    
    function drawWall(ctx) {

        var i, j, p, line;
        
        ctx.strokeStyle = "#0000FF";
        ctx.lineWidth   = 5;
        ctx.lineCap     = "round";
        
        for (i = 0; i < Pacman.WALLS.length; i += 1) {
            line = Pacman.WALLS[i];
            ctx.beginPath();

            for (j = 0; j < line.length; j += 1) {

                p = line[j];
                
                if (p.move) {
                    ctx.moveTo(p.move[0] * blockSize, p.move[1] * blockSize);
                } else if (p.line) {
                    ctx.lineTo(p.line[0] * blockSize, p.line[1] * blockSize);
                } else if (p.curve) {
                    ctx.quadraticCurveTo(p.curve[0] * blockSize, 
                                         p.curve[1] * blockSize,
                                         p.curve[2] * blockSize, 
                                         p.curve[3] * blockSize);   
                }
            }
            ctx.stroke();
        }
    }
    
    function reset() {       
        map    = Pacman.MAP.clone();
        height = map.length;
        width  = map[0].length;        
    };

    function block(pos) {
        return map[pos.y][pos.x];
    };
    
    function setBlock(pos, type) {
        map[pos.y][pos.x] = type;
    };

    function drawPills(ctx) { 

        if (++pillSize > 30) {
            pillSize = 0;
        }
        
        for (i = 0; i < height; i += 1) {
		    for (j = 0; j < width; j += 1) {
                if (map[i][j] === Pacman.PILL) {
                    ctx.beginPath();

                    ctx.fillStyle = "#000";
		            ctx.fillRect((j * blockSize), (i * blockSize), 
                                 blockSize, blockSize);

                    ctx.fillStyle = "#FFF";
                    ctx.arc((j * blockSize) + blockSize / 2,
                            (i * blockSize) + blockSize / 2,
                            Math.abs(5 - (pillSize/3)), 
                            0, 
                            Math.PI * 2, false); 
                    ctx.fill();
                    ctx.closePath();
                }
		    }
	    }
    };
    
    function draw(ctx) {
        
        var i, j, size = blockSize;

        ctx.fillStyle = "#000";
	    ctx.fillRect(0, 0, width * size, height * size);

        drawWall(ctx);
        
        for (i = 0; i < height; i += 1) {
		    for (j = 0; j < width; j += 1) {
			    drawBlock(i, j, ctx);
		    }
	    }
    };
    
    function drawBlock(y, x, ctx) {

        var layout = map[y][x];

        if (layout === Pacman.PILL) {
            return;
        }

        ctx.beginPath();
        
        if (layout === Pacman.EMPTY || layout === Pacman.BLOCK || 
            layout === Pacman.BISCUIT) {
            
            ctx.fillStyle = "#000";
		    ctx.fillRect((x * blockSize), (y * blockSize), 
                         blockSize, blockSize);

            if (layout === Pacman.BISCUIT) {
                ctx.fillStyle = "#FFF";
		        ctx.fillRect((x * blockSize) + (blockSize / 2.5), 
                             (y * blockSize) + (blockSize / 2.5), 
                             blockSize / 6, blockSize / 6);
	        }
        }
        ctx.closePath();	 
    };

    reset();
    
    return {
        "draw"         : draw,
        "drawBlock"    : drawBlock,
        "drawPills"    : drawPills,
        "block"        : block,
        "setBlock"     : setBlock,
        "reset"        : reset,
        "isWallSpace"  : isWall,
        "isFloorSpace" : isFloorSpace,
        "height"       : height,
        "width"        : width,
        "blockSize"    : blockSize
    };
};

Pacman.Audio = function(game) {
    
    var files          = [], 
        endEvents      = [],
        progressEvents = [],
        playing        = [];
    
    function load(name, path, cb) { 

        var f = files[name] = document.createElement("audio");

        progressEvents[name] = function(event) { progress(event, name, cb); };
        
        f.addEventListener("canplaythrough", progressEvents[name], true);
        f.setAttribute("preload", "true");
        f.setAttribute("autobuffer", "true");
        f.setAttribute("src", path);
        f.pause();        
    };

    function progress(event, name, callback) { 
        if (event.loaded === event.total && typeof callback === "function") {
            callback();
            files[name].removeEventListener("canplaythrough", 
                                            progressEvents[name], true);
        }
    };

    function disableSound() {
        for (var i = 0; i < playing.length; i++) {
            files[playing[i]].pause();
            files[playing[i]].currentTime = 0;
        }
        playing = [];
    };

    function ended(name) { 

        var i, tmp = [], found = false;

        files[name].removeEventListener("ended", endEvents[name], true);

        for (i = 0; i < playing.length; i++) {
            if (!found && playing[i]) { 
                found = true;
            } else { 
                tmp.push(playing[i]);
            }
        }
        playing = tmp;
    };

    function play(name) { 
        if (!game.soundDisabled()) {
            endEvents[name] = function() { ended(name); };
            playing.push(name);
            files[name].addEventListener("ended", endEvents[name], true);
            files[name].play();
        }
    };

    function pause() { 
        for (var i = 0; i < playing.length; i++) {
            files[playing[i]].pause();
        }
    };
    
    function resume() { 
        for (var i = 0; i < playing.length; i++) {
            files[playing[i]].play();
        }        
    };
    
    return {
        "disableSound" : disableSound,
        "load"         : load,
        "play"         : play,
        "pause"        : pause,
        "resume"       : resume
    };
};

var PACMAN = (function () {

    var state        = WAITING,
        audio        = null,
        ghosts       = [],
        ghostSpecs   = ["#00FFDE", "#FF0000", "#FFB8DE", "#FFB847"],
        eatenCount   = 0,
        totalGhostsEaten = 0, // Track total ghosts eaten for mid-roll ad
        level        = 0,
        tick         = 0,
        ghostPos, userPos, 
        stateChanged = true,
        timerStart   = null,
        lastTime     = 0,
        ctx          = null,
        timer        = null,
        map          = null,
        user         = null,
        stored       = null;

    function getTick() { 
        return tick;
    };

    function drawScore(text, position) {
        ctx.fillStyle = "#FFFFFF";
        ctx.font      = "12px BDCartoonShoutRegular";
        ctx.fillText(text, 
                     (position["new"]["x"] / 10) * map.blockSize, 
                     ((position["new"]["y"] + 5) / 10) * map.blockSize);
    }
    
    function dialog(text) {
        ctx.fillStyle = "#FFFF00";
        ctx.font      = "18px Calibri";
        var width = ctx.measureText(text).width,
            x     = ((map.width * map.blockSize) - width) / 2;        
        ctx.fillText(text, x, (map.height * 10) + 8);
    }

    function soundDisabled() {
        return localStorage["soundDisabled"] === "true";
    };
    
    function startLevel() {        
        user.resetPosition();
        for (var i = 0; i < ghosts.length; i += 1) { 
            ghosts[i].reset();
        }
        var skipCountdown = false;
        try {
            if (typeof window !== "undefined" && window.skipCountdownForNextLevel) {
                skipCountdown = true;
                window.skipCountdownForNextLevel = false;
            }
        } catch (e) {}
        if (!skipCountdown) {
            audio.play("start");
        }
        timerStart = tick;
        if (skipCountdown) {
            setState(PLAYING);
        } else {
            setState(COUNTDOWN);
        }
        
        // Note: Ads caching happens in completedLevel() when level completes automatically
        // No caching here - caching only on game start (startNewGame) and level complete (completedLevel)
    }    

    function startNewGame() {
        console.log("Pacman: Starting new game");
        // Clear game over flag - allow game to start
        window.isGameOver = false;
        // Reset caching flags to ensure fresh caching can happen
        if (typeof window.resetCachingFlags === 'function') {
            window.resetCachingFlags();
        }
        // Reset RV flags to ensure caching is not blocked
        window.skipCachingAfterRV = false;
        window.continuingFromRV = false;
        console.log("Pacman: Reset RV flags in startNewGame - caching allowed");
        // Don't reset gameStartCachingDone here - it should be reset only when button is clicked
        // This ensures caching happens only once per button click, not multiple times if startNewGame is called multiple times
        // Reset RV video flags for new game session (allow RV to be cached and shown once per new game)
        window.rvVideoCachedOnce = false;
        window.rvVideoUsedOnce = false;
        // Reset level caching tracker for new game
        window.levelCachingTracker = {};
        // Remove game-over class when starting a new game
        try {
            if (typeof document !== 'undefined' && document.body) {
                document.body.classList.remove('game-over');
            }
            if (window.hideGameOverOverlay) {
                window.hideGameOverOverlay({hideHome: true});
            }
        } catch(e) {}
        
        setState(WAITING);
        level = 1;
        user.reset();
        map.reset();
        map.draw(ctx);
        
        // For testing: Level 1 has only 1 ghost, other levels have all 4 ghosts
        // Recreate ghosts based on current level
        ghosts = []; // Clear existing ghosts
        var numGhosts = (level === 1) ? 1 : ghostSpecs.length;
        for (var i = 0; i < numGhosts; i += 1) {
            var ghost = new Pacman.Ghost({"getTick":getTick, "getLevel": function() { return level; }}, map, ghostSpecs[i]);
            ghosts.push(ghost);
        }
        
        // Cache ads at game start (mid-roll + rewarded)
        // gameCacheAd() has its own protection mechanisms, so just call it directly
        // But check flags first to ensure we're not in RV flow
        try {
            if (window.skipCachingAfterRV || window.continuingFromRV) {
                console.log("Pacman: Skipping caching at game start - RV flow active. skipCachingAfterRV:", window.skipCachingAfterRV, "continuingFromRV:", window.continuingFromRV);
            } else {
                gameCacheAd();
                console.log("Pacman: Ads caching at game start (mid-roll + rewarded)");
            }
        } catch(e) { 
            console.log("Pacman: Error caching ads at game start", e);
        }
        
        startLevel();
    }

    function keyDown(e) {
        try {
            if (typeof window !== "undefined" && window.isNextLevelPromptVisible) {
                console.log("Pacman: keyDown ignored - next level prompt visible");
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        } catch(blockErr) {}
        console.log("Pacman: keyDown called, keyCode:", e.keyCode, "which:", e.which, "current state:", state);
        if (e.keyCode === KEY.N) {
            // N key should only start game if not game over (use Play Again button when game over)
            if (window.isGameOver) {
                console.log("Pacman: N key pressed but game is over - ignoring (use Play Again button)");
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            console.log("Pacman: N key detected, starting new game");
            startNewGame();
            e.preventDefault();
            e.stopPropagation();
            return false;
        } else if (e.keyCode === KEY.S) {
            // Toggle sound state first
            var wasDisabled = soundDisabled();
            localStorage["soundDisabled"] = String(!wasDisabled);
            // If sound is now disabled, stop all currently playing sounds
            if (soundDisabled()) {
                audio.disableSound();
            } else {
                // If sound is now enabled, resume music if game is playing
                if (state === PLAYING || state === COUNTDOWN) {
                    audio.resume();
                }
            }
            e.preventDefault();
            e.stopPropagation();
            return false;
        } else if (e.keyCode === KEY.P || e.keyCode === KEY.ENTER) {
            console.log("Pacman: P/ENTER key detected, current state:", state, "KEY.P:", KEY.P, "e.keyCode:", e.keyCode);
            // Handle pause/resume toggle
            if (state === PAUSE) {
                // Resume game
                console.log("Pacman: Resuming game from pause state");
                audio.resume();
                map.draw(ctx);
                setState(stored);
                console.log("Pacman: Game resumed from pause");
            } else if (state === PLAYING || state === COUNTDOWN) {
                // Pause game
                console.log("Pacman: Pausing game, stored state:", state);
                stored = state;
                setState(PAUSE);
                audio.pause();
                map.draw(ctx);
                dialog("Paused");
                console.log("Pacman: Game paused successfully");
            } else if (state === WAITING) {
                // Start game if waiting - but NOT if game is over (wait for Play Again button)
                if (window.isGameOver) {
                    console.log("Pacman: P key pressed in WAITING state but game is over - ignoring (use Play Again button)");
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
                // Start game if waiting (not game over)
                console.log("Pacman: P key pressed in WAITING state, starting new game");
                startNewGame();
                console.log("Pacman: Game started from waiting");
            } else {
                console.log("Pacman: P key pressed but state is:", state, "- no action taken");
            }
            e.preventDefault();
            e.stopPropagation();
            return false;
        } else if (state !== PAUSE) {   
            return user.keyDown(e);
        }
        return true;
    }    

    function loseLife() {        
        user.loseLife();
        
        if (user.getLives() > 0) {
            setState(WAITING);
            startLevel();
        } else {
            // Game Over with rewarded continue flow
            var finalScore = user.theScore();
            var finalLevel = level;
            console.log("Pacman: Game Over - Score: " + finalScore + ", Level: " + finalLevel);
            
            // Mark that game is over - prevent auto-start
            window.isGameOver = true;
            
            // Save game state for extra life continuation
            window.savedGameState = {
                score: finalScore,
                level: finalLevel,
                mapState: null // Will be saved if needed
            };
            
            // Pause game and audio immediately
            setState(PAUSE);
            try {
                if (audio && typeof audio.pause === 'function') {
                    audio.pause();
                }
            } catch(e) {
                console.log("Pacman: Error pausing audio on game over", e);
            }
            
            // Set state to WAITING (this will trigger gameOver event because lives = 0)
            setState(WAITING);
            
            // Post score will be called only after showAds (interstitial ad) closes, not when RV popup appears
            // Store score for posting after interstitial ad closes
            window.pendingPostScore = finalScore;
            
            // Draw game over screen
            map.draw(ctx);
            dialog("Game Over! Score: " + finalScore + ". Press START");
            drawFooter();
            
            // Store popup data globally to ensure it can be shown even if something tries to hide it
            window.currentGameOverData = {
                score: finalScore,
                level: finalLevel
            };
            
            // Game Over Flow: Priority - RV video first, then showAds
            // Don't show game over popup immediately if RV is available - show RV confirmation first
            // Show popup immediately without delay
            (function() {
                try {
                    // Check if RV video is available AND hasn't been used yet in this session
                    if (window.isRVReady === true && !window.rvVideoUsedOnce) {
                        // RV video available - show confirmation popup FIRST (before game over popup)
                        console.log("Pacman: RV video available, showing confirmation popup BEFORE game over popup");
                        if (typeof window.showRewardPrompt === 'function') {
                            window.showRewardPrompt({
                                score: finalScore,
                                onConfirm: function() {
                                    // User clicked yes - hide game over popup immediately, then show rewarded ad -> give extralife and continue game
                                    console.log("Pacman: User confirmed RV video, hiding game over popup and showing rewarded ad");
                                    // Mark RV video as used - only show once per session
                                    window.rvVideoUsedOnce = true;
                                    // Clear any pending game over popup since we're continuing with extra life
                                    window.pendingGameOverPopup = null;
                                    try {
                                        if (window.hideGameOverOverlay) {
                                            window.hideGameOverOverlay({hideHome: true});
                                        }
                                    } catch(e) {
                                        console.log("Pacman: Error hiding game over overlay on RV confirm", e);
                                    }
                                    showAdRewarded();
                                },
                                onCancel: function() {
                                    // User clicked no (skip) - show interstitial ad then gameover popup
                                    console.log("Pacman: User cancelled RV video (skip), checking for interstitial ad");
                                    if (window.isAdReady === true) {
                                        // Show ads available - show ad then game over popup
                                        console.log("Pacman: Interstitial ad available, showing ad then game over popup");
                                        // Store final score and level for showing game over popup after ad closes
                                        window.pendingGameOverPopup = {
                                            score: finalScore,
                                            level: finalLevel
                                        };
                                        showAd();
                                        // Note: Game over popup will be shown after ad closes via adClosed event listener
                                    } else {
                                        // No ads available - show game over popup immediately after skip
                                        // Post score since showAds is not available
                                        if (window.pendingPostScore !== undefined && window.pendingPostScore !== null) {
                                            var scoreToPost = window.pendingPostScore;
                                            window.pendingPostScore = null;
                                            postScore(scoreToPost);
                                            console.log("Pacman: Score posted after RV skip (no ads available):", scoreToPost);
                                        }
                                        try {
                                            if (window.showGameOverOverlay) {
                                                window.showGameOverOverlay({score: finalScore, level: finalLevel});
                                                console.log("Pacman: Game over popup shown after RV skip (no ads)");
                                            }
                                        } catch(e) {
                                            console.log("Pacman: Error showing game over overlay", e);
                                        }
                                    }
                                }
                            });
                        } else {
                            var wants = window.confirm('Continue with an extra life by watching a video?');
                            if (wants) {
                                showAdRewarded();
                            } else {
                                if (window.isAdReady === true) {
                                    showAd();
                                } else {
                                    // No ads - post score since showAds is not available
                                    if (window.pendingPostScore !== undefined && window.pendingPostScore !== null) {
                                        var scoreToPost = window.pendingPostScore;
                                        window.pendingPostScore = null;
                                        postScore(scoreToPost);
                                        console.log("Pacman: Score posted (no ads available):", scoreToPost);
                                    }
                                    // No ads - show game over popup
                                    try {
                                        if (window.showGameOverOverlay) {
                                            window.showGameOverOverlay({score: finalScore, level: finalLevel});
                                        }
                                    } catch(e) {
                                        console.log("Pacman: Error showing game over overlay", e);
                                    }
                                }
                            }
                        }
                    } else {
                        // RV video not available OR already used - show game over popup immediately
                        console.log("Pacman: RV video not available or already used, showing game over popup");
                        console.log("Pacman: isRVReady:", window.isRVReady, "rvVideoUsedOnce:", window.rvVideoUsedOnce);
                        
                        // Show game over popup immediately (RV not available)
                        try {
                            if (window.showGameOverOverlay) {
                                window.showGameOverOverlay({
                                    score: finalScore,
                                    level: finalLevel
                                });
                                console.log("Pacman: Game over popup shown (RV not available)");
                            }
                        } catch(e) {
                            console.log("Pacman: Error showing game over popup", e);
                        }
                        
                        if (window.isAdReady === true) {
                            // Store final score and level for ensuring popup is visible after ad closes
                            window.pendingGameOverPopup = {
                                score: finalScore,
                                level: finalLevel
                            };
                            console.log("Pacman: Setting pendingGameOverPopup before showing interstitial ad", window.pendingGameOverPopup);
                            showAd();
                            console.log("Pacman: Interstitial ad shown, popup will remain visible after ad closes");
                            
                            // Fallback: If adClosed event doesn't fire within 10 seconds, ensure popup is visible
                            setTimeout(function() {
                                if (window.pendingGameOverPopup) {
                                    console.log("Pacman: Fallback - ensuring game over popup is visible (adClosed event may not have fired)");
                                    var popupData = window.pendingGameOverPopup;
                                    window.pendingGameOverPopup = null;
                                    try {
                                        if (window.showGameOverOverlay) {
                                            window.showGameOverOverlay({
                                                score: popupData.score,
                                                level: popupData.level
                                            });
                                            console.log("Pacman: Game over popup ensured visible via fallback");
                                        }
                                    } catch(e) {
                                        console.log("Pacman: Error showing game over overlay via fallback", e);
                                    }
                                }
                            }, 10000); // 10 second fallback
                        } else {
                            console.log("Pacman: No ads available - ensuring game over popup is visible");
                            // Post score since showAds is not available
                            if (window.pendingPostScore !== undefined && window.pendingPostScore !== null) {
                                var scoreToPost = window.pendingPostScore;
                                window.pendingPostScore = null;
                                postScore(scoreToPost);
                                console.log("Pacman: Score posted (no ads available, RV not available):", scoreToPost);
                            }
                            // Ensure popup is visible immediately (no delay)
                            if (window.currentGameOverData) {
                                try {
                                    if (window.showGameOverOverlay) {
                                        window.showGameOverOverlay({
                                            score: window.currentGameOverData.score,
                                            level: window.currentGameOverData.level
                                        });
                                        console.log("Pacman: Game over popup ensured visible (no ads)");
                                    }
                                } catch(e) {
                                    console.log("Pacman: Error showing game over overlay (no ads)", e);
                                }
                            }
                        }
                    }
                } catch(e) {
                    console.log("Pacman: Error in game over ad flow:", e);
                }
            })(); // Execute immediately without delay
        }
    }

    function setState(nState) { 
        state = nState;
        stateChanged = true;
        
        // Dispatch custom events for button toggle in UI
        try {
            if (nState === WAITING) {
                // Check if it's game over (lives <= 0) or just waiting to start
                var isGameOver = false;
                try {
                    if (user && typeof user.getLives === 'function') {
                        var lives = user.getLives();
                        isGameOver = (lives <= 0);
                    }
                } catch(e) {}
                
                if (isGameOver) {
                    // Game over - dispatch gameOver event to keep canvas visible
                    window.dispatchEvent(new CustomEvent('gameOver'));
                    console.log("Pacman: Game Over event dispatched");
                } else {
                    // Just waiting to start - dispatch gameWaiting
                    window.dispatchEvent(new CustomEvent('gameWaiting'));
                }
            } else if (nState === PLAYING) {
                window.dispatchEvent(new CustomEvent('gamePlaying'));
            } else if (nState === COUNTDOWN) {
                // COUNTDOWN is like playing - show Pause button
                window.dispatchEvent(new CustomEvent('gamePlaying'));
            } else if (nState === PAUSE) {
                window.dispatchEvent(new CustomEvent('gamePaused'));
            }
        } catch(e) {
            console.log('Event dispatch error:', e);
        }
    };
    
    function collided(user, ghost) {
        return (Math.sqrt(Math.pow(ghost.x - user.x, 2) + 
                          Math.pow(ghost.y - user.y, 2))) < 10;
    };

    function drawFooter() {
        
        var topLeft  = (map.height * map.blockSize),
            textBase = topLeft + 17;
        
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, topLeft, (map.width * map.blockSize), 30);
        
        ctx.fillStyle = "#FFFF00";

        // Lives icons on the right side with proper spacing
        var livesStartX = (map.width * map.blockSize) - (user.getLives() * 20) - 5;
        for (var i = 0, len = user.getLives(); i < len; i++) {
            ctx.fillStyle = "#FFFF00";
            ctx.beginPath();
            ctx.moveTo(livesStartX + (20 * i) + map.blockSize / 2,
                       (topLeft+1) + map.blockSize / 2);
            
            ctx.arc(livesStartX + (20 * i) + map.blockSize / 2,
                    (topLeft+1) + map.blockSize / 2,
                    map.blockSize / 2, Math.PI * 0.25, Math.PI * 1.75, false);
            ctx.fill();
        }

        // Sound indicator removed - was showing red/green dot near score
        // ctx.fillStyle = !soundDisabled() ? "#00FF00" : "#FF0000";
        // ctx.font = "bold 16px sans-serif";
        // ctx.fillText("s", 10, textBase);

        ctx.fillStyle = "#FFFF00";
        ctx.font      = "14px Calibri";
        ctx.fillText("Score: " + user.theScore(), 10, textBase);
        
        // Center the level text
        var levelText = "Level: " + level;
        var levelWidth = ctx.measureText(levelText).width;
        ctx.fillText(levelText, ((map.width * map.blockSize) - levelWidth) / 2, textBase);
    }

    function redrawBlock(pos) {
        map.drawBlock(Math.floor(pos.y/10), Math.floor(pos.x/10), ctx);
        map.drawBlock(Math.ceil(pos.y/10), Math.ceil(pos.x/10), ctx);
    }

    function mainDraw() { 

        var diff, u, i, len, nScore;
        
        ghostPos = [];

        for (i = 0, len = ghosts.length; i < len; i += 1) {
            ghostPos.push(ghosts[i].move(ctx));
        }
        u = user.move(ctx);
        
        for (i = 0, len = ghosts.length; i < len; i += 1) {
            redrawBlock(ghostPos[i].old);
        }
        redrawBlock(u.old);
        
        for (i = 0, len = ghosts.length; i < len; i += 1) {
            ghosts[i].draw(ctx);
        }                     
        user.draw(ctx);
        
        userPos = u["new"];
        
        for (i = 0, len = ghosts.length; i < len; i += 1) {
            if (collided(userPos, ghostPos[i]["new"])) {
                if (ghosts[i].isVunerable()) { 
                    audio.play("eatghost");
                    ghosts[i].eat();
                    eatenCount += 1;
                    totalGhostsEaten += 1; // Track total ghosts eaten across all pills
                    nScore = eatenCount * 50;
                    drawScore(nScore, ghostPos[i]);
                    user.addScore(nScore);                    
                    setState(EATEN_PAUSE);
                    timerStart = tick;
                
                    // Mid-roll interstitial removed
                } else if (ghosts[i].isDangerous()) {
                    audio.play("die");
                    setState(DYING);
                    timerStart = tick;
                }
            }
        }                             
    };

    function mainLoop() {

        var diff;
        
        // Check if any popup is open - if yes, pause game and sound
        try {
            var rewardModal = document.getElementById('rewardModal');
            var gameOverOverlay = document.getElementById('gameOverOverlay');
            var isPopupOpen = false;
            
            if (rewardModal && rewardModal.classList.contains('visible')) {
                isPopupOpen = true;
            }
            if (gameOverOverlay && gameOverOverlay.getAttribute('aria-hidden') === 'false') {
                isPopupOpen = true;
            }
            
            if (isPopupOpen && state !== PAUSE && state !== WAITING) {
                // Popup is open - pause game and sound
                if (state === PLAYING || state === COUNTDOWN) {
                    stored = state;
                    setState(PAUSE);
                    if (audio && typeof audio.pause === 'function') {
                        audio.pause();
                    }
                    // Also pause all audio elements directly
                    try {
                        var allAudio = document.querySelectorAll('audio');
                        for (var i = 0; i < allAudio.length; i++) {
                            if (allAudio[i] && !allAudio[i].paused) {
                                allAudio[i].pause();
                            }
                        }
                    } catch(e) {
                        // Ignore errors
                    }
                    console.log('Pacman: Game and audio paused because popup is open');
                }
            }
        } catch(e) {
            // Ignore errors in popup check
        }

        if (state !== PAUSE) { 
            ++tick;
        }

        map.drawPills(ctx);

        if (state === PLAYING) {
            mainDraw();
        } else if (state === WAITING) {
            // Always draw the map in WAITING state to prevent black screen
            // Redraw map when state changes or periodically (every 60 frames = 2 seconds)
            if (stateChanged || (tick % 60 === 0)) {
                if (stateChanged) {
                    stateChanged = false;
                }
                // Always redraw the full map to prevent black screen
                map.draw(ctx);
                // Check if it's game over (lives <= 0) or just waiting to start
                var isGameOver = false;
                var finalScore = 0;
                try {
                    if (user && typeof user.getLives === 'function') {
                        var lives = user.getLives();
                        isGameOver = (lives <= 0);
                        if (isGameOver && typeof user.theScore === 'function') {
                            finalScore = user.theScore();
                        }
                    }
                } catch(e) {}
                
                if (isGameOver) {
                    dialog("Game Over! Score: " + finalScore + ". Press START");
                } else {
                    var waitingMessage = "";
                    try {
                        if (typeof window !== "undefined" && window.isNextLevelPromptVisible) {
                            waitingMessage = window.nextLevelDialogText || "";
                        }
                    } catch (dialogErr) {}
                    if (waitingMessage) {
                        dialog(waitingMessage);
                    } else {
                        dialog("");
                    }
                }
            }
            // Always draw pills animation and footer to keep screen visible
            map.drawPills(ctx);
            drawFooter();
        } else if (state === EATEN_PAUSE && 
                   (tick - timerStart) > (Pacman.FPS / 3)) {
            map.draw(ctx);
            setState(PLAYING);
        } else if (state === DYING) {
            if (tick - timerStart > (Pacman.FPS * 2)) { 
                loseLife();
            } else { 
                redrawBlock(userPos);
                for (i = 0, len = ghosts.length; i < len; i += 1) {
                    redrawBlock(ghostPos[i].old);
                    ghostPos.push(ghosts[i].draw(ctx));
                }                                   
                user.drawDead(ctx, (tick - timerStart) / (Pacman.FPS * 2));
            }
        } else if (state === COUNTDOWN) {
            
            diff = 5 + Math.floor((timerStart - tick) / Pacman.FPS);
            
            if (diff === 0) {
                map.draw(ctx);
                setState(PLAYING); // This will fire gamePlaying event on......
            } else {
                if (diff !== lastTime) { 
                    lastTime = diff;
                    map.draw(ctx);
                    dialog("Starting in: " + diff);
                }
            }
        } 

        drawFooter();
    }

    function eatenPill() {
        audio.play("eatpill");
        timerStart = tick;
        eatenCount = 0;
        for (i = 0; i < ghosts.length; i += 1) {
            ghosts[i].makeEatable(ctx);
        }        
    };
    
    function completedLevel() {
        setState(WAITING);
        level += 1;
        map.draw(ctx);
        dialog("🎉 Congratulations! Level " + (level - 1) + " Complete!");

        // Cache ads immediately when level completes automatically (all dots eaten)
        // This is equivalent to "Next Level" button click in other games
        // BUT: Don't cache if we just got extra life from RV video (skip caching after RV)
        // Check multiple conditions to prevent caching after RV video
        try {
            // Clear skipGameCachingOnAdClose flag (only applies to Back-to-Home flow)
            if (window.skipGameCachingOnAdClose) {
                window.skipGameCachingOnAdClose = false;
                console.log("Pacman: Cleared skipGameCachingOnAdClose flag before next level prompt");
            }

            // Reset RV flags so the next button-triggered cache isn't blocked
            if (window.continuingFromRV || window.skipCachingAfterRV) {
                window.continuingFromRV = false;
                window.skipCachingAfterRV = false;
                console.log("Pacman: Reset RV flags on level complete - next level button will cache");
            }
        } catch (e) {
            console.log("Pacman: Error preparing next level flags", e);
        }
        
        // Start next level after a short celebration display
        setTimeout(function() {
            totalGhostsEaten = 0; // Reset ghost count for new level

            function startNextLevelNow() {
                // Recreate ghosts based on current level (Level 1 = 1 ghost, others = 4 ghosts)
                ghosts = [];
                var numGhosts = (level === 1) ? 1 : ghostSpecs.length;
                for (var i = 0; i < numGhosts; i += 1) {
                    var ghost = new Pacman.Ghost({"getTick":getTick, "getLevel": function() { return level; }}, map, ghostSpecs[i]);
                    ghosts.push(ghost);
                }
                map.reset();
                user.newLevel();
                map.draw(ctx);
                try {
                    if (user && typeof user.draw === "function" && ctx) {
                        user.draw(ctx);
                    }
                } catch (drawErr) {
                    console.log("Pacman: Error drawing user on next level start", drawErr);
                }
                drawFooter();
                if (typeof window !== "undefined") {
                    window.skipCountdownForNextLevel = true;
                    window.lastLevelStartScore = user ? user.theScore() : 0;
                }
                try {
                    if (typeof gameCacheAd === "function") {
                        gameCacheAd();
                        console.log("Pacman: Ads caching triggered on Start Next Level button");
                    }
                } catch (cacheErr) {
                    console.log("Pacman: Error caching ads when starting next level", cacheErr);
                }
                startLevel();
            }

            function showNextLevelPopup() {
                var nextLevelScore = (user && typeof user.theScore === 'function') ? user.theScore() : 0;
                var popupLevel = level;
                try {
                    if (typeof window !== "undefined") {
                        if (typeof window.pendingNextLevelLevel === "number") {
                            popupLevel = window.pendingNextLevelLevel;
                        }
                        if (typeof window.pendingNextLevelScore === "number") {
                            nextLevelScore = window.pendingNextLevelScore;
                        }
                        window.pendingNextLevelLevel = null;
                        window.pendingNextLevelScore = null;
                        window.nextLevelPopupPending = false;
                        window.nextLevelPopupCallback = null;
                    }
                } catch(popupErr) {
                    console.log("Pacman: Error reading pending next level data", popupErr);
                }
                
                if (typeof window.showNextLevelPrompt === 'function') {
                    window.showNextLevelPrompt({
                        level: popupLevel,
                        score: nextLevelScore,
                        onStart: function() {
                            if (typeof window.hideNextLevelPrompt === 'function') {
                                window.hideNextLevelPrompt();
                            }
                            startNextLevelNow();
                        }
                    });
                } else {
                    startNextLevelNow();
                }
            }

            var adReady = (typeof showAd === 'function') && window.isAdReady === true;
            if (adReady) {
                console.log("Pacman: Showing interstitial ad before next level popup");
                if (typeof window !== "undefined") {
                    window.nextLevelPopupPending = true;
                    window.nextLevelPopupCallback = showNextLevelPopup;
                    window.pendingNextLevelLevel = level;
                    window.pendingNextLevelScore = nextLevelScore;
                }
                try {
                    if (typeof window !== "undefined") {
                        window.skipPauseKeyOnNextAd = true;
                    }
                    showAd();
                } catch (showErr) {
                    console.log("Pacman: Failed to show ad before next level popup", showErr);
                    if (typeof window !== "undefined") {
                        window.skipPauseKeyOnNextAd = false;
                        window.nextLevelPopupPending = false;
                        window.nextLevelPopupCallback = null;
                        window.pendingNextLevelLevel = null;
                        window.pendingNextLevelScore = null;
                    }
                    showNextLevelPopup();
                }
            } else {
                showNextLevelPopup();
            }
        }, 300);
    };

    function keyPress(e) { 
        if (state !== WAITING && state !== PAUSE) { 
            e.preventDefault();
            e.stopPropagation();
        }
    };
    
    function init(wrapper, root) {
        
        var i, len, ghost,
            blockSize = wrapper.offsetWidth / 19,
            canvas    = document.createElement("canvas");
        
        canvas.setAttribute("width", (blockSize * 19) + "px");
        canvas.setAttribute("height", (blockSize * 22) + 30 + "px");

        wrapper.appendChild(canvas);

        ctx  = canvas.getContext('2d');

        audio = new Pacman.Audio({"soundDisabled":soundDisabled});
        map   = new Pacman.Map(blockSize);
        user  = new Pacman.User({ 
            "completedLevel" : completedLevel, 
            "eatenPill"      : eatenPill 
        }, map);

        // Create all ghosts initially (will be recreated based on level in startNewGame)
        for (i = 0, len = ghostSpecs.length; i < len; i += 1) {
            ghost = new Pacman.Ghost({"getTick":getTick, "getLevel": function() { return level; }}, map, ghostSpecs[i]);
            ghosts.push(ghost);
        }
        
        map.draw(ctx);
        dialog("Loading ...");

        var extension = Modernizr.audio.ogg ? 'ogg' : 'mp3';

        var audio_files = [
            ["start", root + "audio/opening_song." + extension],
            ["die", root + "audio/die." + extension],
            ["eatghost", root + "audio/eatghost." + extension],
            ["eatpill", root + "audio/eatpill." + extension],
            ["eating", root + "audio/eating.short." + extension],
            ["eating2", root + "audio/eating.short." + extension]
        ];

        load(audio_files, function() { loaded(); });
    };

    function load(arr, callback) { 
        
        if (arr.length === 0) { 
            callback();
        } else { 
            var x = arr.pop();
            audio.load(x[0], x[1], function() { load(arr, callback); });
        }
    };
        
    function loaded() {

        dialog("Press START button to play a new game");
        
        document.addEventListener("keydown", keyDown, true);
        document.addEventListener("keypress", keyPress, true); 
        
        // Listen for stopGame event to reset game to WAITING state
        window.addEventListener("stopGame", function() {
            console.log("Pacman: stopGame event received - resetting to WAITING state");
            setState(WAITING);
            level = 1;
            if (user) user.reset();
            if (map) {
                map.reset();
                map.draw(ctx);
            }
            // Stop all audio
            if (audio && typeof audio.pause === 'function') {
                audio.pause();
            }
        });
        
        // Listen for adClosed event to show game over popup after interstitial ad closes
        window.addEventListener("adClosed", function(event) {
            console.log("Pacman: adClosed event received", event.detail);
            try {
                var placement = event.detail ? event.detail.placement : null;
                var placementStr = placement ? String(placement) : "";
                console.log("Pacman: Ad placement:", placementStr, "pendingGameOverPopup:", window.pendingGameOverPopup);
                
                // Only handle interstitial ad close (not rewarded video)
                // Check for interstitial ad spot key "qm19ko74" (NOT "s8omi3we" which is rewarded video)
                var isInterstitial = placementStr && placementStr !== "s8omi3we" && 
                                    (placementStr.indexOf("qm19ko74") !== -1 || placementStr === "qm19ko74");
                
                if (isInterstitial) {
                    // Interstitial ad closed - post score now (only after showAds closes)
                    if (window.pendingPostScore !== undefined && window.pendingPostScore !== null) {
                        var scoreToPost = window.pendingPostScore;
                        window.pendingPostScore = null; // Clear after posting
                        postScore(scoreToPost);
                        console.log("Pacman: Score posted after interstitial ad closed:", scoreToPost);
                    }
                    
                    if (window.startNextLevelAfterAd) {
                        var nextLevelStartFn = window.startNextLevelAfterAd;
                        window.startNextLevelAfterAd = null;
                        window.skipPauseKeyOnNextAd = false;
                        console.log("Pacman: Running pending next level start after ad close");
                        try {
                            nextLevelStartFn();
                        } catch(nextLevelErr) {
                            console.log("Pacman: Error running next level start after ad close", nextLevelErr);
                        }
                    }
                    
                    if (window.nextLevelPopupCallback) {
                        var popupFn = window.nextLevelPopupCallback;
                        window.nextLevelPopupCallback = null;
                        window.nextLevelPopupPending = false;
                        console.log("Pacman: Showing pending next level popup after ad close");
                        try {
                            popupFn();
                        } catch(popupErr) {
                            console.log("Pacman: Error showing next level popup after ad close", popupErr);
                        }
                    }
                    
                    // Interstitial ad closed - ensure game over popup is visible immediately
                    if (window.pendingGameOverPopup) {
                        var popupData = window.pendingGameOverPopup;
                        console.log("Pacman: Interstitial ad closed, ensuring game over popup is visible with data:", popupData);
                        // Clear pending popup BEFORE showing to prevent duplicate calls
                        window.pendingGameOverPopup = null;
                        // Show popup immediately without delay
                        try {
                            if (window.showGameOverOverlay) {
                                window.showGameOverOverlay({
                                    score: popupData.score,
                                    level: popupData.level
                                });
                                console.log("Pacman: Game over popup ensured visible after interstitial ad closed");
                            } else {
                                console.log("Pacman: showGameOverOverlay function not available");
                            }
                        } catch(e) {
                            console.log("Pacman: Error showing game over overlay after ad close", e);
                        }
                    } else {
                        console.log("Pacman: No pendingGameOverPopup found, popup should already be visible");
                    }
                } else {
                    console.log("Pacman: Ad closed but not interstitial (placement:", placementStr, ")");
                }
            } catch(e) {
                console.log("Pacman: Error handling adClosed event", e);
            }
        });
        
        timer = window.setInterval(mainLoop, 1000 / Pacman.FPS);
    };
    
    // Reward function: Give extra life when rewarded ad is watched
    window.giveRewardExtraLife = function() {
        console.log("Pacman: Granting reward - Extra life!");
        
        // CRITICAL: Set flags IMMEDIATELY to prevent ANY caching after RV video
        // Set these flags BEFORE any other operations to ensure they're active
        window.skipCachingAfterRV = true;
        window.continuingFromRV = true;
        console.log("Pacman: Set skipCachingAfterRV and continuingFromRV flags to prevent caching after RV video");
        
        // Restore saved game state (score and level) for continuation
        if (window.savedGameState) {
            var savedState = window.savedGameState;
            if (savedState.score !== undefined && user && typeof user.addScore === 'function') {
                // Restore score by adding the difference
                var currentScore = user.theScore();
                var scoreDiff = savedState.score - currentScore;
                if (scoreDiff > 0) {
                    user.addScore(scoreDiff);
                    console.log("Pacman: Score restored to:", savedState.score);
                }
            }
            if (savedState.level !== undefined) {
                level = savedState.level;
                console.log("Pacman: Level restored to:", level);
            }
        }
        
        if (user && typeof user.addLife === 'function') {
            user.addLife();
            // Continue from same level - reset map for fresh start, but keep score and level
            if (map && typeof map.reset === 'function') {
                map.reset(); // Reset map for fresh start on same level
            }
            if (user && typeof user.newLevel === 'function') {
                user.newLevel(); // Reset user position but keep score
            }
            map.draw(ctx); // Redraw map
            
            // Ensure game over overlay is hidden (in case it was shown)
            try {
                if (window.hideGameOverOverlay) {
                    window.hideGameOverOverlay({hideHome: true});
                }
            } catch(e) {
                console.log("Pacman: Failed to hide game over overlay", e);
            }
            
            // Start level immediately - no delay, no game over popup
            // Don't cache ads when continuing from extra life (same level, already cached)
            // Pass a flag to prevent caching
            window.skipLevelCaching = true;
            startLevel(); // Continue playing from same level
            // Reset flag after startLevel is called
            setTimeout(function() {
                window.skipLevelCaching = false;
            }, 100);
            dialog("🎉 Extra Life! Continue playing!");
            
            // Clear saved state after continuation starts
            window.savedGameState = null;
            
            // Reset flags ONLY when next level actually starts (not on timeout)
            // Keep flags active until user completes the current level and moves to next level
            // This ensures no caching happens on the same level after RV video
            // Flags will be reset in completedLevel() when level actually completes
        }
    };
    
    return {
        "init" : init
    };
    
}());

/* Human readable keyCode index */
var KEY = {'BACKSPACE': 8, 'TAB': 9, 'NUM_PAD_CLEAR': 12, 'ENTER': 13, 'SHIFT': 16, 'CTRL': 17, 'ALT': 18, 'PAUSE': 19, 'CAPS_LOCK': 20, 'ESCAPE': 27, 'SPACEBAR': 32, 'PAGE_UP': 33, 'PAGE_DOWN': 34, 'END': 35, 'HOME': 36, 'ARROW_LEFT': 37, 'ARROW_UP': 38, 'ARROW_RIGHT': 39, 'ARROW_DOWN': 40, 'PRINT_SCREEN': 44, 'INSERT': 45, 'DELETE': 46, 'SEMICOLON': 59, 'WINDOWS_LEFT': 91, 'WINDOWS_RIGHT': 92, 'SELECT': 93, 'NUM_PAD_ASTERISK': 106, 'NUM_PAD_PLUS_SIGN': 107, 'NUM_PAD_HYPHEN-MINUS': 109, 'NUM_PAD_FULL_STOP': 110, 'NUM_PAD_SOLIDUS': 111, 'NUM_LOCK': 144, 'SCROLL_LOCK': 145, 'SEMICOLON': 186, 'EQUALS_SIGN': 187, 'COMMA': 188, 'HYPHEN-MINUS': 189, 'FULL_STOP': 190, 'SOLIDUS': 191, 'GRAVE_ACCENT': 192, 'LEFT_SQUARE_BRACKET': 219, 'REVERSE_SOLIDUS': 220, 'RIGHT_SQUARE_BRACKET': 221, 'APOSTROPHE': 222};

(function () {
	/* 0 - 9 */
	for (var i = 48; i <= 57; i++) {
        KEY['' + (i - 48)] = i;
	}
	/* A - Z */
	for (i = 65; i <= 90; i++) {
        KEY['' + String.fromCharCode(i)] = i;
	}
	/* NUM_PAD_0 - NUM_PAD_9 */
	for (i = 96; i <= 105; i++) {
        KEY['NUM_PAD_' + (i - 96)] = i;
	}
	/* F1 - F12 */
	for (i = 112; i <= 123; i++) {
        KEY['F' + (i - 112 + 1)] = i;
	}
})();

Pacman.WALL    = 0;
Pacman.BISCUIT = 1;
Pacman.EMPTY   = 2;
Pacman.BLOCK   = 3;
Pacman.PILL    = 4;

Pacman.MAP = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
	[0, 4, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 4, 0],
	[0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
	[0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
	[0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0],
	[0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0],
	[0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
	[2, 2, 2, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 2, 2, 2],
	[0, 0, 0, 0, 1, 0, 1, 0, 0, 3, 0, 0, 1, 0, 1, 0, 0, 0, 0],
	[2, 2, 2, 2, 1, 1, 1, 0, 3, 3, 3, 0, 1, 1, 1, 2, 2, 2, 2],
	[0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
	[2, 2, 2, 0, 1, 0, 1, 1, 1, 2, 1, 1, 1, 0, 1, 0, 2, 2, 2],
	[0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
	[0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
	[0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
	[0, 4, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 4, 0],
	[0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0],
	[0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0],
	[0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
	[0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

Pacman.WALLS = [
    
    [{"move": [0, 9.5]}, {"line": [3, 9.5]},
     {"curve": [3.5, 9.5, 3.5, 9]}, {"line": [3.5, 8]},
     {"curve": [3.5, 7.5, 3, 7.5]}, {"line": [1, 7.5]},
     {"curve": [0.5, 7.5, 0.5, 7]}, {"line": [0.5, 1]},
     {"curve": [0.5, 0.5, 1, 0.5]}, {"line": [9, 0.5]},
     {"curve": [9.5, 0.5, 9.5, 1]}, {"line": [9.5, 3.5]}],

    [{"move": [9.5, 1]},
     {"curve": [9.5, 0.5, 10, 0.5]}, {"line": [18, 0.5]},
     {"curve": [18.5, 0.5, 18.5, 1]}, {"line": [18.5, 7]},
     {"curve": [18.5, 7.5, 18, 7.5]}, {"line": [16, 7.5]},
     {"curve": [15.5, 7.5, 15.5, 8]}, {"line": [15.5, 9]},
     {"curve": [15.5, 9.5, 16, 9.5]}, {"line": [19, 9.5]}],

    [{"move": [2.5, 5.5]}, {"line": [3.5, 5.5]}],

    [{"move": [3, 2.5]},
     {"curve": [3.5, 2.5, 3.5, 3]},
     {"curve": [3.5, 3.5, 3, 3.5]},
     {"curve": [2.5, 3.5, 2.5, 3]},
     {"curve": [2.5, 2.5, 3, 2.5]}],

    [{"move": [15.5, 5.5]}, {"line": [16.5, 5.5]}],

    [{"move": [16, 2.5]}, {"curve": [16.5, 2.5, 16.5, 3]},
     {"curve": [16.5, 3.5, 16, 3.5]}, {"curve": [15.5, 3.5, 15.5, 3]},
     {"curve": [15.5, 2.5, 16, 2.5]}],

    [{"move": [6, 2.5]}, {"line": [7, 2.5]}, {"curve": [7.5, 2.5, 7.5, 3]},
     {"curve": [7.5, 3.5, 7, 3.5]}, {"line": [6, 3.5]},
     {"curve": [5.5, 3.5, 5.5, 3]}, {"curve": [5.5, 2.5, 6, 2.5]}],

    [{"move": [12, 2.5]}, {"line": [13, 2.5]}, {"curve": [13.5, 2.5, 13.5, 3]},
     {"curve": [13.5, 3.5, 13, 3.5]}, {"line": [12, 3.5]},
     {"curve": [11.5, 3.5, 11.5, 3]}, {"curve": [11.5, 2.5, 12, 2.5]}],

    [{"move": [7.5, 5.5]}, {"line": [9, 5.5]}, {"curve": [9.5, 5.5, 9.5, 6]},
     {"line": [9.5, 7.5]}],
    [{"move": [9.5, 6]}, {"curve": [9.5, 5.5, 10.5, 5.5]},
     {"line": [11.5, 5.5]}],


    [{"move": [5.5, 5.5]}, {"line": [5.5, 7]}, {"curve": [5.5, 7.5, 6, 7.5]},
     {"line": [7.5, 7.5]}],
    [{"move": [6, 7.5]}, {"curve": [5.5, 7.5, 5.5, 8]}, {"line": [5.5, 9.5]}],

    [{"move": [13.5, 5.5]}, {"line": [13.5, 7]},
     {"curve": [13.5, 7.5, 13, 7.5]}, {"line": [11.5, 7.5]}],
    [{"move": [13, 7.5]}, {"curve": [13.5, 7.5, 13.5, 8]},
     {"line": [13.5, 9.5]}],

    [{"move": [0, 11.5]}, {"line": [3, 11.5]}, {"curve": [3.5, 11.5, 3.5, 12]},
     {"line": [3.5, 13]}, {"curve": [3.5, 13.5, 3, 13.5]}, {"line": [1, 13.5]},
     {"curve": [0.5, 13.5, 0.5, 14]}, {"line": [0.5, 17]},
     {"curve": [0.5, 17.5, 1, 17.5]}, {"line": [1.5, 17.5]}],
    [{"move": [1, 17.5]}, {"curve": [0.5, 17.5, 0.5, 18]}, {"line": [0.5, 21]},
     {"curve": [0.5, 21.5, 1, 21.5]}, {"line": [18, 21.5]},
     {"curve": [18.5, 21.5, 18.5, 21]}, {"line": [18.5, 18]},
     {"curve": [18.5, 17.5, 18, 17.5]}, {"line": [17.5, 17.5]}],
    [{"move": [18, 17.5]}, {"curve": [18.5, 17.5, 18.5, 17]},
     {"line": [18.5, 14]}, {"curve": [18.5, 13.5, 18, 13.5]},
     {"line": [16, 13.5]}, {"curve": [15.5, 13.5, 15.5, 13]},
     {"line": [15.5, 12]}, {"curve": [15.5, 11.5, 16, 11.5]},
     {"line": [19, 11.5]}],

    [{"move": [5.5, 11.5]}, {"line": [5.5, 13.5]}],
    [{"move": [13.5, 11.5]}, {"line": [13.5, 13.5]}],

    [{"move": [2.5, 15.5]}, {"line": [3, 15.5]},
     {"curve": [3.5, 15.5, 3.5, 16]}, {"line": [3.5, 17.5]}],
    [{"move": [16.5, 15.5]}, {"line": [16, 15.5]},
     {"curve": [15.5, 15.5, 15.5, 16]}, {"line": [15.5, 17.5]}],

    [{"move": [5.5, 15.5]}, {"line": [7.5, 15.5]}],
    [{"move": [11.5, 15.5]}, {"line": [13.5, 15.5]}],
    
    [{"move": [2.5, 19.5]}, {"line": [5, 19.5]},
     {"curve": [5.5, 19.5, 5.5, 19]}, {"line": [5.5, 17.5]}],
    [{"move": [5.5, 19]}, {"curve": [5.5, 19.5, 6, 19.5]},
     {"line": [7.5, 19.5]}],

    [{"move": [11.5, 19.5]}, {"line": [13, 19.5]},
     {"curve": [13.5, 19.5, 13.5, 19]}, {"line": [13.5, 17.5]}],
    [{"move": [13.5, 19]}, {"curve": [13.5, 19.5, 14, 19.5]},
     {"line": [16.5, 19.5]}],

    [{"move": [7.5, 13.5]}, {"line": [9, 13.5]},
     {"curve": [9.5, 13.5, 9.5, 14]}, {"line": [9.5, 15.5]}],
    [{"move": [9.5, 14]}, {"curve": [9.5, 13.5, 10, 13.5]},
     {"line": [11.5, 13.5]}],

    [{"move": [7.5, 17.5]}, {"line": [9, 17.5]},
     {"curve": [9.5, 17.5, 9.5, 18]}, {"line": [9.5, 19.5]}],
    [{"move": [9.5, 18]}, {"curve": [9.5, 17.5, 10, 17.5]},
     {"line": [11.5, 17.5]}],

    [{"move": [8.5, 9.5]}, {"line": [8, 9.5]}, {"curve": [7.5, 9.5, 7.5, 10]},
     {"line": [7.5, 11]}, {"curve": [7.5, 11.5, 8, 11.5]},
     {"line": [11, 11.5]}, {"curve": [11.5, 11.5, 11.5, 11]},
     {"line": [11.5, 10]}, {"curve": [11.5, 9.5, 11, 9.5]},
     {"line": [10.5, 9.5]}]
];

Object.prototype.clone = function () {
    var i, newObj = (this instanceof Array) ? [] : {};
    for (i in this) {
        if (i === 'clone') {
            continue;
        }
        if (this[i] && typeof this[i] === "object") {
            newObj[i] = this[i].clone();
        } else {
            newObj[i] = this[i];
        }
    }
    return newObj;
};

$(function(){
  var el = document.getElementById("pacman");

  // JioGames SDK Integration - Initialize
  console.log("Pacman: Initializing JioGames SDK...");
  
  // Note: getUserProfile and loadBanner are called from index.html on page load
  // No need to call here to avoid duplicate calls

  if (Modernizr.canvas && Modernizr.localstorage && 
      Modernizr.audio && (Modernizr.audio.ogg || Modernizr.audio.mp3)) {
    window.setTimeout(function () { PACMAN.init(el, "https://raw.githubusercontent.com/daleharvey/pacman/master/"); }, 0);
  } else { 
    el.innerHTML = "Sorry, needs a decent browser<br /><small>" + 
      "(firefox 3.6+, Chrome 4+, Opera 10+ and Safari 4+)</small>";
  }
});

