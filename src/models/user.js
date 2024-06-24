const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Request = require('./request')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate(val){
            if(!validator.isEmail(val)){
                throw new Error('email not valid')
            }
        }
    },
    password:{
        type: String,
        required: true,
        minlength: 7,
        trim: true,
    }, tokens:[{
        token:{
            type: String,
            required: true
        }
    }]
}, {timestamps: true})


userSchema.virtual('myRequests', {
    ref: 'Request',
    localField: '_id',
    foreignField: 'owner'
})


userSchema.methods.toJSON = function (){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}

userSchema.methods.generateToken = async function (){
    const user = this
    const token = jwt.sign({ _id : user._id.toString()}, 'AmitIsTheBestProgramer')
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}



userSchema.statics.findByCred = async (email, password) =>{
    const user = await User.findOne({ email })
    if(!user){
        throw new Error('Unable to login')
    }
    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error('Unable to login')
    }
    return user
}



//hash thhe ppain text before saving

userSchema.pre('save' , async function (next) {
    const user = this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})





const User = mongoose.model('user', userSchema)


module.exports = User