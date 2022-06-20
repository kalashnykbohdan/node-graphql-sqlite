const db = require('./connectionDb');
const bcryptjs = require('bcrypt');
const jwt = require('jsonwebtoken');   

async function tempbskript(password){
    const costFactor = 4;
    const temp = await bcryptjs.hash(password, costFactor)
    console.log(temp);
    return temp;
}

async function addNewUser(name, email, password){
    const sql1 = `INSERT INTO users (name, password, email) VALUES(?,?,?)`;
    return new Promise((resolve, rejects) => {db.all(sql1, [name, password, email], function(err, rows){
        if(err){
            rejects();
        }
        console.log(rows);
        resolve (rows);
    })})
}

async function findUserEmail(email){
    return new Promise((resolve, rejects) => {db.all(`SELECT * FROM users WHERE email = '${email}'`, function(err, user){
            if(err){
                rejects();
            }
            resolve (user[0]);
        })
    });
}

async function updateToken(token, email){

    const sql = `UPDATE users SET token = '${token}' WHERE email = '${email}'`;
        return new Promise((resolve, rejects) => {db.run(sql, function(err, rows){
            if(err){
                rejects();
            }
            console.log(token, "updateToken")
            resolve (token);
        })})
}

let root = {

    getHelloWorld: () =>{
        return "Hello world";
    },
    getAllCommits: ({}, user) => {
        if(user){
            return new Promise((resolve, reject) => {db.all(`SELECT * FROM commits_list`, [], function(err, rows) {  
                    if(err){
                        reject([]);
                    }
                    resolve(rows);
                });
            })
        }
        else 
        {
            return new Error("not authorization");
        }
    },
    getCommitsBySha: ({sha},user) => {
        if(user){
            return new Promise((resolve, reject) => {db.all(`select * from commits_list where sha = '${sha}'`, function(err, rows) { 
                    if(err){
                        reject([]);
                    }
                    resolve(rows[0]);
                })
            })
        }
        else 
        {
            return new Error("not authorization");
        }
    },
    getPaginationOnCommits: ({perpage, currentpage}, user) => {  

        if(user){

            const temp = (currentpage-1)*perpage;

            if(currentpage < 1 || perpage < 0){
                return new Error("currentpage < 1 or perpage < 0");
            }else{
                return new Promise((resolve, reject) => {db.all(`SELECT * FROM commits_list ORDER BY id LIMIT ${perpage} OFFSET ${temp}`, function(err, rows) {  
                        if(err){
                            reject([]);
                        }
                        resolve(rows);
                    });
                })
            }
        }
        else{
            return new Error("not authorization");
        }
    },
    getCollectionCommitsLength: ({}, user) => {
        if(user){
            return new Promise((resolve, reject) => {db.all(`SELECT COUNT (sha) FROM commits_list`, function(err, rows) { 
                    if(err){    
                        reject([]);
                    }
                    let countNamber = Object.values(rows[0]);
                    resolve (Number(countNamber));
                })
            })
        }
        else 
        {
            return new Error("not authorization");
        }
    },
    registr: async ({name, email, password}) => {
        

        const repeatEmail = await findUserEmail(email);

        if(repeatEmail !== undefined){
            if(repeatEmail.email === email){
                return new Error("email already exists ");
            }
        }

        let passwordHash = await tempbskript(password);
        await addNewUser(name, email, passwordHash);

        const userIteam = await findUserEmail(email);
        const User = {id: userIteam.id, name: userIteam.name, email: userIteam.email};

        return User;
        
    },
    login: async ({email, password}) => {

        
        const user = await findUserEmail(email);

        if(!user){
            return new Error("not user, you mast registretion");   
        }

        const isPasswordValid = await bcryptjs.compare(password, user.password);

        if(!isPasswordValid){
            return new Error("PasswordValid not valid");         
        }

        const token = await jwt.sign({ id: user.id, name: user.name, email: user.email}, process.env.JWT_SECRET);
        await updateToken(token, email);

        return token;

    }
};

module.exports = {root};