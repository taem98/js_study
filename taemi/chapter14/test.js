// console.log("Before timeout:" + new Date());
// function f(){
//     console.log("After timeout:" + new Date());
// }
// setTimeout(f, 60*1000); //1분
// console.log("I happen after setTimeout!");
// console.log("Me too!");




// const start = new Date();
// let i = 0;
// const intervalId = setInterval(function(){
//     let now = new Date();
//     if(now.getMinutes() !== start.getMinutes() || ++i>10)
//         return clearInterval(intervalId);
//     console.log(`${i} : ${now}`);
// }, 5*1000);


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