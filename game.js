kaboom({
    global : true,
    fullscreen : true,
    scale : 1.5,
    debug : true,
    clearColor : [0, 0, 1, 1]
});

const MOVE_SPEED = 120
const JUMP_FORCE = 360
const BIG_JUMP_FORCE = 550
let JUMP_NUMBER = 0
const CURRENT_JUMP_FORCE = JUMP_FORCE
let isJumping = true
const FALL_DEATH = 400

loadSprite('marioLeft', 'https://i.ibb.co/ckRHtJT/left.png')
loadRoot('https://i.imgur.com/')
loadSprite('coin', 'wbKxhcd.png')
loadSprite('evil-shroom', 'KPO3fR9.png')
loadSprite('brick', 'pogC9x5.png')
loadSprite('block', 'M6rwarW.png')
loadSprite('marioRight', 'Wb1qfhK.png')
loadSprite('mushroom', '0wMd92p.png')
loadSprite('surprise', 'gesQ1KP.png')
loadSprite('unboxed', 'bdrLpi6.png')
loadSprite('pipe-top-left', 'ReTPiWY.png')
loadSprite('pipe-top-right', 'hj2GK4n.png')
loadSprite('pipe-bottom-left', 'c1cYSbt.png')
loadSprite('pipe-bottom-right', 'nqQ79eI.png')
loadSprite('blue-block', 'fVscIbn.png')
loadSprite('blue-brick', '3e5YRQd.png')
loadSprite('blue-steel', 'gqVoI2b.png')
loadSprite('blue-evil-shroom', 'SvV4ueD.png')
loadSprite('blue-surprise', 'RMqCc1G.png')

