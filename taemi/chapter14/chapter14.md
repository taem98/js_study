# chapter 14 비동기적 프로그래밍

> 자바스크립트 어플리케이션은 단일 스레드에서 동작한다.
> = 자바스크립트는 한 번에 한 가지 일만 할 수 있다.

- 세 가지 패러다임
    1. 콜백
    2. 프라미스
        - 콜백에 의존
    3. 제너레이터
        - 자체로 비동기적 프로그래밍 지원 안 함
        - 프라미스나 특수한 콜백과 함께 사용

- 사용자 입력 외에, 비동기적 테크닉을 사용해야 하는 경우
    1. Ajax 호출을 비롯한 네트워크 요청
    2. 파일을 읽고 쓰는 등의 파일시스템 작업
    3. 의도적인 시간 지연을 사용하는 기능(알람 등)

## 14.1 비유

- 콜백
    - 사용자와 제공자 어느쪽도 기다리지 않는다.
    - 음식점에서 자리가 나면 음식점 사장님은 미리 받아놓은 당신의 전화번호로 연락을 한다.
    - 자리가 나면 음식점이 안다.
- 프라미스
    - 자리가 나면 사용자의 진동벨이 울린다.
    - 자리가 나면 사용자가 안다.

## 14.2 콜백

> 나중에 호출할 함수

- 보통 익명함수로 사용한다.

```js
//setTimeout을 사용하는 단순예제로 시작해보자.

console.log("Before timeout:" + new Date());
function f(){
    console.log("After timeout:" + new Date());
}
setTimeout(f, 60*1000); //1분
console.log("I happen after setTimeout!");
console.log("Me too!");
```
```js
// 결과

//Before timeout:Thu Jul 18 2019 00:37:37 GMT+0900 (GMT+09:00)
//I happen after setTimeout!
//Me too!
//After timeout:Thu Jul 18 2019 00:38:37 GMT+0900 (GMT+09:00)
```
- 예상대로 움직이지 않는다.
- 비동기적 실행의 가장 큰 목적, 사장 중요한 요점
    - **어떤 것도 차단하지 않는다.**


```js
// 익명함수로 쓴다면?

setTimeout(function(){
    console.log("After timeout: " + new Date());
}, 60*1000);
```
`setTimeout`을 사용할 때 지연 시간을 정하는 숫자 매개변수가 마지막에 있으니, 잊어버리거나 착각하지 말아야 한다.

### 14.2.1 setInterval과 clearInterval

- `setTimeout`
    - 콜백 함수를 한 번 실행하고 멈춤
- `setInterval`
    - 콜백 함수가 정해진 주기마다 호출
    - `clearInterval` 사용 전까지 멈추지 않음

```js
// 분이 넘어가거나 10회째가 될 때까지 5초마다 콜백 실행

const start = new Date();
let i = 0;
const intervalId = setInterval(function(){
    let now = new Date();
    if(now.getMinutes() !== start.getMinutes() || ++i>10)
        return clearInterval(intervalId);
    console.log(`${i} : ${now}`);
}, 5*1000);

```
`clearInterval` 은 `setInterval`이 반환하는 ID를 받아 타음아웃을 멈춘다.

### 14.2.2 스코프와 비동기적 실행

> 스코프와 클로저가 비동기적 실행에 미치는 영향 때문에 에러가 자주난다.

- 함수 호출
    - 클로저 생성
    - 함수 내부 변수는 계속 존재

```js
// countdown 예제
function countdown(){
    let i;
    console.log("Countdown:");
    for(i =5; i >=0; i--){
        setTimeout(function(){
            console.log(i === 0 ? "GO!": i);
        }, (5-i)*1000);
    }
}
countdown();
```
- `setTimeout`  : 동기적
- `setTimeout` 안에 있는 함수 : 비동기적

<hr>

- 위 문제의 해결 방법
    - IIFE 함수 표현식
    - i를 for루프 선언부에서 선언하기

