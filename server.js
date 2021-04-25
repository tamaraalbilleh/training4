'use strict';

const express = require ('express')
const server = express ();
require ('dotenv').config ();
const PORT = process.env.PORT;
const superagent = require ('superagent')
server.set ('view engine', 'ejs');
server.use ('/public',express.static ('public'));
server.use (express.urlencoded ({extended : true}))
const pg = require ('pg')
const client = new pg.Client( {
    connectionString: process.env.DATABASE_URL,
    // ssl: {
    //   rejectUnauthorized : false
    // }
  });
const cors = require ('cors')
server.use(cors());
const methodOverride = require('method-override');
server.use (methodOverride('_method'));



server.get ('/',homepageHandler)

function homepageHandler (req,res){
let url = `https://thesimpsonsquoteapi.glitch.me/quotes?count=10`
    superagent.get(url).set('User-Agent', '1.0').then (data=>{
    res.render ('pages/index' , {data : data.body})

    })
    .catch (error=>{
        res.send (error)
    })
}
server.post ('/add', addHandler)
function addHandler (req,res){
    // console.log (req.body)
    let s = req.body;
    let sql = `INSERT INTO simpsons (character,quote,image,characterdirection)VALUES ($1,$2,$3,$4);`
    let safeValues=[ s.character,s.quote,s.image,s.characterDirection]
    client.query (sql,safeValues)
    .then (()=>{
        res.redirect ('/')
    });
}
server.get ('/favorite-quotes' ,favHandler);
function favHandler (req,res) {
    let sql = `SELECT * FROM simpsons;`;
    client.query (sql).then (data =>{
        // console.log (data.rows)
        res.render ('pages/fav', {data : data.rows.sort()})
    })

}

server.post ('/favorite-quotes/:quote_id',detailsHandler);
function detailsHandler (req,res){
    let safe = req.params.quote_id
    let newSafe = safe.split(':')
    let out = [newSafe[1]]
    // console.log ('params',out)
    let sql = `SELECT * FROM simpsons WHERE id=$1;`

    client.query (sql,out).then (result=>{
        // console.log (result.rows)
        res.render ('pages/details', {item : result.rows[0]})
    })
}

server.put ('/favorite-quotes/:quote_id', updateHandler)
function updateHandler (req,res){
    let sql = `UPDATE simpsons SET quote=$1 WHERE id=$2;`;
    let safeValues = [req.body.quote,req.params.quote_id];
    // console.log ('s',safeValues)
    client.query (sql,safeValues).then (()=>{
        let sql2 = `SELECT * FROM simpsons WHERE id=$1;`
        let safe = [req.params.quote_id]
        client.query (sql2,safe).then (result=>{
            res.render ('pages/details', {item : result.rows[0]})
        })
        // res.redirect (`/favorite-quotes/${req.params.quote_id}`)
    })
}

server.delete ('/favorite-quotes/:quote_id', deleteHandler)
function deleteHandler (req,res){
let sql = `DELETE FROM simpsons WHERE id=$1;`;
let safe = [req.params.quote_id];
client.query (sql,safe).then (()=>{
    res.redirect ('/favorite-quotes')
})
}

client.connect ().then (
server.listen (PORT,()=>{
    console.log (`listening on  PORT :${PORT}`)
}))

