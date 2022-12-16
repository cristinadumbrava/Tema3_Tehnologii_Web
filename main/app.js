const express = require('express')
const Sequelize = require('sequelize')
const bodyParser = require('body-parser')

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'my.db'
})

let FoodItem = sequelize.define('foodItem', {
    name : Sequelize.STRING,
    category : {
        type: Sequelize.STRING,
        validate: {
            len: [3, 10]
        },
        allowNull: false
    },
    calories : Sequelize.INTEGER
},{
    timestamps : false
})


const app = express()
// TODO
app.use(bodyParser.json())

app.locals.products = [
    {
        name: "Onion",
        category: "VEGETABLE",
        calories: 200
    },
    {
        name: "Rice",
        category: "GRAINS",
        calories: 50 
    },
    {
        name: "Chicken meat",
        category: "MEAT",
        calories: -250
    }
];

app.get('/create', async (req, res) => {
    try{
        await sequelize.sync({force : true})
        for (let i = 0; i < 10; i++){
            let foodItem = new FoodItem({
                name: 'name ' + i,
                category: ['MEAT', 'DAIRY', 'VEGETABLE'][Math.floor(Math.random() * 3)],
                calories : 30 + i
            })
            await foodItem.save()
        }
        res.status(201).json({message : 'created'})
    }
    catch(err){
        console.warn(err.stack)
        res.status(500).json({message : 'server error'})
    }
})

app.get('/food-items', async (req, res) => {
    try{
        let foodItems = await FoodItem.findAll()
        res.status(200).json(foodItems)
    }
    catch(err){
        console.warn(err.stack)
        res.status(500).json({message : 'server error'})        
    }
})

app.post('/food-items', async (req, res) => {
    var object = JSON.stringify(req.body);
    try{
        // TODO
        if (object == '{}') {
            res.status(400).json({ message: "body is missing" });
        }
        else {

            if (req.body.name && req.body.category && req.body.calories) {
                if (req.body.calories > 0) {
                    if (req.body.category === "MEAT"  || req.body.category === "DAIRY"  || req.body.category === "VEGETABLE") {
                        FoodItem.build(req.body).save().
                        then(foodItem => {
                            res.status(201).send({
                                message: "created"
                            });
                        })
                    }
                    else{
                        res.status(400).json({ message: "not a valid category" });
                    }
                }
                else {
                    res.status(400).json({ message: "calories should be a positive number" })
                }
            }
            else {
                res.status(400).json({ message: "malformed request" });
            }
           
        }
    }
    catch(err){
        // TODO
        console.warn(err.stack)
        res.status(500).json({ message: 'server error' })
    }
})

module.exports = app