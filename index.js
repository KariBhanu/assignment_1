var xttp = new XMLHttpRequest();
var battles = [];
var most_active = {};
var result = {};

var data = new Promise((resolve,reject)=>{
    xttp.open("GET","battles.json",true);
    xttp.onload = function() {
    resolve(xttp.responseText);
    };
    xttp.send();
});
function groupBy(objectArray, property) {
    return objectArray.reduce((acc, obj) => {
       const key = obj[property];
       if (!acc[key]) {
          acc[key] = [];
       }
       // Add object to list for given key's value
       acc[key].push(obj);
       return acc;
    }, {});
 }

 function find(arrayObject,property){
    let keys = Object.keys(arrayObject);
    let max = 0;
    let string = "";
    for(key of keys){
        if(arrayObject[key].length > max){
            max = arrayObject[key].length;
            string = arrayObject[key][0][property];
        }
    }
    return string;
 }

data.then((data)=>{
    battles = JSON.parse(data);
    console.log(battles); 
}).then(()=>{
    let activeKing = groupBy(battles, 'attacker_king');
    let defenderKing = groupBy(battles, 'defender_king');
    let regionName = groupBy(battles, 'region');
    let attackerOutcome = groupBy(battles,"attacker_outcome");
    let battleType = groupBy(battles,'battle_type');
    most_active = {...most_active,
                    'attacker_king':find(activeKing,'attacker_king'),
                    'defender_king':find(defenderKing,'defender_king'),
                    'region':find(regionName,'region')
                };
    let nameList = battles.filter(item => {
        for (let key in most_active) {
            if (item[key] === undefined || item[key] != most_active[key])
                return false;
        }
        return true;
    });
    nameList = nameList.map(val => val.name);
    most_active = {
                ...most_active,
                'name':nameList
            }
    let defenderSize = battles.map(val => val.defender_size);
    let sum = battles.reduce((acc,val)=>{
        return acc = acc + val.defender_size;
    },0);
    result = {...result,
                'most_active':most_active,
                'attacker_outcome':{
                    'win':attackerOutcome['win'].length,
                    'loss':attackerOutcome['loss'].length
                },
                'battle_type':Object.keys(battleType),
                'defender_size':{
                    'average':Math.ceil(sum/battles.length),
                    'min':Math.min(...defenderSize),
                    'max':Math.max(...defenderSize)
                }
            }
    console.log(result);

});
data.catch(()=>{
    console.log("error");
});


 