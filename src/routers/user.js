const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const mongoose = require('mongoose')




router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        const anotherUser = await User.findOne({ email : req.body.email })
        if (!anotherUser){
            await user.save()
            const token = await user.generateToken()
            return res.status(201).send({user,token})

        }
        res.status(400).send({ error: 'email exist in database!'})

    } catch(e){
        res.status(400).send(e)

    }
})



router.post('/users/login', async (req, res)=>{
    try{
        const user = await User.findByCred(req.body.email, req.body.password)
        const token = await user.generateToken()
        res.send({user,token})
    } catch(e){[
        res.status(400).send()
    ]}
})


router.post('/users/logout', auth, async (req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter(token=> token.token !==req.token)
        await req.user.save()
        res.send()
    } catch(e){
        res.status(500).send()
    }
})




router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowed = ['name','password']
    const validUpdate = updates.every( update => allowed.includes(update))
    
    if(!validUpdate){
        return res.status(400).send({ error: 'invald updates!!!'})
    }
    try{
        updates.forEach(update => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch(e){
        res.status(400).send(e)
    }
})





module.exports = router