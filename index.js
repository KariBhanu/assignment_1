var xttp = new XMLHttpRequest();// XMLHttpRequest objects are used to interact with servers.
var battles = [];//Used for saving the data from json.
var most_active = {};//Used it for filtering the names of battles.
var result = {};

var data = new Promise((resolve,reject)=>{
    try{
        xttp.open("GET","battles.json",true);//Specifies the request
        //Below function to be executed when the request completes successfully.
        xttp.onload = function() {
        resolve(xttp.responseText);
        };
        xttp.send();//Sends the request to the server Used for GET requests
    }
    catch{
        reject();
    }
});

//function is to group the array of objects on property.
function property_group(objectArray, property) {
    return objectArray.reduce((acc, obj) => {
       const key = obj[property];
       if (!acc[key]) {
          acc[key] = [];
       }
       acc[key].push(obj);
       return acc;
    }, {});
 }

//This function is to get the most_active after grouping
 function mostactive_property(arrayObject,property){
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
    try{
         battles = JSON.parse(data);//assigning data to battles array.
        console.log(battles);
    }
    catch(err){
        throw err;
    }
}).then(()=>{
    try{
        let activeKing = property_group(battles, 'attacker_king');
        let defenderKing = property_group(battles, 'defender_king');
        let regionName = property_group(battles, 'region');
        let attackerOutcome = property_group(battles,"attacker_outcome");
        let battleType = property_group(battles,'battle_type');
        //above are objects formed by grouping on their key
        most_active = {...most_active,
                        'attacker_king':mostactive_property(activeKing,'attacker_king'),
                        'defender_king':mostactive_property(defenderKing,'defender_king'),
                        'region':mostactive_property(regionName,'region')
                    };
        //Below filter is used to filter the battles array with most_active object.
        let nameList = battles.filter(item => {
            for (let key in most_active) {
                if (item[key] === undefined || item[key] != most_active[key])
                    return false;
            }
            return true;
        });
        nameList = nameList.map(val => val.name);//getting the array of battle_names.
        most_active = {
                    ...most_active,
                    'name':nameList
                }
        //making an array of defender_size for calculating the min,max and avg.
        let defenderSize = battles.map(val => val.defender_size);
        // sum is total sum of defender_size.
        let sum = battles.reduce((acc,val)=>{
            return acc = acc + val.defender_size;
        },0);
        //below three lines is making a array of battle type and triming that array for emplty values.
        let battleNames = Object.keys(battleType);
        battleNames = battleNames.filter((val)=>{
            return val != "";
        })
        console.log(battleNames);

        result = {...result,
                    'most_active':most_active,
                    'attacker_outcome':{
                        'win':attackerOutcome['win'].length,
                        'loss':attackerOutcome['loss'].length
                    },
                    'battle_type':battleNames,
                    'defender_size':{
                        'average':Math.ceil(sum/battles.length),
                        'min':Math.min(...defenderSize),
                        'max':Math.max(...defenderSize)
                    }
                }
        console.table(result);
    }
    catch(err){
        throw err;
    }
}).then(()=>{ 
    try{
        document.getElementById('attacker_king').innerHTML = result.most_active.attacker_king;
        document.getElementById('defender_king').innerHTML = result.most_active.defender_king;
        document.getElementById('region').innerHTML = result.most_active.region;
        document.getElementById('battle').innerHTML = result.most_active.name;
        document.getElementById('win').innerHTML = result.attacker_outcome.win;
        document.getElementById('loss').innerHTML = result.attacker_outcome.loss;
        document.getElementById('typeofBattle').innerHTML = result.battle_type;
        document.getElementById('avg').innerHTML = result.defender_size.average;
        document.getElementById('max').innerHTML = result.defender_size.max;
        document.getElementById('min').innerHTML = result.defender_size.min;
    }
    catch(err){
        throw err;
    }
    
}).catch((err)=>{
    console.log(err);
})