```js
function countdown(){
    console.log("Countdown:");
    for(let i =5; i >=0; i--){      // i 는 for 문 안에만 있다.
        setTimeout(function(){
            console.log(i===0? "GO!":i);
        }, (5-i)*1000);
    }
}
countdown();
```

- 콜백은 어느 스코프에서 선언이 됐느냐가 중요
    - 자신을 선언한 스코프(클로저)에 있는 것에 접근 가능
    - 따라서 콜백이 실제 실행되는 순간마다 i의 값이 다를 수 있음

### 14.2.3 오류 우선 콜백
> 콜백을 하면 예외처리가 어려우므로 콜백과 관련한 에러를 처리할 표준 방법

**콜백 함수 첫 번째 매개변수에 에러 객체를 쓰자**
- 에러를 체크하고 그에 맞게 반응할 수 있도록

```js
const fs = require('fs');

const fname = 'may_or_may_not_exist.txt';
fs.readFile(jname, function(err,data){      // 매개 변수 넘겨줌
    if(err) return console.error(`error reading file ${fname}: ${err.message}`);
    console.log(`${fname} contents: ${data}`);
})
```
- 콜백이 가장 먼저 하는 일은 err가 참 같은 값인지 확인하는 것
    - err: 참 같은 값
        - 오류 보고 후 즉시 빠져나옴
    - 흔히 하는 실수
        - 에러 체크, 로그 남기기 후 빠져나와야 한다는 사실을 잊는 것
<br>

- 프라미스를 사용하지 않으면 오류우선 콜백은 노드 개발의 표준이나 다름 없음
- 콜백을 사용하는 인터페이스를 만들 때는 오류 우선 콜백 사용 권장

### 14.2.4 콜백 헬

> 한 번에 여러가지를 기다려야 한다면 콜백함수를 다루기가 어렵다.

```js
// 노드 앱을 만드는 예시
// 세 가지 파일의 컨텐츠를 읽고, 
// 60초가 지난 후에 이들을 결함해 네 번째 파일에 기록

const fs = require('fs');

fs.readFile('a.txt', function(err, dataA){
    if(err) console.error(err);
    fs.readFile('b.txt', function(err,dataB){
        if(err) console.error(err);
        fs.readFile('c.txt', function(err, dataC){
            if(err) console.error(err);
            setTimeout(finction(){
                fs.writeFile('d.txt', dataA + dataB + dataC, function(err){
                    if(err) console.error(err);
                });
            }, 60*1000);
        });
    });
});
```
- 이런 코드를 콜백 헬이라고 부른다.

```js
const fs = require('fs');
function readSketchyFile(){
    try{
        fs.readFile('dose_not_exist.txt', function(err.data){
            if(err) throw err;
        });
    } catch(err){
        console.log('warning : minor issue occurred, program continuing');
    }
}
readSketchyFile();
```
- 타당해 보이는 코드
    - 예상되는 에러가 문제를 일으키지 않도록 했는데 프로그램 멈춤
    - try...catch 블록은 같은 함수 안에서만 동작하기 떄문

> 비동기적 코드가 늘어나면 버그가 없고 관리하기 쉬운 코드를 작성하기는 매우 어렵다.

## 14.3 프라미스

> 그래서 나온 것이 프라미스
> 콜백함수의 단점을 해결하려는 시도 속에서 만들어졌다.

- 번거롭지만 안전하고 관리하기 쉬운 코드
- 콜백함수의 대체는 아니다.
    - 프라미스도 콜백함수를 사용함

<br>

- 기본 개념
    1. 프라미스 기반 비동기적 함수 호출
    2. Promise 인스턴스 반환
    3. 프라미스 결정
        - 프라미스는 성공 or 실패 두가지

- 프라미스 장점
    - 객체이다
        - 어디든 전달 가능

### 14.3.1 프라미스 만들기
> resolve와 reject 콜백이 있는 함수로 새 Promise 인스턴스를 만들기 