scene('game', ({ level, score }) => {
    layers(['bg', 'obj', 'ui'], 'obj')

    const maps = [
        [
            '                                        ',
            '                                        ',
            '                                        ', 
            '                                        ',
            '     %   =*=%                           ',
            '                          -+            ',
            '                   ^  ^   ()            ',
            '==============================    ======',
        ],
        [
            's                                      s',
            's                                      s',
            's                                      s',
            's                                      s',
            's                                      s',
            's                                      s',
            's                                      s',
            's       x                              s',
            's                                      s',
            's      !!!!                            s',
            's                 *                    s',
            's                                      s',
            's                !!!!!                 s',
            's      @@@@@@    x                     s',
            's                         -+           s',
            's                  z  z   ()           s',
            '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
        ],
        [
            '                                        ',
            '                                        ',
            '                                        ', 
            '                                        ',
            '     %   =*=%                           ',
            '                                     -+     ',
            '                   ^  ^         ==== () ',
            '   ====   =====================    =====',
            's                                      s',
            's                                      s',
            '                                        ',
            '        ===                   ====      ',
            '                  ======                ',
            '                                        ',
            '             ======                     ', 
            '                                        ',
            '     %   =*=%                           ',
            '                                        ',
            '                   ^  ^                 ',
            '==============================    ======',
        ]
    ]

    const levelCfg = {
        width : 20,
        height : 20,
        '=' : [sprite('block'), solid()],
        '$' : [sprite('coin'), 'coin'],
        '%' : [sprite('surprise'), solid(), 'coin-surprise'],
        '*' : [sprite('surprise'), solid(), 'mushroom-surprise'],
        '}' : [sprite('unboxed'), solid()],
        '(' : [sprite('pipe-bottom-left'), solid(), scale(0.5)],
        ')' : [sprite('pipe-bottom-right'), solid(), scale(0.5)],
        '-' : [sprite('pipe-top-left'), solid(), scale(0.5), 'pipe'],
        '+' : [sprite('pipe-top-right'), solid(), scale(0.5), 'pipe'],
        '^' : [sprite('evil-shroom'), solid(), body(), 'dangerous'],
        '#' : [sprite('mushroom'), solid(), 'mushroom', body()],

        //LEVEL 2
        '!' : [sprite('blue-block'), solid(), scale(0.5)],
        '@' : [sprite('blue-brick'), solid(), scale(0.5)],
        'z' : [sprite('blue-evil-shroom'), solid(), scale(0.5), body(), 'dangerous'],
        'x' : [sprite('blue-surprise'), solid(), scale(0.5), 'coin-surprise'],
        's' : [sprite('blue-steel'), solid(), scale(0.5)]
    }

    const gameLevel = addLevel(maps[level], levelCfg)

    const scoreLable = add([
        text(score),
        pos(30, 6),
        layer('ui'),
        {
            value : score,
        }
    ])

    add([text('level ' + parseInt(level + 1)), pos(40,6)])

    function big(){
        timer = 0
        isBig = false
        return {
            update() {
                if (isBig) {
                    CURRENT_JUMP_FORCE = BIG_JUMP_FORCE
                    timer -= dt()
                    if (timer <= 0){
                        this.smallify()
                    }
                }
            },
            isBig() {
                return isBig
            },
            smallify() {
                this.scale = vec2(1)
                CURRENT_JUMP_FORCE = JUMP_FORCE
                timer = 0
                this.isBig = false
            },
            biggify() {
                this.scale = vec2(2)
                timer = time
                this.isBig = true
            }
        }
    }

    let player = add([
        sprite('marioRight'), solid(),
        pos(30,-100),
        body(),
        big(),
        origin('bot')
    ])

    action('mushroom', m => {
        m.move(10, 0)
    })

    function headThumbChange(obj, target, first, second) {
        if (obj.is(target)) {
            gameLevel.spawn(first, obj.gridPos.sub(0, 1))
            destroy(obj)
            gameLevel.spawn(second, obj.gridPos.sub(0, 0))
        }
    }

    player.on('headbump', obj => {
        headThumbChange(obj, 'coin-surprise', '$', '}')
        headThumbChange(obj, 'mushroom-surprise', '#', '}')
    })

    player.collides('mushroom', m => {
        destroy(m)
        player.biggify(6)
    })

    player.collides('coin', c => {
        destroy(c)
        scoreLable.value++
        scoreLable.text = scoreLable.value
    })

    const ENEMY_SPEED = 20

    action('dangerous', d => {
        d.move(-ENEMY_SPEED, 0)
    })

    player.collides('dangerous', d => {
        if (isJumping){
            destroy(d)
        }else{
            go('lose', { score : scoreLable.value})
        }
    })

    player.action(() => {
        console.log({
            x : player.pos.x - 200,
            y : player.pos.y - 200
        });
        camPos({
            x : player.pos.x + 200,
            y : player.pos.y - 100
        })
        if (player.pos.y >= FALL_DEATH){
            go('lose', {score : scoreLable.value})
        }
    })

    player.collides('pipe', () => {
        keyPress('enter', () => {
            go ('game', {
                level : (level + 1) % maps.length,
                score : 0
            })
        })
    })

    keyDown('left', () => {
        player.changeSprite('marioLeft')
        player.move(-MOVE_SPEED, 0)
    })

    keyDown('right', () => {
        player.changeSprite('marioRight')
        player.move(MOVE_SPEED, 0)
    })

    player.action(() => {
        if (player.grounded()){
            isJumping = false
            JUMP_NUMBER = 0
        }
    })

    keyPress('space', () => {
        if (player.grounded && JUMP_NUMBER < 2){
            isJumping = true
            JUMP_NUMBER++
            player.jump(CURRENT_JUMP_FORCE)
        }
    })
})

scene('lose', ({ score }) => {
    add( [text(score, 32), origin('center'), pos(width()/2, height()/2  )])
    add( [text('Press enter to restart'), pos(width()/2 - 90, height()/2 + 100)])
    keyPress('enter', () => {
        go('game', { level : 0, score : 0})
    })
})

start('game', { level : 0, score : 0 });