```js
// countdown함수 고쳐보기

function countdown(seconds){
    return new Promise(function(resolve, reject){
        for(let i=seconds; i >=0; i--){
            setTimeout(function(){
                if(i>0) console.log(i + '...');
                else resolve(console.log("GO!"));
            }, (seconds-i)*1000);
        }
    });
}
```

### 14.3.2 프라미스 사용

```js
// 반환된 프라미스를 사용하는 예제

countdown(5).then(  
    function(){
        console.log("countdown conpleted successfully");
    },
    function(err){
        console.log("countdown experienced an error: " + err.message);
    }
);

```
- 반환된 프라미스를 변수에 할당하지 않고 then 핸들러를 바로 호출
- then 핸들러는 성공 콜백과 에러 콜백을 받는다.
- 프라미스는 catch핸들러도 지원
    - 핸들러를 둘로 나눠써도 괜찮다.

```js
const p = countdown(5);
p.then(function(){
    console.log("countdown conpleted succressfully");
});
p.catch(function(err){
    console.log("countdown experienced an error: " + err.message);
});

```
```js
// countdown 함수를 수정해서 에러가 나게 해보자
// 수 13에서 에러나게 하기

function countdown(seconds){
    return new Promise(function(resolve, reject){
        for(let i = seconds; i>=0; i--){
            setTimeout(function(){
                if(i===13) return reject(new Error("Oh my God"));
                if(i>0) console.log(i + '...');
                else resolve(console.log("GO!"));
            }, (secnods-i)*1000);
        }
    });
}
```
- reject나 resolve들은 함수를 멈추지 않는다.
    - 프라미스의 상태를 관리할 뿐
- countdown 함수의 고칠점
    - 실패 후에도 계속 진행하는 것
- 프라미스의 특징
    - 완성, 실패 두가지 뿐이지 진행상황은 알 수 없다.

### 14.3.3 이벤트

> 이벤트가 일어나면 이벤트 발생을 담당하는 개체에서 이벤트가 일어났음을 알린다.

- 필요한 이벤트는 모두 주시 가능
    - 콜백을 이용
    - `EventEmitter` 노트에 내장되어 있는 이벤트 모듈
        - `EventEmitter`는 함수와 사용해도 되지만 원래 클래스로 이용하도록 설계되어 있음

```js

const EventEmitter = require('events').EventEmitter;

class Countdown extends EventEmitter {
    constructor(seconds, superstitious){
        super();
        this.seconds = seconds;
        this.superstitious = !!superstitious;
    }
    go(){
        const countdown = this;
        return new Promise(function(resolve, reject){
            for(let i =countdown.seconds; i >=0; i--){
                setTimeout(function(){
                    if(countdown.superstitious && i ===13)
                        return reject(new Error("Oh my god"));
                    countdown.emit('tick',i);
                    if(i ===0) resolve();
                }, (countdown.seconds-i)*1000);
            }
        });
    }
}
```
```js
//사용하기

const c = new Countdown(5);

c.on('tick', function(i){   // 이벤트를 주시하는 부분
    if(i > 0) console.log(i + '...');
});

c.go()
    .then(function(){
        console.log('GO!');
    })
    .catch(function(err){
            console.error(err.message);
    })
```
- 이제 카운트다운을 어떻게 활용할지 마음대로 바꿀 수 있음
- 카운트다운이 끝났을 때 완료되는 프라미스도 생김

<br>
- 하지만 아직
    - Countdown 인스턴스가 13에 도착했는데도 카운트다운이 계속 진행

```js
const c = new Countdown(15,true)
    .on('tick', function(i){
        if(i>0) console.log(i + '...');
    });

c.go()
    .then(function(){
        console.log('GO!');
    })
    .catch(function(err){
        console.error(err.message);
    })
```
- 여전히 모든 카운트가 출력
    - 타임아웃이 이미 모두 만들어졌기 
        - 해결 : 사실을 아는 즉시 대기중인 타임아웃을 모두 취소
```js
const EventEmitter = require('events').EventEmitter;

class Countdown extends EventEmitter{
    constructor(seconds, superstitious){
        super();
        this.seconds = seconds;
        this.superstitious = !!superstitious;
    }
    go(){
        const countdown = this;
        const timeoutIds = [];
        return new Promise(function(resolve, reject){
            for(let i = countdown.seconds; i >=0; i--){
                timeoutIds.push(setTimeout(function(){
                    if(countdown.superstitious && i ===13){
                        //대기중인 타임아웃을 모두 취소합니다.
                        timeoutIds.forEach(clearTimeout);
                        return reject(new Error("Oh my god"));
                    }
                    countdown.emit('tick', i);
                    if(i===0) resolve();
                }, (countdown.seconds-i)*1000));
            }
        });
    }
}
```

### 14.3.4 프라미스 체인

> 프라미스가 완료되면 다른 프라미스를 반환하는 함수를 즉시 호출

```js
//launch 함수를 만들어 카운트다운이 끝나면 실행되게 만들자

function launch(){
    return new Promise(function(resolve, reject){
        console.log("Lift off!");
        setTImeout(function(){
            resolve("In orbit!");
        }, 2*1000);
    });
}
```
이 함수를 카운트 다운 함수에 쉽게 묶을 수 있다.
```js
const c = new Countdown(5)
    .on('tick',i => console.log(i + '...'));

c.go()
    .then(launch)
    .then(function(msg){
        console.log(msg);
    })
    .catch(function(err){
        console.error("Houston, we have a problem...");;
    })
```
- 프라미스 체인을 사용하면 체인 어디서든 에러가 생기면 체인 전체가 멈추고 catch 핸들러가 동작한다.

### 14.3.5 결정되지 않는 프라미스 방지하기

> 프라미스에 타임아웃 걸기

- launch 함수에 에러 조건을 넣어보자

```js
// 열 번에 다섯 번은 실패하는 로켓

function launch(){
    return new Promise(function(resolve, reject){
        if(Math.random()<0.5) return;   // 문제가...
        console.log("Lift off!");
        setTimeout(function(){
            resolve("In orbit!");
        }, 2*1000);
    });
}
```
- 코드의 문제
    - reject 호출 안 함
    - 콘솔에 기록도 안 함

```js
//프라미스에 타임아웃을 거는 함수

function addTimeout(fn, timeout){
    if(timeout === undefined) timeout = 1000;
    return function(...args){
        return new Promise(function(resolve, reject){
        const tid = setTImeout(refuect, timeout,
            new Error("promise timed out"));
        fn(...args)
            .then(function(...arg){
                clearTimeout(tid);
                resolve(...args);
            })
            .catch(function(...args){
                clearTimeout(tid);
                reject(...args);
            });
        })
    }
}
```
```js
c.go()
    .then(addTimeout(launch, 11*1000))
    .then(function(msg){
        console.log(msg);
    })
    .catch(function(err){
        console.err("Houston, we have a problem : " + err.message);
    });
```
- 이제 launch 함수에 문제가 있더라도 프라미스 체인은 항상 결정됨

## 14.4 제너레이터

> 원래는 동기적인 성격, 하지만 프라미스와 결합하면 비동기 코드를 효율적으로 관리 가능

- 파일 세 개를 읽고 1분간 기다린 다음 그 내용을 합쳐 네 번째 파일에 쓰는 문제를 다시 보자

```js
//일반적으로 하려고 하는 방식

dataA = read contents of 'a.txt'
dataB = read contents of 'b.txt'
dataC = read contents of 'c.txt'
wait 60 seconds
write dataA + dataB + dataC to 'd.txt'
```

- 제너레이터를 사용하면 비슷한 방식으로 만들 수 있다.
    - 먼저, 노드의 오류 우선 콜백을 프라미스로 바꾸는 일
    - 이 기능을 nfcall (Node function call) 함수로 만든다
```js
function nfcall(f, ...args){
    return new Promise(function(resolve, reject){
    f.call(null, ...args, function(err,...args){
        if(err) return reject(err);
        resolve(args.length<2? args[0]: args);
        });
    });
}
```
- 이제 콜백 받는 노드 스타일 메서드를 모두 프라미스로 바꿀 수 있다.
- setTimeout을 대신핳여 ptimeout(promise timeout)함수를 새로 쓴다.
    - 오류 우선 콜백의 패터을 따르지 않아서

```js
function ptimeout(delay){
    return new Promise(function(resolve, reject){
        setTimeout(resolve, delay);
    });
}
```
- 다음으로 필요한 건 제너레이터 실행기
    - 제너레이터는 원래 동기적이지만, 특성상 통신을 관리하고 비동기적 호출을 처리하는 함수를 만들 수 있다.
    - 이러한 역할을 할 함수 **grun(generator run)** 만들기

```js
function grun(g){
    const it = g();
    (function iterate(val){
        const x = it.next(val);
        if(!x.done){
            if(x.value instanceof Promise){
                x.value.then(iterate).catch(err => it.throw(err));
            }else {

                setTimeout(iterate, 0, x.value);
            }
        }
    })();
}
```
- grun은 기초적인 제너레이터 재귀 실행기

```js
//이제 일반적인 사람들이 생각하는 코드로 짤 수 있다.

function* theFutureIsNow(){
    const dataA = yield nfcall(fs.readFile, 'a.txt');
    const dataB = yield nfcall(fs.readFile, 'b.txt');
    const dataC = yield nfcall(fs.readFile, 'c.txt');
    yield ptimeout(60*1000);
    yield nfcall(fs.writeFile, 'd.txt', dataA + dataB+ dataC);
}

grun(theFutureIsNow);

```
- 콜백 헬보다 훨씬 쉽다
- 프라미스 하나만 쓸 때보다 더 단순하다
- 사람이 생각하는 것과 비슷하다.
- 실행 역시 간단하다.

### 14.4.1 1보 전진과 2보 후퇴?

```js
function* theFutureISNow(){
    const data = yield Promise.all([
        nfcall(fs.readFile, 'a.txt'),
        nfcall(fs.readFile, 'b.txt'),
        nfcall(fs.readFile, 'c.txt'),
    ]);
    yield ptimeout(60*1000);
    yield nfcall(fs.writeFile, 'd.txt', data[0]+data[1]+data[2]);
}

```
### 14.4.2 제너레이터 실행기를 직접 만들지 마세요

[co](https://github.com/tj/co)
<br>
[Koa](https://koajs.com/)

### 14.4.3 제너레이터 실행기와 예외처리

- 제너레이터 실행기를 쓰면 try/catch를 써서 예외처리를 할 수 있다.
- 콜백, 프라미스에서 예외처리 쉽지 않음
    - 콜백에서 일으킨 예외는 콜백 밖에서 캐치할 수 없다.
- 제너레이터
    - 비동기적으로 실행하면서도 동기적인 동작방식을 유지함
        - try/catch 사용가능

```js
function* theFutureIsNow(){
    let data;
    try{
        data = yield Promise.all([
            nfcall(fs.readFile, 'a.txt'),
            nfcall(fs.readFile, 'b.txt'),
            nfcall(fs.readFile, 'c.txt'),
        ]);
    }catch(err){
        console.error("Unable tto read one ot more input files:" + err.message);
        throw err;
    }
    yield ptimeout(60*1000);
    try{
        yield nfcall(fs.writeFile,'d.txt', data[0]+data[1]+data[2]);
    } catch(err){
        console.error("Unable to write output file: "  + err.message);
        throw err;
    }
}
```
# 주의
- 이번 강의 내용은 진짜 모르겠어서 나중에 필요할 때 찾아보는 방식으로 이해해아겠다..






[프라미스 참고 블로그](https://joshua1988.github.io/web-development/javascript/promise-for-beginners/)